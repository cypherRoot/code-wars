import { useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../learning/db';
import { downloadJson, exportBackup, importBackup, resetAll } from '../../learning/backup';
import { dateKey } from '../../learning/dates';
import { setPrefs, usePrefs, type Prefs } from '../../learning/prefs';
import page from './page.module.css';
import s from './settings.module.css';

export function SettingsPage() {
  const prefs = usePrefs();
  const [message, setMessage] = useState<{ tone: 'ok' | 'bad'; text: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState('');
  const [persisted, setPersisted] = useState<boolean | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const counts = useLiveQuery(async () => ({ lessons: await db.lessons.count(), cards: await db.cards.count(), reviews: await db.reviews.count() }), []);

  useEffect(() => {
    void navigator.storage?.persisted?.().then(setPersisted);
  }, []);

  async function onExport() {
    const backup = await exportBackup();
    downloadJson(backup, `dataforge-backup-${dateKey()}.json`);
    setPrefs({ lastExportAt: Date.now() });
    setMessage({ tone: 'ok', text: 'Backup downloaded. Keep it somewhere safe (e.g. a synced folder).' });
  }

  async function onImport(file: File) {
    try {
      const json: unknown = JSON.parse(await file.text());
      const res = await importBackup(json);
      setMessage(
        res.ok
          ? { tone: 'ok', text: `Restored: ${res.counts.lessons} lessons, ${res.counts.cards} cards, ${res.counts.reviews} reviews.` }
          : { tone: 'bad', text: res.message },
      );
    } catch {
      setMessage({ tone: 'bad', text: 'That file isn’t valid JSON. Nothing was changed.' });
    }
  }

  return (
    <div className={`${page.page} ${page.narrow}`}>
      <header className={page.head}>
        <p className="label">Settings</p>
        <h1>Your setup.</h1>
      </header>

      <section className={page.section} aria-labelledby="look">
        <div className={page.sectionHead}>
          <h2 id="look">Look &amp; motion</h2>
        </div>
        <Choice
          legend="Theme"
          value={prefs.theme}
          options={[
            ['system', 'Match system'],
            ['dark', 'Dark'],
            ['light', 'Light'],
          ]}
          onChange={(v) => setPrefs({ theme: v as Prefs['theme'] })}
        />
        <Choice
          legend="Motion"
          value={prefs.motion}
          options={[
            ['system', 'Match system'],
            ['reduce', 'Reduced'],
            ['full', 'Full'],
          ]}
          onChange={(v) => setPrefs({ motion: v as Prefs['motion'] })}
        />
        <label className={s.field}>
          <span>Daily goal (minutes)</span>
          <input
            type="number"
            min={5}
            max={240}
            step={5}
            value={prefs.dailyGoalMin}
            onChange={(e) => setPrefs({ dailyGoalMin: Math.min(240, Math.max(5, Number(e.target.value) || 40)) })}
            className={s.input}
          />
        </label>
      </section>

      <section className={page.section} aria-labelledby="data">
        <div className={page.sectionHead}>
          <h2 id="data">Your data</h2>
          <span className="label">
            {counts ? `${counts.lessons} lessons · ${counts.cards} cards · ${counts.reviews} reviews` : ''}
          </span>
        </div>
        <p className={s.note}>
          Everything is stored in this browser only — there’s no account and no server.{' '}
          {persisted === true
            ? 'The browser has agreed not to clear it automatically.'
            : persisted === false
              ? 'The browser may clear it under storage pressure, so export a backup regularly.'
              : ''}
        </p>
        <div className={s.row}>
          <button className="btn btn-primary" onClick={() => void onExport()}>
            Export backup
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            Import backup…
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onImport(f);
              e.target.value = '';
            }}
          />
        </div>
        {prefs.lastExportAt ? <p className={s.note}>Last export: {new Date(prefs.lastExportAt).toLocaleString()}</p> : null}
        {message ? (
          <p className={message.tone === 'ok' ? s.ok : s.bad} role="status">
            {message.text}
          </p>
        ) : null}
      </section>

      <section className={page.section} aria-labelledby="danger">
        <div className={page.sectionHead}>
          <h2 id="danger">Start over</h2>
        </div>
        <p className={s.note}>
          Deletes all progress, review cards and drafts on this device. Type <code>reset</code> to confirm.
        </p>
        <div className={s.row}>
          <input
            className={s.input}
            value={confirmReset}
            onChange={(e) => setConfirmReset(e.target.value)}
            aria-label="Type reset to confirm"
            placeholder="reset"
          />
          <button
            className="btn"
            disabled={confirmReset !== 'reset'}
            onClick={async () => {
              await resetAll();
              setConfirmReset('');
              setMessage({ tone: 'ok', text: 'All progress deleted.' });
            }}
          >
            Delete everything
          </button>
        </div>
      </section>
    </div>
  );
}

function Choice({ legend, value, options, onChange }: { legend: string; value: string; options: [string, string][]; onChange: (v: string) => void }) {
  return (
    <fieldset className={s.choice}>
      <legend>{legend}</legend>
      <div className={s.seg}>
        {options.map(([v, label]) => (
          <label key={v} className={`${s.segItem} ${value === v ? s.segOn : ''}`}>
            <input type="radio" name={legend} value={v} checked={value === v} onChange={() => onChange(v)} />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
