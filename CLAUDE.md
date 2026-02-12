# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Baby Sleep Tracker** is a mobile-first React app for tracking infant sleep patterns (0-18 months). Inspired by Napper's AAA-level design, it prioritizes:

- **Decision replacement** over data analysis
- **Calming, night-optimized UI** for sleep-deprived parents
- **One-handed, thumb-zone operation**
- **Emotional safety** with non-judgmental tone

**Target users**: First-time parents seeking certainty about baby sleep schedules.

## Commands

```bash
npm run dev      # Start development server (Vite)
npm run build    # Type-check with tsc and build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build locally
```

## Environment Setup

Copy `.env.example` to `.env.local` and configure Supabase credentials:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these values from your Supabase project dashboard: https://app.supabase.com/project/_/settings/api

## Architecture

Baby Sleep Tracker is a React + TypeScript app for tracking infant sleep patterns. Data persists in Supabase with user authentication.

### Data Flow
- **Supabase** (`src/lib/supabase.ts`) provides the backend client for auth and database operations
- **Hooks** (`src/hooks/`) manage state and Supabase persistence
- **Components** are presentational and receive data/callbacks via props
- `useAuth` handles user authentication (sign up, sign in, sign out, password reset)
- `useSleepEntries` handles all sleep CRUD operations and provides computed values (active sleep, daily summaries)
- `useBabyProfile` handles baby and user profile CRUD via Supabase
- `useBabyShares` handles multi-user sharing (invitations, access management)
- `useCircadianTheme` provides time-based theme switching (morning/afternoon/night)
- `useFocusTrap` traps keyboard focus inside modals/sheets (Tab cycling, Escape key, focus save/restore)
- `useLocalStorage` is available for local-only data if needed

### Key Types (`src/types/index.ts`)
- `BabyProfile`: Baby info (name, DOB, gender, weight, height, avatarUrl)
- `UserProfile`: User info (email, userName, userRole: dad/mum/other)
- `SleepEntry`: Individual sleep record with start/end times, type (nap/night), and optional notes
- `BabyShare`: Multi-user sharing (babyOwnerId, sharedWithEmail, status, role: caregiver/viewer)

### Database Types (`src/lib/supabase.ts`)
- `DbProfile`: Supabase profiles table schema
- `DbSleepEntry`: Supabase sleep_entries table schema
- `baby_shares` table: Multi-user sharing with invitation workflow

### Component Responsibilities
- `App.tsx`: Tab-based navigation (home, history, profile, add), collision detection, bottom action bar, add entry dropdown. **Uses AnimatePresence for slide transitions** between views with spring physics (stiffness: 300, damping: 30)
- `TodayView`: Smart dashboard showing predicted nap times, bedtime, and current status. Uses compact horizontal card layout (~48px height) with timeline river (vertical connector line) for mobile optimization. **Shows skeleton loading states** via `SkeletonTimelineCard` during data fetch. Predictions shown alongside active naps; bedtime updates in real-time based on active nap's expected wake time
- `QuickActionSheet`: Napper-style bottom sheet with 3-column quick action grid (Wake Up, Nap, Bedtime). Uses framer-motion spring animations. Opens SleepEntrySheet with current time pre-loaded
- `SleepEntrySheet`: Bottom sheet modal for adding/editing sleep entries with time pickers. **Uses Framer Motion with drag-to-dismiss** (swipe down to close with elastic physics). Shows selected date and uses smart defaults (12:00 for naps, 20:00 for bedtime) when adding entries for past dates
- `SkeletonTimelineCard`: Loading placeholder cards matching exact dimensions of Compact Cards (48px height) to prevent layout shift. Includes `SkeletonTimeline` and `SkeletonHero` variants
- `MissingBedtimeModal`: Prompts user to log forgotten bedtime with date picker to select which night to log (not just yesterday)
- `BabyProfile`: Profile display/edit form
- `SleepList`/`SleepEntry`: Display entries with edit/delete/wake actions (NapEntry, BedtimeEntry, WakeUpEntry variants)
- `DayNavigator`: Date selection for viewing past entries
- `DailySummary`: Aggregated sleep statistics
- `ConfirmationModal`: Reusable themed confirmation dialog (`role="alertdialog"`, focus trap). Used by SleepEntrySheet, WakeUpSheet, BabyEditSheet for delete confirmations
- `ActivityCollisionModal`: Modal for handling overlapping sleep entries
- `ShareAccess`: Invite caregivers with role selector (caregiver/viewer), manage sharing via bottom sheet (edit role, remove access)
- `SkyBackground`: Animated background atmosphere with inline NightSky (stars), MorningSky (sun), AfternoonSky (clouds)
- `LoadingScreen`: Full-screen loading state with animated moon
- `StatsView`: Sleep statistics dashboard with Recharts. Features date range picker (max 15 days), summary cards (avg total sleep, avg naps/day, avg nap time, avg night sleep), stacked bar chart (daily sleep), and area chart (sleep trends). Uses CSS variables for theming

**Profile Section** (`src/components/Profile/`):
- `ProfileSection`: Container with navigation between profile views
- `ProfileMenu`: Main menu with navigation items (Premium Nested List pattern)
- `MyBabiesView`: Premium AAA gallery with floating BabyProfileCard components (`rounded-[40px]`)
- `BabyEditSheet`: Bottom sheet for editing baby profiles (framer-motion, drag-to-dismiss)
- `BabyAvatarPicker`: Reusable avatar component with client-side image compression (resizes to 400x400, JPEG 80%)
- `AccountSettingsView`: User settings, sign out card, and delete account link
- `SupportView`/`FAQsView`/`ContactView`: Help and support

**Auth Components** (`src/components/Auth/`):
- `AuthGuard`: Protects routes requiring authentication
- `LoginForm`/`SignUpForm`/`ForgotPasswordForm`: Authentication flows
- `GoogleSignInButton`: Dark-themed OAuth button with Google's colored "G" logo (56px touch target)
- `AuthDivider`: "or" separator between social and email login options

**Authentication Methods:**
- Email/password (traditional)
- Google OAuth (via Supabase `signInWithOAuth`)
- Password reset via email

**Google OAuth Setup:** Requires configuration in Google Cloud Console (OAuth client ID) and Supabase Dashboard (enable Google provider, add redirect URLs). See `.context/logs/2026-02-03.md` for detailed setup steps.

### Utilities (`src/utils/`)
- `dateUtils.ts`: Date formatting, duration calculations, age calculation using date-fns. Includes prediction algorithms:
  - `getRecommendedSchedule(dateOfBirth)`: Age-based nap count and wake windows
  - `calculateSuggestedNapTime()`: Next nap prediction based on wake windows
  - `calculateAllNapWindows()`: Full day nap schedule prediction
  - `calculateDynamicBedtime()`: Bedtime calculation based on completed naps
- `storage.ts`: localStorage keys and get/set helpers

## Design System

"Calming Night" theme optimized for night-time use, defined in `src/index.css`.

### CSS Custom Properties
All theme values are CSS variables in `:root`:
- **Background**: `--bg-deep` (#12141C), `--bg-card` (#1E2230), `--bg-soft` (#1E2230)
- **Colors**: `--nap-color` (#9DBAB7 matte sage), `--night-color` (#8A92B3 muted periwinkle), `--wake-color` (#E8D3A3 warm parchment)
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

### Color Semantics (Matte AAA Palette)
- Sage (`--nap-color`): Daytime naps - desaturated to avoid alertness triggers
- Periwinkle (`--night-color`): Night sleep - muted to avoid neon vibes
- Parchment (`--wake-color`): Wake up actions, totals - warm sunrise tone

## Product Research

**IMPORTANT**: Before making any UX/UI decisions, product improvements, or adding new features, always consult the research documents in `product-research/`.

### Research Documents
- `one-pager-research.md`: Product strategy, competitive analysis, user personas, monetization
- `users-feedback.md`: User sentiment analysis, trust dynamics, feedback patterns
- `ux-ui-findings.md`: Detailed UX/UI patterns, interaction design, visual system
- `ux-ui-findings.pdf`: Original PDF with citations (keep for reference)

### When to Consult Research
- Designing new features or screens
- Improving existing UI components
- Making layout or navigation decisions
- Choosing interaction patterns
- Selecting visual design approaches
- Understanding user psychology and trust dynamics

### Key Principles from Research

**Decision Replacement (Not Decision Support)**
- Tell users what to do with definitive outputs ("Next nap at 13:42")
- Compress cognitive steps into single actions
- Users want certainty, not data to analyze

**Night-Time Optimization**
- Large touch targets (minimum 60px)
- High contrast, low-saturation calming colors
- Thumb-zone accessibility (actions at bottom)
- 2 AM readability with large fonts

**Emotional Safety**
- Non-judgmental tone ("gentle friend" persona)
- Allow retrospective editing without penalty
- Never degrade perceived accuracy
- Visual restraint signals care

**Trust Building**
- Transparent calibration periods
- Clear collision handling with modals
- Accuracy is felt emotionally, not measured statistically

### Competitive Positioning
| Aspect | Our Approach (Napper-inspired) | Avoid |
|--------|-------------------------------|-------|
| UX Posture | Decision Replacement | Decision Support |
| Mental Model | Single-Plane Circular | Nested Dashboards |
| Data Display | Minimal, at-a-glance | Dense charts/graphs |
| Tone | Calming, empathetic | Clinical, informative |

---

## Context System

The project uses a persistent memory system in `.context/`. **Always consult these before making changes.**

### Reference Documents
- **`.context/prd.md`**: Product requirements — north star, user persona, principles, constraints
- **`.context/design_system.md`**: Full token reference — colours, typography, spacing, radii per circadian theme
- **`.context/frontend_guidelines.md`**: Component patterns, styling approach, state management
- **`.context/app_flow.md`**: Every screen mapped with primary goal, golden path, branching options, escape routes
- **`.context/tech_stack.md`**: Languages, frameworks, deployment details
- **`.context/lessons.md`**: Past bugs and technical decisions (Problem → Root Cause → Permanent Fix)

### Operational Files
- **`.context/MEMORY.md`**: Project DNA (philosophy, stack, business logic, decisions)
- **`.context/rules.md`**: Coding rules and work protocols
- **`.context/logs/YYYY-MM-DD.md`**: Daily changelogs with technical changes and decisions
- **`.context/progress.txt`**: Project progress tracking

### When to Consult What
| Task | Read first |
|------|-----------|
| UI/UX changes | `prd.md` → `design_system.md` → `frontend_guidelines.md` |
| New feature | `prd.md` → `app_flow.md` → `frontend_guidelines.md` |
| Bug fix | `lessons.md` (check if it's a known pattern) |
| Prediction system changes | `lessons.md` §1 (5 recurring prediction bugs documented) |
| Supabase changes | `lessons.md` §3-4 (query gotchas + Edge Function gotchas) |
| Styling | `design_system.md` (never hardcode hex — use `var(--token)`) |

**Golden Rule**: If it's not documented in `.context/`, it doesn't exist.
