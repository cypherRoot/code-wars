import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { CodeEditor } from '../../components/editor/code-editor';
import { ResultTable } from '../../components/lesson/result-table';
import { EngineErrorPanel } from '../../components/lesson/engine-error';
import { SchemaPanel } from '../../components/lesson/schema-panel';
import { PyOutput } from '../../components/lesson/exercise';
import { engineLabel, usePyStatus, useSqlStatus } from '../../components/lesson/use-engine-status';
import { PLAYGROUND_VARIANT, reseed, runSql, warmSql } from '../../engines/sql/engine';
import { cancelPython, runPython, warmPython } from '../../engines/python/client';
import type { EngineError, QueryResult } from '../../engines/result';
import type { PyRunOutput } from '../../engines/python/protocol';
import { loadDraft, saveDraft } from '../../learning/progress';
import page from './page.module.css';
import panels from '../../components/lesson/panels.module.css';
import s from './playground.module.css';

const SQL_START = `-- Anything goes here: SELECT, CREATE, INSERT, UPDATE…
-- "Reset data" restores the original tables.
SELECT country, COUNT(*) AS customers
FROM customers
GROUP BY country
ORDER BY customers DESC;`;

const PY_START = `# A scratchpad. Python runs in your browser.
orders = [114.49, 29.99, 349.00, 42.50]
total = sum(orders)
print(f"{len(orders)} orders, total {total:.2f}")`;

function useDraft(key: string, fallback: string) {
  const [code, setCode] = useState(fallback);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Set once the learner types, so a slow IndexedDB read can't replace what they've already written.
  const edited = useRef(false);
  useEffect(() => {
    let alive = true;
    edited.current = false;
    void loadDraft(key).then((d) => {
      if (alive && !edited.current && d !== undefined) setCode(d);
    });
    return () => {
      alive = false;
    };
  }, [key]);
  const update = (v: string) => {
    edited.current = true;
    setCode(v);
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => void saveDraft(key, v), 600);
  };
  return [code, update] as const;
}

export function PlaygroundPage() {
  const [tab, setTab] = useState<'sql' | 'python'>('sql');
  useEffect(() => {
    if (tab === 'sql') warmSql('shop', PLAYGROUND_VARIANT);
    else warmPython();
  }, [tab]);

  return (
    <div className={page.page} style={{ '--track': tab === 'sql' ? 'var(--sql-text)' : 'var(--py)' } as CSSProperties}>
      <header className={page.head}>
        <p className="label">Playground</p>
        <h1>Break things. Nothing is graded.</h1>
      </header>
      <div className={s.tabs} role="tablist" aria-label="Language">
        {(['sql', 'python'] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={`${s.tab} ${tab === t ? s.tabOn : ''}`} onClick={() => setTab(t)}>
            {t === 'sql' ? 'SQL · DuckDB' : 'Python · Pyodide'}
          </button>
        ))}
      </div>
      <div role="tabpanel">{tab === 'sql' ? <SqlPlayground /> : <PyPlayground />}</div>
    </div>
  );
}

function SqlPlayground() {
  const [code, setCode] = useDraft('playground:sql', SQL_START);
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<{ result?: QueryResult; error?: EngineError } | null>(null);
  const status = useSqlStatus();

  async function run() {
    setBusy(true);
    const r = await runSql(code, { variant: PLAYGROUND_VARIANT });
    setOut(r.ok ? { result: r.value } : { error: r.error });
    setBusy(false);
  }

  return (
    <div className={s.grid}>
      <div className={s.main}>
        <CodeEditor value={code} onChange={setCode} lang="sql" onRun={run} label="SQL playground editor" minLines={8} />
        <div className={panels.toolbar}>
          <button className="btn btn-primary btn-sm" onClick={run} disabled={busy}>
            Run <span className="kbd">Ctrl ↵</span>
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={async () => {
              setBusy(true);
              await reseed('shop');
              setOut(null);
              setBusy(false);
            }}
            disabled={busy}
          >
            Reset data
          </button>
          <span className={panels.status} aria-live="polite">
            {engineLabel('sql', status, busy)}
          </span>
        </div>
        <div aria-live="polite">
          {out?.result ? <ResultTable result={out.result} /> : null}
          {out?.error ? <EngineErrorPanel error={out.error} /> : null}
        </div>
      </div>
      <aside className={s.side} aria-label="Tables">
        <p className="label">Tables in shop</p>
        <SchemaPanel />
      </aside>
    </div>
  );
}

function PyPlayground() {
  const [code, setCode] = useDraft('playground:py', PY_START);
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<{ out?: PyRunOutput; error?: EngineError } | null>(null);
  const status = usePyStatus();

  async function run() {
    setBusy(true);
    const r = await runPython(code);
    setOut(r.ok ? { out: r.value } : { error: r.error });
    setBusy(false);
  }

  return (
    <div className={s.main}>
      <CodeEditor value={code} onChange={setCode} lang="python" onRun={run} label="Python playground editor" minLines={10} />
      <div className={panels.toolbar}>
        <button className="btn btn-primary btn-sm" onClick={run} disabled={busy}>
          Run <span className="kbd">Ctrl ↵</span>
        </button>
        {busy && status === 'ready' ? (
          <button className="btn btn-ghost btn-sm" onClick={cancelPython}>
            Stop
          </button>
        ) : null}
        <span className={panels.status} aria-live="polite">
          {engineLabel('python', status, busy)}
        </span>
      </div>
      <div aria-live="polite">
        {out?.out ? <PyOutput out={out.out} /> : null}
        {out?.error ? <EngineErrorPanel error={out.error} /> : null}
      </div>
    </div>
  );
}
