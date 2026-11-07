import type { PracticeLink } from '../../content/schema';
import styles from './practice-links.module.css';

/** Curated outside practice for this lesson (plan R10: problem-level, tagged). */
export function PracticeLinks({ links }: { links: PracticeLink[] }) {
  if (!links.length) return null;
  return (
    <section className={styles.wrap} aria-labelledby="practice-title">
      <h2 id="practice-title" className={styles.title}>
        Practice out there
      </h2>
      <ul className={styles.list}>
        {links.map((l) => (
          <li key={l.url}>
            <a href={l.url} target="_blank" rel="noreferrer noopener" className={styles.link}>
              <span className={styles.site}>{l.site}</span>
              <span className={styles.name}>{l.title} ↗</span>
              <span className={styles.meta}>
                <span className={`${styles.diff} ${styles[l.difficulty]}`}>{l.difficulty}</span>
                <span>~{l.estMinutes} min</span>
                <span>{l.free ? 'free' : 'paid'}</span>
                {l.accountRequired ? <span>account needed</span> : null}
                {l.dialect ? <span>{l.dialect}</span> : null}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
