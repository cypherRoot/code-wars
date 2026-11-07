import { useState } from 'react';
import { runSql } from '../../engines/sql/engine';
import { runPython, translatePyError } from '../../engines/python/client';
import type { EngineError, QueryResult } from '../../engines/result';
import type { PyRunOutput } from '../../engines/python/protocol';
import { recordAttempt } from '../../learning/progress';
import { CodeBlock } from '../editor/code-block';
import { InlineMd } from '../ui/inline-md';
import { EngineErrorPanel } from './engine-error';
import { ResultTable } from './result-table';
import { useLesson } from './lesson-context';
import { engineLabel, usePyStatus, useSqlStatus } from './use-engine-status';
import styles from './panels.module.css';
import w from './worked.module.css';

type Output = { kind: 'sql'; result: QueryResult } | { kind: 'py'; out: PyRunOutput } | { kind: 'error'; error: EngineError };

/** A runnable example. With `predict`, Run unlocks only after the learner commits to a prediction (PRIMM). */
export function Worked({ id }: { id: string }) {
  const { lesson } = useLesson();
  const ex = lesson.worked[id];
  const [choice, setChoice] = useState<number | null>(null);
  const [committed, setCommitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [output, setOutput] = useState<Output | null>(null);
  const sqlStatus = useSqlStatus();
  const pyStatus = usePyStatus();

  if (!ex) return <EngineErrorPanel error={{ kind: 'runtime', message: `Missing worked example "${id}" in ${lesson.id}.yaml` }} />;
  const { predict } = ex;
  const locked = Boolean(predict) && !committed;

  async function run() {
    if (!ex || locked) return;
    setBusy(true);
    if (ex.lang === 'sql') {
      const r = await runSql(ex.code, { dataset: ex.dataset });
      setOutput(r.ok ? { kind: 'sql', result: r.value } : { kind: 'error', error: r.error });
    } else {
      const r = await runPython(ex.code);
      setOutput(r.ok ? { kind: 'py', out: r.value } : { kind: 'error', error: r.error });
    }
    setBusy(false);
  }

  function commit() {
    if (choice === null || !predict) return;
    setCommitted(true);
    void recordAttempt(lesson.id, `predict:${id}`, choice === predict.answer);
  }

  const status = engineLabel(ex.lang, ex.lang === 'sql' ? sqlStatus : pyStatus, busy);

  return (
    <section className={styles.panel} aria-label="Worked example">
      <div className={styles.head}>
        <span className={`label ${styles.kicker}`}>{predict ? 'Predict → Run' : 'Worked example'}</span>
      </div>
      <CodeBlock code={ex.code} lang={ex.lang} caption={ex.lang === 'sql' ? 'SQL · shop' : 'Python'} />

      {predict ? (
        <fieldset className={w.predict} disabled={committed}>
          <legend className={w.legend}>
            <InlineMd text={predict.prompt} />
          </legend>
          <div className={w.options}>
            {predict.options.map((opt, i) => {
              const state = committed ? (i === predict.answer ? 'right' : i === choice ? 'wrong' : '') : '';
              return (
                <label key={i} className={`${w.option} ${state ? w[state] : ''}`}>
                  <input type="radio" name={`predict-${lesson.id}-${id}`} checked={choice === i} onChange={() => setChoice(i)} />
                  <span>
                    <InlineMd text={opt} />
                  </span>
                </label>
              );
            })}
          </div>
          {!committed ? (
            <button type="button" className="btn btn-sm" disabled={choice === null} onClick={commit}>
              Lock in prediction
            </button>
          ) : (
            <p className={choice === predict.answer ? w.gotIt : w.notQuite}>
              {choice === predict.answer ? 'Your prediction was right. ' : 'Not quite — and that’s useful: now run it and see why. '}
              <span className={styles.why}>
                <InlineMd text={predict.explain} />
              </span>
            </p>
          )}
        </fieldset>
      ) : null}

      <div className={styles.toolbar}>
        <button type="button" className="btn btn-primary btn-sm" onClick={run} disabled={locked || busy}>
          {locked ? 'Predict first' : 'Run'}
        </button>
        <span className={styles.status} aria-live="polite">
          {status}
        </span>
      </div>

      {output?.kind === 'sql' ? <ResultTable result={output.result} caption="Example result" /> : null}
      {output?.kind === 'py' ? (
        <>
          {output.out.stdout ? <pre className={styles.stdout}>{output.out.stdout}</pre> : null}
          {output.out.error ? (
            <EngineErrorPanel
              error={{
                kind: 'runtime',
                message: output.out.error.traceback,
                hint: translatePyError(output.out.error.type, output.out.error.message),
              }}
            />
          ) : null}
          {!output.out.stdout && !output.out.error ? <p className={styles.status}>(no output)</p> : null}
        </>
      ) : null}
      {output?.kind === 'error' ? <EngineErrorPanel error={output.error} /> : null}
      {ex.note && output ? (
        <p className={styles.why}>
          <InlineMd text={ex.note} />
        </p>
      ) : null}
    </section>
  );
}
