import { describe, expect, it } from 'vitest';
import { computeStreak } from '../../src/learning/streak';
import { addDays } from '../../src/learning/dates';

describe('computeStreak', () => {
  const today = '2026-11-07';

  it('is zero with no activity', () => {
    expect(computeStreak([], today)).toEqual({ current: 0, longest: 0, activeToday: false });
  });

  it('counts consecutive days ending today', () => {
    const s = computeStreak(['2026-11-05', '2026-11-06', '2026-11-07'], today);
    expect(s).toMatchObject({ current: 3, activeToday: true });
  });

  it("keeps yesterday's streak alive before today's study", () => {
    expect(computeStreak(['2026-11-05', '2026-11-06'], today)).toMatchObject({ current: 2, activeToday: false });
  });

  it('breaks after a missed day', () => {
    expect(computeStreak(['2026-11-04', '2026-11-05'], today).current).toBe(0);
  });

  it('tracks the longest run across month boundaries', () => {
    const run = ['2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'];
    expect(computeStreak([...run, '2026-11-07'], today)).toMatchObject({ current: 1, longest: 4 });
  });

  it('addDays handles month and year edges', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });
});
