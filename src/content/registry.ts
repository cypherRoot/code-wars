import type { ComponentType } from 'react';
import type { MDXProps } from 'mdx/types';
import { LessonData } from './schema';
import { MODULES, PATH, moduleByCode, type ModuleInfo } from './curriculum';

/*
 * Lessons = `content/<track>/<module>/<slug>.yaml` (data, validated eagerly) + `<slug>.mdx` (prose, loaded lazily).
 */
const yamlFiles = import.meta.glob<{ default: unknown }>('/content/**/*.yaml', { eager: true });
const mdxFiles = import.meta.glob<{ default: ComponentType<MDXProps> }>('/content/**/*.mdx');

export interface Lesson extends LessonData {
  /** Loads the MDX prose component. */
  loadBody: () => Promise<ComponentType<MDXProps>>;
  path: string;
}

export interface ContentError {
  file: string;
  message: string;
}

const lessons: Lesson[] = [];
export const contentErrors: ContentError[] = [];

for (const [file, mod] of Object.entries(yamlFiles)) {
  const parsed = LessonData.safeParse(mod.default);
  if (!parsed.success) {
    contentErrors.push({
      file,
      message: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n'),
    });
    continue;
  }
  const mdxPath = file.replace(/\.yaml$/, '.mdx');
  const loader = mdxFiles[mdxPath];
  if (!loader) {
    contentErrors.push({ file, message: `missing prose file ${mdxPath}` });
    continue;
  }
  if (!moduleByCode.has(parsed.data.module)) {
    contentErrors.push({ file, message: `unknown module ${parsed.data.module}` });
    continue;
  }
  lessons.push({ ...parsed.data, path: file, loadBody: async () => (await loader()).default });
}

const seen = new Set<string>();
for (const l of lessons) {
  if (seen.has(l.id)) contentErrors.push({ file: l.path, message: `duplicate lesson id ${l.id}` });
  seen.add(l.id);
}

const pathIndex = (code: string) => {
  const i = PATH.indexOf(code);
  return i < 0 ? 999 : i;
};

/** All lessons in recommended-path order. */
export const LESSONS: Lesson[] = lessons.sort((a, b) => pathIndex(a.module) - pathIndex(b.module) || a.order - b.order);
export const lessonById = new Map(LESSONS.map((l) => [l.id, l]));

export interface ModuleWithLessons extends ModuleInfo {
  lessons: Lesson[];
}

export const MODULES_WITH_LESSONS: ModuleWithLessons[] = PATH.map((code) => moduleByCode.get(code)!)
  .filter(Boolean)
  .map((m) => ({ ...m, lessons: LESSONS.filter((l) => l.module === m.code) }))
  .concat(
    MODULES.filter((m) => !PATH.includes(m.code)).map((m) => ({ ...m, lessons: LESSONS.filter((l) => l.module === m.code) })),
  );

export function nextLessonAfter(id: string): Lesson | undefined {
  const i = LESSONS.findIndex((l) => l.id === id);
  return i >= 0 ? LESSONS[i + 1] : undefined;
}
