# Lessons Learned

Format: **Problem** → **Root Cause** → **Permanent Fix**

---

## 1. Prediction System Bugs (TodayView)

### 1.1 Predicted Nap Overlapping Active Nap
**Date:** 2026-02-02

- **Problem:** With a nap in progress at 13:30, the app showed "Predicted Nap 15:05" — a duplicate nap that overlapped the active one.
- **Root Cause:** `todayNaps` only counted completed naps (`endTime !== null`). The algorithm thought there was only 1 nap done and predicted a 2nd, unaware one was already in progress.
- **Permanent Fix:** Count active naps in the effective count: `effectiveNapCount = todayNaps.length + (hasActiveNap ? 1 : 0)`. Use expected wake time as anchor for future predictions and filter out any prediction that falls before the expected wake.

### 1.2 Bedtime Showing Before Predicted Naps
**Date:** 2026-02-03

- **Problem:** After logging a nap at 11:45, app showed predicted naps at 14:38 and 18:08 (correct), but bedtime at 15:30 (should be after 18:08).
- **Root Cause:** Bedtime anchor priority was wrong — active nap took priority over predicted naps, so bedtime was anchored on the active nap's expected wake time instead of the last predicted nap's end.
- **Permanent Fix:** Reorder priority: (1) predicted naps → use last predicted nap end, (2) active nap → use expected wake, (3) completed naps → use last nap end, (4) fallback → config bedtime window.

### 1.3 Bedtime Ghost Card During Active Night Sleep
**Date:** 2026-02-03

- **Problem:** After logging bedtime at 20:45, a ghost "Bedtime 21:18" card appeared even though the baby was already sleeping.
- **Root Cause:** Render condition only checked `isBefore(now, expectedBedtime)` but not whether a night sleep was already active.
- **Permanent Fix:** Add guard: `!(activeSleep && activeSleep.type === 'night')` to the bedtime card render condition.

### 1.4 Overdue Predictions Causing Impossibly Early Bedtime
**Date:** 2026-02-04

- **Problem:** At 15:22, bedtime showed 15:54 instead of ~18:30. The 3rd nap (predicted at ~14:54) was overdue.
- **Root Cause:** Past predictions were silently filtered out. With no predictions remaining, bedtime fell back to: last completed nap end (12:54) + final wake window (3h) = 15:54.
- **Permanent Fix:** Never silently discard overdue predictions. If a predicted nap is in the past and the baby isn't sleeping, show it as "now" (overdue). This keeps bedtime anchored correctly and alerts the parent that the nap is needed immediately.

### 1.5 Bedtime Calculation Ignoring Predicted Naps After Active Nap
**Date:** 2026-01-28

- **Problem:** Bedtime calculation didn't consider predicted naps that come after the currently active nap.
- **Root Cause:** Algorithm only looked at completed naps and the active nap, but ignored any remaining predicted naps when computing bedtime.
- **Permanent Fix:** Always include predicted naps in the bedtime anchor calculation, even when a nap is in progress.

> **Pattern:** TodayView prediction bugs are the #1 recurring issue. They always involve **priority ordering** (which data source wins) or **filtering logic** (removing data that should be kept). Always check: does the bedtime anchor account for ALL future events?

---

## 2. State Synchronisation Bugs

### 2.1 Editing Night Sleep Moves Bedtime to Wrong Day
**Date:** 2026-02-03

- **Problem:** Tapping a yesterday's night sleep card to add a wake-up time moved the bedtime from yesterday to today, triggering the "Missing Bedtime" modal.
- **Root Cause:** `handleEdit()` in `App.tsx` opened `SleepEntrySheet` without syncing `selectedDate` to the entry's date. The sheet used today's `selectedDate` to recalculate times, shifting the entry forward by one day.
- **Permanent Fix:** `handleEdit()` must always set `setSelectedDate(entry.date)` before opening the sheet. Any time a sheet opens for an existing entry, the date context must match the entry.

### 2.2 Scroll Position Persists Across Profile Views
**Date:** 2026-02-02

- **Problem:** Navigating from ProfileMenu to AccountSettings kept the scroll position from the previous view.
- **Root Cause:** No scroll reset on view change within ProfileSection.
- **Permanent Fix:** Add `useEffect(() => { window.scrollTo(0, 0); }, [currentView])` in ProfileSection.

---

## 3. Supabase Query Bugs

### 3.1 Shared Profile Avatar Not Visible
**Date:** 2026-02-05

- **Problem:** Shared users couldn't see the baby's profile picture.
- **Root Cause:** `baby_avatar_url` was added to the `profiles` table but not included in the Supabase `select()` query for shared babies in `useBabyProfile.ts`.
- **Permanent Fix:** When adding new columns to `profiles`, always update BOTH the owner query AND the shared babies join query. The shared query explicitly lists fields — it won't pick up new columns automatically.

### 3.2 Invited Users Can't Save Profile Changes
**Date:** 2026-02-05

- **Problem:** Users who were invited (no baby of their own) couldn't save name/role changes — UI showed changes but reverted on refresh.
- **Root Cause:** `updateProfile()` used `.update()` which only affects existing rows. Invited users had no profile row yet.
- **Permanent Fix:** Use `.upsert()` instead of `.update()` when the profile row might not exist.

### 3.3 Re-invite Fails with Unique Constraint
**Date:** 2026-02-06

- **Problem:** Re-inviting a previously revoked user failed silently — the invitation wasn't recreated.
- **Root Cause:** INSERT hit unique constraint on `baby_shares` table. Supabase returns HTTP 409, not just PostgreSQL code 23505.
- **Permanent Fix:** Check for both: `error.code === '23505' || error.code === '409' || error.message?.includes('duplicate')`. On conflict, UPDATE the existing row back to `pending` status and refresh `invited_at` timestamp.

---

## 4. Supabase Edge Function Gotchas

### 4.1 Manual JWT Verification Causes 401
**Date:** 2026-02-06

- **Problem:** Edge Function returned 401 on every request despite valid auth tokens.
- **Root Cause:** Added manual `getUser()` check inside the function. Supabase already verifies JWT at the infrastructure level — the manual check was redundant and failed.
- **Permanent Fix:** Never add manual JWT verification in Edge Functions. Supabase handles it. If you need to bypass verification entirely (e.g., for public endpoints), use `--no-verify-jwt` flag during deploy.

### 4.2 Deploy Uses Local Files, Not Git Remote
**Date:** 2026-02-06

- **Problem:** Deployed Edge Function still had old code even after pushing fixes to git.
- **Root Cause:** `npx supabase functions deploy` reads from the local filesystem, not from the git remote.
- **Permanent Fix:** Always `git pull` before running `npx supabase functions deploy`.

### 4.3 CORS Blocked on Error Responses
**Date:** 2026-02-06

- **Problem:** Frontend got CORS errors on Edge Function calls that returned errors (non-200).
- **Root Cause:** CORS headers were only added to the OPTIONS preflight response, not to error/success responses.
- **Permanent Fix:** Create a shared `corsHeaders` object and a `jsonResponse()` helper that always includes CORS headers on every response (success, error, crash).

---

## 5. CSS / Visual Bugs

### 5.1 MenuCard Black Borders
**Date:** 2026-02-02

- **Problem:** Profile menu cards showed ugly black borders.
- **Root Cause:** Used `border-[var(--border-subtle)]` but the CSS variable `--border-subtle` didn't exist — CSS defaulted to black.
- **Permanent Fix:** Never reference CSS variables without checking they exist in the theme. Replaced with `shadow-sm hover:shadow-md` (no border needed).

### 5.2 Afternoon Clouds Too Visible
**Date:** 2026-02-06

- **Problem:** AfternoonSky clouds appeared as visible white blobs over content.
- **Root Cause:** Cloud opacity was 0.6 with only 1px blur, and the sky component lacked a `fixed` container with proper z-index (unlike Morning and Night skies).
- **Permanent Fix:** Added `fixed inset-0 z-[-5]` container (matching other sky components). Reduced cloud opacity to 0.15 and increased blur to 8px. Background elements must always be `fixed` with negative z-index.

### 5.3 Navigation Icons Invisible in Light Themes
**Date:** 2026-01-28

- **Problem:** Navigation icons disappeared against light theme backgrounds.
- **Root Cause:** Icon colors were hardcoded for the dark theme.
- **Permanent Fix:** Use CSS variables for icon colors so they adapt across all circadian themes.

### 5.4 Light Mode Collapse — Hardcoded White Opacities
**Date:** 2026-02-09

- **Problem:** The entire TodayView hero card, timeline river, and ghost cards were invisible in morning/afternoon themes. ProfileMenu cards and AccountSettingsView sign-out card had the same issue.
- **Root Cause:** Components used Tailwind classes like `bg-white/[0.06]`, `border-white/10`, `bg-white/[0.04]`, and `bg-white/[0.08]` for glassmorphism. These assume a dark background. On the morning/afternoon white backgrounds (`--bg-deep: #FFFBF2` / `#FDF7F2`), white-on-white produces zero contrast — cards, borders, and lines become invisible.
- **Permanent Fix:**
  - **NEVER use `bg-white/[n]` or `border-white/[n]` for theme-sensitive surfaces.** These are only acceptable for decorative elements on accent-coloured cards (where the background is a solid colour like `--nap-color`).
  - For glass surfaces: use `var(--glass-bg)` and `var(--glass-border)` which shift between dark-frosted and light-frosted per theme.
  - For ghost/prediction cards: use `color-mix(in srgb, var(--accent-color) 5%, transparent)` to tint with the semantic colour — this works on any background.
  - For timeline lines: use `bg-[var(--text-muted)]/20` which auto-adapts between blue-grey (night) and charcoal (day).
  - For shadows: use `var(--shadow-sm)` / `var(--shadow-md)` tokens.
  - Also replaced hardcoded Tailwind reds (`text-red-400`, `bg-red-500/15`) with `var(--danger-color)` in AccountSettingsView.

> **Rule of thumb:** If you write `white/` in a className and it's not inside a solid accent-coloured container, you are creating a light-mode bug. Always use CSS variable tokens instead.

---

### 5.5 Tailwind v4 `z-[n]` Not Overriding CSS `z-index`
**Date:** 2026-02-10

- **Problem:** Calendar modal with Tailwind `z-[60]` appeared UNDER the floating nav bar which has CSS `z-index: 50`. The nav covered the modal's footer buttons.
- **Root Cause:** Tailwind v4 arbitrary value `z-[60]` did not reliably override `z-index: 50` set via plain CSS on `.floating-nav`. Likely a specificity or cascade ordering issue between Tailwind-generated utilities and hand-written CSS classes.
- **Permanent Fix:** Use inline `style={{ zIndex: 100 }}` on modals that must appear above the nav bar. Inline styles have the highest specificity and always win. Also added `pb-28` to modal footers so buttons clear the nav bar area even if z-index behaves unexpectedly.

> **Rule of thumb:** For critical z-index stacking (modals over fixed nav), prefer inline `style={{ zIndex }}` over Tailwind classes when the competing element uses plain CSS.

---

## 6. Statistics Bugs

### 6.1 Stats Averages Skewed by Incomplete Today
**Date:** 2026-02-06

- **Problem:** If today has 2 of 3 usual naps, the "average naps per day" dropped.
- **Root Cause:** Today's incomplete data was included in the average calculation alongside fully completed days.
- **Permanent Fix:** Exclude today from average calculations (flag `isToday` in `rangeData`). Today still appears on charts for visual continuity, but doesn't affect computed averages.

---

## 7. UX / Modal Bugs

### 7.1 MissingBedtimeModal Showing on Load
**Date:** 2026-02-01

- **Problem:** Modal appeared incorrectly when the app first loaded.
- **Root Cause:** Condition to show the modal triggered before data finished loading, detecting a false "no activity today" state.
- **Permanent Fix:** Guard the modal trigger behind loading state — only evaluate conditions after entries are fully loaded.

---

## 8. Navigation / View Bugs

### 10.1 Scroll Position Persists Across Main Tabs
**Date:** 2026-02-11

- **Problem:** Switching from Stats (scrolled down) to Home showed the Home view scrolled partway down instead of at the top.
- **Root Cause:** `handleViewChange()` in App.tsx changed the view state but never reset the scroll position. The browser preserved the scroll offset across tab switches.
- **Permanent Fix:** Add `window.scrollTo(0, 0)` in `handleViewChange()`. Note: ProfileSection already had its own scroll reset for internal sub-views (lesson 2.2). This fix covers the top-level tab bar navigation.

---

## 9. Prediction Display Bugs

### 9.1 Predicted Nap Cards Shift During Active Nap
**Date:** 2026-02-11

- **Problem:** While a nap was in progress, predicted ghost cards for future naps and bedtime kept re-rendering every minute, giving the impression that times were shifting.
- **Root Cause:** `predictedNapsWithMetadata` useMemo included `now` in its dependency array (needed for overdue detection when awake). During an active nap, `now` was never used in the calculation, but the memo still recomputed every minute, creating new Date object references that triggered React re-renders.
- **Permanent Fix:** Use `useRef` to snapshot predictions when a nap starts (`frozenNapIdRef`, `frozenPredictionsRef`, `frozenBedtimeRef`). JSX renders `displayPredictions` / `displayBedtime` which are the frozen refs during nap and live values when awake. When the nap ends, refs clear and predictions recalculate from the actual end time — so subsequent naps correctly reflect the real schedule.

> **Pattern:** When a useMemo has a time-dependent dep (`now`) but only uses it in some branches, use a ref-based snapshot to prevent unnecessary re-renders in the branches that don't need it.

---

## 10. Technical Decisions

### 10.1 Predictions Visible During Active Nap
**Decision (2026-02-02):** Show future predicted naps even when a nap is in progress. Previously they were all hidden. Rationale: parents want to see "what comes next" while the baby sleeps.

### 10.2 Bottom Sheet Over Full View Swap
**Decision (2026-02-05):** Always use bottom sheets for editing (SleepEntrySheet, BabyEditSheet, ShareAccess). Never swap the full view — it feels jarring and loses spatial context. The user can still see the list behind the blur.

### 10.3 Client-Side Image Compression
**Decision (2026-02-05):** Compress images on the client (Canvas API: 400x400, JPEG 80%) before uploading to Supabase Storage. Avoids upload friction regardless of source image size.

### 10.4 Fire-and-Forget Invitation Emails
**Decision (2026-02-06):** Email sending is non-blocking. If the email fails, the invitation in the database still exists. No rollback. The parent can still share the link manually.

### 10.5 Google OAuth Button Placement
**Decision (2026-02-03):** Google sign-in button placed at TOP of auth forms, above email/password. Follows "Decision Replacement" principle — fastest path first for sleep-deprived parents.

### 10.6 Resend Free Tier Limitation
**Decision (2026-02-06):** `onboarding@resend.dev` can only send to the Resend account owner's email. Need a verified custom domain (e.g., `napnap.app`) to send to arbitrary recipients. Blocked until domain verification is completed.

### 10.7 Drag-to-Dismiss Thresholds
**Decision (2026-02-02):** 150px offset OR 500px/s velocity to dismiss a bottom sheet. Calibrated for mobile — high enough to prevent accidental dismisses, low enough to feel responsive.

### 10.8 Decision Replacement in UI Copy
**Decision (2026-02-03):** Show time ranges ("14:38 — 15:23") instead of durations ("~45m"). Parents shouldn't do mental arithmetic. The dashed border already signals predictions — no need for the `~` symbol.

### 10.9 "Tell, Don't Ask" in Prediction Labels
**Decision (2026-02-09):** Renamed "Predicted Nap" to "Nap {n}" (e.g. "Nap 2") and "Catnap" to "Short Nap". The dashed border already communicates "future/not-yet" visually. Using the word "Predicted" surfaces algorithm uncertainty to the parent, violating the "decision replacement" North Star. "Catnap" is jargon that first-time parents may not understand.

### 10.10 Redundant Navigation Removal
**Decision (2026-02-09):** Removed the "My Babies" ListRow from ProfileMenu. The primary baby card already navigates to `my-babies` and is the dominant visual element. Having a secondary list row for the same destination diluted the Golden Path and added visual noise (6 interactive elements → 5).

### 10.11 Full-Screen Detail View Over Bottom Sheet for Complex Editing
**Decision (2026-02-09):** Owned baby profiles now open a full-screen `BabyDetailView` instead of the `BabyEditSheet` bottom sheet. The bottom sheet is retained only for the "Add Baby" quick flow (ghost card). **Rationale:** The baby edit form + ShareAccess sharing management is too much content for a bottom sheet. A full-screen view provides space for all sections, better scrolling, and clearer navigation hierarchy. This is an exception to decision 8.2 (bottom sheets over full view swap) — complex multi-section forms warrant a dedicated screen.

### 10.12 Temporal Validation as Client-Side Guard
**Decision (2026-02-09):** Sleep entry validation (max 5h nap, max 14h night, 0-duration block, cross-midnight warnings) is purely client-side. No server enforcement. **Rationale:** These are UX guardrails, not data integrity constraints. Cross-midnight naps are warned but allowed because late-evening naps for older infants are legitimate.

### 10.13 Contextual Save Icons (Play/Stop/Check)
**Decision (2026-02-09):** The SleepEntrySheet save button now shows different icons based on entry state: Play (filled triangle) for new entries without an end time, Stop (filled square) for editing active entries, Check (tick) for completed entries. **Rationale:** The icon communicates the action about to happen — "start tracking" vs "stop this sleep" vs "confirm changes". Reduces cognitive load at 3AM.

### 10.14 Napper-style DayNavigator
**Decision (2026-02-10):** Replaced the basic prev/next arrow DayNavigator (with native `<input type="date">`) with a premium week strip + calendar modal. The week strip shows 7 days (Mon–Sun) with swipe navigation. Tapping the date header opens a full calendar bottom sheet. **Rationale:** The native date picker felt out of place in a premium mobile app. The week strip gives immediate context (what day of the week), and the calendar modal allows jumping to any date without repeated arrow tapping. Entry dots on days with data help parents find logged days quickly.

### 10.15 Accessibility (A11Y) as a Systemic Pass
**Decision (2026-02-12):** A11y was added as a full-app pass rather than per-component incremental work. Created a shared `useFocusTrap` hook used by all 9 modals. Used `MotionConfig reducedMotion="user"` at the App root to cover all Framer Motion animations with zero per-component changes. Touch targets bumped from 40px to 44px (WCAG minimum). **Key insight:** Framer Motion's `MotionConfig` is the highest-leverage a11y fix — one line covers all animations. Focus trapping is best done as a hook rather than inline logic to avoid 9 duplicate implementations.

### 10.16 Dynamic Time Labels Over Static Section
**Decision (2026-02-09):** Removed the standalone duration section from SleepEntrySheet. Duration now appears as the start time label (e.g. "2h 30m" instead of "Start"), and the end time label shows relative time (e.g. "15m ago" instead of "End"). Active entries show "Sleeping..." under the end time. **Rationale:** Puts contextual information exactly where the eye is already looking. The previous central duration section was wasted vertical space.

### 10.17 Bottom Sheets: No Bounce + Handle Implies Drag
**Decision (2026-02-12):** (1) All bottom sheets use **tween** for enter/exit (`duration: 0.25, ease: 'easeOut'`) — no spring, no bounce. Bouncy modals were perceived as bad practice. (2) Any sheet that displays a **drag handle** (the thin bar) must support **drag-to-dismiss**; otherwise the visual affordance is misleading. QuickActionSheet and ShareAccess Edit Access sheet had handles but no drag — both now have `drag="y"`, `onDragEnd`, and backdrop opacity tied to drag position.
