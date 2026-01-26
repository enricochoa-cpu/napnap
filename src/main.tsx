import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import './index.css'
import App from './App.tsx'
import { AuthGuard } from './components/Auth'

// Initialize Sentry for error tracking
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
    ],
    tracesSampleRate: 0.1, // 10% of transactions for performance monitoring
    enabled: import.meta.env.PROD, // Only enabled in production
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthGuard>
      <App />
    </AuthGuard>
  </StrictMode>,
)
