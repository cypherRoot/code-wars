import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DataForgeDB } from '../../src/learning/db';
import { completeLesson, reviewQueue, submitReview, startLesson } from '../../src/learning/progress';
import { exportBackup, importBackup } from '../../src/learning/backup';
import { Rating } from '../../src/learning/srs';

const lesson = {
  id: 'sql.s1.where',
  version: 1,
  quiz: [{ id: 'q1' }, { id: 'q2' }, { id: 'q3' }],
  cards: [{ id: 'c1' }, { id: 'c2' }],
};

let db: DataForgeDB;
let n = 0;
beforeEach(() => {
  db = new DataForgeDB(`test-${n++}`);
});
afterEach(async () => {
  await db.delete();
});

const day = (d: number, h = 10) => new Date(2026, 10, d, h);

describe('completeLesson + SRS', () => {
  it('records completion and seeds cards: quiz answers are first reviews, concept cards wait until tomorrow', async () => {
    await startLesson(lesson, day(7), db);
    const score = await completeLesson(lesson, [
      { itemId: 'q1', correct: true },
      { itemId: 'q2', correct: false },
      { itemId: 'q3', correct: true },
    ], day(7), db);

    expect(score).toBeCloseTo(2 / 3);
    const p = await db.lessons.get(lesson.id);
    expect(p?.status).toBe('completed');
    expect(await db.cards.count()).toBe(5);
    expect(await db.reviews.count()).toBe(3);

    // Same day: nothing is due — the quiz was just answered.
    expect((await reviewQueue(day(7, 23), db)).queue).toHaveLength(0);

    // Tomorrow: the missed quiz item and the concept cards; correctly answered items wait longer.
    const ids = (await reviewQueue(day(8), db)).queue.map((c) => c.id);
    expect(ids).toContain('sql.s1.where#quiz:q2');
    expect(ids).not.toContain('sql.s1.where#quiz:q1');
    expect(ids.filter((id) => id.includes('#card:'))).toHaveLength(2);
  });

  it('logs the day as active and counts the lesson once even if retaken', async () => {
    await completeLesson(lesson, [{ itemId: 'q1', correct: true }], day(7), db);
    await completeLesson(lesson, [{ itemId: 'q1', correct: true }], day(7, 11), db);
    const d = await db.days.get('2026-11-07');
    expect(d?.lessonsCompleted).toEqual([lesson.id]);
    expect(await db.cards.count()).toBe(3); // 1 quiz + 2 concept cards, not duplicated
  });

  it('a good review pushes the card into the future', async () => {
    await completeLesson(lesson, [], day(7), db);
    const card = (await db.cards.toArray())[0]!;
    await submitReview(card.id, Rating.Good, 4000, day(8), db);
    const after = await db.cards.get(card.id);
    expect(after!.due).toBeGreaterThan(day(8).getTime());
    expect((await db.days.get('2026-11-08'))?.reviews).toBe(1);
  });

  it('caps new cards per day', async () => {
    const many = { ...lesson, cards: Array.from({ length: 14 }, (_, i) => ({ id: `c${i}` })) };
    await completeLesson(many, [], day(7), db);
    const { queue, backlog } = await reviewQueue(day(8), db);
    expect(queue).toHaveLength(10);
    expect(backlog).toBe(4);
  });
});

describe('backup', () => {
  it('round-trips export → wipe → import', async () => {
    await completeLesson(lesson, [{ itemId: 'q1', correct: true }], day(7), db);
    const backup = await exportBackup(db);
    const json = JSON.parse(JSON.stringify(backup));

    const fresh = new DataForgeDB(`restore-${n++}`);
    const res = await importBackup(json, fresh);
    expect(res.ok).toBe(true);
    expect(await fresh.cards.count()).toBe(await db.cards.count());
    expect((await fresh.lessons.get(lesson.id))?.status).toBe('completed');
    await fresh.delete();
  });

  it('rejects a malformed file without touching existing data', async () => {
    await completeLesson(lesson, [], day(7), db);
    const before = await db.cards.count();
    const res = await importBackup({ format: 'dataforge-backup', version: 1, data: { lessons: 'nope' } }, db);
    expect(res.ok).toBe(false);
    expect(await db.cards.count()).toBe(before);
  });

  it('rejects duplicate primary keys instead of silently dropping rows', async () => {
    await completeLesson(lesson, [{ itemId: 'q1', correct: true }], day(7), db);
    const backup = JSON.parse(JSON.stringify(await exportBackup(db)));
    backup.data.lessons.push({ ...backup.data.lessons[0] });
    const before = await db.lessons.count();
    const res = await importBackup(backup, db);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.message).toMatch(/duplicate lessonId/);
    expect(await db.lessons.count()).toBe(before);
  });

  it('rejects unrepresentable timestamps and impossible calendar dates', async () => {
    await completeLesson(lesson, [{ itemId: 'q1', correct: true }], day(7), db);
    const good = JSON.parse(JSON.stringify(await exportBackup(db)));

    const hugeDate = structuredClone(good);
    hugeDate.data.lessons[0].completedAt = 1e100;
    expect((await importBackup(hugeDate, db)).ok).toBe(false);

    const badDay = structuredClone(good);
    badDay.data.days = [{ date: '2026-02-31', activeMs: 0, lessonsCompleted: [], reviews: 0, exercisesPassed: 0 }];
    expect((await importBackup(badDay, db)).ok).toBe(false);

    expect((await importBackup(good, db)).ok).toBe(true);
  });
});
