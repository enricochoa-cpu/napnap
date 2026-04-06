# Full App — UX/UI Audit Backlog (2026-03-31)

Sources:
- [2026-03-31 Full App Audit](../../audits/full-app/2026-03-31-full-app-ux-ui-horizontal-audit.md)
- [BACKLOG.md](../../../.context/operational/backlog/BACKLOG.md) — §1-11 (consolidated 2026-04-06)

---

## P1 — Important

---

## P2 — Nice to have

### U-32 — No retry mechanism for data fetch errors

- **Effort**: Medium
- **Impact**: Low
- **Location**: `App.tsx:619-624`
- **Problem**: Global error banner shows "Something went wrong" but provides no way to retry. Only recovery is a full page refresh.
- **Fix**: Add "Tap to retry" button in error banner that calls refresh/refetch from data hooks. May need to expose retry functions from `useSleepEntries`, `useBabyProfile`, `useGrowthLogs`.

### U-33 — Week strip day buttons narrower than standard

- **Effort**: Low
- **Impact**: Low
- **Location**: `DayNavigator.tsx:117`
- **Problem**: `min-w-[44px]` while other touch targets are 56px+. Height meets minimum (56px), width is narrower. Acceptable in 7-column grid but not ideal.
- **Fix**: Increase to `min-w-[48px]` if layout allows on 375px viewports.

### U-34 — No tablet/desktop responsive layouts

- **Effort**: High
- **Impact**: Low
- **Location**: App-wide
- **Problem**: No `lg:` breakpoint layouts. App works on larger screens but doesn't use extra space. Low priority given mobile-first target user.
- **Fix**: Add `lg:` breakpoints for wider viewports (two-column Stats, wider cards, centered containers).

### U-35 — LandingLanguagePicker uses white/ tokens

- **Effort**: Low
- **Impact**: Low
- **Location**: `LandingLanguagePicker.tsx:92-93`
- **Problem**: Stacked variant uses `bg-white/20` and `text-white/60`. Works visually (always-dark menu) but violates project rule of never using `white/` values.
- **Fix**: Replace with `bg-[var(--glass-bg)]` and `text-[var(--text-muted)]`.

### U-42 — Chips missing `aria-pressed` state (§8.1)

- **Effort**: Low
- **Impact**: Medium
- **Location**: `SleepEntrySheet`
- **Problem**: Onset, method, wake method, and wake mood chip buttons communicate selection only via CSS. No `aria-pressed` attribute. WCAG 4.1.2 violation.
- **Fix**: Add `aria-pressed={isSelected}` to all chip buttons. Consider subtle scale + spring animation on toggle.

### U-43 — Frozen "awake since" timer (§8.2)

- **Effort**: Medium
- **Impact**: Medium
- **Location**: `TodayView`
- **Problem**: "Despert des de fa Xm" stayed at "7m" across several minutes. Likely frozen by ref snapshot logic (see `frozenPredictionsRef` pattern).
- **Fix**: Ensure awake-since label uses live `now` value, not frozen ref. Must tick at least every 30s.

### U-44 — Playwright click timeouts on all buttons (§8.3)

- **Effort**: Medium
- **Impact**: Medium
- **Location**: App-wide
- **Problem**: Every Playwright `click()` times out after 5s. All clicks need `page.evaluate()` workaround. Likely framer-motion drag handlers or touch event listeners intercepting pointer events.
- **Fix**: Review `touch-action` CSS and framer-motion drag configs. Ensure buttons within draggable sheets have proper event isolation.

### U-45 — Nested `<button>` in pause card header (§9.3)

- **Effort**: Low
- **Impact**: Medium
- **Location**: `SleepEntrySheet`
- **Problem**: Pause card's collapsible header is a `<button>` containing the delete `<button>` — invalid HTML nesting. Tap targets overlap on phones.
- **Fix**: Use `<div role="button" tabIndex={0}>` for the header, or move delete button outside toggle hit area (e.g. swipe-to-reveal).

### U-46 — Pause default start = nap start (§9.4)

- **Effort**: Low
- **Impact**: Low-Medium
- **Location**: `SleepEntrySheet`
- **Problem**: New pause defaults to start=nap start time. Pauses happen mid-nap, not at the start. Extra taps at 3AM.
- **Fix**: Smart default: pause start = midpoint (if completed) or current time (if active). If existing pauses, start after the last one ends.

### U-47 — Today's incomplete data looks alarming in charts (§10.3)

- **Effort**: Medium
- **Impact**: Medium
- **Location**: `StatsView` (charts)
- **Problem**: Today shows a tiny sliver / sharp drop in bar and area charts because the day isn't over yet. Looks like "something went wrong."
- **Fix**: Mark today's bar with dashed outline + "in progress" pill badge. Or exclude today from trend calculations and show separately as "Today so far."

### U-48 — HORARI DIARI too small for mobile (§10.4)

- **Effort**: Medium
- **Impact**: Medium
- **Location**: `StatsView` (Gantt)
- **Problem**: Gantt-style daily schedule chart has small colored dots. 6-item legend. Dots too small for comfortable phone reading on 390px screens.
- **Fix**: Increase dot/bar size to min 8px (ideally 12px). Add one-line insight card above. Add time-of-day background bands. Consider tappable rows.

### U-49 — Date range picker needs native segmented control (§10.5)

- **Effort**: Medium
- **Impact**: Medium
- **Location**: `StatsView` (picker)
- **Problem**: Max 15-day range with no indication. No presets. "7d" badge looks like a label, not interactive.
- **Fix**: Replace with native-style segmented control (7d / 14d pill toggle). Auto-disable dates beyond max range. Add "Max 15 days" hint.

### U-50 — Chip bar should be sticky with scroll affordance (§10.6)

- **Effort**: Low-Medium
- **Impact**: Low-Medium
- **Location**: `StatsView` (nav)
- **Problem**: Section chips scroll with page. "Creixement" off-screen on smaller phones. No overflow hint.
- **Fix**: Make chip bar sticky below date range picker. Add fade gradient on trailing edge. Consider snap-scroll.

### U-51 — Missing "Generate report" button (§10.7)

- **Effort**: Low
- **Impact**: Low-Medium
- **Location**: `StatsView`
- **Problem**: "Generate report (last 30 days)" entry point not visible during audit. Feature exists in code but may be unreachable.
- **Fix**: Verify if removed or hidden by condition. Restore as prominent CTA card at bottom of "Resum de son" tab.

### U-52 — No save confirmation toast in baby profile (§11.1)

- **Effort**: Low
- **Impact**: Medium
- **Location**: `BabyDetailView`
- **Problem**: After "Desar canvis", button silently greys out. No toast, no animation. User must infer success from header updating. Silent save feels broken.
- **Fix**: Add native-style toast/snackbar: "Changes saved ✓" — auto-dismiss 2s. Use framer-motion spring.

### U-53 — No unsaved changes warning on back navigation (§11.2)

- **Effort**: Medium
- **Impact**: Medium
- **Location**: `BabyDetailView`
- **Problem**: Editing fields and tapping back silently discards changes. No confirmation prompt. Silent data loss breaks trust.
- **Fix**: Detect dirty form state. Show bottom sheet on back: "You have unsaved changes" with "Discard" / "Keep editing".

### U-54 — Header doesn't preview edits live (§11.3)

- **Effort**: Low
- **Impact**: Low
- **Location**: `BabyDetailView`
- **Problem**: Header shows old name and age while editing. Changes appear only after save.
- **Fix**: Bind header name to form input value for live preview.

### U-55 — Avatar picker has no preview/crop step (§11.4)

- **Effort**: Medium
- **Impact**: Low-Medium
- **Location**: `BabyAvatarPicker`
- **Problem**: File picker triggers immediately. No preview, crop circle overlay, or loading indicator. Image just "pops" into place.
- **Fix**: Add circular crop overlay after selection (like WhatsApp profile photo). Show loading spinner during upload.

### U-56 — Minutes-from-midnight → Date objects (§6.5)

- **Effort**: High
- **Impact**: Medium
- **Location**: `dateUtils` (`simulateDay`, `calculateAllNapWindows`)
- **Problem**: Simulation uses minutes-from-midnight (0-1439). Intervals near 00:00 may be treated incorrectly for night wakings or shifted schedules.
- **Fix**: Use `Date` objects throughout simulation chain. Requires tests for midnight-crossing cases.
- **Dependencies**: Best after U-40 (§6.3 unification) to avoid double refactor.

### U-57 — Overdue nap / "skipped" UX transition (§6.2)

- **Effort**: Medium
- **Impact**: Medium
- **Location**: `TodayView`
- **Problem**: After 60min overdue, system silently treats nap as skipped and anchors on original time. No user feedback or recalculation option.
- **Fix**: Show "nap very overdue" indicator + discreet "Recalculate day" button that re-anchors from now. Avoid modals (one-handed use at night).

### U-58 — Dynamic blending 70/30 by maturity (§6.4)

- **Effort**: Medium
- **Impact**: Medium
- **Location**: `dateUtils`
- **Problem**: Fixed 70% config / 30% history weight regardless of data maturity. Doesn't leverage existing `getAlgorithmStatusTier()` tiers.
- **Fix**: Dynamic weight: 90/10 learning → 70/30 calibrating → 50/50 optimized. Gradual curve, not abrupt steps. Use existing calibration thresholds.

### U-59 — Accumulated wake time factor for bedtime (§6.6)

- **Effort**: Medium
- **Impact**: Medium
- **Location**: `dateUtils`
- **Problem**: Bedtime calculation ignores total daytime wake time. Baby with many fragmented micro-naps accumulates more fatigue than algorithm predicts.
- **Fix**: Factor in accumulated wake time (sum of awake intervals since morning). If exceeding age threshold, reduce final wake window. Coordinate with U-41 (§6.1) as a single "fatigue state."
- **Dependencies**: After U-41 and U-40.

---

## P3 — Future / Infrastructure

### U-60 — Profiles table semantics — 1 user = 1 baby (§1)

- **Effort**: N/A (documentation / architectural awareness)
- **Impact**: N/A
- **Location**: `profiles` table
- **Problem**: `profiles` table stores both user-level and baby-level data in one row. One user can only have one "own" baby. Misleading schema.
- **Note**: Awareness item for §4 (multi-baby). When implementing multi-baby, split into `profiles` (user-only) + `babies` table.

### U-61 — Onboarding draft persistence across refresh (§2)

- **Effort**: Low
- **Impact**: Low
- **Location**: `OnboardingFlow`
- **Problem**: Refresh during onboarding loses all draft data. Optional improvement.
- **Fix**: Persist draft to localStorage (not sessionStorage, which is tab-scoped).

### U-62 — Supabase base schema migration (§3)

- **Effort**: Medium
- **Impact**: Medium
- **Location**: `supabase/migrations/`
- **Problem**: Only `multi_user_sharing.sql` and later migrations in repo. `profiles` and `sleep_entries` assumed to exist but not created by any migration. Project not self-contained/reproducible.
- **Fix**: Add initial migration creating `profiles`, `sleep_entries`, and their RLS policies.

### U-63 — Multi-baby support (2+ babies per account) (§4)

- **Effort**: Very High
- **Impact**: High
- **Location**: App-wide + Supabase schema
- **Problem**: UI has "Add your baby" and active-baby switch, but backend is 1 user = 1 profile row = 1 baby. No `baby_id` on `sleep_entries`.
- **Fix**: (1) New `babies` table, (2) `profiles` user-only, (3) `sleep_entries` add `baby_id` FK, (4) `baby_shares` reference `baby_id`, (5) Update all hooks and RLS. See BACKLOG §4 for detailed schema plan.

### U-64 — Invitation emails production — Resend domain (§5)

- **Effort**: Low (operational)
- **Impact**: Low
- **Location**: Resend dashboard
- **Problem**: `onboarding@resend.dev` can only deliver to account owner. Need verified custom domain for real recipients.
- **Fix**: Verify domain in Resend dashboard.

### U-65 — Weekly newborn + monthly infant age brackets (§7)

- **Effort**: High
- **Impact**: Medium-High
- **Location**: `dateUtils` (`SLEEP_DEVELOPMENT_MAP`)
- **Problem**: Newborns (0-12 weeks) change rapidly but covered by only 2 brackets. Current map has 13 brackets for 0-24 months.
- **Fix**: (1) Research weekly granularity for 0-12 weeks, (2) Expand map with weekly newborn + monthly infant brackets, (3) Validate prediction engine handles increased resolution, (4) Extend app range to 24 months.
- **Dependencies**: Best after U-40 (§6.3 unification).

---

## Summary counts

| Priority | Count | Key themes |
|----------|-------|------------|
| P0 | 0 | ~~Resolved~~ |
| P1 | 0 | ~~Resolved~~ |
| P2 | 24 | QA fixes, Stats polish, profile UX, prediction refinements |
| P3 | 6 | Infrastructure, multi-baby, algorithm granularity |
| **Total** | **30** | |

## Completed (2026-04-06)

- U-36 (P0): Pause validation stuck — fixed stale error on blur revert
- U-37 (P1): Negative awake time — clamped to `max(0, ...)`
- U-38 (P1): Reference ranges — added ReferenceArea/ReferenceLine to 4 charts
- U-39 (P1): Warm narrative — insight cards per section with i18n (en/es/ca)
- U-40 (P1): Unified prediction — `predictDaySchedule()` single source of truth
- U-41 (P1): Bedtime flexibility — two-tier debt system (moderate 20min / extreme 40min)

## Recommended execution order

**Phase 1 — Native polish** (P2 UX):
U-42 (aria-pressed), U-43 (frozen timer), U-44 (Playwright clicks), U-45 (nested button), U-46 (pause defaults)

**Phase 2 — Stats polish** (P2):
U-47 (incomplete today), U-48 (Gantt size), U-49 (date picker), U-50 (sticky chips), U-51 (report button)

**Phase 3 — Profile polish** (P2):
U-52 (save toast), U-53 (unsaved warning), U-54 (live preview), U-55 (avatar crop)

**Phase 4 — Prediction refinements** (P2):
U-56 (Date objects) → U-57 (overdue UX) → U-58 (dynamic blending) → U-59 (accumulated wake)

**Phase 5 — Infrastructure** (P3):
U-62 (base schema) → U-63 (multi-baby) → U-65 (age brackets)
