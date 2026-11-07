import type { CSSProperties } from 'react';
import { Link } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../learning/db';
import { MODULES_WITH_LESSONS, LESSONS } from '../../content/registry';
import { TRACKS } from '../../content/curriculum';
import type { TrackId } from '../../content/schema';
import page from './page.module.css';
import s from './learn.module.css';

export function LearnPage() {
  const progress = useLiveQuery(() => db.lessons.toArray(), [], []);
  const status = new Map(progress.map((p) => [p.lessonId, p.status]));
  const nextId = LESSONS.find((l) => status.get(l.id) !== 'completed')?.id;

  const trackStats = (Object.keys(TRACKS) as TrackId[]).map((t) => {
    const ls = LESSONS.filter((l) => l.track === t);
    const done = ls.filter((l) => status.get(l.id) === 'completed').length;
    const modules = MODULES_WITH_LESSONS.filter((m) => m.track === t).length;
    return { track: TRACKS[t], done, total: ls.length, modules };
  });

  return (
    <div className={page.page}>
      <header className={page.head}>
        <p className="label">The path</p>
        <h1>One route through SQL, Python and data engineering.</h1>
        <p className={page.lede}>
          The tracks are interleaved on purpose — switching between SQL and Python every few lessons makes both stick. Greyed-out
          modules are still being written.
        </p>
      </header>

      <section className={s.tracks} aria-label="Progress by track">
        {trackStats.map(({ track, done, total, modules }) => (
          <div key={track.id} className={s.track} style={{ '--track': track.color } as CSSProperties}>
            <span className="label">{track.name}</span>
            <span className={s.trackNum}>
              {done}
              <span className={s.trackOf}>/{total}</span>
            </span>
            <span className={s.meter} aria-hidden="true">
              <span style={{ width: total ? `${(done / total) * 100}%` : 0 }} />
            </span>
            <span className={s.trackNote}>
              {modules} module{modules === 1 ? '' : 's'} · {total} lesson{total === 1 ? '' : 's'} ready
            </span>
          </div>
        ))}
      </section>

      <ol className={s.path}>
        {MODULES_WITH_LESSONS.map((m) => {
          const track = TRACKS[m.track];
          const ready = m.lessons.length > 0;
          const done = m.lessons.filter((l) => status.get(l.id) === 'completed').length;
          const state = !ready ? 'soon' : done === m.lessons.length ? 'done' : done > 0 || m.lessons.some((l) => status.has(l.id)) ? 'active' : 'todo';
          return (
            <li key={m.code} className={`${s.module} ${s[state]}`} style={{ '--track': track.color } as CSSProperties}>
              <span className={s.node} aria-hidden="true" />
              <div className={s.modBody}>
                <p className="label">
                  <span style={{ color: ready ? track.color : undefined }}>{m.code}</span> · {track.name}
                  {m.optional ? ' · optional' : ''}
                  {!ready ? ' · coming soon' : ` · ${done}/${m.lessons.length}`}
                </p>
                <h2 className={s.modTitle}>{m.title}</h2>
                <p className={s.blurb}>{m.blurb}</p>
                {ready ? (
                  <ul className={s.lessons}>
                    {m.lessons.map((l) => {
                      const st = status.get(l.id);
                      return (
                        <li key={l.id}>
                          <Link to={`/learn/${l.id}`} className={s.lesson} viewTransition>
                            <span className={`${s.dot} ${st === 'completed' ? s.dotDone : st ? s.dotStarted : ''}`} aria-hidden="true" />
                            <span className={s.lessonTitle}>{l.title}</span>
                            <span className="label">
                              {l.where === 'local' ? '💻 lab' : ''} {l.estMinutes} min
                              {st === 'completed' ? ' · done' : st ? ' · started' : l.id === nextId ? ' · next' : ''}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
