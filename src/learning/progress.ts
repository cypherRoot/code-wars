import { db as defaultDb, type DataForgeDB, type DayLog, type SrsCard } from './db';
import { dateKey, endOfToday, startOfTomorrow } from './dates';
import { gradeFor, isNew, newCardState, NEW_CARDS_PER_DAY, review, type ReviewGrade } from './srs';

interface LessonRef {
  id: string;
  version: number;
  quiz: { id: string }[];
  cards: { id: string }[];
}

async function updateDay(database: DataForgeDB, now: Date, fn: (d: DayLog) => void) {
  const date = dateKey(now);
  await database.transaction('rw', database.days, async () => {
    const day = (await database.days.get(date)) ?? { date, activeMs: 0, lessonsCompleted: [], reviews: 0, exercisesPassed: 0 };
    fn(day);
    await database.days.put(day);
  });
}

export async function startLesson(lesson: LessonRef, now = new Date(), database = defaultDb) {
  const existing = await database.lessons.get(lesson.id);
  if (existing) return existing;
  const progress = {
    lessonId: lesson.id,
    status: 'started' as const,
    startedAt: now.getTime(),
    contentVersion: lesson.version,
    activeMs: 0,
    exercisesPassed: [],
  };
  await database.lessons.put(progress);
  return progress;
}

/** Visible-tab time spent in a lesson. Counts toward the day even after the lesson is done. */
export async function addActiveTime(lessonId: string, ms: number, now = new Date(), database = defaultDb) {
  if (ms <= 0) return;
  await database.lessons.where('lessonId').equals(lessonId).modify((p) => {
    p.activeMs += ms;
  });
  await updateDay(database, now, (d) => {
    d.activeMs += ms;
  });
}

export async function recordAttempt(
  lessonId: string,
  itemKey: string,
  correct: boolean,
  hintsUsed = 0,
  now = new Date(),
  database = defaultDb,
) {
  await database.attempts.add({ lessonId, itemKey, correct, hintsUsed, at: now.getTime() });
}

export async function markExercisePassed(lessonId: string, exerciseId: string, now = new Date(), database = defaultDb) {
  let firstTime = false;
  await database.lessons.where('lessonId').equals(lessonId).modify((p) => {
    if (!p.exercisesPassed.includes(exerciseId)) {
      p.exercisesPassed.push(exerciseId);
      firstTime = true;
    }
  });
  if (firstTime) {
    await updateDay(database, now, (d) => {
      d.exercisesPassed++;
    });
  }
}

export interface QuizAnswer {
  itemId: string;
  correct: boolean;
}

/**
 * Completes a lesson and seeds spaced repetition:
 * - each quiz item's in-lesson answer counts as its first FSRS review (wrong → Again, right → Good);
 * - concept cards start as new cards, first due tomorrow (not straight after reading the lesson).
 */
export async function completeLesson(lesson: LessonRef, answers: QuizAnswer[], now = new Date(), database = defaultDb) {
  const score = answers.length ? answers.filter((a) => a.correct).length / answers.length : 1;
  const t = now.getTime();
  await database.transaction('rw', [database.lessons, database.cards, database.reviews, database.days], async () => {
    const prev = await database.lessons.get(lesson.id);
    await database.lessons.put({
      lessonId: lesson.id,
      status: 'completed',
      startedAt: prev?.startedAt ?? t,
      completedAt: prev?.completedAt ?? t,
      quizScore: Math.max(score, prev?.quizScore ?? 0),
      contentVersion: lesson.version,
      activeMs: prev?.activeMs ?? 0,
      exercisesPassed: prev?.exercisesPassed ?? [],
    });

    for (const a of answers) {
      const id = `${lesson.id}#quiz:${a.itemId}`;
      if (await database.cards.get(id)) continue; // retaking a lesson doesn't reset scheduling
      const before = newCardState(now);
      const after = review(before, gradeFor(a.correct), now);
      await database.cards.put({ id, lessonId: lesson.id, kind: 'quiz', itemId: a.itemId, due: after.due, fsrs: after, createdAt: t });
      await database.reviews.add({ cardId: id, rating: gradeFor(a.correct), at: t, stateBefore: 0, elapsedMs: 0 });
    }
    for (const c of lesson.cards) {
      const id = `${lesson.id}#card:${c.id}`;
      if (await database.cards.get(id)) continue;
      await database.cards.put({
        id,
        lessonId: lesson.id,
        kind: 'card',
        itemId: c.id,
        due: startOfTomorrow(now).getTime(),
        fsrs: newCardState(now),
        createdAt: t,
      });
    }

    const date = dateKey(now);
    const day = (await database.days.get(date)) ?? { date, activeMs: 0, lessonsCompleted: [], reviews: 0, exercisesPassed: 0 };
    if (!day.lessonsCompleted.includes(lesson.id)) day.lessonsCompleted.push(lesson.id);
    await database.days.put(day);
  });
  return score;
}

/**
 * Today's review queue (plan R5): due review cards, most overdue first, then new cards up to the daily cap.
 */
export async function reviewQueue(now = new Date(), database = defaultDb): Promise<{ queue: SrsCard[]; backlog: number }> {
  const due = await database.cards.where('due').belowOrEqual(endOfToday(now)).toArray();
  const learned = due.filter((c) => !isNew(c.fsrs)).sort((a, b) => a.due - b.due);
  const fresh = due.filter((c) => isNew(c.fsrs)).sort((a, b) => a.createdAt - b.createdAt);

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const introducedToday = await database.reviews
    .where('at')
    .aboveOrEqual(todayStart)
    .filter((r) => r.stateBefore === 0 && !r.cardId.includes('#quiz:'))
    .count();
  const allowNew = Math.max(0, NEW_CARDS_PER_DAY - introducedToday);
  const queue = [...learned, ...fresh.slice(0, allowNew)];
  return { queue, backlog: fresh.length - Math.min(fresh.length, allowNew) };
}

export async function submitReview(cardId: string, grade: ReviewGrade, elapsedMs: number, now = new Date(), database = defaultDb) {
  await database.transaction('rw', [database.cards, database.reviews, database.days], async () => {
    const card = await database.cards.get(cardId);
    if (!card) return;
    const next = review(card.fsrs, grade, now);
    await database.cards.put({ ...card, fsrs: next, due: next.due });
    await database.reviews.add({ cardId, rating: grade, at: now.getTime(), stateBefore: card.fsrs.state, elapsedMs });
    const date = dateKey(now);
    const day = (await database.days.get(date)) ?? { date, activeMs: 0, lessonsCompleted: [], reviews: 0, exercisesPassed: 0 };
    day.reviews++;
    day.activeMs += Math.min(elapsedMs, 120_000);
    await database.days.put(day);
  });
}

export async function saveDraft(key: string, code: string, database = defaultDb) {
  await database.drafts.put({ key, code, updatedAt: Date.now() });
}

export async function loadDraft(key: string, database = defaultDb) {
  return (await database.drafts.get(key))?.code;
}

export async function setChecklist(key: string, done: boolean, database = defaultDb) {
  await database.checklist.put({ key, done, at: Date.now() });
}

/** A day counts toward the streak when something was learned or reviewed. */
export const isActiveDay = (d: DayLog) => d.lessonsCompleted.length > 0 || d.reviews > 0 || d.exercisesPassed > 0;
