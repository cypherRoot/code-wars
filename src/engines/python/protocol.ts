/** Messages between the Python client (main thread) and the Pyodide worker. */
export interface PyCase {
  /** A Python expression, evaluated in the learner's namespace, e.g. `double([1, 2])`. */
  call: string;
  /** A Python expression for the expected value, e.g. `[2, 4]`. */
  expect: string;
}

export interface PyTests {
  cases?: PyCase[];
  /** Exact stdout expected (trailing whitespace ignored). */
  stdout?: string;
}

export interface PyCaseResult {
  call: string;
  expected: string;
  got: string | null;
  pass: boolean;
  error?: string;
}

export interface PyRunOutput {
  stdout: string;
  /** Present when the learner's code raised. */
  error?: { type: string; message: string; line?: number; traceback: string };
  cases?: PyCaseResult[];
  stdoutPass?: boolean;
  truncated?: boolean;
  elapsedMs: number;
}

export type ToWorker =
  | { type: 'init'; packages?: string[] }
  | { type: 'run'; id: number; code: string; tests?: PyTests; packages?: string[] };

export type FromWorker =
  | { type: 'ready'; version: string }
  | { type: 'load-error'; message: string }
  | { type: 'result'; id: number; output: PyRunOutput };
