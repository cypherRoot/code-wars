import { z } from 'zod';

/*
 * Lesson data lives in `content/<track>/<module>/<lesson>.yaml` next to the prose in `<lesson>.mdx`.
 * IDs are stable keys for storage and SRS cards — never rename one (plan: Conventions).
 */

const id = z.string().regex(/^[a-z0-9]+(\.[a-z0-9-]+)+$/, 'ids look like sql.s1.select-basics');
const shortId = z.string().regex(/^[a-z0-9-]+$/);

export const TrackId = z.enum(['found', 'sql', 'py', 'de']);
export type TrackId = z.infer<typeof TrackId>;

const Predict = z.object({
  prompt: z.string(),
  options: z.array(z.string()).min(2),
  answer: z.number().int().min(0),
  explain: z.string(),
});

const Worked = z.object({
  lang: z.enum(['sql', 'python']),
  dataset: z.literal('shop').default('shop'),
  code: z.string(),
  /** If present, the learner must predict before Run unlocks (plan R6: only selected examples). */
  predict: Predict.optional(),
  note: z.string().optional(),
  /** The example deliberately raises an error (e.g. to show a TypeError). */
  expectError: z.boolean().default(false),
});
export type Worked = z.infer<typeof Worked>;

const Hints = z.array(z.string()).min(1).max(3);

const SqlExercise = z.object({
  lang: z.literal('sql'),
  dataset: z.literal('shop').default('shop'),
  prompt: z.string(),
  starter: z.string().default(''),
  solution: z.string(),
  /** Other correct answers — validation requires ≥1 to pass (plan R4). */
  alternates: z.array(z.string()).min(1),
  /** Known-wrong answers — validation requires ≥2 to fail (plan R4). */
  wrong: z.array(z.string()).min(2),
  orderMatters: z.boolean().default(false),
  columnNames: z.enum(['strict', 'ignore']).default('ignore'),
  hints: Hints,
});

const PyCase = z.object({ call: z.string(), expect: z.string() });
const PyExercise = z.object({
  lang: z.literal('python'),
  prompt: z.string(),
  starter: z.string().default(''),
  solution: z.string(),
  alternates: z.array(z.string()).min(1),
  wrong: z.array(z.string()).min(2),
  cases: z.array(PyCase).default([]),
  stdout: z.string().optional(),
  hints: Hints,
});

export const Exercise = z.discriminatedUnion('lang', [SqlExercise, PyExercise]);
export type Exercise = z.infer<typeof Exercise>;
export type SqlExercise = z.infer<typeof SqlExercise>;
export type PyExercise = z.infer<typeof PyExercise>;

const Parsons = z.object({
  lang: z.enum(['sql', 'python']),
  prompt: z.string(),
  /** Lines in the correct order; shuffled deterministically for display. */
  lines: z.array(z.string()).min(2),
  explain: z.string(),
});
export type Parsons = z.infer<typeof Parsons>;

const QuizOption = z.object({ text: z.string(), correct: z.boolean().default(false), why: z.string() });
const QuizItem = z
  .object({
    id: shortId,
    type: z.enum(['mcq', 'multi']),
    prompt: z.string(),
    code: z.string().optional(),
    lang: z.enum(['sql', 'python', 'text']).default('text'),
    options: z.array(QuizOption).min(2),
  })
  .refine((q) => q.options.filter((o) => o.correct).length >= 1, 'a quiz item needs at least one correct option')
  .refine((q) => q.type === 'multi' || q.options.filter((o) => o.correct).length === 1, 'mcq items need exactly one correct option');
export type QuizItem = z.infer<typeof QuizItem>;

const Card = z.object({ id: shortId, front: z.string(), back: z.string() });
export type Card = z.infer<typeof Card>;

const PracticeLink = z.object({
  url: z.url(),
  site: z.string(),
  title: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  free: z.boolean(),
  accountRequired: z.boolean().default(false),
  estMinutes: z.number().int().positive(),
  dialect: z.string().optional(),
  lastChecked: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
export type PracticeLink = z.infer<typeof PracticeLink>;

const ChecklistItem = z.object({ id: shortId, text: z.string(), command: z.string().optional(), verify: z.string().optional() });
export type ChecklistItem = z.infer<typeof ChecklistItem>;

export const LessonData = z.object({
  id,
  title: z.string(),
  summary: z.string(),
  track: TrackId,
  module: z.string().regex(/^[A-Z]\d+(\.\d+)?$/),
  order: z.number().int().min(1),
  /** Bump when content changes meaningfully; progress records the version it was completed on (plan R8). */
  version: z.number().int().min(1),
  estMinutes: z.number().int().positive(),
  where: z.enum(['browser', 'local']),
  objectives: z.array(z.string()).min(1),
  worked: z.record(shortId, Worked).default({}),
  exercises: z.record(shortId, Exercise).default({}),
  parsons: z.record(shortId, Parsons).default({}),
  checklist: z.array(ChecklistItem).default([]),
  quiz: z.array(QuizItem).min(3),
  cards: z.array(Card).default([]),
  practice: z.array(PracticeLink).default([]),
});
export type LessonData = z.infer<typeof LessonData>;
