import { useEffect, useState } from 'react';
import { LESSONS, contentErrors } from '../../content/registry';
import { checkSqlExercise } from '../../engines/sql/check';
import { runSql } from '../../engines/sql/engine';
import { checkPyExercise } from '../../engines/python/check';
import { runPython } from '../../engines/python/client';
import page from './page.module.css';
import s from './dev-validate.module.css';

interface Row {
  lesson: string;
  item: string;
  check: string;
  ok: boolean;
  detail?: string;
}

/**
 * Content validation (plan R4), run against the real in-browser engines:
 * every reference + alternate solution passes, every known-wrong solution fails,
 * every worked example runs (or errors, when it's meant to).
 * Driven by `npm run validate:content` (Playwright), or open /dev/validate by hand.
 */
async function validateAll(onRow: (r: Row) => void) {
  for (const e of contentErrors) onRow({ lesson: e.file, item: '(schema)', check: 'parses', ok: false, detail: e.message });

  for (const lesson of LESSONS) {
    for (const [id, w] of Object.entries(lesson.worked)) {
      if (w.lang === 'sql') {
        const r = await runSql(w.code, { dataset: w.dataset });
        onRow({ lesson: lesson.id, item: `worked:${id}`, check: 'runs', ok: r.ok !== w.expectError, detail: r.ok ? `${r.value.rowCount} rows` : r.error.message });
      } else {
        const r = await runPython(w.code);
        const raised = !r.ok || Boolean(r.value.error);
        onRow({
          lesson: lesson.id,
          item: `worked:${id}`,
          check: w.expectError ? 'raises (as intended)' : 'runs',
          ok: raised === w.expectError,
          detail: r.ok ? (r.value.error?.message ?? r.value.stdout.slice(0, 80)) : r.error.message,
        });
      }
      if (w.predict && w.predict.answer >= w.predict.options.length) {
        onRow({ lesson: lesson.id, item: `worked:${id}`, check: 'predict answer index', ok: false });
      }
    }

    for (const [id, ex] of Object.entries(lesson.exercises)) {
      const check = (code: string) => (ex.lang === 'sql' ? checkSqlExercise(ex, code) : checkPyExercise({ cases: ex.cases, stdout: ex.stdout }, code));
      const describe = (c: Awaited<ReturnType<typeof check>>) =>
        c.status === 'error' ? `error: ${c.error.message}` : c.status === 'fail' ? c.reasons.join(' ') : 'pass';

      const ref = await check(ex.solution);
      onRow({ lesson: lesson.id, item: `ex:${id}`, check: 'reference passes', ok: ref.status === 'pass', detail: describe(ref) });
      for (const [i, alt] of ex.alternates.entries()) {
        const c = await check(alt);
        onRow({ lesson: lesson.id, item: `ex:${id}`, check: `alternate ${i + 1} passes`, ok: c.status === 'pass', detail: describe(c) });
      }
      for (const [i, wrong] of ex.wrong.entries()) {
        const c = await check(wrong);
        onRow({ lesson: lesson.id, item: `ex:${id}`, check: `wrong ${i + 1} fails`, ok: c.status === 'fail', detail: describe(c) });
      }
      if (ex.lang === 'sql' && ex.starter.trim()) {
        const c = await check(ex.starter);
        onRow({ lesson: lesson.id, item: `ex:${id}`, check: 'starter is not already correct', ok: c.status !== 'pass', detail: describe(c) });
      }
    }

    for (const [id, p] of Object.entries(lesson.parsons)) {
      onRow({ lesson: lesson.id, item: `parsons:${id}`, check: 'lines are unique', ok: new Set(p.lines).size === p.lines.length });
    }
  }
}

export function ValidatePage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let alive = true;
    const acc: Row[] = [];
    void validateAll((r) => {
      acc.push(r);
      if (alive) setRows([...acc]);
    }).then(() => alive && setDone(true));
    return () => {
      alive = false;
    };
  }, []);

  const failed = rows.filter((r) => !r.ok);
  return (
    <div className={page.page}>
      <header className={page.head}>
        <p className="label">Developer · content validation</p>
        <h1>Every answer, checked by the real engines.</h1>
        <p className={failed.length ? s.bad : s.ok} data-testid="validate-summary" data-done={done}>
          {done ? (failed.length ? `FAIL ${failed.length} of ${rows.length}` : `PASS ${rows.length}/${rows.length}`) : `Running… ${rows.length} checks`}
        </p>
      </header>
      <div className={s.scroll}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Lesson</th>
              <th>Item</th>
              <th>Check</th>
              <th>Result</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            {[...failed, ...rows.filter((r) => r.ok)].map((r, i) => (
              <tr key={i} className={r.ok ? undefined : s.failRow} data-testid={r.ok ? undefined : 'validate-fail'}>
                <td>{r.lesson}</td>
                <td>{r.item}</td>
                <td>{r.check}</td>
                <td className={r.ok ? s.ok : s.bad}>{r.ok ? 'ok' : 'FAIL'}</td>
                <td className={s.detail}>{r.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
