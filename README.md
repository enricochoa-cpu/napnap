# Baby Sleep Tracker

A React + TypeScript mobile-first app for tracking infant sleep patterns, inspired by Napper's AAA-level design principles. Optimized for sleep-deprived parents with a calming "Midnight" theme and one-handed operation.

## Features

- **24-Hour Circular Clock**: Visual timeline showing sleep patterns at a glance
- **Sleep Tracking**: Log naps and night sleep with one-tap actions
- **Active Sleep Timer**: Real-time countdown with bedtime predictions
- **Daily Summaries**: Aggregated sleep statistics (nap time, night sleep, total)
- **Activity Collision Detection**: Prevents overlapping entries with clear resolution modals
- **Profile Management**: Track baby info (name, DOB, gender, weight, height)
- **User Authentication**: Supabase-powered auth with email/password

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Custom CSS variables
- **Backend**: Supabase (Auth + PostgreSQL)
- **Date Handling**: date-fns
- **Error Tracking**: Sentry

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Add your Supabase credentials to .env.local
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key

# Start development server
npm run dev
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Vite) |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |

## Project Structure

```
src/
├── components/          # React components
│   ├── Auth/           # Login, SignUp, ForgotPassword, AuthGuard
│   ├── TodayView.tsx   # Main dashboard with sleep algorithm
│   ├── SleepForm.tsx   # Add/edit sleep entries
│   ├── SleepList.tsx   # Entry list with timeline
│   ├── BabyProfile.tsx # Profile display/edit
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useAuth.ts      # Authentication state
│   ├── useSleepEntries.ts  # Sleep CRUD + computed values
│   └── useBabyProfile.ts   # Profile management
├── lib/
│   └── supabase.ts     # Supabase client + DB types
├── types/
│   └── index.ts        # TypeScript interfaces
├── utils/
│   ├── dateUtils.ts    # Date formatting, duration calc
│   └── storage.ts      # localStorage helpers
├── index.css           # Design system (CSS variables)
├── App.tsx             # Root component + routing
└── main.tsx            # Entry point
```

## Design System

"Calming Night" theme optimized for 3AM use. See `src/index.css` for full implementation.

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-deep` | #070912 | Main background |
| `--nap-color` | #5eadb0 | Daytime naps (teal) |
| `--night-color` | #7c85c4 | Night sleep (lavender) |
| `--wake-color` | #f0c674 | Wake actions, totals (gold) |

### Typography

- **Display & body**: Plus Jakarta Sans (headings, buttons, content, forms)

### Key Classes

- `.card` / `.card-glass` - Dark glass-morphism containers
- `.btn-nap` / `.btn-night` / `.btn-wake` - Semantic button colors
- `.tag-nap` / `.tag-night` / `.tag-active` - Status badges
- `.hero-countdown` - Large focal-point numbers

## Data Model

```typescript
interface BabyProfile {
  id: string;
  name: string;
  dateOfBirth: string;  // ISO date
  gender: 'male' | 'female' | 'other';
  weight: number;       // kg
  height: number;       // cm
}

interface SleepEntry {
  id: string;
  date: string;         // YYYY-MM-DD
  startTime: string;    // ISO datetime
  endTime: string | null;  // null = active sleep
  type: 'nap' | 'night';
  notes?: string;
}
```

## Product Research

Before making UX/UI decisions, consult the research in `product-research/`:

- `one-pager-research.md` - Product strategy analysis
- `users-feedback.md` - User sentiment and trust dynamics
- `ux-ui-findings.pdf` - Detailed UX/UI recommendations

### Core Design Principles

1. **Decision Replacement** - Tell users what to do, don't make them analyze
2. **Cognitive Load Minimization** - One-tap logging, minimal charts
3. **Night-Time Optimization** - Large touch targets, calming colors, high contrast
4. **One-Handed Operation** - Thumb-zone accessibility
5. **Emotional Safety** - Non-judgmental tone, retrospective editing

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `VITE_SENTRY_DSN` | Sentry error tracking DSN (optional) |

## License

Private project - All rights reserved
