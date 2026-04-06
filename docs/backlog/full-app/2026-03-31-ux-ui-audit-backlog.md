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

### U-57 — Auto-overdue nap silent skip (§6.2)

- **Effort**: Medium
- **Impact**: Medium
- **Location**: `TodayView`
- **Problem**: After 60min overdue (`OVERDUE_NAP_PERSISTENCE_MINUTES`), nap silently drops from predictions. **Note:** visual feedback exists for explicitly-skipped naps (via `skippedNapIndices` — dimmed, muted label), but auto-overdue naps simply vanish with no indicator. No "Recalculate day" button.
- **Fix**: When a nap auto-expires at 60min, show a transient "nap skipped" card or indicator + discreet "Recalculate day" button. Avoid modals (one-handed use at night).
- **Note**: Product decision — not a bug or algorithm improvement. Independent of other prediction tasks.

---

## P3 — Future / Infrastructure

### U-69 — Blended nap times can exceed max wake window (BUG-2)

- **Effort**: Medium
- **Impact**: Low
- **Location**: `dateUtils.ts` — `predictDaySchedule` / `simulateDay` interaction
- **Source**: [2026-04-06 Algorithm Arithmetic Audit](../../audits/prediction-engine/2026-04-06-algorithm-arithmetic-audit.md) — BUG-2
- **Problem**: `simulateDay` uses config-only wake windows and can trigger rescue naps when gaps exceed max. But `predictDaySchedule` blends with historical data and can produce different nap end times, creating wake gaps that exceed `config.wakeWindows.max` (e.g., 260min gap for a 6mo baby with max=180min). Only triggers with extreme short naps + high optimization + high blending divergence. Earliest bedtime floor prevents absurd outputs.
- **Fix**: Post-hoc check after computing all blended nap times + bedtime: if any wake gap exceeds `config.wakeWindows.max`, insert a rescue micro-nap or flag the gap.

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
| P2 | 6 | UX polish, overdue nap UX |
| P3 | 7 | Infrastructure, multi-baby, algorithm granularity, rescue nap gap |
| **Total** | **13** | |

## Completed (2026-04-06)

- U-36 (P0): Pause validation stuck — fixed stale error on blur revert
- U-37 (P1): Negative awake time — clamped to `max(0, ...)`
- U-38 (P1): Reference ranges — added ReferenceArea/ReferenceLine to 4 charts
- U-39 (P1): Warm narrative — insight cards per section with i18n (en/es/ca)
- U-40 (P1): Unified prediction — `predictDaySchedule()` single source of truth
- U-41 (P1): Bedtime flexibility — two-tier debt system (moderate 20min / extreme 40min)
- U-43 (P1): Frozen awake timer — compute locally in TodayView using live 60s tick instead of stale hook prop
- U-66 (P1): Toddler bedtime floor — age-aware safety floor for 1-nap configs (BUG-3)
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
- U-58 (P2): Dynamic blending — getBlendingWeights() helper; 90/10 learning → 70/30 calibrating → 50/50 optimized at all 3 blending sites
- U-59 (P2): Accumulated wake time — unified fatigue state (sleep debt + wake excess); takes larger shift, capped at 25min for wake excess
- U-56 (P2): Midnight safety — minutesToDate() helper, modular arithmetic in calculateAllNapWindows, documented >1440 support in interfaces
- U-67 (P2): Nap duration cap — cap learned duration when simulation says micro/catnap (BUG-5)
- U-68 (P2): Latest bedtime ceiling — soft cap at config.bedtime.latest + 60min (BUG-4)

## Recommended execution order

**Phase 1 — Quick wins** (P2):
U-51 (report button)

**Phase 2 — Product decisions** (P2):
U-57 (overdue nap UX — needs product review)

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

**Phase 3 — Low priority polish** (P2):
U-32 (retry banner), U-34 (tablet), U-53 (auto-save confirmation), U-55 (avatar crop)

**Phase 5 — Infrastructure** (P3):
U-62 (base schema) → U-63 (multi-baby) → U-65 (age brackets)
