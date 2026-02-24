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

### 1.6 Overdue Nap Timeline Card Showing Current Time Instead of Predicted Time
**Date:** 2026-02-18

- **Problem:** When the first predicted nap was in the past ("overdue"), the hero correctly showed "NAP NOW", but the timeline ghost card showed the **current** time as the nap start (e.g. 14:00) and it kept updating every minute. The user lost sight of when the nap was actually suggested (e.g. 13:42).
- **Root Cause:** For overdue predictions we push `time: now` so bedtime anchor and hero behaviour stay correct (lesson 1.4). The timeline card was displaying `napInfo.time` directly, so it showed "now" instead of the original suggested time.
- **Permanent Fix:** Keep `time: now` for anchor/bedtime math. Add `isOverdue: true` when pushing the overdue prediction. In the timeline card render, use **display start** = `napInfo.prediction.predictedTime` when `napInfo.isOverdue` (and `napInfo.prediction.predictedTime` exists), otherwise `napInfo.time`. Compute displayed end from that start + expected duration. The card now shows the suggested window (e.g. 13:42 — 14:27) while the hero still shows "NAP NOW".

### 1.7 Unrealistic Early Bedtime (e.g. 16:30 for 8‑month on 2 naps)
**Date:** 2026-02-24

- **Problem:** For an 8‑month‑old who still needs a 3rd nap, the system showed "Bedtime 16:30" after 2 completed naps (last nap end 13:35 + final wake window). Age config says targetNaps = 2, so the loop never tried a 3rd nap.
- **Root Cause:** Simulation stopped at targetNaps and computed bedtime from last activity; no constraint that bedtime must fall within the age-appropriate window (e.g. 18:30–19:30). Single fixed nap count per age doesn't fit babies in transition (3→2 or 2→1).
- **Permanent Fix:** (1) **simulateDay:** After the nap loop, if `bedtimeMinutes < config.bedtime.earliest` and we're at target 2–3 naps (transition), add one **rescue catnap** so bedtime moves into [earliest, latest]. (2) **calculateDynamicBedtime:** Floor the returned time to `config.bedtime.earliest` (same calendar day) when computed bedtime is earlier — covers 1‑nap toddlers where we don't add a 2nd nap. See `.context/docs/BEDTIME_WINDOW_RESEARCH_AND_SCENARIOS.md`.

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

### 2.3 Language Selector Does Nothing (Settings)
**Date:** 2026-02-20

- **Problem:** Tapping English or Español in Account settings did nothing — UI did not switch language.
- **Root Cause:** In `useBabyProfile.updateProfile()`, the Supabase upsert ran first; only on success did we call `i18n.changeLanguage()` and `setUserProfile()`. If the upsert failed (e.g. `profiles.locale` column missing because migration not run, or RLS), the function returned early and the UI never updated.
- **Permanent Fix:** Apply locale changes **optimistically** at the start of `updateProfile()` when `data.locale` is set: call `i18n.changeLanguage(locale)`, `setToStorage(STORAGE_KEYS.LOCALE, locale)`, and `setUserProfile(prev => (prev ? { ...prev, locale } : prev))` before the Supabase upsert. The selector then works immediately; DB persistence is best-effort. **Pattern:** For user-facing toggles that can fail server-side (new column, RLS), apply the change to local state and i18n first so the UI always responds.

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

## 4. Supabase RLS — Anonymized / Write-Only Tables

### 4.1 RLS "Block FOR ALL" Blocks INSERT Too
**Date:** 2026-02-13

- **Problem:** Client got 403 when inserting into `anonymized_baby_profiles` (and similarly `anonymized_sleep_entries`) with error "new row violates row-level security policy".
- **Root Cause:** A single policy "Block anon and authenticated" was defined as `FOR ALL` with `WITH CHECK (false)`. In Postgres, **FOR ALL** applies to SELECT, INSERT, UPDATE, and DELETE. So the block policy was evaluated on INSERT and rejected the row. RLS requires the row to satisfy all applicable policies; the "Authenticated can insert" policy allowed it, but the block policy denied it.
- **Permanent Fix:** Do not use one policy with `FOR ALL` to "block everyone from reading/updating/deleting." Create **separate** policies: "Block select", "Block update", "Block delete" — each with its own `FOR SELECT` / `FOR UPDATE` / `FOR DELETE`. Leave INSERT controlled only by the "Authenticated can insert" policy. **Reusable rule:** For write-only or analytics tables where authenticated users should only INSERT, block SELECT/UPDATE/DELETE with separate policies, not FOR ALL.

### 4.2 INSERT with .select('id') Requires SELECT Policy
**Date:** 2026-02-13

- **Problem:** After fixing the block policy, client still got 403 on insert into `anonymized_baby_profiles` when using `.insert({...}).select('id').single()`.
- **Root Cause:** PostgREST runs a **SELECT** after the INSERT to return the requested columns. We had "Block select" (USING (false)) on the table, so that follow-up SELECT was denied → 403.
- **Permanent Fix:** Either (1) allow authenticated SELECT on that table (e.g. "Authenticated can select anonymized_baby_profiles" with USING (true)) so the insert-return pattern works — acceptable when the table has no PII — or (2) avoid `.select('id')` and use a DB function (SECURITY DEFINER) that inserts and returns the id. For anonymized analytics tables, (1) is usually fine.

---

## 5. Supabase Edge Function Gotchas

### 5.1 Manual JWT Verification Causes 401
**Date:** 2026-02-06

- **Problem:** Edge Function returned 401 on every request despite valid auth tokens.
- **Root Cause:** Added manual `getUser()` check inside the function. Supabase already verifies JWT at the infrastructure level — the manual check was redundant and failed.
- **Permanent Fix:** Never add manual JWT verification in Edge Functions. Supabase handles it. If you need to bypass verification entirely (e.g., for public endpoints), use `--no-verify-jwt` flag during deploy.

### 5.2 Edge Function 401 = Gateway JWT Verification (verify_jwt)
**Date:** 2026-02-13

- **Problem:** POST to Edge Function returned 401 Unauthorized even when the client sent `Authorization: Bearer <session.access_token>` and the user was logged in.
- **Root Cause:** With **verify_jwt: true** (default), the **Supabase gateway** validates the JWT **before** the request reaches your function. If validation fails (expired token, wrong key, or client not attaching the header correctly in some edge cases), the gateway returns 401 and your function code never runs.
- **Permanent Fix:** (1) **Client:** Pass the token explicitly: get session with `getSession()`, then `supabase.functions.invoke('fn-name', { headers: { Authorization: \`Bearer ${session.access_token}\` } })`. (2) **Function:** Either keep verify_jwt and ensure tokens are valid and sent, or **disable verify_jwt** for that function (Dashboard → Edge Functions → function → Settings → "Enforce JWT verification" OFF, or deploy with `--no-verify-jwt`). When verify_jwt is off, the function must validate the user itself (e.g. read Authorization header and call `createClient(..., { global: { headers: { Authorization: authHeader } } }).auth.getUser()` and return 401 if no user). **Reusable rule:** For "delete account" or similar flows, using verify_jwt = false + manual getUser() inside the function avoids gateway 401s while keeping the same security.

### 5.3 signOut() Returns 403 After deleteUser()
**Date:** 2026-02-13

- **Problem:** After the delete-account Edge Function successfully deleted the user, the client called `supabase.auth.signOut()` and got 403 on `POST .../auth/v1/logout`.
- **Root Cause:** The user no longer exists in Supabase Auth. The logout endpoint rejects the request for a deleted/invalid session.
- **Permanent Fix:** After a successful delete-account response, wrap `signOut()` in try/catch and **always** call the signed-out callback (e.g. `onSignedOut()`) so the UI redirects and clears state. Ignore errors from signOut(); the account is already gone. The 403 may still appear in the browser console — that's expected.

### 5.4 Deploy Uses Local Files, Not Git Remote
**Date:** 2026-02-06

- **Problem:** Deployed Edge Function still had old code even after pushing fixes to git.
- **Root Cause:** `npx supabase functions deploy` reads from the local filesystem, not from the git remote.
- **Permanent Fix:** Always `git pull` before running `npx supabase functions deploy`.

### 5.5 CORS Blocked on Error Responses
**Date:** 2026-02-06

- **Problem:** Frontend got CORS errors on Edge Function calls that returned errors (non-200).
- **Root Cause:** CORS headers were only added to the OPTIONS preflight response, not to error/success responses.
- **Permanent Fix:** Create a shared `corsHeaders` object and a `jsonResponse()` helper that always includes CORS headers on every response (success, error, crash).

---

## 6. CSS / Visual Bugs

### 6.1 MenuCard Black Borders
**Date:** 2026-02-02

- **Problem:** Profile menu cards showed ugly black borders.
- **Root Cause:** Used `border-[var(--border-subtle)]` but the CSS variable `--border-subtle` didn't exist — CSS defaulted to black.
- **Permanent Fix:** Never reference CSS variables without checking they exist in the theme. Replaced with `shadow-sm hover:shadow-md` (no border needed).

### 6.2 Afternoon Clouds Too Visible
**Date:** 2026-02-06

- **Problem:** AfternoonSky clouds appeared as visible white blobs over content.
- **Root Cause:** Cloud opacity was 0.6 with only 1px blur, and the sky component lacked a `fixed` container with proper z-index (unlike Morning and Night skies).
- **Permanent Fix:** Added `fixed inset-0 z-[-5]` container (matching other sky components). Reduced cloud opacity to 0.15 and increased blur to 8px. Background elements must always be `fixed` with negative z-index.

### 6.3 Navigation Icons Invisible in Light Themes
**Date:** 2026-01-28

- **Problem:** Navigation icons disappeared against light theme backgrounds.
- **Root Cause:** Icon colors were hardcoded for the dark theme.
- **Permanent Fix:** Use CSS variables for icon colors so they adapt across all circadian themes.

### 6.4 Light Mode Collapse — Hardcoded White Opacities
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

### 6.5 Tailwind v4 `z-[n]` Not Overriding CSS `z-index`
**Date:** 2026-02-10

- **Problem:** Calendar modal with Tailwind `z-[60]` appeared UNDER the floating nav bar which has CSS `z-index: 50`. The nav covered the modal's footer buttons.
- **Root Cause:** Tailwind v4 arbitrary value `z-[60]` did not reliably override `z-index: 50` set via plain CSS on `.floating-nav`. Likely a specificity or cascade ordering issue between Tailwind-generated utilities and hand-written CSS classes.
- **Permanent Fix:** Use inline `style={{ zIndex: 100 }}` on modals that must appear above the nav bar. Inline styles have the highest specificity and always win. Also added `pb-28` to modal footers so buttons clear the nav bar area even if z-index behaves unexpectedly.

> **Rule of thumb:** For critical z-index stacking (modals over fixed nav), prefer inline `style={{ zIndex }}` over Tailwind classes when the competing element uses plain CSS.

---

## 7. Statistics Bugs

### 7.1 Stats Averages Skewed by Incomplete Today
**Date:** 2026-02-06

- **Problem:** If today has 2 of 3 usual naps, the "average naps per day" dropped.
- **Root Cause:** Today's incomplete data was included in the average calculation alongside fully completed days.
- **Permanent Fix:** Exclude today from average calculations (flag `isToday` in `rangeData`). Today still appears on charts for visual continuity, but doesn't affect computed averages.

### 7.2 Stats Y-axis Duplicate or Wrong Labels (Recharts)
**Date:** 2026-02-24

- **Problem:** Duration charts (Average nap, Daily Sleep) showed repeated Y-axis labels (e.g. 0h, 1h, 1h, 1h). Growth weight/height could show unclear or overlapping tick labels.
- **Root Cause:** Recharts auto-generates Y-axis ticks from the data range. With a formatter like `Math.round(value/60)}h`, several different minute values (e.g. 30, 45, 60) round to the same label (1h). No explicit `domain` or `ticks` was set.
- **Permanent Fix:** For duration (minutes) charts: compute explicit domain and ticks (e.g. 0–max rounded to 30 min, ticks every 30 min) and a formatter that yields distinct labels (0h, 30m, 1h, 1h 30m, …). For growth: keep adaptive domain; add explicit tick arrays (e.g. weight: 0.25/0.5/1 kg steps; height: 2/5/10 cm steps) so the Y-axis always shows readable, non-duplicate labels.

### 7.3 Stats Y-axis Too Many Ticks (Clutter)
**Date:** 2026-02-24

- **Problem:** Duration and Sleep Trend charts showed a very large number of Y-axis labels (e.g. 0h, 30m, 1h, 1h 30m, 2h, … up to 14h), causing overlap, wrong visual order, and "30m" appearing in multiple places. Bedtime showed odd times (19:55, 20:20). Height chart had dense grid lines.
- **Root Cause:** Data-viz rule violated: **use 4–7 ticks per axis**. We used a tick every 30 minutes (up to 28 ticks for 14h), so Recharts crammed them on the axis. Time-of-day charts had no explicit ticks, so Recharts chose uneven steps. Growth steps could yield too many ticks for narrow ranges.
- **Permanent Fix:** (1) **Duration:** Cap at 6 ticks; choose step by range (30 min for &lt;2h, 1h for &lt;5h, 2h for &lt;10h, 3h for 14h) so labels are e.g. 0h, 3h, 6h, 9h, 12h, 14h. (2) **Bedtime / Woke Up:** Explicit ticks at round clock times (30 min or 1 h steps), max 6. (3) **Growth:** Cap at 6 ticks; if step yields more, increase step (e.g. double) until tick count ≤ 6.

### 7.4 Line/Area Charts: X-axis Day Label Overlapping Y-axis Unit (kg / cm / time)
**Date:** 2026-02-24

- **Problem:** In Growth (Weight over time, Height over time) and Night (Woke up, Bedtime) area charts, the first X-axis label (e.g. "Mon 16/6") overlapped the lowest Y-axis label ("2 kg", "40 cm", or "07:00") at the bottom-left corner, making both hard to read.
- **Root Cause:** `CHART_MARGIN_LONG_Y` (used for area charts with long Y labels) had left 72 and bottom 40. That left margin was too small for labels like "10 kg" or "70 cm", and the bottom margin was too small for the two-line day/date X tick, so they collided at the axes origin.
- **Permanent Fix:** Increase `CHART_MARGIN_LONG_Y` to `left: 88, bottom: 48` so Y-axis labels have space and X-axis labels sit clearly below the plot. Bar charts keep using `CHART_MARGIN` (shorter Y labels) and are unaffected.

---

## 8. UX / Modal Bugs

### 8.1 MissingBedtimeModal Showing on Load
**Date:** 2026-02-01

- **Problem:** Modal appeared incorrectly when the app first loaded.
- **Root Cause:** Condition to show the modal triggered before data finished loading, detecting a false "no activity today" state.
- **Permanent Fix:** Guard the modal trigger behind loading state — only evaluate conditions after entries are fully loaded.

### 8.2 MissingBedtimeModal After Adding Bedtime + Wake-Up
**Date:** 2026-02-13 (documented from plan)

- **Problem:** After the user added a completed night (bedtime + wake-up) from the sheet, the "Forgot bedtime?" modal still appeared.
- **Root Cause:** We store night end time on the **next calendar day** (e.g. wake 08:00 → endTime tomorrow 08:00). The modal only treated "night ended **today**" as "we have a wake-up", so it kept showing.
- **Permanent Fix:** Treat any completed night whose end date is **today or tomorrow** as "we have a wake-up" and suppress the modal. In App.tsx: `hasCompletedNightRecently` uses `endDateStr === todayStr || endDateStr === tomorrowStr`.

---

## 9. Navigation / View Bugs

### 9.1 Scroll Position Persists Across Main Tabs
**Date:** 2026-02-11

- **Problem:** Switching from Stats (scrolled down) to Home showed the Home view scrolled partway down instead of at the top.
- **Root Cause:** `handleViewChange()` in App.tsx changed the view state but never reset the scroll position. The browser preserved the scroll offset across tab switches.
- **Permanent Fix:** Add `window.scrollTo(0, 0)` in `handleViewChange()`. Note: ProfileSection already had its own scroll reset for internal sub-views (lesson 2.2). This fix covers the top-level tab bar navigation.

---

## 10. Prediction Display Bugs

### 10.1 Predicted Nap Cards Shift During Active Nap
**Date:** 2026-02-11

- **Problem:** While a nap was in progress, predicted ghost cards for future naps and bedtime kept re-rendering every minute, giving the impression that times were shifting.
- **Root Cause:** `predictedNapsWithMetadata` useMemo included `now` in its dependency array (needed for overdue detection when awake). During an active nap, `now` was never used in the calculation, but the memo still recomputed every minute, creating new Date object references that triggered React re-renders.
- **Permanent Fix:** Use `useRef` to snapshot predictions when a nap starts (`frozenNapIdRef`, `frozenPredictionsRef`, `frozenBedtimeRef`). JSX renders `displayPredictions` / `displayBedtime` which are the frozen refs during nap and live values when awake. When the nap ends, refs clear and predictions recalculate from the actual end time — so subsequent naps correctly reflect the real schedule.

> **Pattern:** When a useMemo has a time-dependent dep (`now`) but only uses it in some branches, use a ref-based snapshot to prevent unnecessary re-renders in the branches that don't need it.

---

## 11. Technical Decisions

### 11.1 Predictions Visible During Active Nap
**Decision (2026-02-02):** Show future predicted naps even when a nap is in progress. Previously they were all hidden. Rationale: parents want to see "what comes next" while the baby sleeps.

### 11.2 Bottom Sheet Over Full View Swap
**Decision (2026-02-05):** Always use bottom sheets for editing (SleepEntrySheet, BabyEditSheet, ShareAccess). Never swap the full view — it feels jarring and loses spatial context. The user can still see the list behind the blur.

### 11.3 Client-Side Image Compression
**Decision (2026-02-05):** Compress images on the client (Canvas API: 400x400, JPEG 80%) before uploading to Supabase Storage. Avoids upload friction regardless of source image size.

### 11.4 Fire-and-Forget Invitation Emails
**Decision (2026-02-06):** Email sending is non-blocking. If the email fails, the invitation in the database still exists. No rollback. The parent can still share the link manually.

### 11.5 Google OAuth Button Placement
**Decision (2026-02-03):** Google sign-in button placed at TOP of auth forms, above email/password. Follows "Decision Replacement" principle — fastest path first for sleep-deprived parents.

### 11.6 Resend Free Tier Limitation
**Decision (2026-02-06):** `onboarding@resend.dev` can only send to the Resend account owner's email. Need a verified custom domain (e.g., `napnap.app`) to send to arbitrary recipients. Blocked until domain verification is completed.

### 11.7 Drag-to-Dismiss Thresholds
**Decision (2026-02-02):** 150px offset OR 500px/s velocity to dismiss a bottom sheet. Calibrated for mobile — high enough to prevent accidental dismisses, low enough to feel responsive.

### 11.8 Decision Replacement in UI Copy
**Decision (2026-02-03):** Show time ranges ("14:38 — 15:23") instead of durations ("~45m"). Parents shouldn't do mental arithmetic. The dashed border already signals predictions — no need for the `~` symbol.

### 11.9 "Tell, Don't Ask" in Prediction Labels
**Decision (2026-02-09):** Renamed "Predicted Nap" to "Nap {n}" (e.g. "Nap 2") and "Catnap" to "Short Nap". The dashed border already communicates "future/not-yet" visually. Using the word "Predicted" surfaces algorithm uncertainty to the parent, violating the "decision replacement" North Star. "Catnap" is jargon that first-time parents may not understand.

### 11.10 Redundant Navigation Removal
**Decision (2026-02-09):** Removed the "My Babies" ListRow from ProfileMenu. The primary baby card already navigates to `my-babies` and is the dominant visual element. Having a secondary list row for the same destination diluted the Golden Path and added visual noise (6 interactive elements → 5).

### 11.11 Full-Screen Detail View Over Bottom Sheet for Complex Editing
**Decision (2026-02-09):** Owned baby profiles now open a full-screen `BabyDetailView` instead of the `BabyEditSheet` bottom sheet. The bottom sheet is retained only for the "Add Baby" quick flow (ghost card). **Rationale:** The baby edit form + ShareAccess sharing management is too much content for a bottom sheet. A full-screen view provides space for all sections, better scrolling, and clearer navigation hierarchy. This is an exception to decision 11.2 (bottom sheets over full view swap) — complex multi-section forms warrant a dedicated screen.

### 11.12 Temporal Validation as Client-Side Guard
**Decision (2026-02-09):** Sleep entry validation (max 5h nap, max 14h night, 0-duration block, cross-midnight warnings) is purely client-side. No server enforcement. **Rationale:** These are UX guardrails, not data integrity constraints. Cross-midnight naps are warned but allowed because late-evening naps for older infants are legitimate.

### 11.13 Contextual Save Icons (Play/Stop/Check)
**Decision (2026-02-09):** The SleepEntrySheet save button now shows different icons based on entry state: Play (filled triangle) for new entries without an end time, Stop (filled square) for editing active entries, Check (tick) for completed entries. **Rationale:** The icon communicates the action about to happen — "start tracking" vs "stop this sleep" vs "confirm changes". Reduces cognitive load at 3AM.

### 11.14 Napper-style DayNavigator
**Decision (2026-02-10):** Replaced the basic prev/next arrow DayNavigator (with native `<input type="date">`) with a premium week strip + calendar modal. The week strip shows 7 days (Mon–Sun) with swipe navigation. Tapping the date header opens a full calendar bottom sheet. **Rationale:** The native date picker felt out of place in a premium mobile app. The week strip gives immediate context (what day of the week), and the calendar modal allows jumping to any date without repeated arrow tapping. Entry dots on days with data help parents find logged days quickly.

### 11.15 Accessibility (A11Y) as a Systemic Pass
**Decision (2026-02-12):** A11y was added as a full-app pass rather than per-component incremental work. Created a shared `useFocusTrap` hook used by all 9 modals. Used `MotionConfig reducedMotion="user"` at the App root to cover all Framer Motion animations with zero per-component changes. Touch targets bumped from 40px to 44px (WCAG minimum). **Key insight:** Framer Motion's `MotionConfig` is the highest-leverage a11y fix — one line covers all animations. Focus trapping is best done as a hook rather than inline logic to avoid 9 duplicate implementations.

### 11.16 Dynamic Time Labels Over Static Section
**Decision (2026-02-09):** Removed the standalone duration section from SleepEntrySheet. Duration now appears as the start time label (e.g. "2h 30m" instead of "Start"), and the end time label shows relative time (e.g. "15m ago" instead of "End"). Active entries show "Sleeping..." under the end time. **Rationale:** Puts contextual information exactly where the eye is already looking. The previous central duration section was wasted vertical space.

### 11.17 Bottom Sheets: No Bounce + Handle Implies Drag
**Decision (2026-02-12):** (1) All bottom sheets use **tween** for enter/exit (`duration: 0.25, ease: 'easeOut'`) — no spring, no bounce. Bouncy modals were perceived as bad practice. (2) Any sheet that displays a **drag handle** (the thin bar) must support **drag-to-dismiss**; otherwise the visual affordance is misleading. QuickActionSheet and ShareAccess Edit Access sheet had handles but no drag — both now have `drag="y"`, `onDragEnd`, and backdrop opacity tied to drag position.

### 11.18 Onboarding Next Button: Disabled Until Step Complete
**Decision (2026-02-12):** In OnboardingFlow, the "Next" button must be disabled until the user has completed the current step's required input (baby name, baby DOB, your name). Baby DOB defaults to empty string so the user must explicitly pick a date; relationship defaults to "mum" so that step can always proceed. **Rationale:** Prevents advancing with empty data and makes it clear what action is required before continuing.

---

## 12. Onboarding / First-Login

### 12.1 Onboarding Draft Not Persisted — New User Lands With No Profile
**Date:** 2026-02-13

- **Problem:** User completes onboarding (baby name, DOB, your name, relationship), clicks Create account (or Google). Auth succeeds but the app shows no baby and no user name/relationship — "Add your baby" is the only path.
- **Root Cause:** OnboardingFlow kept the draft only in React state. The Account step called `signUp` / `signInWithGoogle` with email/password only; the draft was never sent or stored. After sign-up, no profile row existed.
- **Permanent Fix:** (1) When the user reaches the Account step (`step === STEP_ACCOUNT`), persist the draft to **sessionStorage** in a `useEffect([step, draft])` so it's available after redirect (e.g. Google OAuth). (2) In App, when the user is authenticated and profile has finished loading with **no profile**, read the onboarding draft from sessionStorage; if valid (babyName + babyDob), call `createProfile` with mapped fields (name, dateOfBirth, userName, userRole from relationship); on success remove the draft. Use a ref to avoid applying twice; on create failure reset the ref so the user can retry. **Reusable rule:** sessionStorage (not localStorage) keeps the draft tab-scoped and available after OAuth redirect without persisting indefinitely.

---

## 13. Display / dateUtils

### 13.1 Baby Age "X months, Y days" Showing Wrong Days
**Date:** 2026-02-13

- **Problem:** Baby born 16 June 2025 showed "7 months, 2 days" in the UI when it should show "7 months, 28 days" (as of mid-Feb 2026).
- **Root Cause:** In `calculateAge()` (dateUtils.ts), the "days" part for infants under 1 year was computed as `differenceInDays(now, dob) % 30`. That gives **total days since birth modulo 30**, not "days since the last month anniversary." Example: 242 total days → 242 % 30 = 2, hence "2 days."
- **Permanent Fix:** Compute days as **days since the last full month**: `lastMonthAnniversary = addMonths(dob, months)` (with `months = differenceInMonths(now, dob)`), then `days = differenceInDays(now, lastMonthAnniversary)`. Import `addMonths` from date-fns. **Reusable rule:** For "X months, Y days" display, Y must be the offset from the month anniversary, not total days mod 30.

---

## 14. Loading / Profile Race Conditions

### 14.1 FAB Opens Add-Baby When Tapping + Before Profile Loads
**Date:** 2026-02-18

- **Problem:** Opening the app and tapping the center + button very quickly took the user to Profile → My Babies and opened the add-baby sheet instead of the sleep action menu (QuickActionSheet).
- **Root Cause:** `hasAnyBaby = sharedProfiles.length > 0`. Until `useBabyProfile`'s `fetchProfile()` completes, `sharedProfiles` is `[]` and `profileLoading` is true. So the FAB saw "no baby" and called `goToAddBaby()`.
- **Permanent Fix:** Do not treat as "no baby" while profile is loading. **FAB:** Open QuickActionSheet when `profileLoading || hasAnyBaby`, else `goToAddBaby()`. Do not disable the FAB (optimistic: assume normal case). **handleOpenNewEntry:** At the start, if `!profileLoading && !hasAnyBaby`, close the action menu, call `goToAddBaby()`, and return — so if the user opened the sheet during load and then taps Nap/Bedtime, we redirect to add baby instead of opening the entry form. **Reusable rule:** Any UI that branches on "user has no baby" must only do so when `!profileLoading`; while loading, optimistically show the "has baby" path or a loading state.

### 14.2 History "+ Add Entry" Same Race (superseded 2026-02-19)
**Date:** 2026-02-18

- **Problem:** In History view, during profile load the header showed "Add a baby to log sleep" and a tap would navigate to add baby even when the user had babies.
- **Root Cause:** Same as 14.1 — `hasAnyBaby` was false until `sharedProfiles` loaded.
- **Permanent Fix (then):** Show the "+ Add Entry" branch when `profileLoading || hasAnyBaby`; show "Add a baby to log sleep" only when `!profileLoading && !hasAnyBaby`.
- **Update 2026-02-19:** History no longer has "+ Add Entry"; add entry is FAB-only. History header now shows only title and "Add a baby to log sleep" when `!profileLoading && !hasAnyBaby`.

### 14.3 TodayView "Add a baby" Empty State During Load
**Date:** 2026-02-18

- **Problem:** During initial load, users with a baby could briefly see "Add a baby to get started" and the "Add your baby" button because `hasNoBaby` was derived from `!hasAnyBaby` (true while `sharedProfiles` was still empty).
- **Root Cause:** TodayView received `hasNoBaby={!hasAnyBaby}` with no loading guard.
- **Permanent Fix:** Pass `hasNoBaby={!profileLoading && !hasAnyBaby}` from App. Only show the add-baby empty state when we know there are no babies.

### 14.4 Profile Tab Empty/Inconsistent While Profile Loading
**Date:** 2026-02-18

- **Problem:** Switching to the Profile tab before profile finished loading showed the full menu with empty `sharedProfiles` (e.g. empty My babies list), causing a flash of wrong or empty state.
- **Root Cause:** ProfileSection did not receive or use profile loading state.
- **Permanent Fix:** Pass `profileLoading` from App to ProfileSection. When `profileLoading` is true, render a lightweight skeleton (e.g. title placeholder + a few card-shaped placeholders with `animate-pulse`) instead of the full menu. When load completes, render the real content.

---

## 15. Stats View — Growth Charts & Chips

### 15.1 Weight/Height Graphs in Every Section and Twice in Growth
**Date:** 2026-02-22

- **Problem:** Weight and height area charts appeared in every Stats section (Summary, Naps, Night) and twice when the Growth chip was selected.
- **Root Cause:** Two separate render paths: (1) content inside `statsSection === 'growth'` (correct), and (2) a second block that rendered growth charts whenever `weightLogs.length > 0 || heightLogs.length > 0` with no check for `hasData` or section — so growth showed alongside sleep content and again in Growth.
- **Permanent Fix:** Remove the duplicate block. Growth charts render only in: (a) `statsSection === 'growth'` when `hasData`, and (b) `!hasData && (weightLogs.length > 0 || heightLogs.length > 0)` (no-sleep fallback). **Pattern:** When adding section-scoped content (chips), ensure each block is guarded by the section state so content appears in exactly one place.

### 15.2 Chip Row Scrolls to End When Selecting Growth
**Date:** 2026-02-22

- **Problem:** Tapping the "Growth" chip caused the horizontal chip row to scroll so Growth was at the far right, pushing other chips off-screen.
- **Root Cause:** No scroll control; the container has `overflow-x-auto` and the selected chip was just focused/visible at the end of the list.
- **Permanent Fix:** Add a ref array for each chip button. On `statsSection` change, call `chipRefs.current[idx].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })` so the **selected** chip is brought into view and centered when possible, without forcing the row to scroll to the last item.

### 15.3 Growth Charts Y-Axis Always 0–Max (Poor Scale for Real Data)
**Date:** 2026-02-22

- **Problem:** Weight and height Recharts used default domain (0 to max), so e.g. 50–70 cm or 3–9 kg looked flat and wasted vertical space.
- **Root Cause:** No `domain` prop on `YAxis`; Recharts defaults to full range from 0.
- **Permanent Fix:** Add helpers `adaptiveWeightDomain(values)` and `adaptiveHeightDomain(values)`: compute min/max from data, add ~15% padding, round to sensible steps (weight: 0.5 kg, height: 5 cm), clamp lower bound at 0. Pass `domain={weightDomain}` / `domain={heightDomain}` (from `useMemo` on logs) to every weight/height `YAxis` in StatsView (Growth section + no-sleep block). **Pattern:** For growth or measurement charts, use data-driven Y domains so the curve uses the vertical space meaningfully.

---

## 16. Timezone and DST

### 16.1 Store UTC, Compute Durations as Absolute Minutes
**Date:** 2026-02-23

- **Goal:** Handle DST changes and travel correctly: no double/missing hours, stable wake-window math.
- **Approach:** (1) **Persistence:** Sleep entry `start_time` / `end_time` are stored in UTC (ISO with Z). In `useSleepEntries`, `toSupabaseTimestamp` uses `parseISO(datetime).toISOString()` so we always send UTC to Supabase. Entries in client state keep raw `startTime`/`endTime` from the DB (UTC ISO). (2) **Display:** `formatTime(entry.startTime)` and `extractTime` in SleepEntrySheet use `parseISO` then local formatting, so the user always sees local time. (3) **Durations and wake windows:** All logic uses `differenceInMinutes(parseISO(a), parseISO(b))` — i.e. difference between two instants — so wake windows and nap lengths are independent of clock changes. **Reusable rule:** Persist instants in UTC; use instant difference (minutes) for any duration or window; render in local for the current device.
