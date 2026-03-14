import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import './i18n';
import './index.css';
import App from './App.tsx';
import { AuthGuard } from './components/Auth';
import { NavHiddenWhenModalProvider } from './contexts/NavHiddenWhenModalContext';
import { LandingPage } from './components/LandingPage';
import { LandingPrivacyPage } from './components/LandingPrivacyPage';
import { LandingTermsPage } from './components/LandingTermsPage';
import { LandingContactPage } from './components/LandingContactPage';
import { SleepGuideHub } from './components/SleepGuideHub';
import { SleepGuidePage } from './components/SleepGuidePage';

// Initialize Sentry for error tracking
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  sendDefaultPii: true,
  enabled: import.meta.env.PROD, // Only enabled in production
});

const pathname = window.location.pathname;

// Apply morning theme synchronously for landing pages to prevent flash of dark theme
if (!pathname.startsWith('/app')) {
  document.documentElement.classList.add('theme-morning');
}

const LANDING_ROUTES: Record<string, React.JSX.Element> = {
  '/privacy': <LandingPrivacyPage />,
  '/terms': <LandingTermsPage />,
  '/contact': <LandingContactPage />,
  '/sleep-guides': <SleepGuideHub />,
};

let page: React.JSX.Element;

if (pathname.startsWith('/app')) {
  page = (
    <NavHiddenWhenModalProvider>
      <AuthGuard>
        <App />
      </AuthGuard>
    </NavHiddenWhenModalProvider>
  );
} else if (pathname.startsWith('/sleep-guides/')) {
  const slug = pathname.replace('/sleep-guides/', '');
  page = <SleepGuidePage slug={slug} />;
} else {
  page = LANDING_ROUTES[pathname] ?? <LandingPage />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {page}
  </StrictMode>,
);
