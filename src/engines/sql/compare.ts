import type { CellValue, Column, QueryResult, TypeFamily } from '../result';

export interface CompareOptions {
  orderMatters?: boolean;
  columnNames?: 'strict' | 'ignore';
  floatTolerance?: number;
}

export interface CompareOutcome {
  pass: boolean;
  /** Human-readable reasons, most important first. */
  reasons: string[];
  missing: CellValue[][];
  extra: CellValue[][];
}

const NUMERIC: TypeFamily[] = ['int', 'float'];
const isNumeric = (f: TypeFamily) => NUMERIC.includes(f);

function familiesCompatible(a: TypeFamily, b: TypeFamily): boolean {
  if (a === b) return true;
  if (isNumeric(a) && isNumeric(b)) return true;
  // DuckDB may type a literal NULL-only column as INTEGER/"NULL"; treat 'other' loosely
  return a === 'other' || b === 'other';
}

/** Canonical string for a cell, so multisets can be compared with a Map. NULL equals NULL here. */
export function cellKey(v: CellValue, tolerance: number): string {
  if (v === null) return '∅';
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) return `n:${v}`;
    const digits = Math.max(0, Math.round(-Math.log10(tolerance)));
    // Normalise -0 and float noise
    const fixed = (Math.round(v / tolerance) * tolerance).toFixed(digits);
    return `n:${fixed === `-${(0).toFixed(digits)}` ? (0).toFixed(digits) : fixed}`;
  }
  if (typeof v === 'boolean') return `b:${v}`;
  return `s:${v}`;
}

/** JSON-encoded so a separator inside a text cell can never make two different rows share a key. */
const rowKey = (row: CellValue[], tol: number) => JSON.stringify(row.map((c) => cellKey(c, tol)));

/** True absolute-tolerance check, unlike the bucketing in `cellKey`, which can split two close values. */
function cellsEqual(a: CellValue, b: CellValue, tol: number): boolean {
  if (typeof a === 'number' && typeof b === 'number') {
    if (!Number.isFinite(a) || !Number.isFinite(b)) return Object.is(a, b) || a === b;
    // Strictly absolute: a relative (or magnitude-scaled) slack would let 1e15 match 1e15 + 0.5.
    return Math.abs(a - b) <= tol;
  }
  return cellKey(a, tol) === cellKey(b, tol);
}

const rowsEqual = (a: CellValue[], b: CellValue[], tol: number) => a.length === b.length && a.every((c, i) => cellsEqual(c, b[i]!, tol));

function describeColumns(cols: Column[]) {
  return cols.map((c) => c.name).join(', ');
}

/**
 * Compares a learner result to the reference result (plan R3 comparison contract):
 * column count → names (optional) → type families → rows as a multiset (or sequence when orderMatters).
 */
export function compareResults(expected: QueryResult, actual: QueryResult, opts: CompareOptions = {}): CompareOutcome {
  const tol = opts.floatTolerance ?? 1e-6;
  const reasons: string[] = [];

  if (expected.truncated || actual.truncated) {
    return {
      pass: false,
      reasons: ['The result is too large to check. Did you forget a WHERE or LIMIT?'],
      missing: [],
      extra: [],
    };
  }

  if (expected.columns.length !== actual.columns.length) {
    return {
      pass: false,
      reasons: [
        `Expected ${expected.columns.length} column(s) (${describeColumns(expected.columns)}) but got ${actual.columns.length} (${describeColumns(actual.columns)}).`,
      ],
      missing: [],
      extra: [],
    };
  }

  if ((opts.columnNames ?? 'ignore') === 'strict') {
    const wrong = expected.columns.findIndex((c, i) => c.name.toLowerCase() !== actual.columns[i]!.name.toLowerCase());
    if (wrong >= 0) {
      reasons.push(
        `Column ${wrong + 1} should be named "${expected.columns[wrong]!.name}" but is "${actual.columns[wrong]!.name}". Use AS to rename it.`,
      );
    }
  }

  expected.columns.forEach((c, i) => {
    const a = actual.columns[i]!;
    if (!familiesCompatible(c.family, a.family)) {
      reasons.push(`Column ${i + 1} ("${a.name}") holds ${a.family} values, but ${c.family} values were expected.`);
    }
  });

  const missing: CellValue[][] = [];
  const extra: CellValue[][] = [];

  if (opts.orderMatters) {
    const n = Math.max(expected.rows.length, actual.rows.length);
    let firstMismatch = -1;
    for (let i = 0; i < n; i++) {
      const e = expected.rows[i];
      const a = actual.rows[i];
      if (!e || !a || !rowsEqual(e, a, tol)) {
        if (firstMismatch < 0) firstMismatch = i;
        if (e) missing.push(e);
        if (a) extra.push(a);
      }
    }
    if (firstMismatch >= 0) {
      const sameSet = multisetDiff(expected.rows, actual.rows, tol);
      if (sameSet.missing.length === 0 && sameSet.extra.length === 0) {
        reasons.push(`The rows are right but in the wrong order (first difference at row ${firstMismatch + 1}). Check your ORDER BY.`);
        return { pass: false, reasons, missing: [], extra: [] };
      }
      reasons.push(`Rows differ starting at row ${firstMismatch + 1}.`);
    }
  } else {
    const d = multisetDiff(expected.rows, actual.rows, tol);
    missing.push(...d.missing);
    extra.push(...d.extra);
  }

  if (!opts.orderMatters && (missing.length || extra.length)) {
    if (expected.rows.length !== actual.rows.length) {
      reasons.push(`Expected ${expected.rows.length} row(s) but got ${actual.rows.length}.`);
    } else {
      reasons.push(`Same number of rows (${actual.rows.length}), but ${missing.length} of them have different values.`);
    }
  }

  return { pass: reasons.length === 0, reasons, missing, extra };
}

function multisetDiff(expected: CellValue[][], actual: CellValue[][], tol: number) {
  // Pass 1: exact canonical keys (fast path, handles nearly every case).
  const counts = new Map<string, { row: CellValue[]; n: number }>();
  for (const r of expected) {
    const k = rowKey(r, tol);
    const cur = counts.get(k);
    if (cur) cur.n++;
    else counts.set(k, { row: r, n: 1 });
  }
  let extra: CellValue[][] = [];
  for (const r of actual) {
    const k = rowKey(r, tol);
    const cur = counts.get(k);
    if (cur && cur.n > 0) cur.n--;
    else extra.push(r);
  }
  const missing: CellValue[][] = [];
  for (const { row, n } of counts.values()) for (let i = 0; i < n; i++) missing.push(row);

  // Pass 2: leftovers that differ only by float noise across a bucket boundary. Each row matches at most once.
  // Capped so a completely wrong 10k-row answer can't trigger a 10k×10k scan.
  if (missing.length && extra.length && missing.length * extra.length <= 1_000_000) {
    const unmatched: CellValue[][] = [];
    for (const r of extra) {
      const j = missing.findIndex((m) => rowsEqual(m, r, tol));
      if (j >= 0) missing.splice(j, 1);
      else unmatched.push(r);
    }
    extra = unmatched;
  }
  return { missing, extra };
}
