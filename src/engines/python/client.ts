import { LIMITS, err, ok, type Result } from '../result';
import type { FromWorker, PyRunOutput, PyTests, ToWorker } from './protocol';
import { translatePyError } from './errors';

/*
 * Main-thread client for the Pyodide worker.
 * Separate timers (plan R3): a generous one while Pyodide loads, 5 s for execution.
 * A timeout or cancel terminates the worker; the next run spawns a fresh one.
 * Run IDs make sure a late reply from an old run is ignored.
 */

export type PyStatus = 'idle' | 'loading' | 'ready' | 'error';

class CancelError extends Error {}
class TimeoutError extends Error {}

/**
 * Everything owned by one worker. Cleanup is always scoped to the worker that started it, so a stale timer
 * or a late rejection from an old worker can never terminate its replacement.
 */
interface WorkerSlot {
  worker: Worker;
  ready: Promise<void>;
  initTimer: ReturnType<typeof setTimeout>;
  rejectInit: (e: Error) => void;
  pending: Map<number, { resolve: (out: PyRunOutput) => void; reject: (e: Error) => void }>;
}

let slot: WorkerSlot | null = null;
let nextId = 1;
let status: PyStatus = 'idle';
const listeners = new Set<(s: PyStatus) => void>();
/** Runs are serialised: Pyodide is single-threaded, and one-at-a-time keeps timeouts and Stop unambiguous. */
let runQueue: Promise<unknown> = Promise.resolve();

function setStatus(s: PyStatus) {
  status = s;
  listeners.forEach((l) => l(s));
}
export const getPyStatus = () => status;
export function onPyStatus(fn: (s: PyStatus) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function spawn(): WorkerSlot {
  if (slot) return slot;
  setStatus('loading');
  const w = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  const pending: WorkerSlot['pending'] = new Map();
  let rejectInit!: (e: Error) => void;
  let initTimer!: ReturnType<typeof setTimeout>;
  const ready = new Promise<void>((resolve, reject) => {
    rejectInit = reject;
    initTimer = setTimeout(() => reject(new Error('Python took too long to load.')), LIMITS.loadTimeoutMs);
    w.onmessage = (ev: MessageEvent<FromWorker>) => {
      const m = ev.data;
      if (m.type === 'ready') {
        clearTimeout(initTimer);
        if (slot?.worker === w) setStatus('ready');
        resolve();
      } else if (m.type === 'load-error') {
        clearTimeout(initTimer);
        reject(new Error(m.message));
      } else if (m.type === 'result') {
        pending.get(m.id)?.resolve(m.output);
        pending.delete(m.id);
      }
    };
    w.onerror = (e) => {
      clearTimeout(initTimer);
      reject(new Error(e.message || 'Python worker crashed.'));
    };
    w.postMessage({ type: 'init' } satisfies ToWorker);
  });
  const mine: WorkerSlot = { worker: w, ready, initTimer, rejectInit, pending };
  ready.catch((e: unknown) => {
    if (slot !== mine) return; // already replaced or killed
    kill(mine);
    if (!(e instanceof CancelError)) setStatus('error');
  });
  slot = mine;
  return mine;
}

/** Terminates a worker and settles everything waiting on it. No-op if `target` is no longer current. */
function kill(target: WorkerSlot | null = slot) {
  if (!target || target !== slot) return;
  slot = null;
  clearTimeout(target.initTimer);
  target.worker.terminate();
  target.rejectInit(new CancelError());
  for (const p of target.pending.values()) p.reject(new CancelError());
  target.pending.clear();
  setStatus('idle');
}

/** Start loading Pyodide in the background (e.g. when a Python lesson opens). */
export function warmPython() {
  void spawn().ready.catch(() => undefined);
}

/** Stops the current run (if any) by terminating the worker. */
export function cancelPython() {
  kill();
}

export function runPython(code: string, tests?: PyTests, timeoutMs: number = LIMITS.execTimeoutMs): Promise<Result<PyRunOutput>> {
  const task = runQueue.then(() => runNow(code, tests, timeoutMs));
  runQueue = task.catch(() => undefined);
  return task;
}

async function runNow(code: string, tests: PyTests | undefined, timeoutMs: number): Promise<Result<PyRunOutput>> {
  const s = spawn();
  try {
    await s.ready;
  } catch (e) {
    if (e instanceof CancelError) return err({ kind: 'cancelled', message: 'Run cancelled.' });
    return err({
      kind: 'load',
      message: e instanceof Error ? e.message : String(e),
      hint: 'Python runs in your browser and is downloaded on first use (about 10 MB). Check your connection and try again.',
    });
  }
  const id = nextId++;
  try {
    const output = await new Promise<PyRunOutput>((resolve, reject) => {
      const timer = setTimeout(() => reject(new TimeoutError()), timeoutMs);
      s.pending.set(id, {
        resolve: (out) => {
          clearTimeout(timer);
          resolve(out);
        },
        reject: (e) => {
          clearTimeout(timer);
          reject(e);
        },
      });
      s.worker.postMessage({ type: 'run', id, code, tests } satisfies ToWorker);
    });
    return ok(output.error ? { ...output, error: { ...output.error } } : output);
  } catch (e) {
    s.pending.delete(id);
    if (e instanceof CancelError) return err({ kind: 'cancelled', message: 'Run cancelled.' });
    kill(s); // only the worker this run used
    return err({
      kind: 'timeout',
      message: `Stopped after ${timeoutMs / 1000}s.`,
      hint: 'Your code ran too long — usually a loop whose condition never becomes false. Python has been restarted.',
    });
  }
}

/** Beginner hint for a Python error, if we recognise it. */
export { translatePyError };
