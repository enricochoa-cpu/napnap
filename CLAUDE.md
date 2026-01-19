# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (Vite)
npm run build    # Type-check with tsc and build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build locally
```

## Architecture

Baby Sleep Tracker is a React + TypeScript app for tracking infant sleep patterns. All data persists in localStorage.

### Data Flow
- **Hooks** (`src/hooks/`) manage all state and localStorage persistence
- **Components** are presentational and receive data/callbacks via props
- `useSleepEntries` handles all sleep CRUD operations and provides computed values (active sleep, daily summaries)
- `useBabyProfile` handles baby profile CRUD
- `useLocalStorage` is the generic persistence hook used by the other hooks

### Key Types (`src/types/index.ts`)
- `BabyProfile`: Baby info (name, DOB, gender, weight, height)
- `SleepEntry`: Individual sleep record with start/end times, type (nap/night), and optional notes

### Component Responsibilities
- `App.tsx`: Tab-based navigation (home, history, profile, add), collision detection, bottom action bar
- `CircularClock`: SVG 24-hour clock visualization with sleep arcs and current time needle
- `BabyProfile`: Profile display/edit form
- `SleepForm`: Add/edit entries with icon-based type toggles
- `SleepList`/`SleepEntryCard`: Display entries with edit/delete/wake actions
- `DayNavigator`: Date selection for viewing past entries
- `DailySummary`: Aggregated sleep statistics
- `ActivityCollisionModal`: Modal for handling overlapping sleep entries
- `LoadingScreen`/`Loader`/`Spinner`: Loading state components

### Utilities (`src/utils/`)
- `dateUtils.ts`: Date formatting, duration calculations, age calculation using date-fns
- `storage.ts`: localStorage keys and get/set helpers

## Design System

"Calming Night" theme optimized for night-time use, defined in `src/index.css`.

### CSS Custom Properties
All theme values are CSS variables in `:root`:
- **Background**: `--bg-deep` (#0f1428), `--bg-card` (#1e2845), `--bg-soft` (#2a3655)
- **Colors**: `--nap-color` (#5eadb0 teal), `--night-color` (#7c85c4 lavender), `--wake-color` (#f0c674 gold)
- **Text**: `--text-primary`, `--text-secondary`, `--text-muted`
- **UI**: `--success-color`, `--danger-color`
- **Typography**: `--font-display` (Quicksand), `--font-body` (Nunito)

### Reusable CSS Classes
- `.card`: Dark glass-morphism cards with subtle border
- `.btn`, `.btn-nap`, `.btn-night`, `.btn-wake`, `.btn-ghost`, `.btn-danger`: Button variants
- `.input`: Dark-themed form inputs with focus glow
- `.tag`, `.tag-nap`, `.tag-night`, `.tag-active`: Status pill badges
- `.stat-value`, `.stat-value-nap`, `.stat-value-night`, `.stat-value-total`: Colored stat text
- `.stat-label`: Muted label text
- `.text-display-lg`, `.text-display-md`, `.text-display-sm`: Display typography
- `.action-bar`: Fixed bottom action area
- `.modal-overlay`, `.modal-content`: Modal styling
- `.loader`, `.loader-dot`, `.spinner`: Loading animations
- `.fade-in`, `.slide-up`: Animation classes

### Color Semantics
- Teal (`--nap-color`): Daytime naps
- Lavender (`--night-color`): Night sleep
- Gold (`--wake-color`): Wake up actions, totals, highlights
