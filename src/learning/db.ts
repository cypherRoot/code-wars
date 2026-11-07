import Dexie, { type Table } from 'dexie';

/*
 * IndexedDB schema (plan R8: versioned with migrations). Bump the Dexie version and add an
 * `.upgrade()` for any change; never edit an existing version's store definition.
 */

export interface LessonProgress {
  lessonId: string;
  status: 'started' | 'completed';
  startedAt: number;
  completedAt?: number;
  /** 0..1 */
  quizScore?: number;
  /** Content version the lesson was completed on (shows "updated" badges later). */
  contentVersion: number;
  activeMs: number;
  exercisesPassed: string[];
}

export interface Attempt {
  id?: number;
  lessonId: string;
  /** e.g. `ex:e1`, `quiz:q2`, `parsons:p1`, `predict:w1` */
  itemKey: string;
  correct: boolean;
  /** Hints shown before this attempt. */
  hintsUsed: number;
  at: number;
}

/** Serialised FSRS card state (dates as epoch ms). */
export interface FsrsState {
  due: number;
  stability: number;
  difficulty: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: number;
  last_review?: number;
}

export interface SrsCard {
  /** `${lessonId}#quiz:${itemId}` or `${lessonId}#card:${itemId}` */
  id: string;
  lessonId: string;
  kind: 'quiz' | 'card';
  itemId: string;
  due: number;
  fsrs: FsrsState;
  createdAt: number;
}

export interface ReviewLog {
  id?: number;
  cardId: string;
  rating: number;
  at: number;
  /** State before the review, for later re-optimisation (plan R5). */
  stateBefore: number;
  elapsedMs: number;
}

export interface DayLog {
  /** Local date YYYY-MM-DD */
  date: string;
  activeMs: number;
  lessonsCompleted: string[];
  reviews: number;
  exercisesPassed: number;
}

export interface Draft {
  key: string;
  code: string;
  updatedAt: number;
}

export interface ChecklistTick {
  key: string;
  done: boolean;
  at: number;
}

export class DataForgeDB extends Dexie {
  lessons!: Table<LessonProgress, string>;
  attempts!: Table<Attempt, number>;
  cards!: Table<SrsCard, string>;
  reviews!: Table<ReviewLog, number>;
  days!: Table<DayLog, string>;
  drafts!: Table<Draft, string>;
  checklist!: Table<ChecklistTick, string>;

  constructor(name = 'dataforge') {
    super(name);
    this.version(1).stores({
      lessons: 'lessonId, status, completedAt',
      attempts: '++id, lessonId, itemKey, at',
      cards: 'id, lessonId, due',
      reviews: '++id, cardId, at',
      days: 'date',
      drafts: 'key',
      checklist: 'key',
    });
  }
}

export const TABLES = ['lessons', 'attempts', 'cards', 'reviews', 'days', 'drafts', 'checklist'] as const;
export type TableName = (typeof TABLES)[number];

export const db = new DataForgeDB();
