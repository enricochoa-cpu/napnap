# Full App — UX/UI Audit Backlog (2026-03-31)

Sources:
- [2026-03-31 Full App Audit](../../audits/full-app/2026-03-31-full-app-ux-ui-horizontal-audit.md)
- [BACKLOG.md](../../../.context/operational/backlog/BACKLOG.md) — §1-11 (consolidated 2026-04-06)
- [2026-04-10 Profile Flows Audit](../../../ux-audit-profile-flows.md) — Playwright MCP testing of Profile, Settings, My Babies, Measures, Sharing

---

## P2 — Nice to have

### U-87 — No way to add a second owned baby

- **Effort**: ~~Low~~ **High** (blocked on schema migration — see Blocker)
- **Impact**: Medium
- **Status**: **Blocked** — re-classified as a child of U-63 on 2026-04-27
- **Location**: `MyBabiesView`
- **Source**: 2026-04-10 Profile flows audit (Playwright MCP)
- **Problem**: When the user already owns a baby, the "Add your baby" ghost card disappears from the My Babies list. There is no "+" button or other affordance to add another baby. Parents with twins or multiple children are blocked.
- **Fix**: Always show an "Add baby" option regardless of whether the user already owns a baby. Either keep the ghost card always visible, or add a "+" button in the header (matching the Measures pattern).
- **Blocker — backend is NOT ready** (verified 2026-04-27): The schema is structurally 1 user = 1 baby.
  - `profiles` is keyed by `auth.users.id` with baby fields as columns (`baby_name`, `baby_date_of_birth`, `baby_gender`, `baby_avatar_url`); there is no separate `babies` table.
  - All `baby_id` FKs point at `profiles.id` (i.e. the user id) — see `baby_measurement_logs.baby_id REFERENCES profiles(id)`. Same for `baby_shares.baby_owner_id`.
  - `sleep_entries` has only `user_id`, no baby reference at all.
  - `useBabyProfile.createProfile` upserts on `id: user.id`, so calling it again would silently overwrite the first profile and orphan the existing sleep entries (still attached to the same `user_id` but now describing a different baby).
  - The audit's "UI-only — the Add baby sheet already works" assessment is incorrect.
- **Dependencies**: Blocked on **U-62** (Supabase base schema migration — new `babies` table with own PK, add `baby_id` to `sleep_entries` and `baby_shares`, RLS rewrite) and **U-63** (multi-baby frontend refactor — decouple `baby.id` from `user.id` across `useBabyProfile`, sleep hooks, storage keys, active-baby selection). U-87 cannot ship before that work lands.

### U-75 — Real-time password strength feedback (S3)

- **Effort**: Medium
- **Impact**: Medium
- **Location**: `SignUpForm` — password field
- **Source**: 2026-04-10 Registration flow audit (Playwright)
- **Problem**: "At least 6 characters" is a static hint below the password field. No real-time visual feedback (colour change, strength bar, checkmark). A tired parent at 3AM may submit, get rejected, and feel frustrated.
- **Fix**: Add inline validation: red/green colour on the hint text as the user types (e.g. "At least 6 characters" turns green with a checkmark when met). Optionally show password match indicator on Confirm Password. Keep it simple — no complex strength meters.

### U-76 — Improve Terms & Privacy Policy visibility (S4)

- **Effort**: Low
- **Impact**: Low-Medium
- **Location**: `SignUpForm` — T&C checkbox area
- **Source**: 2026-04-10 Registration flow audit (Playwright)
- **Problem**: The checkbox is small and below the fold on smaller screens. The Terms/Privacy links are `<button>` elements — unclear if clicking them navigates away and loses form data.
- **Fix**: (1) Ensure the checkbox area is always visible without scrolling on common mobile viewports. (2) Open Terms/Privacy in a modal or new tab (not in-page navigation) so form state is preserved. (3) Consider slightly larger checkbox hit area.

### U-81 — Merge parent name + relationship into one onboarding step (U5)

- **Effort**: Medium
- **Impact**: Medium
- **Location**: `OnboardingFlow` — Steps 4 and 5
- **Source**: 2026-04-10 Registration flow audit (Playwright)
- **Problem**: 6 steps before the user sees any value feels long. Steps 4 (parent name) and 5 (relationship) are both about the parent and could live on one screen.
- **Fix**: Combine into a single step: "Tell us about you" with name field + Mum/Dad/Other selector. Reduces flow from 6 to 5 steps. Do NOT remove Step 1 (welcome).

### U-79 — Add illustrations to onboarding + auth screens (B1 + B5)

- **Effort**: High
- **Impact**: High
- **Location**: `EntryChoice`, `OnboardingFlow` (Steps 1-6), `LoginForm`, `ForgotPasswordForm`
- **Source**: 2026-04-10 Registration flow audit (Playwright)
- **Problem**: Onboarding steps 2-5 are ~70% whitespace. The entry choice screen is emotionally flat. The calming brand personality from the landing page disappears across the entire registration flow. Napper uses soft illustrations on each onboarding step to maintain warmth.
- **Fix**: Add a unique soft illustration per screen. Style: muted pastels (sage, periwinkle, parchment palette), rounded shapes, sleeping/calm motifs. Placed between heading and input to fill the dead space.
- **Status**: Blocked — illustrations need to be created first. Exploring Nano Banana or similar tool.

- **Illustration brief per screen:**

  | Screen | Illustration idea | Mood |
  |--------|-------------------|------|
  | **Entry Choice** | A small sleeping baby curled on a crescent moon, soft stars around. Conveys "we're the calm place for nighttime." | Peaceful, inviting |
  | **Step 1 — Welcome** | Already has icon cards; could add a soft scene of a parent holding a baby looking at the night sky together. Wraps the value props in warmth. | Reassuring, togetherness |
  | **Step 2 — Baby name** | A baby onesie or crib with a blank name tag, soft bunting flags above. "This is your baby's space." | Playful, personal |
  | **Step 3 — Baby DOB** | A small birthday cake with one candle, or a stork carrying a bundle with a tiny calendar. Celebration of arrival. | Celebratory, gentle |
  | **Step 4 — Parent name** (or merged Step 4+5) | Two hands cradling a small heart or a parent silhouette with a baby. "You matter too." | Warm, inclusive |
  | **Step 5 — Relationship** | A family constellation — simple abstract figures (mum/dad/other) around a crib. Non-gendered, inclusive shapes. | Inclusive, connected |
  | **Step 6 — Create Account** | A small door slightly ajar with warm light spilling out, or a key with a sleeping-baby keychain. "Almost there, come in." | Safe, welcoming |
  | **Login** | A house with a lit window at night. "Welcome home." Matches the "Welcome back" heading. | Familiar, cosy |
  | **Forgot Password** | Already has a key icon; could enhance with a soft scene of someone finding a key under a doormat or pillow. | Reassuring, low-stress |

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

### U-60 — Profiles table semantics — 1 user = 1 baby (§1)

- **Effort**: N/A (documentation / architectural awareness)
- **Impact**: N/A
- **Location**: `profiles` table
- **Problem**: `profiles` table stores both user-level and baby-level data in one row. One user can only have one "own" baby. Misleading schema.
- **Note**: Awareness item for §4 (multi-baby). When implementing multi-baby, split into `profiles` (user-only) + `babies` table.

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
- **Children**: U-87 (add second owned baby UI) is blocked on this work — see U-87 for the schema audit.

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
| P2 | 8 | UX polish, overdue nap UX, onboarding warmth, step merge |
| P3 | 6 | Infrastructure, multi-baby, algorithm granularity, rescue nap gap |
| **Total** | **17** | |

## Completed (2026-04-27)

- U-53 (P2): Save-on-back confirmation — replaced silent auto-save in `BabyDetailView` with a 3-action modal (Save / Discard / Cancel); overlay tap stays on screen so accidental dismiss can't drop edits; i18n en/es/ca

## Completed (2026-04-10)

- U-89 (P1): Active bedtime save — saving an active entry with pauses no longer terminates it; early return closes sheet without overwriting endTime
- U-90 (P1): Pause duration edit — changed from uncontrolled defaultValue+onBlur to controlled value+onChange with local drafts; flush on blur, collapse, and save
- U-91 (P1): Pause header stale — collapsed card header now reads from draft state, updates live as user edits duration
- U-92 (P2): Net suffix spacing — added literal space before "(net)" in duration label
- SleepEntrySheet UX redesign (Napper-style): compact sheet with ⋯ expand toggle, drag handle tap/drag dual gesture, subtle backdrop, white section labels, glass-bordered notes, rounded-lg (8px) card corners, iOS picker fix (freeze now tick)
- U-88 (P2): View-only indicator — added "View only" badge with eye icon on BabyDetailView and MeasuresView for shared babies (en/es/ca)
- U-73 (P2): Personalise DOB step — "When was Luna born?" using baby name from step 2; falls back to generic if empty
- U-74 (P2): Relationship subtitle — added "This helps us personalise your experience" subtitle to step 5 (en/es/ca)
- U-77 (P2): Carry baby name to signup — subtitle now says "Start tracking Luna's sleep" instead of generic; passed via babyName prop
- U-83 (P1): Duplicate sign out — removed sign-out card + confirmation modal from AccountSettingsView; sign out lives only in ProfileMenu
- U-84 (P2): Greeting fallback — show just "Good evening" (no trailing "there") when name not set; subtitle nudges to Settings
- U-85 (P2): Tap-photo text — removed redundant "Tap photo to change" from BabyDetailView and BabyEditSheet; camera icon is sufficient
- U-86 (P2): DOB format — shared baby detail now shows formatted dd/MM/yyyy via date-fns instead of raw ISO string
- U-70 (P1): Passive consent — replaced T&C checkbox with "By creating an account, you agree to..." text; Google OAuth always enabled
- U-71 (P1): Signup routing — "Sign up" from login now routes through full onboarding flow
- U-72 (P2): Step 4 subtitle — added "So we know how to greet you in the app."

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

**Phase 0 — Critical fixes** (P1):
U-82 (nav bar scroll clipping — Settings + Baby detail)

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
