import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { CodeBlock } from '../editor/code-block';
import { setChecklist } from '../../learning/progress';
import { db } from '../../learning/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useLesson } from './lesson-context';
import { SchemaPanel } from './schema-panel';
import styles from './prose.module.css';

/** Maps MDX fenced code blocks (<pre><code className="language-x">) to the highlighted CodeBlock. */
export function Pre({ children }: { children?: ReactNode }) {
  if (isValidElement(children)) {
    const el = children as ReactElement<{ className?: string; children?: ReactNode }>;
    const lang = el.props.className?.replace(/^language-/, '') ?? 'text';
    const code = String(el.props.children ?? '').replace(/\n$/, '');
    return <CodeBlock code={code} lang={lang} />;
  }
  return <pre>{children}</pre>;
}

/** Side-by-side "JS you know ↔ the new thing", with a mandatory "where the analogy breaks" note (plan R6). */
export function JsBridge({ children }: { children: ReactNode }) {
  return (
    <aside className={styles.bridge} aria-label="Bridge from JavaScript">
      <p className={`label ${styles.bridgeLabel}`}>From JavaScript</p>
      <div className={styles.bridgeGrid}>{children}</div>
    </aside>
  );
}

export function Breaks({ children }: { children: ReactNode }) {
  return (
    <div className={styles.breaks}>
      <p className="label">Where the analogy breaks</p>
      <div>{children}</div>
    </div>
  );
}

const CALLOUT_LABEL = { tip: 'Tip', warn: 'Watch out', dialect: 'Dialect note', de: 'In real pipelines' } as const;

export function Callout({ kind = 'tip', children }: { kind?: keyof typeof CALLOUT_LABEL; children: ReactNode }) {
  return (
    <aside className={`${styles.callout} ${styles[kind]}`}>
      <p className="label">{CALLOUT_LABEL[kind]}</p>
      <div>{children}</div>
    </aside>
  );
}

export function Schema({ tables }: { tables?: string }) {
  return (
    <div className={styles.schema}>
      <SchemaPanel only={tables ? tables.split(',').map((t) => t.trim()) : undefined} />
    </div>
  );
}

/** Local-lab checklist (💻 lessons). Ticks are saved so the lab can be done across sessions. */
export function Checklist() {
  const { lesson } = useLesson();
  const ticks = useLiveQuery(() => db.checklist.where('key').startsWith(`${lesson.id}#`).toArray(), [lesson.id]) ?? [];
  const done = new Set(ticks.filter((t) => t.done).map((t) => t.key));
  const count = lesson.checklist.filter((c) => done.has(`${lesson.id}#${c.id}`)).length;
  return (
    <section className={styles.checklist} aria-label="Lab checklist">
      <p className="label">
        Lab checklist · {count}/{lesson.checklist.length}
      </p>
      <ul>
        {lesson.checklist.map((c) => {
          const key = `${lesson.id}#${c.id}`;
          return (
            <li key={c.id}>
              <label className={styles.check}>
                <input type="checkbox" checked={done.has(key)} onChange={(e) => void setChecklist(key, e.target.checked)} />
                <span>{c.text}</span>
              </label>
              {c.command ? <CodeBlock code={c.command} lang="bash" /> : null}
              {c.verify ? <p className={styles.verify}>✓ Check: {c.verify}</p> : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
