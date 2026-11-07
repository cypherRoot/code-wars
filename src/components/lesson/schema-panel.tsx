import { DATASETS } from '../../data/datasets';
import styles from './schema-panel.module.css';

/** The tables of the `shop` dataset, so learners never have to guess column names. */
export function SchemaPanel({ only }: { only?: string[] }) {
  const tables = DATASETS.shop.tables.filter((t) => !only || only.includes(t.name));
  return (
    <div className={styles.grid}>
      {tables.map((t) => (
        <section key={t.name} className={styles.table} aria-label={`Table ${t.name}`}>
          <h4 className={styles.name}>{t.name}</h4>
          <p className={styles.desc}>{t.description}</p>
          <ul className={styles.cols}>
            {t.columns.map((c) => (
              <li key={c.name}>
                <code>{c.name}</code>
                <span className={styles.type}>{c.type}</span>
                {c.note ? <span className={styles.note}>{c.note}</span> : null}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
