import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import { Link } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { gsap } from 'gsap';
import { db } from '../../learning/db';
import { addDays, dateKey } from '../../learning/dates';
import { isActiveDay, reviewQueue } from '../../learning/progress';
import { computeStreak } from '../../learning/streak';
import { prefersReducedMotion, usePrefs } from '../../learning/prefs';
import { LESSONS, lessonById } from '../../content/registry';
import { TRACKS, moduleByCode } from '../../content/curriculum';
import { InlineMd } from '../../components/ui/inline-md';
import page from './page.module.css';
import s from './today.module.css';

const fmtDate = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const fmtDay = new Intl.DateTimeFormat('en-GB', { weekday: 'short' });

export function TodayPage() {
  const prefs = usePrefs();
  const today = dateKey();
  const data = useLiveQuery(async () => {
    const [days, progress, rq, cardCount] = await Promise.all([db.days.toArray(), db.lessons.toArray(), reviewQueue(), db.cards.count()]);
    return { days, progress, rq, cardCount };
  }, []);

  const root = useRef<HTMLDivElement>(null);
  const ready = data !== undefined;
  useLayoutEffect(() => {
    if (!ready || !root.current || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from('[data-rise]', { y: 16, opacity: 0, duration: 0.5, ease: 'power3.out', stagger: 0.06 });
      root.current!.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
        const target = Number(el.dataset.count);
        if (!target) return;
        const obj = { v: 0 };
        gsap.to(obj, { v: target, duration: 1, ease: 'power3.out', onUpdate: () => (el.textContent = String(Math.round(obj.v))) });
      });
    }, root);
    return () => ctx.revert();
  }, [ready]);

  if (!data) return <div className={page.page} />;

  const { days, progress, rq } = data;
  const completed = new Set(progress.filter((p) => p.status === 'completed').map((p) => p.lessonId));
  const started = new Set(progress.filter((p) => p.status === 'started').map((p) => p.lessonId));
  const next = LESSONS.find((l) => !completed.has(l.id));
  const streak = computeStreak(days.filter(isActiveDay).map((d) => d.date), today);
  const todayLog = days.find((d) => d.date === today);
  const minutesToday = Math.round((todayLog?.activeMs ?? 0) / 60000);
  const goal = prefs.dailyGoalMin;
  const isNewLearner = progress.length === 0 && days.length === 0;

  const week = Array.from({ length: 7 }, (_, i) => {
    const key = addDays(today, i - 6);
    const d = days.find((x) => x.date === key);
    return { key, minutes: Math.round((d?.activeMs ?? 0) / 60000), active: d ? isActiveDay(d) : false };
  });
  const weekMax = Math.max(goal, ...week.map((w) => w.minutes));

  const recent = [...days]
    .filter((d) => d.lessonsCompleted.length && d.date >= addDays(today, -13))
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const needsBackup =
    progress.length > 0 && (!prefs.lastExportAt || Date.now() - prefs.lastExportAt > 7 * 24 * 3600 * 1000);

  const headline = isNewLearner
    ? 'Day one. Let’s build your first query.'
    : streak.activeToday
      ? 'Nice — today counts.'
      : streak.current > 0
        ? 'Keep the chain going.'
        : 'Welcome back.';

  return (
    <div className={`${page.page} ${s.today}`} ref={root}>
      <header className={s.hero}>
        <p className="label" data-rise>
          {fmtDate.format(new Date())}
        </p>
        <h1 className={s.display} data-rise>
          {headline}
        </h1>
      </header>

      <section className={s.stats} aria-label="Your numbers">
        <Stat label="Day streak" value={streak.current} note={streak.longest > streak.current ? `best ${streak.longest}` : streak.activeToday ? 'today ✓' : 'study today to extend'} accent={streak.activeToday ? 'var(--mastery)' : undefined} />
        <Stat label="Reviews due" value={rq.queue.length} note={rq.backlog ? `+${rq.backlog} waiting (daily cap)` : rq.queue.length ? 'do these first' : 'all clear'} />
        <Stat label="Minutes today" value={minutesToday} note={`goal ${goal}`} />
        <Stat label="Lessons done" value={completed.size} note={`of ${LESSONS.length} written so far`} />
      </section>

      <section className={page.section} aria-labelledby="plan-title">
        <div className={page.sectionHead}>
          <h2 id="plan-title">Today’s plan</h2>
          <span className="label">reviews first, then something new</span>
        </div>
        <ol className={s.plan}>
          <li className={s.step} data-rise data-done={rq.queue.length === 0 || undefined}>
            <span className={s.stepNum}>01</span>
            <div className={s.stepBody}>
              <p className={s.stepTitle}>{rq.queue.length ? `Review ${rq.queue.length} card${rq.queue.length === 1 ? '' : 's'}` : 'No reviews due'}</p>
              <p className={s.stepNote}>
                {rq.queue.length
                  ? `About ${Math.max(1, Math.round(rq.queue.length * 0.4))} min. Recalling beats re-reading.`
                  : data.cardCount
                    ? 'Your memory is up to date. Cards come back right before you’d forget them.'
                    : 'Finish a lesson and its quiz to start your review deck.'}
              </p>
            </div>
            {rq.queue.length ? (
              <Link to="/review" className="btn btn-primary" viewTransition>
                Start review
              </Link>
            ) : null}
          </li>
          <li className={s.step} data-rise style={next ? ({ '--track': TRACKS[next.track].color } as CSSProperties) : undefined}>
            <span className={s.stepNum}>02</span>
            <div className={s.stepBody}>
              {next ? (
                <>
                  <p className="label" style={{ color: TRACKS[next.track].color }}>
                    {next.module} · {moduleByCode.get(next.module)?.title} · {next.where === 'local' ? '💻 local lab' : '🌐 in browser'} · ~{next.estMinutes} min
                  </p>
                  <p className={s.stepTitle}>{next.title}</p>
                  <p className={s.stepNote}>{next.summary}</p>
                </>
              ) : (
                <>
                  <p className={s.stepTitle}>You’ve finished every lesson written so far.</p>
                  <p className={s.stepNote}>Keep reviewing — new modules are on the way.</p>
                </>
              )}
            </div>
            {next ? (
              <Link to={`/learn/${next.id}`} className={rq.queue.length ? 'btn' : 'btn btn-primary'} viewTransition>
                {started.has(next.id) ? 'Continue' : 'Start lesson'}
              </Link>
            ) : null}
          </li>
          <li className={s.step} data-rise>
            <span className={s.stepNum}>03</span>
            <div className={s.stepBody}>
              <p className={s.stepTitle}>Free practice</p>
              <p className={s.stepNote}>Poke at the shop database in the Playground, or try an outside problem from your last lesson.</p>
            </div>
            <Link to="/playground" className="btn btn-ghost" viewTransition>
              Playground
            </Link>
          </li>
        </ol>
      </section>

      <section className={page.section} aria-labelledby="week-title">
        <div className={page.sectionHead}>
          <h2 id="week-title">This week</h2>
          <span className="label">{week.reduce((a, w) => a + w.minutes, 0)} min total</span>
        </div>
        <div className={s.week} role="img" aria-label={`Minutes per day this week: ${week.map((w) => `${fmtDay.format(new Date(w.key))} ${w.minutes}`).join(', ')}`}>
          {week.map((w) => (
            <div key={w.key} className={s.dayCol}>
              <div className={s.barTrack}>
                <div
                  className={`${s.bar} ${w.minutes >= goal ? s.barGoal : ''}`}
                  style={{ height: `${Math.max(w.active ? 6 : 2, (w.minutes / weekMax) * 100)}%` }}
                />
                <div className={s.goalLine} style={{ bottom: `${(goal / weekMax) * 100}%` }} />
              </div>
              <span className={`label ${w.key === today ? s.todayLabel : ''}`}>{fmtDay.format(new Date(`${w.key}T12:00`))}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={page.section} aria-labelledby="learned-title">
        <div className={page.sectionHead}>
          <h2 id="learned-title">What you’ve learned</h2>
          <span className="label">last 14 days</span>
        </div>
        {recent.length ? (
          <ol className={s.log}>
            {recent.map((d) => (
              <li key={d.date} className={s.logDay}>
                <p className="label">{d.date === today ? 'Today' : fmtDate.format(new Date(`${d.date}T12:00`))}</p>
                <ul>
                  {d.lessonsCompleted.map((id) => {
                    const l = lessonById.get(id);
                    if (!l) return null;
                    return (
                      <li key={id} style={{ '--track': TRACKS[l.track].color } as CSSProperties}>
                        <Link to={`/learn/${id}`} className={s.logLesson}>
                          <span className="label" style={{ color: TRACKS[l.track].color }}>
                            {l.module}
                          </span>{' '}
                          {l.title}
                        </Link>
                        <ul className={s.objectives}>
                          {l.objectives.map((o) => (
                            <li key={o}>
                  <InlineMd text={o} />
                </li>
                          ))}
                        </ul>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ol>
        ) : (
          <div className={page.empty}>
            <p>Lessons you finish show up here with what you can now do — your own learning log.</p>
          </div>
        )}
      </section>

      {needsBackup ? (
        <aside className={s.backup} role="note">
          <p>
            <strong>Back up your progress.</strong> It lives only in this browser — clearing site data would erase it.
          </p>
          <Link to="/settings" className="btn btn-sm">
            Export backup
          </Link>
        </aside>
      ) : null}
    </div>
  );
}

function Stat({ label, value, note, accent }: { label: string; value: number; note: string; accent?: string }) {
  return (
    <div className={s.stat} data-rise>
      <span className={s.statValue} data-count={value} style={accent ? { color: accent } : undefined}>
        {value}
      </span>
      <span className="label">{label}</span>
      <span className={s.statNote}>{note}</span>
    </div>
  );
}
