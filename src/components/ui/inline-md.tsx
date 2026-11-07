import { Fragment, type ReactNode } from 'react';

/**
 * Minimal inline formatting for strings that come from YAML: `code`, **bold**, *italic*.
 * Deliberately tiny — anything richer belongs in the MDX prose.
 */
export function InlineMd({ text }: { text: string }) {
  const out: ReactNode[] = [];
  const re = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('`')) out.push(<code key={k++}>{tok.slice(1, -1)}</code>);
    else if (tok.startsWith('**')) out.push(<strong key={k++}>{tok.slice(2, -2)}</strong>);
    else out.push(<em key={k++}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <Fragment>{out}</Fragment>;
}

/** Paragraph-aware variant: blank lines split paragraphs. */
export function InlineParas({ text, className }: { text: string; className?: string }) {
  return (
    <div className={className}>
      {text
        .trim()
        .split(/\n\s*\n/)
        .map((p, i) => (
          <p key={i}>
            <InlineMd text={p.replace(/\s*\n\s*/g, ' ')} />
          </p>
        ))}
    </div>
  );
}
