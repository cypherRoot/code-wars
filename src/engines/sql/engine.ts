import * as duckdb from '@duckdb/duckdb-wasm';
import mvpWasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import mvpWorker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import ehWasm from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import ehWorker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';
import { DATASETS, schemaName, type DatasetId } from '../../data/datasets';
import { LIMITS, err, ok, type CellValue, type Column, type QueryResult, type Result, type TypeFamily } from '../result';
import { translateSqlError } from './errors';
import { logger } from '../../lib/logger';

/*
 * DuckDB-WASM already runs inside its own Web Worker; this module owns that worker's lifecycle.
 * A run that exceeds the timeout (or is cancelled) terminates the worker; the next call boots a fresh one
 * and re-seeds datasets lazily (plan R3: cancel → terminate → respawn → reseed).
 */

const BUNDLES: duckdb.DuckDBBundles = {
  mvp: { mainModule: mvpWasm, mainWorker: mvpWorker },
  eh: { mainModule: ehWasm, mainWorker: ehWorker },
};

interface Instance {
  db: duckdb.AsyncDuckDB;
  worker: Worker;
  conn: duckdb.AsyncDuckDBConnection;
  seeded: Map<string, Promise<void>>;
}

let instance: Promise<Instance> | null = null;
/** The worker of the current generation, tracked from creation so a boot that hangs can still be terminated. */
let currentWorker: Worker | null = null;
let queue: Promise<unknown> = Promise.resolve();
let generation = 0;

/** Learner-writable sandbox used by the Playground: seeded like `main`, but a separate schema from what lessons grade against. */
export const PLAYGROUND_VARIANT = 'playground';

export type SqlStatus = 'idle' | 'loading' | 'ready' | 'error';
const listeners = new Set<(s: SqlStatus) => void>();
let status: SqlStatus = 'idle';
function setStatus(s: SqlStatus) {
  status = s;
  listeners.forEach((l) => l(s));
}
export const getSqlStatus = () => status;
export function onSqlStatus(fn: (s: SqlStatus) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

async function boot(gen: number): Promise<Instance> {
  setStatus('loading');
  const bundle = await duckdb.selectBundle(BUNDLES);
  if (gen !== generation) throw new Error('SQL engine was reset during startup');
  const worker = new Worker(bundle.mainWorker!);
  currentWorker = worker;
  const db = new duckdb.AsyncDuckDB(new duckdb.VoidLogger(), worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  const conn = await db.connect();
  if (gen === generation) setStatus('ready');
  return { db, worker, conn, seeded: new Map() };
}

function getInstance(): Promise<Instance> {
  if (!instance) {
    const gen = generation;
    const booting: Promise<Instance> = boot(gen).catch((e: unknown) => {
      // A stale boot (from before a reset) must not clobber the replacement instance or its status.
      if (instance === booting) {
        instance = null;
        setStatus('error');
      }
      throw e;
    });
    instance = booting;
  }
  return instance;
}

/** Kills the worker (used for timeouts/cancel). The next query boots a fresh database. */
export function resetSqlEngine() {
  generation++;
  // Terminate directly rather than awaiting the instance: if boot or seeding hung, that promise never settles.
  currentWorker?.terminate();
  currentWorker = null;
  instance = null;
  // `queue` is deliberately NOT replaced: tasks already chained on it would otherwise run concurrently with new ones.
  // It can't deadlock, because every await on the connection inside a queued task has its own timeout.
  setStatus('idle');
}

/** Preload in the background (e.g. when a SQL lesson opens). */
export function warmSql(dataset: DatasetId = 'shop', variant: string = 'main') {
  const gen = generation;
  const task = queue.then(() => withTimeout(ensureSchema(dataset, variant), LIMITS.loadTimeoutMs));
  queue = task.catch((e: unknown) => {
    logger.warn('sql warmup failed', e);
    if (e instanceof TimeoutError && gen === generation) resetSqlEngine();
  });
}

function seedFor(dataset: DatasetId, variant: string): string | undefined {
  const variants = DATASETS[dataset].variants as Record<string, string>;
  return variant === PLAYGROUND_VARIANT ? variants.main : variants[variant];
}

async function ensureSchema(dataset: DatasetId, variant: string): Promise<Instance> {
  const inst = await getInstance();
  const schema = schemaName(dataset, variant);
  // One shared promise per schema: concurrent callers (warm-up + first run) wait for the same seed.
  let seeding = inst.seeded.get(schema);
  if (!seeding) {
    const seed = seedFor(dataset, variant);
    if (!seed) throw new Error(`Unknown dataset variant ${dataset}/${variant}`);
    // A single call, so no other query on this connection can change `schema` mid-seed.
    seeding = inst.conn
      .query(`DROP SCHEMA IF EXISTS ${schema} CASCADE; CREATE SCHEMA ${schema}; SET schema='${schema}';\n${seed}`)
      .then(() => undefined);
    inst.seeded.set(schema, seeding);
    seeding.catch(() => inst.seeded.delete(schema));
  }
  await seeding;
  return inst;
}

/** Re-creates the Playground sandbox for a dataset ("reset data"). Lesson schemas are never touched by the Playground. */
export function reseed(dataset: DatasetId): Promise<void> {
  const task = queue.then(async () => {
    const inst = await getInstance();
    inst.seeded.delete(schemaName(dataset, PLAYGROUND_VARIANT));
    await withTimeout(ensureSchema(dataset, PLAYGROUND_VARIANT), LIMITS.loadTimeoutMs);
  });
  queue = task.catch(() => undefined);
  return task;
}

export interface RunOptions {
  dataset?: DatasetId;
  variant?: string;
  maxRows?: number;
  timeoutMs?: number;
}

/** Runs SQL against a dataset schema. Serialised: one query at a time on the shared connection. */
export function runSql(sql: string, opts: RunOptions = {}): Promise<Result<QueryResult>> {
  const task = queue.then(() => runNow(sql, opts));
  queue = task.catch(() => undefined);
  return task;
}

async function runNow(sql: string, opts: RunOptions): Promise<Result<QueryResult>> {
  const dataset = opts.dataset ?? 'shop';
  const variant = opts.variant ?? 'main';
  const myGen = generation;
  let inst: Instance;
  try {
    inst = await withTimeout(ensureSchema(dataset, variant), LIMITS.loadTimeoutMs);
  } catch (e) {
    // A hung boot/seed would otherwise stay cached and every retry would wait on it again.
    if (e instanceof TimeoutError && myGen === generation) resetSqlEngine();
    return err({
      kind: 'load',
      message: e instanceof TimeoutError ? 'The SQL engine took too long to start.' : `The SQL engine failed to start: ${String(e)}`,
      hint: 'Check your connection and try again.',
    });
  }

  const started = performance.now();
  try {
    await withTimeout(inst.conn.query(`SET schema='${schemaName(dataset, variant)}'`), opts.timeoutMs ?? LIMITS.execTimeoutMs);
    const table = await withTimeout(inst.conn.query(sql), opts.timeoutMs ?? LIMITS.execTimeoutMs);
    return ok(toResult(table, opts.maxRows ?? LIMITS.displayRows, performance.now() - started));
  } catch (e) {
    if (e instanceof TimeoutError) {
      if (myGen === generation) resetSqlEngine();
      return err({
        kind: 'timeout',
        message: `Stopped after ${(opts.timeoutMs ?? LIMITS.execTimeoutMs) / 1000}s.`,
        hint: 'The query ran too long. Real tables can be huge — add a WHERE or LIMIT. The engine has been restarted.',
      });
    }
    return err(translateSqlError(e instanceof Error ? e.message : String(e)));
  }
}

class TimeoutError extends Error {}
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new TimeoutError('timeout')), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e: unknown) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

/* ---------- Arrow → plain values ---------- */

// apache-arrow Type enum ids (stable across versions)
const T = { Null: 1, Int: 2, Float: 3, Binary: 4, Utf8: 5, Bool: 6, Decimal: 7, Date: 8, Time: 9, Timestamp: 10, Interval: 11, LargeUtf8: 20 } as const;

interface ArrowField {
  name: string;
  type: { typeId: number; scale?: number; toString(): string };
}
interface ArrowTable {
  numRows: number;
  schema: { fields: ArrowField[] };
  getChildAt(i: number): { get(row: number): unknown } | null;
}

function familyOf(typeId: number): TypeFamily {
  switch (typeId) {
    case T.Int:
      return 'int';
    case T.Float:
    case T.Decimal:
      return 'float';
    case T.Utf8:
    case T.LargeUtf8:
      return 'text';
    case T.Bool:
      return 'bool';
    case T.Date:
      return 'date';
    case T.Timestamp:
      return 'timestamp';
    default:
      return 'other';
  }
}

const pad = (n: number) => String(n).padStart(2, '0');
function isoDate(ms: number) {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}
function isoTimestamp(ms: number) {
  // Keep sub-second precision (to the microsecond) so 12:00:00.1 and 12:00:00.9 stay distinct.
  const micros = Math.round(ms * 1000);
  const wholeMs = Math.floor(micros / 1000);
  const d = new Date(wholeMs);
  const frac = ((micros % 1_000_000) + 1_000_000) % 1_000_000;
  const fracStr = frac ? `.${String(frac).padStart(6, '0').replace(/0+$/, '')}` : '';
  return `${isoDate(wholeMs)} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}${fracStr}`;
}

/** Shortest round-trip text for a double, without exponent notation (1e-7 → "0.0000001"). */
function plainNumberString(n: number): string {
  const s = String(n);
  const m = /^(-?)(\d)(?:\.(\d+))?e([+-]\d+)$/.exec(s);
  if (!m) return s;
  const [, sign, lead, rest = '', expStr] = m;
  const digits = lead! + rest;
  const point = 1 + Number(expStr); // position of the decimal point within `digits`
  if (point <= 0) return `${sign}0.${'0'.repeat(-point)}${digits}`;
  if (point >= digits.length) return `${sign}${digits}${'0'.repeat(point - digits.length)}`;
  return `${sign}${digits.slice(0, point)}.${digits.slice(point)}`;
}

/** Exact decimal text for an unscaled integer, e.g. (12345n, 2) → "123.45". */
function decimalString(unscaled: bigint, scale: number): string {
  const neg = unscaled < 0n;
  const digits = (neg ? -unscaled : unscaled).toString().padStart(scale + 1, '0');
  const int = scale ? digits.slice(0, -scale) : digits;
  const frac = scale ? digits.slice(-scale).replace(/0+$/, '') : '';
  return `${neg ? '-' : ''}${int}${frac ? `.${frac}` : ''}`;
}

export function normalizeCell(v: unknown, field: ArrowField): CellValue {
  if (v === null || v === undefined) return null;
  const id = field.type.typeId;
  if (id === T.Decimal) {
    const scale = field.type.scale ?? 0;
    // Arrow decimals come back as a BigNum-like object; its string form is the unscaled integer.
    const unscaled = typeof v === 'bigint' ? v : BigInt(String(v));
    // Decide by *value*, not scale: 1 (scale 0) and 1.000000000000000000 (scale 18) must both become the number 1.
    // Only values a double can't round-trip (e.g. 9007199254740993) stay as exact text, so distinct values never collide.
    const exact = decimalString(unscaled, scale);
    const n = Number(exact);
    return plainNumberString(n) === exact ? n : exact;
  }
  if (typeof v === 'bigint') {
    return v <= BigInt(Number.MAX_SAFE_INTEGER) && v >= BigInt(Number.MIN_SAFE_INTEGER) ? Number(v) : v.toString();
  }
  if (id === T.Date) return isoDate(v instanceof Date ? v.getTime() : Number(v));
  if (id === T.Timestamp) return isoTimestamp(v instanceof Date ? v.getTime() : Number(v));
  if (typeof v === 'number' || typeof v === 'boolean' || typeof v === 'string') return v;
  try {
    return JSON.stringify(v, (_k, x: unknown) => (typeof x === 'bigint' ? x.toString() : x));
  } catch {
    return String(v);
  }
}

function toResult(raw: unknown, maxRows: number, elapsedMs: number): QueryResult {
  const table = raw as ArrowTable;
  const fields = table.schema.fields;
  const columns: Column[] = fields.map((f) => ({ name: f.name, type: f.type.toString(), family: familyOf(f.type.typeId) }));
  const n = Math.min(table.numRows, maxRows);
  const children = fields.map((_f, i) => table.getChildAt(i));
  const rows: CellValue[][] = [];
  for (let r = 0; r < n; r++) {
    rows.push(fields.map((f, c) => normalizeCell(children[c]?.get(r), f)));
  }
  return { columns, rows, rowCount: table.numRows, truncated: table.numRows > maxRows, elapsedMs };
}
