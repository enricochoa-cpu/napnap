# Tech Stack

## Languages
- **TypeScript** ~5.9.3 — strict mode, ES2022 target, bundler module resolution
- **CSS** — Tailwind CSS v4 + custom properties (no separate tailwind.config; uses `@tailwindcss/vite` plugin)
- **HTML** — single `index.html` SPA entry point

## Frontend Framework
- **React** 19.2 with `react-dom` — functional components, hooks-only architecture
- **JSX transform**: `react-jsx` (automatic, no manual imports)

## Build Tooling
- **Vite** 7.2 — dev server, HMR, production bundler
  - Plugins: `@vitejs/plugin-react`, `@tailwindcss/vite`
- **TypeScript** — type-checked before build (`tsc -b && vite build`)
- **ESLint** 9 (flat config) — `typescript-eslint`, `react-hooks`, `react-refresh`
- **Node** 24.6 / **npm** 11.5

## Styling
- **Tailwind CSS** 4.1 — imported via `@import "tailwindcss"` in `src/index.css`
- **CSS Custom Properties** — full design token system (colors, spacing, radii, typography)
- **Google Fonts** — Quicksand (display) + Nunito (body), loaded via CSS `@import`
- **No component library** — all UI is hand-built

## Key Libraries
| Library | Version | Purpose |
|---------|---------|---------|
| `framer-motion` | 12.29 | Animations, bottom sheet drag/dismiss, page transitions |
| `date-fns` | 4.1 | Date formatting, duration calculations, age math |
| `recharts` | 3.7 | Sleep statistics charts (stacked bar, area) |
| `react-markdown` | 10.1 | Markdown rendering (support/FAQ content) |

## Backend / BaaS
- **Supabase** (`@supabase/supabase-js` 2.90)
  - **Auth**: Email/password + Google OAuth
  - **Database**: PostgreSQL with Row Level Security (RLS)
  - **Storage**: `baby-avatars` bucket for profile images
  - **Edge Functions**: Deno runtime, deployed via `npx supabase functions deploy`
    - `send-invitation-email` — sends invitations via Resend API
  - **Migrations**: `supabase/migrations/` (e.g. `multi_user_sharing.sql`)

## Monitoring / Observability
- **Sentry** (`@sentry/react` 10.36) — error tracking, optional DSN via env var

## MCP Servers (Developer Tooling)
| Server | Transport | Purpose |
|--------|-----------|---------|
| `context7` | stdio (npx) | Library documentation lookup |
| `sentry` | HTTP | Error monitoring integration |
| `supabase` | HTTP | Database management |

## Environment Variables
| Variable | Runtime | Purpose |
|----------|---------|---------|
| `VITE_SUPABASE_URL` | Client | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Client | Supabase anonymous API key |
| `VITE_SENTRY_DSN` | Client | Sentry error tracking DSN (optional) |
| `RESEND_API_KEY` | Edge Function | Resend email API key (server-side secret) |
| `APP_URL` | Edge Function | Public app URL for email CTAs (server-side secret) |

## Deployment
- **Frontend**: Static SPA — `npm run build` outputs to `dist/`
- **Backend**: Supabase hosted (managed PostgreSQL, Auth, Storage, Edge Functions)
- **Edge Functions**: Deployed from local filesystem via `npx supabase functions deploy`
- **No CI/CD pipeline** configured in repo

## TypeScript Configuration
- **App** (`tsconfig.app.json`): ES2022, strict, `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`
- **Node** (`tsconfig.node.json`): ES2023, covers `vite.config.ts` only
- **Project references**: root `tsconfig.json` composes app + node configs
