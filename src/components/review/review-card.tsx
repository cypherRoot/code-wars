import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { lessonById } from '../../content/registry';
import type { SrsCard } from '../../learning/db';
import { gradeFor, Rating, type ReviewGrade } from '../../learning/srs';
import { QuizQuestion } from '../lesson/quiz';
import { InlineParas } from '../ui/inline-md';
import { TRACKS } from '../../content/curriculum';
import styles from './review-card.module.css';

/**
 * One review item. Quiz cards are auto-graded (wrong → Again, right → Good);
 * concept cards are self-graded with Again / Hard / Good / Easy (keys 1–4, Space to reveal).
 */
export function ReviewCard({ card, onGrade }: { card: SrsCard; onGrade: (grade: ReviewGrade, elapsedMs: number) => void }) {
  const started = useRef(0);
  const lesson = lessonById.get(card.lessonId);
  const quizItem = card.kind === 'quiz' ? lesson?.quiz.find((q) => q.id === card.itemId) : undefined;
  const concept = card.kind === 'card' ? lesson?.cards.find((c) => c.id === card.itemId) : undefined;
  const [revealed, setRevealed] = useState(false);
  const [quizResult, setQuizResult] = useState<boolean | null>(null);

  useEffect(() => {
    started.current = performance.now();
  }, [card.id]);

  useEffect(() => {
    if (!concept) return;
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement;
      if (t.closest('input, textarea, .cm-editor')) return;
      if (!revealed && (e.key === ' ' || e.key === 'Enter') && !t.closest('button, a')) {
        e.preventDefault();
        setRevealed(true);
      } else if (revealed && ['1', '2', '3', '4'].includes(e.key)) {
        onGrade(Number(e.key) as ReviewGrade, Math.round(performance.now() - started.current));
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [concept, revealed, onGrade]);

  const elapsed = () => Math.round(performance.now() - started.current);
  const track = lesson ? TRACKS[lesson.track] : undefined;
  const style = { '--track': track?.color } as CSSProperties;
  const source = lesson ? (
    <p className="label" style={{ color: track?.color }}>
      {lesson.module} · {lesson.title}
    </p>
  ) : null;

  if (!lesson || (!quizItem && !concept)) {
    return (
      <div className={styles.card}>
        <p>This card’s lesson content changed or was removed.</p>
        <div>
          <button type="button" className="btn btn-sm" onClick={() => onGrade(Rating.Good, 0)}>
            Skip
          </button>
        </div>
      </div>
    );
  }

  if (quizItem) {
    return (
      <div className={styles.card} style={style}>
        {source}
        <QuizQuestion key={card.id} item={quizItem} name={`review-${card.id}`} onAnswered={(c) => setQuizResult(c)} />
        {quizResult !== null ? (
          <div>
            <button type="button" className="btn btn-primary" onClick={() => onGrade(gradeFor(quizResult), elapsed())} autoFocus>
              Next →
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={styles.card} style={style}>
      {source}
      <InlineParas text={concept!.front} className={styles.front} />
      {!revealed ? (
        <div>
          <button type="button" className="btn btn-primary" onClick={() => setRevealed(true)}>
            Show answer <span className="kbd">Space</span>
          </button>
        </div>
      ) : (
        <>
          <InlineParas text={concept!.back} className={styles.back} />
          <div className={styles.grades} role="group" aria-label="How well did you remember?">
            {(
              [
                [Rating.Again, 'Again', 'forgot'],
                [Rating.Hard, 'Hard', 'struggled'],
                [Rating.Good, 'Good', 'recalled'],
                [Rating.Easy, 'Easy', 'instant'],
              ] as const
            ).map(([g, label, sub], i) => (
              <button key={g} type="button" className={`btn ${styles.grade}`} onClick={() => onGrade(g, elapsed())}>
                <span>
                  {label} <span className="kbd">{i + 1}</span>
                </span>
                <span className={styles.sub}>{sub}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** Round-robin by lesson so consecutive cards come from different topics (interleaving). */
export function interleave(cards: SrsCard[]): SrsCard[] {
  const groups = new Map<string, SrsCard[]>();
  for (const c of cards) {
    const g = groups.get(c.lessonId) ?? [];
    g.push(c);
    groups.set(c.lessonId, g);
  }
  const out: SrsCard[] = [];
  const lists = [...groups.values()];
  while (out.length < cards.length) {
    for (const l of lists) {
      const c = l.shift();
      if (c) out.push(c);
    }
  }
  return out;
}
