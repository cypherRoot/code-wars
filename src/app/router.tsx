import { lazy } from 'react';
import { createBrowserRouter } from 'react-router';
import { Layout } from './layout';
import { TodayPage } from './routes/today';
import { LearnPage } from './routes/learn';
import { NotFound } from './routes/not-found';

const LessonPage = lazy(() => import('./routes/lesson').then((m) => ({ default: m.LessonPage })));
const ReviewPage = lazy(() => import('./routes/review').then((m) => ({ default: m.ReviewPage })));
const PlaygroundPage = lazy(() => import('./routes/playground').then((m) => ({ default: m.PlaygroundPage })));
const SettingsPage = lazy(() => import('./routes/settings').then((m) => ({ default: m.SettingsPage })));
const ValidatePage = lazy(() => import('./routes/dev-validate').then((m) => ({ default: m.ValidatePage })));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <TodayPage /> },
      { path: 'learn', element: <LearnPage /> },
      { path: 'learn/:lessonId', element: <LessonPage /> },
      { path: 'review', element: <ReviewPage /> },
      { path: 'playground', element: <PlaygroundPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'dev/validate', element: <ValidatePage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
