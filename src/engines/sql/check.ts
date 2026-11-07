import { DATASETS, type DatasetId } from '../../data/datasets';
import { LIMITS, type EngineError, type QueryResult } from '../result';
import { compareResults, type CompareOptions } from './compare';
import { runSql } from './engine';
import { checkReadOnly } from './guard';

export interface SqlExerciseSpec extends CompareOptions {
  dataset: DatasetId;
  solution: string;
}

export type SqlCheck =
  | { status: 'pass'; result: QueryResult; variantsChecked: number }
  | { status: 'error'; error: EngineError }
  | {
      status: 'fail';
      /** 'main' = the data the learner sees; anything else = a hidden edge-case fixture. */
      variant: string;
      reasons: string[];
      result: QueryResult;
      expected: QueryResult;
      missing: QueryResult['rows'];
      extra: QueryResult['rows'];
    };

/**
 * Plan R3: guard → run learner + reference on every fixture variant → compare.
 * Learner queries are read-only (guarded), so sharing one DB instance cannot contaminate the reference.
 */
export async function checkSqlExercise(spec: SqlExerciseSpec, learnerSql: string): Promise<SqlCheck> {
  const blocked = checkReadOnly(learnerSql);
  if (blocked) return { status: 'error', error: blocked };

  const variants = Object.keys(DATASETS[spec.dataset].variants);
  let mainResult: QueryResult | null = null;

  for (const variant of variants) {
    const got = await runSql(learnerSql, { dataset: spec.dataset, variant, maxRows: LIMITS.checkRows });
    if (!got.ok) return { status: 'error', error: got.error };
    const ref = await runSql(spec.solution, { dataset: spec.dataset, variant, maxRows: LIMITS.checkRows });
    if (!ref.ok) {
      return {
        status: 'error',
        error: { kind: 'runtime', message: `The reference solution failed (a content bug — please report it): ${ref.error.message}` },
      };
    }
    if (variant === 'main') mainResult = got.value;
    const cmp = compareResults(ref.value, got.value, spec);
    if (!cmp.pass) {
      return {
        status: 'fail',
        variant,
        reasons:
          variant === 'main'
            ? cmp.reasons
            : [
                'Your query gives the right answer on this data, but not on a hidden test dataset with tricky cases (NULLs, ties, duplicates, odd casing).',
                ...cmp.reasons,
              ],
        result: got.value,
        expected: ref.value,
        missing: cmp.missing,
        extra: cmp.extra,
      };
    }
  }
  return { status: 'pass', result: mainResult!, variantsChecked: variants.length };
}
