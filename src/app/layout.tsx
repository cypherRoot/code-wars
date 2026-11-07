import { Suspense, useEffect } from 'react';
import { NavLink, Outlet, ScrollRestoration, useLocation } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { reviewQueue } from '../learning/progress';
import { contentErrors } from '../content/registry';
import styles from './layout.module.css';

const NAV = [
  { to: '/', label: 'Today', end: true },
  { to: '/learn', label: 'Learn' },
  { to: '/review', label: 'Review' },
  { to: '/playground', label: 'Playground' },
  { to: '/settings', label: 'Settings' },
];

export function Layout() {
  const due = useLiveQuery(async () => (await reviewQueue()).queue.length, [], 0);
  const { pathname } = useLocation();

  // Move focus to main content on navigation, for keyboard and screen-reader users.
  useEffect(() => {
    document.getElementById('main')?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <div className={styles.shell}>
      <a href="#main" className={styles.skip}>
        Skip to content
      </a>
      <header className={styles.header}>
        <NavLink to="/" className={styles.brand} viewTransition>
          <span className={styles.mark} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          DataForge
        </NavLink>
        <nav aria-label="Main" className={styles.nav}>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} viewTransition className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
              {n.label}
              {n.to === '/review' && due > 0 ? (
                <span className={styles.badge} aria-label={`${due} due`}>
                  {due}
                </span>
              ) : null}
            </NavLink>
          ))}
        </nav>
      </header>
      {import.meta.env.DEV && contentErrors.length ? (
        <div className={styles.contentErrors} role="alert">
          <strong>Content errors</strong>
          {contentErrors.map((e) => (
            <pre key={e.file}>
              {e.file}
              {'\n'}
              {e.message}
            </pre>
          ))}
        </div>
      ) : null}
      <main id="main" tabIndex={-1} className={styles.main}>
        <Suspense fallback={<p className={`label ${styles.loading}`}>Loading…</p>}>
          <Outlet />
        </Suspense>
      </main>
      <ScrollRestoration />
    </div>
  );
}
