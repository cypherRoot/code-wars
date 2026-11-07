import { useState } from 'react';
import type { QuizItem } from '../../content/schema';
import { CodeBlock } from '../editor/code-block';
import { InlineMd } from '../ui/inline-md';
import styles from './panels.module.css';
import q from './quiz.module.css';

export interface ItemResult {
  itemId: string;
  correct: boolean;
}

function isCorrect(item: QuizItem, picked: Set<number>) {
  return item.options.every((o, i) => o.correct === picked.has(i));
}

/** One question; every option carries an explanation shown after answering. Used in lessons and reviews. */
export function QuizQuestion({
  item,
  index,
  total,
  onAnswered,
  name,
}: {
  item: QuizItem;
  index?: number;
  total?: number;
  onAnswered: (correct: boolean) => void;
  name: string;
}) {
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const multi = item.type === 'multi';
  const correct = submitted && isCorrect(item, picked);

  function toggle(i: number) {
    if (submitted) return;
    setPicked((p) => {
      const next = new Set(multi ? p : []);
      if (multi && p.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function submit() {
    setSubmitted(true);
    onAnswered(isCorrect(item, picked));
  }

  return (
    <fieldset className={q.question}>
      <legend className={q.legend}>
        {index !== undefined && total ? (
          <span className="label">
            Question {index + 1} of {total}
            {multi ? ' · select all that apply' : ''}
          </span>
        ) : multi ? (
          <span className="label">Select all that apply</span>
        ) : null}
        <span className={q.prompt}>
          <InlineMd text={item.prompt} />
        </span>
      </legend>
      {item.code ? <CodeBlock code={item.code} lang={item.lang} /> : null}
      <div className={q.options}>
        {item.options.map((o, i) => {
          const chosen = picked.has(i);
          const state = submitted ? (o.correct ? 'right' : chosen ? 'wrong' : 'idle') : '';
          return (
            <div key={i} className={`${q.option} ${state ? q[state] : ''}`}>
              <label className={q.optLabel}>
                <input type={multi ? 'checkbox' : 'radio'} name={name} checked={chosen} onChange={() => toggle(i)} disabled={submitted} />
                <span>
                  <InlineMd text={o.text} />
                </span>
              </label>
              {submitted && (chosen || o.correct) ? (
                <p className={q.why}>
                  <span className={o.correct ? q.tagRight : q.tagWrong}>{o.correct ? 'Correct' : 'Not this'}</span> <InlineMd text={o.why} />
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
      {!submitted ? (
        <div>
          <button type="button" className="btn btn-primary btn-sm" disabled={picked.size === 0} onClick={submit}>
            Submit answer
          </button>
        </div>
      ) : (
        <p className={correct ? q.resRight : q.resWrong} role="status">
          {correct ? 'Correct.' : 'Not quite — read the explanations above.'}
        </p>
      )}
    </fieldset>
  );
}

/** End-of-lesson quiz. First answers are final (they seed spaced repetition). */
export function Quiz({ items, lessonId, onDone }: { items: QuizItem[]; lessonId: string; onDone: (results: ItemResult[]) => void }) {
  const [results, setResults] = useState<ItemResult[]>([]);
  const [shown, setShown] = useState(1);
  const done = results.length === items.length;
  const score = results.filter((r) => r.correct).length;

  function answered(itemId: string, correct: boolean) {
    if (results.some((r) => r.itemId === itemId)) return;
    const next = [...results, { itemId, correct }];
    setResults(next);
    if (next.length === items.length) onDone(next);
  }

  return (
    <section className={styles.panel} aria-labelledby="quiz-title">
      <div className={styles.head}>
        <h2 id="quiz-title" className={q.title}>
          Check yourself
        </h2>
        <span className="label">
          {results.length}/{items.length} answered
        </span>
      </div>
      <p className={styles.why}>Answer from memory — no scrolling back up. Mistakes here are useful: they go into your review queue.</p>
      {items.slice(0, shown).map((item, i) => (
        <QuizQuestion
          key={item.id}
          item={item}
          index={i}
          total={items.length}
          name={`quiz-${lessonId}-${item.id}`}
          onAnswered={(c) => {
            answered(item.id, c);
            if (i + 1 === shown && shown < items.length) setTimeout(() => setShown((s) => s + 1), 0);
          }}
        />
      ))}
      {done ? (
        <p className={`${q.score} label`} role="status">
          Score {score}/{items.length}
        </p>
      ) : null}
    </section>
  );
}
