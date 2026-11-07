import { useSyncExternalStore } from 'react';
import { getSqlStatus, onSqlStatus } from '../../engines/sql/engine';
import { getPyStatus, onPyStatus } from '../../engines/python/client';

export function useSqlStatus() {
  return useSyncExternalStore(
    (cb) => {
      const off = onSqlStatus(cb);
      return () => void off();
    },
    getSqlStatus,
  );
}

export function usePyStatus() {
  return useSyncExternalStore(
    (cb) => {
      const off = onPyStatus(cb);
      return () => void off();
    },
    getPyStatus,
  );
}

export function engineLabel(lang: 'sql' | 'python', status: string, busy: boolean): string {
  if (status === 'loading') return lang === 'sql' ? 'Starting DuckDB…' : 'Loading Python (first time ≈10 MB)…';
  if (busy) return 'Running…';
  if (status === 'error') return 'Engine failed to load — try again';
  return '';
}
