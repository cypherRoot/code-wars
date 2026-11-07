import { useMemo, type ReactNode } from 'react';
import { highlightCode, classHighlighter } from '@lezer/highlight';
import { PostgreSQL } from '@codemirror/lang-sql';
import { pythonLanguage } from '@codemirror/lang-python';
import { javascriptLanguage } from '@codemirror/lang-javascript';
import styles from './code-block.module.css';

const PARSERS = {
  sql: PostgreSQL.language.parser,
  python: pythonLanguage.parser,
  py: pythonLanguage.parser,
  js: javascriptLanguage.parser,
  javascript: javascriptLanguage.parser,
} as const;

type Lang = keyof typeof PARSERS | 'text' | 'bash' | 'shell';

const LABELS: Record<string, string> = { sql: 'SQL', python: 'Python', py: 'Python', js: 'JavaScript', javascript: 'JavaScript', bash: 'Terminal', shell: 'Terminal' };

/** Read-only highlighted code, using the same token classes as the editor. */
export function CodeBlock({ code, lang = 'text', caption }: { code: string; lang?: Lang | string; caption?: ReactNode }) {
  const nodes = useMemo(() => {
    const parser = PARSERS[lang as keyof typeof PARSERS];
    if (!parser) return [code];
    const out: ReactNode[] = [];
    let k = 0;
    highlightCode(
      code,
      parser.parse(code),
      classHighlighter,
      (text, cls) => out.push(cls ? <span key={k++} className={cls}>{text}</span> : text),
      () => out.push('\n'),
    );
    return out;
  }, [code, lang]);

  const label = caption ?? LABELS[lang];
  return (
    <figure className={styles.block}>
      {label ? <figcaption className="label">{label}</figcaption> : null}
      <pre tabIndex={0}>
        <code>{nodes}</code>
      </pre>
    </figure>
  );
}
