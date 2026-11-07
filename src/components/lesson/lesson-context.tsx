import { createContext, useContext } from 'react';
import type { Lesson } from '../../content/registry';

export interface LessonCtx {
  lesson: Lesson;
  onExercisePassed: (exerciseId: string) => void;
}

export const LessonContext = createContext<LessonCtx | null>(null);

export function useLesson(): LessonCtx {
  const ctx = useContext(LessonContext);
  if (!ctx) throw new Error('Lesson components must be used inside a lesson page.');
  return ctx;
}
