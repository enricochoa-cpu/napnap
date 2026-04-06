# Full App — UX/UI Audit Backlog (2026-03-31)

Sources:
- [2026-03-31 Full App Audit](../../audits/full-app/2026-03-31-full-app-ux-ui-horizontal-audit.md)
- [BACKLOG.md](../../../.context/operational/backlog/BACKLOG.md) — §1-11 (consolidated 2026-04-06)

---

## P1 — Important

---

## P2 — Nice to have

### U-32 — No retry button in error banner

- **Effort**: Medium
- **Impact**: Low
- **Location**: `App.tsx:644-650`
- **Problem**: Global error banner shows "Something went wrong loading your data. Pull down to refresh." — text-only, no interactive retry button. User must manually pull-to-refresh or reload the page.
- **Fix**: Add a "Tap to retry" button in the banner that calls refresh/refetch from data hooks.

### U-34 — No tablet/desktop responsive layouts

- **Effort**: High
- **Impact**: Low
- **Location**: App-wide
- **Problem**: No `lg:` breakpoint layouts. App works on larger screens but doesn't use extra space. Low priority given mobile-first target user.
- **Fix**: Add `lg:` breakpoints for wider viewports (two-column Stats, wider cards, centered containers).

### U-51 — Missing "Generate report" button (§10.7)

- **Effort**: Low
- **Impact**: Low-Medium
- **Location**: `StatsView`
- **Problem**: "Generate report (last 30 days)" entry point not visible during audit. Feature exists in code but may be unreachable.
- **Fix**: Verify if removed or hidden by condition. Restore as prominent CTA card at bottom of "Resum de son" tab.

### U-53 — Valid changes auto-save silently on back (§11.2)

- **Effort**: Low
- **Impact**: Low-Medium
- **Location**: `BabyDetailView:145-165`
- **Problem**: Partially addressed — a discard dialog exists for **invalid** changes (via `ConfirmationModal` + `showDiscardConfirm`). However, **valid** changes auto-save silently when tapping back, with no confirmation. User may not intend to save edits they were still reviewing.
- **Fix**: Show "Save changes?" confirmation on back for valid dirty state, instead of auto-saving. Or add the missing save toast (U-52) so at least the auto-save is communicated.

### U-55 — Avatar picker has no crop step (§11.4)

- **Effort**: Medium
- **Impact**: Low
- **Location**: `BabyAvatarPicker`
- **Problem**: File picker triggers immediately with no crop/preview step. Auto-compresses to 400x400 JPEG via Canvas API. **Loading spinner already exists** (`uploading` prop → spinner overlay). Only the crop UI is missing.
- **Fix**: Add circular crop overlay after file selection (like WhatsApp profile photo) so user can adjust framing before upload.

### U-56 — Minutes-from-midnight → Date objects in simulateDay (§6.5)

- **Effort**: Medium-High
- **Impact**: Medium
- **Location**: `dateUtils` (`simulateDay` internals)
- **Problem**: `simulateDay` still works entirely in minutes-from-midnight (0-1439) internally. `predictDaySchedule` already converts to Date objects at the boundary (U-40 done), so the external API is safe. The risk is limited to midnight-crossing edge cases inside `simulateDay` itself (e.g. night wakings at 23:30→00:15).
- **Fix**: Refactor `simulateDay` internals to use Date objects. Lower priority now that `predictDaySchedule` handles boundary conversion.
- **Dependencies**: U-40 done. Can be done independently.

### U-57 — Auto-overdue nap silent skip (§6.2)

- **Effort**: Medium
- **Impact**: Medium
- **Location**: `TodayView`
- **Problem**: After 60min overdue (`OVERDUE_NAP_PERSISTENCE_MINUTES`), nap silently drops from predictions. **Note:** visual feedback exists for explicitly-skipped naps (via `skippedNapIndices` — dimmed, muted label), but auto-overdue naps simply vanish with no indicator. No "Recalculate day" button.
- **Fix**: When a nap auto-expires at 60min, show a transient "nap skipped" card or indicator + discreet "Recalculate day" button. Avoid modals (one-handed use at night).

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

## Removed

### ~~U-35 — LandingLanguagePicker uses white/ tokens~~

- **Status**: Fixed — all `white/` values replaced with `var(--glass-bg)`, `var(--text-primary)`, `var(--text-secondary)` tokens.

### ~~U-44 — Playwright click timeouts on all buttons (§8.3)~~

- **Status**: Removed — not an app code bug.
- **Root cause**: Playwright MCP's synthetic pointer simulation doesn't complete through framer-motion's drag listeners + `touch-action: none` CSS. App buttons use standard `onClick`, drag is scoped to `motion.div` containers, no global event hijacking. Real device taps work fine. `page.evaluate()` workaround bypasses the pointer layer entirely.
- **Action**: Test tooling config issue. Address in Playwright test setup if E2E automation is needed.

---

## Summary counts

| Priority | Count | Key themes |
|----------|-------|------------|
| P0 | 0 | ~~Resolved~~ |
| P1 | 0 | ~~Resolved~~ |
| P2 | 10 | Prediction refinements, low-priority polish |
| P3 | 6 | Infrastructure, multi-baby, algorithm granularity |
| **Total** | **16** | |

## Completed (2026-04-06)

- U-36 (P0): Pause validation stuck — fixed stale error on blur revert
- U-37 (P1): Negative awake time — clamped to `max(0, ...)`
- U-38 (P1): Reference ranges — added ReferenceArea/ReferenceLine to 4 charts
- U-39 (P1): Warm narrative — insight cards per section with i18n (en/es/ca)
- U-40 (P1): Unified prediction — `predictDaySchedule()` single source of truth
- U-41 (P1): Bedtime flexibility — two-tier debt system (moderate 20min / extreme 40min)
- U-43 (P1): Frozen awake timer — compute locally in TodayView using live 60s tick instead of stale hook prop
- U-50 (P2): Sticky chip bar — sticky positioning with bg gradient + trailing fade overflow hint
- U-42 (P2): Chips aria-pressed — added `aria-pressed={selected}` to TagCard component
- U-45 (P2): Nested button — replaced outer `<button>` with `<div role="button">` + keyboard handler + aria-expanded
- U-46 (P2): First pause default — midpoint of nap instead of nap start
- U-33 (P2): Day button width — min-w-[44px] → min-w-[48px] for better touch targets
- U-54 (P2): Live header preview — bound to formData.name instead of saved baby.name
- U-47 (P2): Today's bar dashed — custom TodayAwareBar shape with dashed outline + reduced opacity for incomplete day
- U-48 (P2): Gantt dot size — wake/bed dots 7px→12px, nap bars 7px→10px, row height 28px→32px, legend updated
- U-49 (P2): Segmented date control — 7d/14d pill toggle replacing static badge, calendar button kept for custom range
- U-52 (P2): Save toast — framer-motion spring toast with checkmark, auto-dismiss 2s, i18n en/es/ca

## Recommended execution order

**Phase 1 — Quick wins** (P2):
U-51 (report button)

**Phase 2 — Prediction refinements** (P2):
U-57 (overdue UX) → U-58 (dynamic blending) → U-59 (accumulated wake) → U-56 (Date internals)

### Phase 2 — Detailed implementation plan

---

#### U-57 — Auto-overdue nap visual indicator + recalculate

**Goal**: When a nap auto-expires (>60min overdue), show a muted "skipped" card instead of silently removing it. Add a "Recalculate" action to re-anchor from now.

**Current state**: `predictedNapsWithMetadata` (TodayView.tsx:281-294) drops overdue naps by simply not adding them to `predictions[]`. The `skippedNapIndices` system exists in App.tsx for *user*-skipped naps but is never populated by auto-expiry.

**Implementation steps**:

1. **TodayView.tsx — track auto-skipped naps**: In the overdue loop (line 289), when `overdueMinutes > OVERDUE_NAP_PERSISTENCE_MINUTES`, instead of silently dropping, push to a new `autoSkippedNaps` array with the nap data + original predicted time. Return it alongside `predictions`.

2. **TodayView.tsx — render auto-skipped cards**: In the timeline render section (around line 743), render auto-skipped naps as muted cards (reuse the existing skipped nap visual: `opacity-50`, dashed border, muted bg). Show the original predicted time with a label like "Skipped" (reuse `t('predictedNap.skippedNap')`).

3. **TodayView.tsx — "Recalculate" button**: Below the auto-skipped card, add a small text button "Recalculate day" that calls a new `onRecalculate` callback. This callback (in App.tsx) simply adds the skipped nap index to `skippedNapIndices`, which forces `predictDaySchedule` to re-run with the nap excluded from the simulation input.

**Files**: `TodayView.tsx` (overdue logic + render), no i18n needed (reuses existing keys).
**Risk**: Low — additive change, no existing behavior altered for non-overdue naps.

---

#### U-58 — Dynamic blending weights by algorithm maturity

**Goal**: Replace fixed 70/30 config/history ratio with maturity-adaptive weights: 90/10 (learning) → 70/30 (calibrating) → 50/50 (optimized).

**Current state**: 0.7/0.3 hardcoded in 3 places. `getAlgorithmStatusTier(totalEntries)` exists (line 631) and returns `'learning'|'calibrating'|'optimized'` based on thresholds (5/15), but is never used for blending.

**Implementation steps**:

1. **dateUtils.ts — add `getBlendingWeights()` helper** (new function, ~10 lines):
   ```
   getBlendingWeights(totalEntries: number): { config: number; learned: number }
   ```
   - `learning` (0-5 entries): `{ config: 0.90, learned: 0.10 }`
   - `calibrating` (6-15 entries): `{ config: 0.70, learned: 0.30 }`
   - `optimized` (16+ entries): `{ config: 0.50, learned: 0.50 }`

2. **dateUtils.ts — update `predictDaySchedule()`** (line 1582): Replace `0.7`/`0.3` with `weights.config`/`weights.learned`. `totalEntriesCount` is already available in params.

3. **dateUtils.ts — update `calculateSuggestedNapTimeWithMetadata()`** (line 898): Same replacement. `totalEntriesCount` is already a parameter.

4. **dateUtils.ts — update `getLearnedNapDurationMinutes()`** (line 1114): This function doesn't have `totalEntries` as a param. **Add it as an optional param** with default that preserves current 70/30 behaviour. Callers in `predictDaySchedule` and TodayView already have `entries.length` available.

**Files**: `dateUtils.ts` only. Update 3 blending call sites + 1 new helper.
**Risk**: Low — gradual weight change. Learning users barely notice (90/10 ≈ current config-dominated). Optimized users get better personalization.

---

#### U-59 — Accumulated wake time factor for bedtime

**Goal**: If baby has been awake for significantly more total minutes than expected for their age, reduce the final wake window (earlier bedtime). Coordinates with the existing sleep-debt mechanism (U-41) as a unified "fatigue state."

**Current state**: `calculateDynamicBedtime` only considers *sleep deficit* (how much less the baby slept vs target). It doesn't consider *total awake time* (sum of all awake intervals since morning). A baby with many fragmented micro-naps can accumulate excessive fatigue even when total sleep minutes look OK.

**Implementation steps**:

1. **dateUtils.ts — compute expected vs actual wake time**: Add an optional `totalAwakeMinutes` param to `calculateDynamicBedtime`. Calculate expected wake time per age:
   ```
   expectedWakeMinutes = (minutesSinceMorningWake) - targetDaytimeSleep
   ```
   If `totalAwakeMinutes` exceeds expected by a threshold (e.g. 30+ min over), apply an additional bedtime shift (capped, non-linear, same pattern as sleep debt).

2. **dateUtils.ts — unified fatigue state**: Combine sleep deficit + wake surplus into a single `fatigueScore`. Apply the larger of the two shifts (don't double-stack):
   ```
   sleepDebtShift = existing logic (U-41)
   wakeExcessShift = min(cap, excess / 3)
   finalShift = max(sleepDebtShift, wakeExcessShift)
   ```

3. **dateUtils.ts — update `predictDaySchedule()`**: Compute `totalAwakeMinutes` from the nap chain (it already tracks `lastEndTime` and `accumulatedSleepMinutes`, so awake time = elapsed - sleep). Pass to `calculateDynamicBedtime`.

**Files**: `dateUtils.ts` only. Backward-compatible — new param is optional with default 0 (no change).
**Risk**: Medium — needs careful capping to avoid excessively early bedtimes. Floor at `config.wakeWindows.first` already exists from U-41.

---

#### U-56 — Minutes-from-midnight → Date objects in simulateDay

**Goal**: Eliminate the theoretical midnight-crossing bug in `simulateDay` by using Date objects internally instead of minute integers.

**Current state**: `simulateDay` works in minutes-from-midnight (0-1440). No explicit bounds checking. In practice, bedtime maxes at ~1425 min (23:45) which is safe. The risk is theoretical (shifted-schedule babies with very late mornings).

**Implementation steps**:

1. **dateUtils.ts — refactor `simulateDay` signature**: Change from `morningWakeMinutes: number` to `morningWakeTime: Date`. Internally use Date arithmetic instead of minute addition.

2. **dateUtils.ts — refactor `ProjectedNap`**: Replace `startMinutes`/`endMinutes` with `startTime: Date`/`endTime: Date`. Keep `durationMinutes` and `wakeWindowBefore` as integers.

3. **dateUtils.ts — update `DaySimulation`**: Replace `wakeTimeMinutes`/`bedtimeMinutes` with Date objects.

4. **dateUtils.ts — update callers**: `calculateAllNapWindows` (still used by StatsView for schedule data) and `predictDaySchedule` both call `simulateDay`. Update their conversion logic.

5. **StatsView.tsx — update scheduleData**: The Gantt chart consumes `simulateDay` via `calculateAllNapWindows`. Update to extract hours/minutes from Date objects instead of minute integers.

**Files**: `dateUtils.ts` (core), `StatsView.tsx` (Gantt consumer), potentially `TodayView.tsx` if any direct `simulateDay` references remain.
**Risk**: Medium-High — largest refactor. Many internal calculations to convert. Recommend doing last so all other prediction work is stable first. Consider adding a few unit tests for midnight edge cases.

---

### Execution order rationale

1. **U-57 first**: Pure UI addition, no algorithm changes. Quick confidence-building win.
2. **U-58 second**: Self-contained algorithm change (3 call sites + 1 helper). No UI changes.
3. **U-59 third**: Extends `calculateDynamicBedtime` with optional param. Depends on U-41 (done) and benefits from U-58's dynamic weights being in place.
4. **U-56 last**: Largest refactor, touches interfaces consumed by multiple callers. All other prediction logic should be stable first.

**Phase 3 — Low priority polish** (P2):
U-32 (retry banner), U-34 (tablet), U-53 (auto-save confirmation), U-55 (avatar crop)

**Phase 5 — Infrastructure** (P3):
U-62 (base schema) → U-63 (multi-baby) → U-65 (age brackets)
