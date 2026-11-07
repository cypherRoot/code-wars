import { useEffect, useRef, useState } from 'react';
import type { PyExercise, SqlExercise } from '../../content/schema';
import { checkSqlExercise, type SqlCheck } from '../../engines/sql/check';
import { runSql } from '../../engines/sql/engine';
import { checkReadOnly } from '../../engines/sql/guard';
import { checkPyExercise, type PyCheck } from '../../engines/python/check';
import { cancelPython, runPython, translatePyError } from '../../engines/python/client';
import type { EngineError, QueryResult } from '../../engines/result';
import type { PyRunOutput } from '../../engines/python/protocol';
import { loadDraft, recordAttempt, saveDraft } from '../../learning/progress';
import { CodeEditor } from '../editor/code-editor';
import { InlineMd, InlineParas } from '../ui/inline-md';
import { EngineErrorPanel } from './engine-error';
import { ResultTable } from './result-table';
import { SchemaPanel } from './schema-panel';
import { useLesson } from './lesson-context';
import { engineLabel, usePyStatus, useSqlStatus } from './use-engine-status';
import styles from './panels.module.css';

/** "Make it": an independent exercise, auto-checked, with 3 levels of hints. */
export function Exercise({ id }: { id: string }) {
  const { lesson } = useLesson();
  const ex = lesson.exercises[id];
  if (!ex) return <EngineErrorPanel error={{ kind: 'runtime', message: `Missing exercise "${id}" in ${lesson.id}.yaml` }} />;
  return ex.lang === 'sql' ? <SqlExerciseView id={id} ex={ex} /> : <PyExerciseView id={id} ex={ex} />;
}

/* ---------- shared state: draft, hints, solution ---------- */

function useExerciseState(id: string, starter: string) {
  const { lesson, onExercisePassed } = useLesson();
  const draftKey = `${lesson.id}#ex:${id}`;
  const [code, setCode] = useState(starter);
  const [hintsShown, setHintsShown] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [solved, setSolved] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Set once the learner types, so a slow IndexedDB read can't replace what they've already written.
  const edited = useRef(false);

  useEffect(() => {
    let alive = true;
    edited.current = false;
    void loadDraft(draftKey).then((d) => {
      if (alive && !edited.current && d !== undefined) setCode(d);
    });
    return () => {
      alive = false;
    };
  }, [draftKey]);

  function update(v: string) {
    edited.current = true;
    setCode(v);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => void saveDraft(draftKey, v), 600);
  }

  function recordCheck(pass: boolean) {
    setAttempts((a) => a + 1);
    void recordAttempt(lesson.id, `ex:${id}`, pass, hintsShown);
    if (pass) {
      setSolved(true);
      onExercisePassed(id);
    }
  }

  return { code, update, hintsShown, setHintsShown, attempts, solved, recordCheck, showSolution, setShowSolution, lessonId: lesson.id };
}

function HintsAndSolution({
  hints,
  hintsShown,
  onHint,
  canReveal,
  solution,
  showSolution,
  onShowSolution,
  onUseSolution,
}: {
  hints: string[];
  hintsShown: number;
  onHint: () => void;
  canReveal: boolean;
  solution: string;

  showSolution: boolean;
  onShowSolution: () => void;
  onUseSolution: () => void;
}) {
  return (
    <>
      {hintsShown > 0 ? (
        <ol className={styles.hints} aria-label="Hints">
          {hints.slice(0, hintsShown).map((h, i) => (
            <li key={i}>
              <span className="label">{['Nudge', 'Concept', 'Partial answer'][i] ?? 'Hint'} · </span>
              <InlineMd text={h} />
            </li>
          ))}
        </ol>
      ) : null}
      <div className={styles.toolbar}>
        {hintsShown < hints.length ? (
          <button type="button" className="btn btn-ghost btn-sm" onClick={onHint}>
            Hint {hintsShown + 1}/{hints.length}
          </button>
        ) : null}
        {canReveal && !showSolution ? (
          <button type="button" className="btn btn-ghost btn-sm" onClick={onShowSolution}>
            Show a solution
          </button>
        ) : null}
      </div>
      {showSolution ? (
        <div className={styles.panel}>
          <p className="label">One correct solution</p>
          <pre className={styles.stdout}>{solution}</pre>
          <div>
            <button type="button" className="btn btn-sm" onClick={onUseSolution}>
              Copy into editor
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

/* ---------- SQL ---------- */

function SqlExerciseView({ id, ex }: { id: string; ex: SqlExercise }) {
  const s = useExerciseState(id, ex.starter);
  const [busy, setBusy] = useState(false);
  const [run, setRun] = useState<{ result?: QueryResult; error?: EngineError } | null>(null);
  const [check, setCheck] = useState<SqlCheck | null>(null);
  const [showSchema, setShowSchema] = useState(false);
  const status = useSqlStatus();

  async function onRun() {
    setBusy(true);
    setCheck(null);
    const blocked = checkReadOnly(s.code);
    if (blocked) setRun({ error: blocked });
    else {
      const r = await runSql(s.code, { dataset: ex.dataset });
      setRun(r.ok ? { result: r.value } : { error: r.error });
    }
    setBusy(false);
  }

  async function onCheck() {
    setBusy(true);
    setRun(null);
    const c = await checkSqlExercise(ex, s.code);
    setCheck(c);
    if (c.status !== 'error' || c.error.kind !== 'blocked') s.recordCheck(c.status === 'pass');
    setBusy(false);
  }

  return (
    <section className={styles.panel} aria-label="Exercise" data-testid={`exercise-${id}`}>
      <div className={styles.head}>
        <span className={`label ${styles.kicker}`}>Your turn · SQL{s.solved ? ' · ✓ solved' : ''}</span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowSchema((v) => !v)} aria-expanded={showSchema}>
          {showSchema ? 'Hide tables' : 'Show tables'}
        </button>
      </div>
      <InlineParas text={ex.prompt} className={styles.prompt} />
      {showSchema ? <SchemaPanel /> : null}
      <CodeEditor value={s.code} onChange={s.update} lang="sql" onRun={onRun} label="SQL exercise editor" />
      <div className={styles.toolbar}>
        <button type="button" className="btn btn-sm" onClick={onRun} disabled={busy}>
          Run <span className="kbd">Ctrl ↵</span>
        </button>
        <button type="button" className="btn btn-primary btn-sm" onClick={onCheck} disabled={busy}>
          Check answer
        </button>
        <span className={styles.status} aria-live="polite">
          {engineLabel('sql', status, busy)}
        </span>
      </div>

      <div aria-live="polite">
        {run?.result ? <ResultTable result={run.result} caption="Your result" /> : null}
        {run?.error ? <EngineErrorPanel error={run.error} /> : null}
        {check ? <SqlCheckPanel check={check} /> : null}
      </div>

      <HintsAndSolution
        hints={ex.hints}
        hintsShown={s.hintsShown}
        onHint={() => s.setHintsShown((n) => n + 1)}
        canReveal={s.attempts > 0 || s.hintsShown >= ex.hints.length}
        solution={ex.solution}
        showSolution={s.showSolution}
        onShowSolution={() => s.setShowSolution(true)}
        onUseSolution={() => s.update(ex.solution)}
      />
    </section>
  );
}

function SqlCheckPanel({ check }: { check: SqlCheck }) {
  if (check.status === 'error') return <EngineErrorPanel error={check.error} />;
  if (check.status === 'pass') {
    return (
      <div className={styles.success} role="status">
        <p className={styles.panelTitle}>Correct</p>
        <p>
          Matches the expected result{check.variantsChecked > 1 ? ` — on this data and ${check.variantsChecked - 1} hidden edge-case dataset` : ''}.
        </p>
        <ResultTable result={check.result} caption="Your result" maxHeight="14rem" />
      </div>
    );
  }
  return (
    <div className={styles.fail} role="status">
      <p className={styles.panelTitle}>Not yet</p>
      <ul className={styles.reasons}>
        {check.reasons.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>
      {check.variant === 'main' ? (
        <div className={styles.diff}>
          <div>
            <p className="label">Your result</p>
            <ResultTable result={check.result} caption="Your result" tone="extra" maxHeight="14rem" />
          </div>
          {check.missing.length ? (
            <div>
              <p className="label">Expected rows you’re missing</p>
              <ResultTable result={{ columns: check.expected.columns, rows: check.missing.slice(0, 50) }} caption="Missing rows" tone="missing" maxHeight="14rem" />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/* ---------- Python ---------- */

function PyExerciseView({ id, ex }: { id: string; ex: PyExercise }) {
  const s = useExerciseState(id, ex.starter);
  const [busy, setBusy] = useState(false);
  const [run, setRun] = useState<{ out?: PyRunOutput; error?: EngineError } | null>(null);
  const [check, setCheck] = useState<PyCheck | null>(null);
  const status = usePyStatus();

  async function onRun() {
    setBusy(true);
    setCheck(null);
    const r = await runPython(s.code);
    setRun(r.ok ? { out: r.value } : { error: r.error });
    setBusy(false);
  }

  async function onCheck() {
    setBusy(true);
    setRun(null);
    const c = await checkPyExercise({ cases: ex.cases, stdout: ex.stdout }, s.code);
    setCheck(c);
    if (c.status !== 'error' || c.error.kind !== 'blocked') s.recordCheck(c.status === 'pass');
    setBusy(false);
  }

  return (
    <section className={styles.panel} aria-label="Exercise" data-testid={`exercise-${id}`}>
      <div className={styles.head}>
        <span className={`label ${styles.kicker}`}>Your turn · Python{s.solved ? ' · ✓ solved' : ''}</span>
      </div>
      <InlineParas text={ex.prompt} className={styles.prompt} />
      <CodeEditor value={s.code} onChange={s.update} lang="python" onRun={onRun} label="Python exercise editor" minLines={6} />
      <div className={styles.toolbar}>
        <button type="button" className="btn btn-sm" onClick={onRun} disabled={busy}>
          Run <span className="kbd">Ctrl ↵</span>
        </button>
        <button type="button" className="btn btn-primary btn-sm" onClick={onCheck} disabled={busy}>
          Check answer
        </button>
        {busy && status === 'ready' ? (
          <button type="button" className="btn btn-ghost btn-sm" onClick={cancelPython}>
            Stop
          </button>
        ) : null}
        <span className={styles.status} aria-live="polite">
          {engineLabel('python', status, busy)}
        </span>
      </div>

      <div aria-live="polite">
        {run?.out ? <PyOutput out={run.out} /> : null}
        {run?.error ? <EngineErrorPanel error={run.error} /> : null}
        {check ? <PyCheckPanel check={check} expectedStdout={ex.stdout} /> : null}
      </div>

      <HintsAndSolution
        hints={ex.hints}
        hintsShown={s.hintsShown}
        onHint={() => s.setHintsShown((n) => n + 1)}
        canReveal={s.attempts > 0 || s.hintsShown >= ex.hints.length}
        solution={ex.solution}
        showSolution={s.showSolution}
        onShowSolution={() => s.setShowSolution(true)}
        onUseSolution={() => s.update(ex.solution)}
      />
    </section>
  );
}

export function PyOutput({ out }: { out: PyRunOutput }) {
  return (
    <>
      {out.stdout ? (
        <pre className={styles.stdout} aria-label="Output">
          {out.stdout}
        </pre>
      ) : null}
      {out.error ? (
        <EngineErrorPanel error={{ kind: 'runtime', message: out.error.traceback, hint: translatePyError(out.error.type, out.error.message) }} />
      ) : null}
      {!out.stdout && !out.error ? <p className={styles.status}>(no output — use print() to see values)</p> : null}
    </>
  );
}

function PyCheckPanel({ check, expectedStdout }: { check: PyCheck; expectedStdout?: string }) {
  if (check.status === 'error') return <EngineErrorPanel error={check.error} />;
  const cases = check.output.cases ?? [];
  const pass = check.status === 'pass';
  return (
    <div className={pass ? styles.success : styles.fail} role="status">
      <p className={styles.panelTitle}>{pass ? 'Correct' : 'Not yet'}</p>
      {!pass ? (
        <ul className={styles.reasons}>
          {check.reasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      ) : null}
      {check.output.error ? (
        <EngineErrorPanel
          error={{ kind: 'runtime', message: check.output.error.traceback, hint: translatePyError(check.output.error.type, check.output.error.message) }}
        />
      ) : null}
      {cases.length ? (
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.cases}>
            <thead>
              <tr>
                <th scope="col">Test</th>
                <th scope="col">Expected</th>
                <th scope="col">Got</th>
                <th scope="col">
                  <span className="sr-only">Result</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c, i) => (
                <tr key={i}>
                  <td>{c.call}</td>
                  <td>{c.expected}</td>
                  <td>{c.error ?? c.got}</td>
                  <td className={c.pass ? styles.casePass : styles.caseFail}>{c.pass ? '✓' : '✗'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {check.output.stdoutPass === false && expectedStdout !== undefined ? (
        <div className={styles.diff}>
          <div>
            <p className="label">Your output</p>
            <pre className={styles.stdout}>{check.output.stdout || '(nothing printed)'}</pre>
          </div>
          <div>
            <p className="label">Expected output</p>
            <pre className={styles.stdout}>{expectedStdout}</pre>
          </div>
        </div>
      ) : null}
      {pass && check.output.stdout ? <pre className={styles.stdout}>{check.output.stdout}</pre> : null}
    </div>
  );
}
