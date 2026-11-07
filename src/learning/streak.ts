import { addDays } from './dates';

export interface Streak {
  current: number;
  longest: number;
  /** True when today already counts. */
  activeToday: boolean;
}

/**
 * Consecutive active days ending today — or yesterday, so the streak isn't shown as broken
 * before the learner has had a chance to study today. (Weekly freezes arrive in Phase C.)
 */
export function computeStreak(activeDates: Iterable<string>, today: string): Streak {
  const set = new Set(activeDates);
  const activeToday = set.has(today);
  let cursor = activeToday ? today : addDays(today, -1);
  let current = 0;
  while (set.has(cursor)) {
    current++;
    cursor = addDays(cursor, -1);
  }

  let longest = 0;
  for (const d of set) {
    if (set.has(addDays(d, -1))) continue; // not the start of a run
    let len = 0;
    let c = d;
    while (set.has(c)) {
      len++;
      c = addDays(c, 1);
    }
    longest = Math.max(longest, len);
  }
  return { current, longest, activeToday };
}
