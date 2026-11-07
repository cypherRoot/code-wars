import { useCallback, useEffect, useRef, useState, type ComponentType, type CSSProperties } from 'react';
import { Link, useParams } from 'react-router';
import { MDXProvider } from '@mdx-js/react';
import type { MDXProps } from 'mdx/types';
import { useLiveQuery } from 'dexie-react-hooks';
import { lessonById, nextLessonAfter, type Lesson } from '../../content/registry';
import { TRACKS, moduleByCode } from '../../content/curriculum';
import { db } from '../../learning/db';
import { addActiveTime, completeLesson, markExercisePassed, reviewQueue, startLesson, submitReview } from '../../learning/progress';
import { LessonContext } from '../../components/lesson/lesson-context';
import { mdxComponents } from '../../components/lesson/mdx-components';
import { Quiz, type ItemResult } from '../../components/lesson/quiz';
import { PracticeLinks } from '../../components/lesson/practice-links';
import { ReviewCard } from '../../components/review/review-card';
import { warmSql } from '../../engines/sql/engine';
import { warmPython } from '../../engines/python/client';
import { NotFound } from './not-found';
import { InlineMd } from '../../components/ui/inline-md';
import page from './page.module.css';
import s from './lesson.module.css';

const fmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export function LessonPage() {
  const { lessonId = '' } = useParams();
  const lesson = lessonById.get(lessonId);
  if (!lesson) return <NotFound />;
  return <LessonView key={lesson.id} lesson={lesson} />;
}

/** Counts visible, recently-interacted time only (no credit for a tab left open overnight). */
function useActiveTime(lessonId: string) {
  useEffect(() => {
    let lastInput = Date.now();
    let pending = 0;
    let last = Date.now();
    const bump = () => (lastInput = Date.now());
    const tick = () => {
      const now = Date.now();
      if (document.visibilityState === 'visible' && now - lastInput < 120_000) pending += now - last;
      last = now;
    };
    const flush = () => {
      tick();
      if (pending > 0) void addActiveTime(lessonId, pending);
      pending = 0;
    };
    const iv = setInterval(tick, 5_000);
    const fl = setInterval(flush, 30_000);
    const events = ['pointerdown', 'keydown', 'scroll', 'pointermove'] as const;
    events.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    document.addEventListener('visibilitychange', flush);
    return () => {
      clearInterval(iv);
      clearInterval(fl);
      events.forEach((e) => window.removeEventListener(e, bump));
      document.removeEventListener('visibilitychange', flush);
      flush();
    };
  }, [lessonId]);
}

function LessonView({ lesson }: { lesson: Lesson }) {
  const [Body, setBody] = useState<ComponentType<MDXProps> | null>(null);
  const [completion, setCompletion] = useState<{ score: number; total: number; cards: number } | null>(null);
  const progress = useLiveQuery(() => db.lessons.get(lesson.id), [lesson.id]);
  const track = TRACKS[lesson.track];
  const mod = moduleByCode.get(lesson.module);
  const next = nextLessonAfter(lesson.id);
  const completeRef = useRef<HTMLDivElement>(null);

  useActiveTime(lesson.id);

  useEffect(() => {
    let alive = true;
    void lesson.loadBody().then((C) => alive && setBody(() => C));
    void startLesson(lesson);
    const langs = new Set([...Object.values(lesson.worked), ...Object.values(lesson.exercises)].map((x) => x.lang));
    if (langs.has('sql')) warmSql();
    if (langs.has('python')) warmPython();
    document.title = `${lesson.title} · DataForge`;
    return () => {
      alive = false;
      document.title = 'DataForge';
    };
  }, [lesson]);

  const onExercisePassed = useCallback((id: string) => void markExercisePassed(lesson.id, id), [lesson.id]);

  async function onQuizDone(results: ItemResult[]) {
    const score = await completeLesson(lesson, results);
    setCompletion({ score: Math.round(score * results.length), total: results.length, cards: results.length + lesson.cards.length });
    requestAnimationFrame(() => completeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  }

  return (
    <LessonContext.Provider value={{ lesson, onExercisePassed }}>
      <article className={`${page.page} ${page.narrow} ${s.lesson}`} style={{ '--track': track.color } as CSSProperties}>
        <header className={s.header}>
          <nav aria-label="Breadcrumb" className="label">
            <Link to="/learn" viewTransition>
              Learn
            </Link>{' '}
            / <span style={{ color: track.color }}>{lesson.module}</span> · {mod?.title}
          </nav>
          <h1 className={s.title}>{lesson.title}</h1>
          <p className={page.lede}>{lesson.summary}</p>
          <div className={s.meta}>
            <span className={s.chip}>~{lesson.estMinutes} min</span>
            <span className={s.chip}>{lesson.where === 'local' ? '💻 Local lab — on your machine' : '🌐 Runs in your browser'}</span>
            {progress?.status === 'completed' && progress.completedAt ? (
              <span className={`${s.chip} ${s.chipDone}`}>
                ✓ Completed {fmt.format(progress.completedAt)} · best quiz {Math.round((progress.quizScore ?? 0) * 100)}%
              </span>
            ) : null}
          </div>
          <div className={s.objectives}>
            <p className="label">By the end you can</p>
            <ul>
              {lesson.objectives.map((o) => (
                <li key={o}>
                  <InlineMd text={o} />
                </li>
              ))}
            </ul>
          </div>
        </header>

        {progress?.status !== 'completed' ? <WarmUp lessonId={lesson.id} /> : null}

        <div className={s.prose}>
          {Body ? (
            <MDXProvider components={mdxComponents}>
              <Body components={mdxComponents} />
            </MDXProvider>
          ) : (
            <p className="label">Loading lesson…</p>
          )}
        </div>

        {Body ? <Quiz items={lesson.quiz} lessonId={lesson.id} onDone={(r) => void onQuizDone(r)} /> : null}

        {completion ? (
          <div ref={completeRef} className={s.complete} role="status">
            <div className={s.pulse} aria-hidden="true" />
            <p className="label">Lesson complete</p>
            <p className={s.completeTitle}>
              {completion.score}/{completion.total} on the quiz.{' '}
              {completion.score === completion.total ? 'Clean sweep.' : 'The ones you missed come back soon in Review.'}
            </p>
            <p className={s.completeNote}>
              {completion.cards} review card{completion.cards === 1 ? '' : 's'} added. They’ll reappear just before you’d forget them.
            </p>
            <div className={s.completeActions}>
              {next ? (
                <Link to={`/learn/${next.id}`} className="btn btn-primary" viewTransition>
                  Next: {next.title} →
                </Link>
              ) : null}
              <Link to="/" className="btn" viewTransition>
                Back to Today
              </Link>
            </div>
          </div>
        ) : null}

        <PracticeLinks links={lesson.practice} />
      </article>
    </LessonContext.Provider>
  );
}

/** Lesson loop step 1: 2–3 due cards from *other* lessons before new material (retrieval practice). */
function WarmUp({ lessonId }: { lessonId: string }) {
  const [cards, setCards] = useState<Awaited<ReturnType<typeof reviewQueue>>['queue'] | null>(null);
  const [i, setI] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const saving = useRef(false);

  useEffect(() => {
    void reviewQueue().then(({ queue }) => setCards(queue.filter((c) => c.lessonId !== lessonId).slice(0, 3)));
  }, [lessonId]);

  if (!cards || cards.length === 0 || skipped) return null;
  const card = cards[i];
  return (
    <section className={s.warmup} aria-label="Warm-up">
      <div className={s.warmHead}>
        <p className="label">
          Warm-up · {Math.min(i + 1, cards.length)}/{cards.length} · recall before you learn
        </p>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSkipped(true)}>
          {card ? 'Skip warm-up' : 'Hide'}
        </button>
      </div>
      {card ? (
        <ReviewCard
          key={card.id}
          card={card}
          onGrade={(g, ms) => {
            if (saving.current) return;
            saving.current = true;
            submitReview(card.id, g, ms).then(
              () => {
                saving.current = false;
                setSaveError(false);
                setI((n) => n + 1);
              },
              () => {
                // Keep the card so the review isn't silently lost.
                saving.current = false;
                setSaveError(true);
              },
            );
          }}
        />
      ) : (
        <p className={s.warmDone}>Warmed up. On to the lesson ↓</p>
      )}
      {saveError ? <p role="alert">Couldn’t save that review (browser storage may be full or blocked). Grade it again to retry.</p> : null}
    </section>
  );
}
