import type { CellValue, QueryResult } from '../../engines/result';
import styles from './result-table.module.css';

function Cell({ v }: { v: CellValue }) {
  if (v === null) return <span className={styles.null}>NULL</span>;
  if (typeof v === 'boolean') return <span className={styles.bool}>{v ? 'true' : 'false'}</span>;
  if (typeof v === 'number') return <>{Number.isInteger(v) ? v : Number(v.toFixed(6))}</>;
  return <>{v}</>;
}

interface Props {
  result: Pick<QueryResult, 'columns' | 'rows'> & Partial<Pick<QueryResult, 'rowCount' | 'truncated' | 'elapsedMs'>>;
  caption?: string;
  /** Rows to tint (e.g. rows missing from a learner's result). */
  tone?: 'default' | 'missing' | 'extra';
  maxHeight?: string;
}

export function ResultTable({ result, caption, tone = 'default', maxHeight = '22rem' }: Props) {
  const { columns, rows } = result;
  const numericCols = columns.map((c) => c.family === 'int' || c.family === 'float');
  return (
    <div className={`${styles.wrap} ${styles[tone]}`}>
      <div className={styles.scroll} style={{ maxHeight }} tabIndex={0} role="region" aria-label={caption ?? 'Query result'}>
        <table className={styles.table}>
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead>
            <tr>
              {columns.map((c, i) => (
                <th key={i} scope="col" className={numericCols[i] ? styles.num : undefined}>
                  <span className={styles.colName}>{c.name}</span>
                  <span className={styles.colType}>{c.family === 'other' ? c.type : c.family}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri}>
                {r.map((v, ci) => (
                  <td key={ci} className={numericCols[ci] ? styles.num : undefined}>
                    <Cell v={v} />
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={Math.max(1, columns.length)} className={styles.empty}>
                  0 rows
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      {result.rowCount !== undefined ? (
        <p className={`label ${styles.meta}`}>
          {result.rowCount} row{result.rowCount === 1 ? '' : 's'}
          {result.truncated ? ` · showing first ${rows.length}` : ''}
          {result.elapsedMs !== undefined ? ` · ${Math.max(1, Math.round(result.elapsedMs))} ms` : ''}
        </p>
      ) : null}
    </div>
  );
}
