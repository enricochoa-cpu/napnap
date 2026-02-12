# Remaining Audit Phases for Cursor

> Phase 1 (Broken Flows) and Phase 2 (Accessibility) are DONE.
> Phases 3, 4, and 5 remain. Copy-paste each phase into Cursor's chat as a prompt.

---

## Phase 3: Light Mode Polish

*Things that look wrong in morning/afternoon themes*

### Issues to fix

1. **`border-white/10` and `hover:bg-white/5`** in History view dropdown (`src/App.tsx`, around the Add Entry dropdown menu) — invisible on white backgrounds. Replace with `border-[var(--glass-border)]` and `hover:bg-[var(--text-muted)]/10`

2. **`text-white` hardcoded** on bedtime icon in `src/components/QuickActionSheet.tsx` (the Moon/Bedtime button icon) — white on light bg. Replace with `text-[var(--text-on-accent)]` or `text-[var(--bg-deep)]`

3. **Save button mixes `'white'` with `var(--bg-deep)`** in `src/components/SleepEntrySheet.tsx` (the save button style) — night type uses hardcoded `white`. Replace with `var(--text-on-accent)` or compute from theme

4. **Timeline river line uses `white/` opacity** — `bg-white/[0.08]` in CSS `.timeline-river::before` (`src/index.css` around line 848). Replace with `bg-[var(--text-muted)]/10` or a CSS variable

5. **Ghost card dashed borders** use hardcoded `rgba(255, 255, 255, ...)` in CSS (`src/index.css` around lines 432-445). Replace with CSS variable-based colours

6. **Nav bar background** hardcodes `rgba(18, 20, 28, 0.85)` instead of `var(--glass-nav-bg)` (`src/index.css` around line 654). Use the CSS variable

### Verification
1. `npm run build` — no type errors
2. Switch system time to morning (or temporarily set theme to morning) and verify all the above elements are visible and properly themed
3. Check afternoon theme too
4. Night theme should still look correct (regression check)

### Key rule
Never use `white/` or `rgba(255,255,255,...)` outside of a solid accent-coloured container. Always use CSS variables (`var(--glass-bg)`, `var(--glass-border)`, `var(--text-muted)`, etc.). See `.context/design_system.md` for the full token reference.

---

## Phase 4: UX Improvements

*Not broken, but suboptimal user experience*

### Issues to fix

1. **No loading states on save** — Save operations in `SleepEntrySheet`, `WakeUpSheet`, `BabyDetailView` have no spinner/disabled feedback. User can double-tap and create duplicates.
   - Add `isSaving` state, disable button + show spinner while async operation runs
   - Prevent double-submission

2. **Date pickers in StatsView have no visual affordance** — Hidden behind text with `opacity-0` (`src/components/StatsView.tsx`). Users don't know they can tap to change dates.
   - Add a subtle calendar icon or underline/border to indicate tappability
   - Or show the date in a pill/chip with a chevron

3. **No drag-to-dismiss visual hint** — All bottom sheets (SleepEntrySheet, WakeUpSheet, BabyEditSheet, QuickActionSheet, CalendarModal) have handle bars but no indication they're swipeable.
   - Consider a subtle bounce animation on open, or a "swipe down to close" text that fades out after 2 seconds on first use

4. **DailySummary cloud icon uses `--night-color`** — Should use `--nap-color` for nap-related items (`src/components/DailySummary.tsx` if it exists)

5. **No timeout on avatar uploads** — If network hangs, the loading spinner in `BabyAvatarPicker` stays forever (`src/components/Profile/BabyAvatarPicker.tsx`).
   - Add a timeout (e.g. 30 seconds) and show an error state
   - Allow retry

### Verification
1. `npm run build` — no type errors
2. Test save operations: tap save rapidly — should only create one entry
3. Check StatsView date pickers are discoverable
4. Upload an avatar on slow network — verify timeout works

---

## Phase 5: Nice-to-Have Refinements

*Polish and edge cases — lowest priority*

1. **Recharts charts have no accessibility** — No labels for screen readers on chart data in `src/components/StatsView.tsx`. Add `aria-label` to chart containers describing what the chart shows.

2. **Gantt chart edge case** — `endMin` check uses `!= null` which could miss `0` (midnight) in `src/components/StatsView.tsx`. Use explicit `endMin !== null && endMin !== undefined` or similar.

3. **Week strip has no visual scroll indicator** — `touch-none` on the DayNavigator week strip suppresses native scroll feedback. Consider adding a subtle edge fade or dots indicating more weeks exist.

4. **Form validation feedback is subtle** — Disabled buttons use `opacity-40` with no tooltip/message explaining why they're disabled. Consider adding a helper text below the button (e.g. "Name and birthday are required").

### Verification
1. `npm run build` — no type errors
2. Test with screen reader (VoiceOver on Mac) — charts should announce their purpose
3. Edge test: create entry ending at exactly midnight (00:00) — Gantt should render correctly

---

## Project context files to reference

Before making changes, read these files for coding conventions:
- `CLAUDE.md` — Project overview, architecture, design system
- `.context/design_system.md` — CSS variable tokens (never hardcode hex colours)
- `.context/frontend_guidelines.md` — Component patterns
- `.context/lessons.md` — Known bugs and their fixes
- `.context/prd.md` — Product principles

## Tech stack
- React 18 + TypeScript + Vite
- Tailwind CSS v4
- Framer Motion for animations
- Recharts for charts
- Supabase (auth + DB + storage)
- date-fns for date operations
