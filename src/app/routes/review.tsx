import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import type { SrsCard } from '../../learning/db';
import { reviewQueue, submitReview } from '../../learning/progress';
import type { ReviewGrade } from '../../learning/srs';
import { interleave, ReviewCard } from '../../components/review/review-card';
import page from './page.module.css';
import s from './review.module.css';

export function ReviewPage() {
  const [queue, setQueue] = useState<SrsCard[] | null>(null);
  const [backlog, setBacklog] = useState(0);
  const [index, setIndex] = useState(0);
  const [again, setAgain] = useState(0);
  const [saveError, setSaveError] = useState(false);
  // Ref, not state: a double key-press lands before React re-renders, and must not grade the card twice.
  const saving = useRef(false);

  // Snapshot the queue once per session, so grading a card doesn't reshuffle what's left.
  useEffect(() => {
    void reviewQueue().then(({ queue: q, backlog: b }) => {
      setQueue(interleave(q));
      setBacklog(b);
    });
  }, []);

  if (!queue) return <div className={page.page} />;
  const card = queue[index];
  const done = index >= queue.length;

  async function grade(g: ReviewGrade, ms: number) {
    if (!card || saving.current) return;
    saving.current = true;
    try {
      await submitReview(card.id, g, ms);
    } catch {
      // Keep the current card so the learner can retry; advancing would silently drop the review.
      setSaveError(true);
      return;
    } finally {
      saving.current = false;
    }
    setSaveError(false);
    if (g === 1) setAgain((n) => n + 1);
    setIndex((i) => i + 1);
  }

  return (
    <div className={`${page.page} ${page.narrow}`}>
      <header className={page.head}>
        <p className="label">Review · spaced repetition</p>
        <h1>{queue.length === 0 ? 'Nothing due.' : done ? 'Session done.' : 'Recall, don’t reread.'}</h1>
        {queue.length > 0 && !done ? (
          <div className={s.progress} aria-label={`Card ${index + 1} of ${queue.length}`}>
            <span className="label">
              {index + 1} / {queue.length}
            </span>
            <span className={s.meter} aria-hidden="true">
              <span style={{ width: `${(index / queue.length) * 100}%` }} />
            </span>
          </div>
        ) : null}
      </header>

      {saveError ? (
        <p role="alert" className={page.empty}>
          Couldn’t save that review (browser storage may be full or blocked). Grade the card again to retry.
        </p>
      ) : null}
      {card ? (
        <ReviewCard key={card.id} card={card} onGrade={(g, ms) => void grade(g, ms)} />
      ) : (
        <div className={page.empty}>
          {queue.length === 0 ? (
            <p>Cards come back right before you’re likely to forget them. Finish a lesson to add more.</p>
          ) : (
            <p>
              {queue.length} reviewed{again ? ` · ${again} marked “again” — they’ll come back sooner` : ' · all recalled'}.
            </p>
          )}
          {backlog ? <p>{backlog} new card(s) are waiting — the daily cap of new cards keeps reviews from snowballing.</p> : null}
          <Link to="/" className="btn btn-primary" viewTransition>
            Back to Today
          </Link>
        </div>
      )}
    </div>
  );
}
