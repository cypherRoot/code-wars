import { createEmptyCard, fsrs, generatorParameters, Rating, type Card, type Grade } from 'ts-fsrs';
import type { FsrsState } from './db';

/*
 * The only module that touches ts-fsrs (pinned to 6.0.0, plan R5). It uses the legacy `fsrs()` API,
 * which is stable and synchronous; switching to the newer DefaultScheduler only changes this file.
 */

export const TARGET_RETENTION = 0.9;
export const NEW_CARDS_PER_DAY = 10;

/*
 * Short-term (minutes-based) learning steps are off: this is a once-a-day app, and quiz items were just
 * answered in the lesson. A correct answer schedules days ahead; a miss comes back the next day.
 */
const scheduler = fsrs(generatorParameters({ request_retention: TARGET_RETENTION, enable_fuzz: true, enable_short_term: false }));

export { Rating };
export type ReviewGrade = Grade;

function toCard(s: FsrsState): Card {
  return {
    ...s,
    due: new Date(s.due),
    last_review: s.last_review === undefined ? undefined : new Date(s.last_review),
  } as Card;
}

function fromCard(c: Card): FsrsState {
  return {
    due: c.due.getTime(),
    stability: c.stability,
    difficulty: c.difficulty,
    scheduled_days: c.scheduled_days,
    learning_steps: c.learning_steps,
    reps: c.reps,
    lapses: c.lapses,
    state: c.state,
    last_review: c.last_review ? c.last_review.getTime() : undefined,
  };
}

export function newCardState(now: Date): FsrsState {
  return fromCard(createEmptyCard(now));
}

export function review(state: FsrsState, grade: ReviewGrade, now: Date): FsrsState {
  return fromCard(scheduler.next(toCard(state), now, grade).card);
}

/** Plan R5 mapping for auto-graded items: wrong → Again; right after a hint → Hard; right → Good. */
export function gradeFor(correct: boolean, usedHint = false): ReviewGrade {
  if (!correct) return Rating.Again;
  return usedHint ? Rating.Hard : Rating.Good;
}

/** Card state 0 = New in ts-fsrs. */
export const isNew = (s: FsrsState) => s.state === 0;
