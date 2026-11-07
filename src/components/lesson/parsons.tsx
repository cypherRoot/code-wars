import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { recordAttempt } from '../../learning/progress';
import { CodeBlock } from '../editor/code-block';
import { InlineMd } from '../ui/inline-md';
import { useLesson } from './lesson-context';
import styles from './panels.module.css';
import p from './parsons.module.css';

/** Deterministic shuffle (seeded by the item id) that never returns the solved order. */
export function seededShuffle<T>(items: T[], seed: string): T[] {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const rand = () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 10_000) / 10_000;
  };
  const out = items.map((v, i) => ({ v, i }));
  for (let attempt = 0; attempt < 10; attempt++) {
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [out[i], out[j]] = [out[j]!, out[i]!];
    }
    if (out.some((x, i) => x.i !== i)) break;
  }
  if (out.every((x, i) => x.i === i) && out.length > 1) out.reverse();
  return out.map((x) => x.v);
}

/** Parsons problem: put the lines in order. Reorder with buttons or Alt+↑/↓ (plan R9 keyboard access). */
export function Parsons({ id }: { id: string }) {
  const { lesson } = useLesson();
  const item = lesson.parsons[id];
  const initial = useMemo(() => (item ? seededShuffle(item.lines.map((text, i) => ({ text, key: i })), `${lesson.id}:${id}`) : []), [item, lesson.id, id]);
  const [lines, setLines] = useState(initial);
  const [result, setResult] = useState<null | boolean[]>(null);
  const [tries, setTries] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  if (!item) return null;
  const solved = result?.every(Boolean) ?? false;

  function move(from: number, to: number) {
    if (to < 0 || to >= lines.length) return;
    setLines((ls) => {
      const next = [...ls];
      const [x] = next.splice(from, 1);
      next.splice(to, 0, x!);
      return next;
    });
    setResult(null);
    requestAnimationFrame(() => refs.current[to]?.focus());
  }

  function onKey(e: KeyboardEvent, i: number) {
    if (!e.altKey) {
      if (e.key === 'ArrowDown') refs.current[i + 1]?.focus();
      if (e.key === 'ArrowUp') refs.current[i - 1]?.focus();
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') e.preventDefault();
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      move(i, i - 1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      move(i, i + 1);
    }
  }

  function check() {
    const r = lines.map((l, i) => l.key === i);
    setResult(r);
    setTries((t) => t + 1);
    if (tries === 0 || r.every(Boolean)) void recordAttempt(lesson.id, `parsons:${id}`, r.every(Boolean));
  }

  return (
    <section className={styles.panel} aria-label="Put the lines in order">
      <div className={styles.head}>
        <span className={`label ${styles.kicker}`}>Put it in order</span>
        <span className="label">Alt + ↑/↓ moves a line</span>
      </div>
      <p className={styles.prompt}>
        <InlineMd text={item.prompt} />
      </p>
      <ol className={p.list}>
        {lines.map((l, i) => (
          <li
            key={l.key}
            ref={(el) => {
              refs.current[i] = el;
            }}
            tabIndex={0}
            onKeyDown={(e) => onKey(e, i)}
            className={`${p.line} ${result ? (result[i] ? p.ok : p.bad) : ''}`}
            aria-label={`Line ${i + 1}: ${l.text}${result ? (result[i] ? ', correct position' : ', wrong position') : ''}`}
          >
            <span className={p.num}>{i + 1}</span>
            <code className={p.code}>{l.text}</code>
            <span className={p.btns}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label={`Move line ${i + 1} up`}>
                ↑
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => move(i, i + 1)}
                disabled={i === lines.length - 1}
                aria-label={`Move line ${i + 1} down`}
              >
                ↓
              </button>
            </span>
          </li>
        ))}
      </ol>
      <div className={styles.toolbar}>
        <button type="button" className="btn btn-primary btn-sm" onClick={check} disabled={solved}>
          Check order
        </button>
        <span className={styles.status} aria-live="polite">
          {result ? (solved ? 'Correct order ✓' : `${result.filter(Boolean).length}/${result.length} lines in the right place`) : ''}
        </span>
      </div>
      {solved ? (
        <div className={styles.success}>
          <p className={styles.panelTitle}>Correct</p>
          <CodeBlock code={item.lines.join('\n')} lang={item.lang} />
          <p className={styles.why}>
            <InlineMd text={item.explain} />
          </p>
        </div>
      ) : null}
    </section>
  );
}
