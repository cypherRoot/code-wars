/** Shared result contract: engines never throw across the worker boundary (plan: Conventions). */
export type EngineErrorKind = 'syntax' | 'runtime' | 'timeout' | 'blocked' | 'load' | 'cancelled' | 'limit';

export interface EngineError {
  kind: EngineErrorKind;
  message: string;
  /** Beginner-friendly explanation, when we recognise the error. */
  hint?: string;
  line?: number;
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: EngineError };

export const ok = <T>(value: T): Result<T> => ({ ok: true, value });
export const err = <T = never>(error: EngineError): Result<T> => ({ ok: false, error });

export type CellValue = string | number | boolean | null;
export type TypeFamily = 'int' | 'float' | 'text' | 'date' | 'timestamp' | 'bool' | 'other';

export interface Column {
  name: string;
  type: string;
  family: TypeFamily;
}

export interface QueryResult {
  columns: Column[];
  rows: CellValue[][];
  /** Total rows produced (may exceed rows.length when truncated). */
  rowCount: number;
  truncated: boolean;
  elapsedMs: number;
}

/** Caps from plan R3. */
export const LIMITS = {
  displayRows: 1000,
  checkRows: 10_000,
  execTimeoutMs: 5_000,
  loadTimeoutMs: 90_000,
  stdoutBytes: 200_000,
} as const;
