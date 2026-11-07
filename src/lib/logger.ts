/* Tiny logger: silent in production builds (plan: Conventions — no console.log in shipped code). */
const dev = import.meta.env.DEV;

export const logger = {
  debug: (...args: unknown[]) => {
    if (dev) console.debug('[dataforge]', ...args);
  },
  warn: (...args: unknown[]) => {
    if (dev) console.warn('[dataforge]', ...args);
  },
  error: (...args: unknown[]) => {
    if (dev) console.error('[dataforge]', ...args);
  },
};
