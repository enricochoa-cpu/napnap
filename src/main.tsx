import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import './i18n';
import './index.css';
import App from './App.tsx';
import { AuthGuard } from './components/Auth';
import { NavHiddenWhenModalProvider } from './contexts/NavHiddenWhenModalContext';
import { LandingPage } from './components/LandingPage';

// Initialize Sentry for error tracking
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  sendDefaultPii: true,
  enabled: import.meta.env.PROD, // Only enabled in production
});

const isAppShell = window.location.pathname.startsWith('/app');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAppShell ? (
      <NavHiddenWhenModalProvider>
        <AuthGuard>
          <App />
        </AuthGuard>
      </NavHiddenWhenModalProvider>
    ) : (
      <LandingPage />
    )}
  </StrictMode>,
);
