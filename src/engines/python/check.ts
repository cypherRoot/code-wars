import type { EngineError } from '../result';
import { runPython } from './client';
import type { PyRunOutput, PyTests } from './protocol';

export type PyCheck =
  | { status: 'pass'; output: PyRunOutput }
  | { status: 'fail'; output: PyRunOutput; reasons: string[] }
  | { status: 'error'; error: EngineError };

/** Runs learner code plus hidden cases. Feedback, not tamper-proof assessment (plan R3). */
export async function checkPyExercise(tests: PyTests, code: string): Promise<PyCheck> {
  if (!code.trim()) return { status: 'error', error: { kind: 'blocked', message: 'The editor is empty.' } };
  const res = await runPython(code, tests);
  if (!res.ok) return { status: 'error', error: res.error };
  const out = res.value;
  const reasons: string[] = [];
  if (out.error) reasons.push(`Your code raised ${out.error.type}: ${out.error.message}`);
  const failed = (out.cases ?? []).filter((c) => !c.pass);
  if (failed.length) reasons.push(`${failed.length} of ${out.cases!.length} test(s) failed.`);
  if (out.stdoutPass === false) reasons.push('The printed output doesn’t match what was expected.');
  return reasons.length ? { status: 'fail', output: out, reasons } : { status: 'pass', output: out };
}
