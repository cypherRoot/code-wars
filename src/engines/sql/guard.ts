import type { EngineError } from '../result';

/** Removes comments and string/identifier literals so keyword checks can't be fooled by text inside quotes. */
export function stripSqlNoise(sql: string): string {
  let out = '';
  let i = 0;
  while (i < sql.length) {
    const c = sql[i]!;
    const next = sql[i + 1];
    if (c === '-' && next === '-') {
      while (i < sql.length && sql[i] !== '\n') i++;
      continue;
    }
    if (c === '/' && next === '*') {
      i += 2;
      while (i < sql.length && !(sql[i] === '*' && sql[i + 1] === '/')) i++;
      i += 2;
      out += ' ';
      continue;
    }
    if (c === "'" || c === '"') {
      const q = c;
      i++;
      while (i < sql.length) {
        if (sql[i] === q && sql[i + 1] === q) {
          i += 2;
          continue;
        }
        if (sql[i] === q) break;
        i++;
      }
      i++;
      out += q === "'" ? "''" : '""';
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

/** Splits into statements on `;`, ignoring empty trailing pieces. Input must already be stripped. */
export function splitStatements(stripped: string): string[] {
  return stripped
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

const WRITE_KEYWORDS =
  /\b(insert|update|delete|drop|create|alter|attach|detach|copy|install|load|pragma|set|reset|truncate|vacuum|checkpoint|export|import|call|use|begin|commit|rollback)\b/i;

/**
 * Read exercises accept a single SELECT / WITH / FROM-first query only (plan R3).
 * Returns null when the query is allowed.
 */
export function checkReadOnly(sql: string): EngineError | null {
  const stripped = stripSqlNoise(sql);
  const statements = splitStatements(stripped);
  if (statements.length === 0) {
    return { kind: 'blocked', message: 'The editor is empty.', hint: 'Write a query that starts with SELECT.' };
  }
  if (statements.length > 1) {
    return {
      kind: 'blocked',
      message: `Found ${statements.length} statements; this exercise expects exactly one query.`,
      hint: 'Remove the extra statements. A semicolon at the very end is fine.',
    };
  }
  const stmt = statements[0]!;
  if (!/^(select|with|from|\()/i.test(stmt)) {
    return {
      kind: 'blocked',
      message: 'This exercise only accepts a read query.',
      hint: 'Start your answer with SELECT (or WITH for a CTE).',
    };
  }
  const bad = stmt.match(WRITE_KEYWORDS);
  if (bad) {
    return {
      kind: 'blocked',
      message: `"${bad[0].toUpperCase()}" isn't allowed here — exercises only read data.`,
      hint: 'Use the Playground if you want to experiment with changing tables.',
    };
  }
  return null;
}
