import { useEffect, useRef } from 'react';
import { basicSetup } from 'codemirror';
import { EditorView, keymap } from '@codemirror/view';
import { EditorState, Compartment, Prec } from '@codemirror/state';
import { indentWithTab } from '@codemirror/commands';
import { syntaxHighlighting } from '@codemirror/language';
import { classHighlighter } from '@lezer/highlight';
import { sql, PostgreSQL } from '@codemirror/lang-sql';
import { python } from '@codemirror/lang-python';
import { DATASETS } from '../../data/datasets';
import styles from './code-editor.module.css';

export type EditorLang = 'sql' | 'python';

interface Props {
  value: string;
  onChange?: (v: string) => void;
  lang: EditorLang;
  /** Ctrl/Cmd-Enter */
  onRun?: () => void;
  label: string;
  readOnly?: boolean;
  minLines?: number;
}

const sqlSchema = Object.fromEntries(DATASETS.shop.tables.map((t) => [t.name, t.columns.map((c) => c.name)]));

const theme = EditorView.theme({
  '&': { backgroundColor: 'var(--surface)', color: 'var(--text)', fontSize: '15px' },
  '.cm-content': { fontFamily: 'var(--font-mono)', caretColor: 'var(--text)', padding: '12px 0' },
  '.cm-gutters': { backgroundColor: 'var(--surface)', color: 'var(--muted)', border: 'none' },
  '.cm-activeLine': { backgroundColor: 'color-mix(in srgb, var(--text) 4%, transparent)' },
  '.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'var(--text)' },
  '.cm-cursor': { borderLeftColor: 'var(--text)' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': {
    backgroundColor: 'color-mix(in srgb, var(--track) 30%, transparent) !important',
  },
  '.cm-tooltip': { backgroundColor: 'var(--surface-2)', border: '1px solid var(--line-strong)', borderRadius: '7px' },
  '.cm-tooltip-autocomplete ul li[aria-selected]': { backgroundColor: 'var(--track)', color: 'var(--on-accent)' },
  '.cm-matchingBracket': { backgroundColor: 'color-mix(in srgb, var(--track) 25%, transparent)', outline: 'none' },
  '&.cm-focused': { outline: 'none' },
});

export function CodeEditor({ value, onChange, lang, onRun, label, readOnly = false, minLines = 4 }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onRunRef = useRef(onRun);
  const initial = useRef(value);
  const readOnlyComp = useRef(new Compartment());

  useEffect(() => {
    onChangeRef.current = onChange;
    onRunRef.current = onRun;
  });

  useEffect(() => {
    const v = new EditorView({
      parent: host.current!,
      state: EditorState.create({
        doc: initial.current,
        extensions: [
          basicSetup,
          Prec.highest(
            keymap.of([
              {
                key: 'Mod-Enter',
                run: () => {
                  onRunRef.current?.();
                  return true;
                },
              },
            ]),
          ),
          keymap.of([indentWithTab]),
          lang === 'sql' ? sql({ dialect: PostgreSQL, schema: sqlSchema, upperCaseKeywords: true }) : python(),
          syntaxHighlighting(classHighlighter),
          theme,
          readOnlyComp.current.of([EditorState.readOnly.of(false)]),
          EditorView.lineWrapping,
          EditorView.contentAttributes.of({ 'aria-label': label }),
          EditorView.updateListener.of((u) => {
            if (u.docChanged) onChangeRef.current?.(u.state.doc.toString());
          }),
        ],
      }),
    });
    view.current = v;
    return () => {
      v.destroy();
      view.current = null;
    };
  }, [lang, label]);

  // External value changes (reset, show solution, draft restore) replace the document.
  useEffect(() => {
    const v = view.current;
    if (v && v.state.doc.toString() !== value) {
      v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: value } });
    }
  }, [value]);

  useEffect(() => {
    view.current?.dispatch({
      effects: readOnlyComp.current.reconfigure([EditorState.readOnly.of(readOnly), EditorView.editable.of(!readOnly)]),
    });
  }, [readOnly]);

  return (
    <div className={styles.wrap} style={{ minHeight: `${minLines * 1.6 + 1.5}em` }}>
      <div ref={host} className={styles.host} />
      <p className="sr-only">Press Escape then Tab to move focus out of the editor. Press Control Enter to run.</p>
    </div>
  );
}
