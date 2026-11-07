import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import './styles/global.css';
import { router } from './app/router';

// Ask the browser not to evict our IndexedDB under storage pressure (plan: risk "progress lost").
if (navigator.storage?.persist) void navigator.storage.persist().catch(() => undefined);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
