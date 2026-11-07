import { z } from 'zod';
import { db as defaultDb, TABLES, type DataForgeDB } from './db';

/*
 * Versioned export/import (plan R8). Imports are validated with zod *before* a transactional replace,
 * so a bad file can never leave the database half-written.
 */

export const BACKUP_FORMAT = 'dataforge-backup';
export const BACKUP_VERSION = 1;

const num = z.number().finite();
const count = z.number().int().min(0);
/** Epoch ms that `new Date()` can represent (±8.64e15), so restored dates never render as "Invalid Date". */
const epochMs = z.number().int().min(0).max(8.64e15);
/** A real calendar date (rejects 2026-02-31). */
const calendarDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((s) => {
    const d = new Date(`${s}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
  }, 'not a real calendar date');
const Fsrs = z.object({
  due: epochMs,
  stability: num.min(0),
  difficulty: num.min(0),
  scheduled_days: count,
  learning_steps: count,
  reps: count,
  lapses: count,
  // ts-fsrs State: New=0, Learning=1, Review=2, Relearning=3
  state: z.number().int().min(0).max(3),
  last_review: epochMs.optional(),
});

const BackupSchema = z.object({
  format: z.literal(BACKUP_FORMAT),
  version: z.literal(BACKUP_VERSION),
  exportedAt: z.string(),
  data: z.object({
    lessons: z.array(
      z.object({
        lessonId: z.string(),
        status: z.enum(['started', 'completed']),
        startedAt: epochMs,
        completedAt: epochMs.optional(),
        quizScore: num.min(0).max(1).optional(),
        contentVersion: num,
        activeMs: num.min(0),
        exercisesPassed: z.array(z.string()),
      }),
    ),
    attempts: z.array(
      z.object({ id: count.optional(), lessonId: z.string(), itemKey: z.string(), correct: z.boolean(), hintsUsed: count, at: epochMs }),
    ),
    cards: z.array(
      z.object({
        id: z.string(),
        lessonId: z.string(),
        kind: z.enum(['quiz', 'card']),
        itemId: z.string(),
        due: epochMs,
        fsrs: Fsrs,
        createdAt: epochMs,
      }),
    ),
    reviews: z.array(
      z.object({
        id: count.optional(),
        cardId: z.string(),
        rating: z.number().int().min(1).max(4),
        at: epochMs,
        stateBefore: z.number().int().min(0).max(3),
        elapsedMs: num.min(0),
      }),
    ),
    days: z.array(
      z.object({
        date: calendarDate,
        activeMs: num.min(0),
        lessonsCompleted: z.array(z.string()),
        reviews: count,
        exercisesPassed: count,
      }),
    ),
    drafts: z.array(z.object({ key: z.string(), code: z.string(), updatedAt: epochMs })),
    checklist: z.array(z.object({ key: z.string(), done: z.boolean(), at: epochMs })),
  }),
});
export type Backup = z.infer<typeof BackupSchema>;

/** Primary key per table (mirrors db.ts). `bulkPut` keeps only the last row for a repeated key, so duplicates must be rejected. */
const PRIMARY_KEYS: Record<(typeof TABLES)[number], string> = {
  lessons: 'lessonId',
  attempts: 'id',
  cards: 'id',
  reviews: 'id',
  days: 'date',
  drafts: 'key',
  checklist: 'key',
};

function findDuplicateKey(data: Backup['data']): string | null {
  for (const t of TABLES) {
    const field = PRIMARY_KEYS[t];
    const seen = new Set<unknown>();
    for (const row of data[t] as Record<string, unknown>[]) {
      const k = row[field];
      if (k === undefined) continue; // auto-increment ids are assigned on insert
      if (seen.has(k)) return `${t}: duplicate ${field} "${String(k)}"`;
      seen.add(k);
    }
  }
  return null;
}

export async function exportBackup(database: DataForgeDB = defaultDb): Promise<Backup> {
  const data = Object.fromEntries(await Promise.all(TABLES.map(async (t) => [t, await database.table(t).toArray()] as const)));
  return { format: BACKUP_FORMAT, version: BACKUP_VERSION, exportedAt: new Date().toISOString(), data: data as Backup['data'] };
}

export type ImportResult = { ok: true; counts: Record<string, number> } | { ok: false; message: string };

export async function importBackup(raw: unknown, database: DataForgeDB = defaultDb): Promise<ImportResult> {
  const parsed = BackupSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      ok: false,
      message: `This doesn't look like a DataForge backup (${first ? `${first.path.join('.') || 'file'}: ${first.message}` : 'invalid'}). Nothing was changed.`,
    };
  }
  const { data } = parsed.data;
  const dup = findDuplicateKey(data);
  if (dup) return { ok: false, message: `This backup is inconsistent (${dup}). Nothing was changed.` };
  await database.transaction('rw', TABLES.map((t) => database.table(t)), async () => {
    for (const t of TABLES) {
      await database.table(t).clear();
      await database.table(t).bulkPut(data[t] as unknown[]);
    }
  });
  return { ok: true, counts: Object.fromEntries(TABLES.map((t) => [t, data[t].length])) };
}

export async function resetAll(database: DataForgeDB = defaultDb) {
  await database.transaction('rw', TABLES.map((t) => database.table(t)), async () => {
    for (const t of TABLES) await database.table(t).clear();
  });
}

export function downloadJson(obj: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
