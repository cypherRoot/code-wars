import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { LessonData } from '../../src/content/schema';
import { moduleByCode } from '../../src/content/curriculum';

/*
 * Fast static content checks (seconds, no browser). The slow, executable check —
 * running every answer through the real engines — is `npm run validate:content`.
 */
const ROOT = join(__dirname, '../../content');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const yamlFiles = walk(ROOT).filter((f) => f.endsWith('.yaml'));

describe('content files', () => {
  it('has lessons', () => {
    expect(yamlFiles.length).toBeGreaterThan(0);
  });

  const ids = new Set<string>();

  it.each(yamlFiles.map((f) => [f.replace(ROOT, 'content'), f]))('%s is valid', (_label, file) => {
    const parsed = LessonData.safeParse(parse(readFileSync(file, 'utf8')));
    if (!parsed.success) {
      throw new Error(parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n'));
    }
    const lesson = parsed.data;

    expect(ids.has(lesson.id), `duplicate id ${lesson.id}`).toBe(false);
    ids.add(lesson.id);
    expect(moduleByCode.has(lesson.module), `unknown module ${lesson.module}`).toBe(true);
    expect(lesson.id.startsWith(`${lesson.track}.${lesson.module.toLowerCase().replace('.', '-')}.`), 'id prefix matches track.module').toBe(true);

    const mdxPath = file.replace(/\.yaml$/, '.mdx');
    expect(existsSync(mdxPath), 'has a matching .mdx').toBe(true);
    const mdx = readFileSync(mdxPath, 'utf8');

    // Every component reference resolves, and every defined item is used somewhere.
    const refs = (tag: string) => [...mdx.matchAll(new RegExp(`<${tag} id="([^"]+)"`, 'g'))].map((m) => m[1]!);
    for (const [tag, record] of [
      ['Worked', lesson.worked],
      ['Exercise', lesson.exercises],
      ['Parsons', lesson.parsons],
    ] as const) {
      for (const id of refs(tag)) expect(Object.keys(record), `<${tag} id="${id}"> has no data`).toContain(id);
      for (const id of Object.keys(record)) expect(refs(tag), `${tag} "${id}" is never shown`).toContain(id);
    }
    if (lesson.checklist.length) expect(mdx).toContain('<Checklist />');

    // Only allowlisted components (plan R9)
    const allowed = new Set(['Worked', 'Exercise', 'Parsons', 'JsBridge', 'Breaks', 'Callout', 'Schema', 'Checklist']);
    for (const m of mdx.matchAll(/<([A-Z]\w*)/g)) expect(allowed.has(m[1]!), `component <${m[1]}> not allowed`).toBe(true);

    for (const [id, w] of Object.entries(lesson.worked)) {
      if (w.predict) expect(w.predict.answer, `${id}: predict answer index`).toBeLessThan(w.predict.options.length);
    }
    for (const q of lesson.quiz) {
      const qids = lesson.quiz.filter((x) => x.id === q.id);
      expect(qids, `duplicate quiz id ${q.id}`).toHaveLength(1);
    }
  });
});
