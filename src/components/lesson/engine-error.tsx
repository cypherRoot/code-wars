import type { EngineError } from '../../engines/result';
import styles from './panels.module.css';

const TITLES: Record<EngineError['kind'], string> = {
  syntax: 'Syntax error',
  runtime: 'Error',
  timeout: 'Timed out',
  blocked: 'Not allowed here',
  load: 'Engine didn’t load',
  cancelled: 'Cancelled',
  limit: 'Too much output',
};

export function EngineErrorPanel({ error }: { error: EngineError }) {
  return (
    <div className={styles.error} role="alert">
      <p className={styles.panelTitle}>{TITLES[error.kind]}</p>
      <pre className={styles.errorMsg}>{error.message}</pre>
      {error.hint ? <p className={styles.hint}>{error.hint}</p> : null}
    </div>
  );
}
