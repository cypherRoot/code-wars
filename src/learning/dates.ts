const pad = (n: number) => String(n).padStart(2, '0');

/** Local calendar date as YYYY-MM-DD (streaks and daily logs follow the learner's own clock). */
export function dateKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function addDays(key: string, delta: number): string {
  const [y, m, d] = key.split('-').map(Number) as [number, number, number];
  const dt = new Date(y, m - 1, d + delta);
  return dateKey(dt);
}

/** Midnight at the start of the next local day. */
export function startOfTomorrow(now: Date = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
}

export function endOfToday(now: Date = new Date()): number {
  return startOfTomorrow(now).getTime() - 1;
}
