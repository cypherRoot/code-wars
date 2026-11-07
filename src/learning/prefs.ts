import { useSyncExternalStore } from 'react';

/* Per-device UI preferences (theme, motion). Kept in localStorage — conveniences, not learning data. */
export interface Prefs {
  theme: 'system' | 'dark' | 'light';
  motion: 'system' | 'reduce' | 'full';
  dailyGoalMin: number;
  lastExportAt?: number;
}

const KEY = 'dataforge.prefs';
const DEFAULTS: Prefs = { theme: 'system', motion: 'system', dailyGoalMin: 40 };
const listeners = new Set<() => void>();

function read(): Prefs {
  try {
    return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<Prefs>) };
  } catch {
    return DEFAULTS;
  }
}
let current = read();

function apply(p: Prefs) {
  const root = document.documentElement;
  if (p.theme === 'system') delete root.dataset.theme;
  else root.dataset.theme = p.theme;
  if (p.motion === 'system') delete root.dataset.motion;
  else root.dataset.motion = p.motion;
}

export function setPrefs(patch: Partial<Prefs>) {
  current = { ...current, ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(current));
  } catch {
    /* storage blocked: still apply for this session */
  }
  apply(current);
  listeners.forEach((l) => l());
}

export function usePrefs(): Prefs {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => current,
  );
}

/** True when animations should be minimal (system setting or override). */
export function prefersReducedMotion(): boolean {
  if (current.motion === 'reduce') return true;
  if (current.motion === 'full') return false;
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}
