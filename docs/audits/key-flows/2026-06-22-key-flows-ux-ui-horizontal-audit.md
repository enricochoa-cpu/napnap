# Key Flows — UX/UI Horizontal Audit

- **Date**: 2026-06-22
- **Area**: Core logging flows (React + TypeScript + Vite + Supabase; mobile-first SPA)
- **Persona**: Anxious first-time parent, one-handed, often at 3am ("the quiet voice at 3am")
- **User goal**: Create a baby, then log a wake-up, a nap, a bedtime, and night-wakings — with zero learning curve and calm certainty
- **Method**: **Live Playwright walkthrough** at 390×844 signed in as `enric@graavia.com` on a real baby (Júlia, 2mo), in **both light (afternoon) and night (dark) themes**, plus the full sign-out → onboarding create-baby flow. Every finding was then **grounded in source (`file:line`) and adversarially confirmed/refuted by a 16-agent verification pass.**
- **Evidence**: 25 screenshots in [docs/audits/key-flows/shots/](shots/)
- **Rubric**: graded against [.context/core/prd.md](../../../.context/core/prd.md), [.context/guidelines/brand_guidelines.md](../../../.context/guidelines/brand_guidelines.md), [.context/reference/lessons.md](../../../.context/reference/lessons.md), and [.context/guidelines/design_critique.md](../../../.context/guidelines/design_critique.md)

> **Implementation status (2026-06-22, branch `ux/key-flows-mvp-fixes`):**
> - **MVP set — KF-01, KF-02, KF-05** — implemented + verified live (shots [26](shots/26-fix-kf01-quickactions-2tile.png)–[28](shots/28-fix-kf02-dob-empty-next-disabled.png)). Commit `80b4a7d`.
> - **Task Group C — KF-03, KF-04, KF-08** (prediction correctness) — implemented; build + lint green. Commit `a778865`. Validated against a seeded realistic week (see below): the 9-month-old's day renders a coherent 2-nap plan with no phantom third nap and no nap-after-bedtime (KF-08), and an active night shows no nap ghost (KF-03). KF-04's mid-day "NAP NOW" path is gated to fire only when overtired *and* a nap still fits before bedtime, so it correctly stays out near/after bedtime (couldn't be shown at the test clock of ~20:30; logic verified by code + the gate behaving in the past-bedtime state).
> - Remaining P1/P2 items (KF-06, KF-07, KF-09–KF-16) are still open.
>
> **Algorithm exercise (2026-06-22):** repurposed the test baby to **Àgata (9-month-old girl)** on `enric@graavia.com` (one-owned-baby constraint, KF-11), cleared prior test logs, and seeded a realistic week — 7 nights (~19:00→07:00, 3 with night-wakings) + 14 naps (2/day). The algorithm reached a stable 2-nap "Optimised" profile: Today shows a learned bedtime + "Expected wake at 07:26", Trends shows Night 83% / Nap 17% with consistent ~1h15 naps. **KF-13 (empty-Today greeting "Good morning")** re-confirmed live during the cold-start. Àgata is currently left with tonight's bedtime active.

> **Test data note:** This audit created throwaway entries on Júlia (a "Wake up 06:00", last night's "Night sleep 10h", a 2-min "Nap 1"). I deleted the active test night and cleared the onboarding draft, but those three benign entries remain — delete them at leisure. No new accounts were created.

---

## 0. Reading this report (design-critique lens)

Per [design_critique.md](../../../.context/guidelines/design_critique.md), findings are judged **successful / unsuccessful relative to stated goals** (decision-replacement, 3am usability, no-judgement, calm-over-clever), not "good/bad", and **fidelity is separated from quality**. The visual *fidelity* of these flows is genuinely high — the matte palette, spring sheets, and night theme are AAA-level. Most findings below are *quality* gaps (goal-achievement), not polish.

The prediction layer (naps/bedtime) is a **probabilistic system wrapped in deterministic UI**. Three findings (KF-03, KF-04, KF-08) are where that deterministic surface presents the model's output as certain when it is contradictory or silent — exactly the place the guideline says to flag. They're framed as bets, with the rough conditions under which each surfaces.

---

## 1. Scenario & flows

Five flows were walked end-to-end in the live app:

1. **Create a baby** — both paths: the new-user **onboarding** (Welcome → name → DOB → your name → relationship → account) and the existing-owner path (My Babies → Baby detail).
2. **Log a wake-up** — both the empty-state QuickAction "Wake Up" and the canonical "end an active sleep" WakeUpSheet.
3. **Log a nap** — start an active nap, observe the live timer, then end it.
4. **Log a bedtime** — QuickAction "Bedtime" (active night) and the auto **MissingBedtimeModal** forgiveness path.
5. **Add night-wakings** — pause/resume an active night, edit the recorded waking's time + duration, verify persistence, delete.

---

## 2. What's working well (document the good)

These are **successful** against the product goals and should be protected in any refactor:

- **The active-sleep WakeUpSheet** ([shots/11](shots/11-wakeup-sheet-proper.png)) — sunrise icon, big editable time, "just now", ±1 min nudge, one prominent confirm. Textbook decision-replacement and 3am-friendly.
- **Night-waking pause/resume model** ([shots/16](shots/16-night-waking-paused.png)–[18](shots/18-night-waking-edit-fields.png)) — "Paused" hero state, recorded cards with storm-cloud count badge, editable start + duration, **persists across reopen**, collapses to a "Tap to view · 1 night waking · 20min" summary, deletable. Comprehensive and robust.
- **MissingBedtimeModal** ([shots/02](shots/02-today-empty-missing-bedtime-modal.png)) — a strong, calm forgiveness path ("Select which night you forgot… we'll help you add it") with a date picker and a clear "Start a new day" escape.
- **Onboarding 1–5** ([shots/20](shots/20-onboarding-1-welcome.png)–[22](shots/22-onboarding-5-relationship.png)) — personalised ("When was **Aria** born?"), progress bar, Next-disabled-until-complete, pre-selected "Mum" default, and a **draft persisted to localStorage** (verified: `baby-sleep-tracker-onboarding-draft`). Calm, value-first copy ("No fuss").
- **QuickActionSheet adapts** ([shots/10](shots/10-quickaction-active-wakeonly.png)) — collapses to a single "Wake Up" when a sleep is active. Solid/dashed cards cleanly separate logged vs predicted.
- **Night (dark) theme** ([shots/24](shots/24-today-night-theme.png)) — deep navy, desaturated sage/periwinkle/parchment, readable contrast. The primary 3am scenario lands.

---

## 3. Step-by-step walkthrough

### Flow 1 — Create a baby

**Step 1 – Onboarding DOB defaults to *today*, and Next is already enabled.** ([shots/21](shots/21-onboarding-3-dob-prefilled-today.png)) `defaultDraft()` sets `babyDob: formatDate(new Date())` ([OnboardingFlow.tsx:66](../../../src/components/Onboarding/OnboardingFlow.tsx#L66)) with the comment "Default to today; user can change"; `canProceed` is satisfied because `validateDateOfBirth` treats today as valid ([dateUtils.ts:57-58](../../../src/utils/dateUtils.ts#L57)). A parent can tap straight through → a **"born today" baby** → the youngest 45-min wake-window bracket → wrong suggestions. This is a **regression against the project's own decision** ([lessons.md §11.18](../../../.context/reference/lessons.md#L389): "Baby DOB defaults to empty string so the user must explicitly pick a date"). *Why it matters:* age is the single input that drives every prediction; silently-wrong age erodes the "accuracy felt emotionally" trust the PRD names as core. → **KF-02**

**Step 2 – The account step loses its chrome.** Steps 1–5 show "Step N of 6" + a back arrow; the final account step early-returns before the stepper row ([OnboardingFlow.tsx:153](../../../src/components/Onboarding/OnboardingFlow.tsx#L153)) and renders `SignUpForm`, which has no `onBack` prop ([SignUpForm.tsx:10-18](../../../src/components/Auth/SignUpForm.tsx#L10)). The only off-ramp is "Sign In" (sideways, not back), so there's **no way to return and fix the name/relationship** before creating the account. The pattern already exists — `LoginForm` accepts `onBack` and renders a floating back button — it's just not passed to `SignUpForm`. → **KF-07**

**Step 3 – Existing owners can't add a second baby.** My Babies ([shots/03](shots/03-my-babies.png)) shows owned (Júlia) + shared (Ferran) but no add-baby affordance; it's gated behind `{!profile && hasAnyBabies}` ([MyBabiesView.tsx:327](../../../src/components/Profile/MyBabiesView.tsx#L327)). This is **intended**, not a missing button: the owned baby *is* the user's `profiles` row (1:1, keyed by `user.id`, written via upsert-on-id — [useBabyProfile.ts:203-222](../../../src/hooks/useBabyProfile.ts#L203)). But the plural title "Baby profiles" + gallery layout over-promise multi-baby support that the data model doesn't deliver for owned babies. → **KF-11**

**Step 4 – Baby detail edit is clean.** ([shots/04](shots/04-baby-detail-edit.png)) Avatar picker, Name, native DOB, Gender, Save-disabled-until-dirty, Measures, Share, Delete. No issues; the delete-confirmation `alertdialog` ([shots/19](shots/19-delete-confirm.png)) is correct.

**Step 5 – SubViewHeader subtitle clips under the back button.** ([shots/03](shots/03-my-babies.png)) The header centers title/subtitle with an `absolute left-0` back button and **no reserved horizontal padding** ([SubViewHeader.tsx:18-33](../../../src/components/Profile/SubViewHeader.tsx#L18)); the real production subtitle "Select which baby you want to see sleep logs for" runs under the button at 390px (worse in Spanish). → **KF-12**

### Flow 2 — Log a wake-up

**Step 1 – "Wake Up" with no active sleep is a dead-end.** ([shots/06](shots/06-wakeup-no-active-deadend.png)) The QuickActionSheet shows "Wake Up" unconditionally when nothing is active ([QuickActionSheet.tsx:88](../../../src/components/QuickActionSheet.tsx#L88)). Tapping it opens a sheet pre-filled **yesterday 20:00 → now** ([SleepEntrySheet.tsx:172](../../../src/components/SleepEntrySheet.tsx#L172) start default `'20:00'`; :372 end = now), producing "21h 41min long", tripping the >14h hard block ([:505-510](../../../src/components/SleepEntrySheet.tsx#L505)) and **disabling Save** ([:1369](../../../src/components/SleepEntrySheet.tsx#L1369)). The math means this trips for **any wake-up logged after ~10am** — most waking hours. The screen opens *already in an error state* with no hint that editing the start time is the fix. *Why it matters:* this is the exact sleep-deprived user the product exists for, and a primary action opens into a disabled-Save error — the opposite of decision-replacement and no-judgement. → **KF-01**

**Step 2 – The error is red and clinical.** "Night sleep exceeds 14 hours" renders in `var(--danger-color)` ([SleepEntrySheet.tsx:1029-1030](../../../src/components/SleepEntrySheet.tsx#L1029)) = `#DC2626` in light themes ([index.css:140](../../../src/index.css#L140)). [PRD §4.2](../../../.context/core/prd.md#L67) reserves red "strictly for destructive confirmations" and asks for empathetic copy. An amber "soft-warn" lane already exists in the same component (`var(--wake-color)`) — the hard-block branch just routes to red. → **KF-09**

**Step 3 – "Wake Up" opens a "Night sleep" sheet.** The tile is parchment + sunrise; the resulting sheet flips to moon + periwinkle + "Night sleep" heading ([SleepEntrySheet.tsx:796,918,924](../../../src/components/SleepEntrySheet.tsx#L796)) with no acknowledgement of the wake-up intent. Mental-model discontinuity. → **KF-10**

**Step 4 – The canonical wake-up is excellent.** ([shots/11](shots/11-wakeup-sheet-proper.png)) Ending an *active* sleep opens the focused WakeUpSheet. This is the model the empty-state path should aspire to. ✅

### Flow 3 — Log a nap

**Step 1 – Active nap UX is strong.** ([shots/08](shots/08-nap-sheet-active.png), [shots/09](shots/09-today-active-nap.png)) Sage cloud + Play; Today shows "Napping / 1m / Expected wake at 18:44", solid active card vs dashed ghosts, jargon-free "Short Nap". ✅

**Step 2 – A 2-minute nap saves with no sanity check.** Only zero-duration is blocked ([SleepEntrySheet.tsx:494](../../../src/components/SleepEntrySheet.tsx#L494)); all nap validation is upper-bound. A tiny mistap is consumed by `getShortNapCompensation` ([dateUtils.ts:833](../../../src/utils/dateUtils.ts#L833), <30min → 20% wake-window penalty), materially skewing the next prediction. → **KF-16**

**Step 3 – A predicted nap ends *after* the predicted bedtime.** ([shots/12](shots/12-today-nap-bedtime-overlap.png)) Timeline showed "Short Nap 21:17 — 21:37" above "Bedtime 21:30". `predictDaySchedule` can inject a late rescue catnap ([dateUtils.ts:1336-1356](../../../src/utils/dateUtils.ts#L1336)) and there's no reconciliation ensuring bedtime ≥ last nap end; the timeline render has no guard either ([TodayView.tsx:742,769](../../../src/components/TodayView.tsx#L742)). Contradictory plan = broken decision-replacement. *Bet:* surfaces mainly with a late catnap + clamped bedtime (transition-age or odd data); not the golden path, but zero defense exists and it reproduced organically. → **KF-08**

### Flow 4 — Log a bedtime

**Step 1 – Bedtime start = now.** ([shots/13](shots/13-bedtime-sheet.png)) Reasonable when tapped at bedtime; unlike the wake-up path it pre-fills only the start, so no validation error.

**Step 2 – A predicted nap persists *during* active night sleep.** ([shots/14](shots/14-today-active-night.png)) With an active night running, the timeline still showed "Short Nap 21:17 — 21:37". The bedtime card got the lesson-1.3 guard `!(activeSleep && activeSleep.type === 'night')` ([TodayView.tsx:742](../../../src/components/TodayView.tsx#L742)), but **the nap render block never did** ([:760-761](../../../src/components/TodayView.tsx#L760)); for `type==='night'`, `hasActiveNap` is false so future naps still pass. Telling a parent to start a nap while the baby is down for the night directly contradicts night-first. → **KF-03**

**Step 3 – A long-awake baby gets no nap guidance.** ([shots/07](shots/07-today-after-wake.png)) With a morning wake logged and no naps ("Awake for 11h 43m"), Today showed **only a bedtime** — no "nap now"/overtired cue. Overdue naps >60min are silently dropped ([TodayView.tsx:25,297-303](../../../src/components/TodayView.tsx#L297)), so `isBedtimeNext` wins. Violates [lessons.md §1.4](../../../.context/reference/lessons.md#L35) ("never silently discard overdue predictions… show it as 'now'"). This is decision-*support* (a quiet "Awake for 11h 43m" line) at the moment decision-*replacement* matters most. → **KF-04**

**Step 4 – Greeting is wrong on empty Today.** Heading read "Good morning" at 17:41 while Profile correctly read "Good afternoon". `TodayView` hardcodes `t('today.goodMorning')` ([TodayView.tsx:573](../../../src/components/TodayView.tsx#L573)) while `ProfileMenu` computes the hour ([ProfileMenu.tsx:91-94](../../../src/components/Profile/ProfileMenu.tsx#L91)). The `goodAfternoon`/`goodEvening` keys already exist, unused. → **KF-13**

### Flow 5 — Add night-wakings

**Step 1 – Two unlabeled, identical periwinkle circles.** ([shots/15](shots/15-edit-night-entry.png), [shots/16](shots/16-night-waking-paused.png)) For an active night, the only controls are a pause button (aria "Night waking") and a stop button (aria "Save"/end) — same color, same circle, same `w-14 h-14`, **no visible text** ([SleepEntrySheet.tsx:1341-1390](../../../src/components/SleepEntrySheet.tsx#L1341)). "Stop" means *end the night* (hard to undo) sitting visually indistinct beside the benign "log a waking". At 3am, glance-distinguishable labels matter. (Not a WCAG-A failure — aria-labels are correct — hence P1 not P0.) → **KF-05**

**Step 2 – Logging a *past* waking is awkward.** The global "Night waking" FAB only appears while a night is active ([App.tsx:139](../../../src/App.tsx#L139)) and captures *now* ([:367](../../../src/App.tsx#L367)). The retrospective branch exists ([App.tsx:370](../../../src/App.tsx#L370)) but is unreachable from the FAB. The only working path for "baby woke at 2am for 20m, logged next morning" is: open the completed entry → tap ⋯ to expand → "Add night waking +" (which **fabricates a midpoint time + 1–5min duration**, [SleepEntrySheet.tsx:655-667](../../../src/components/SleepEntrySheet.tsx#L655)) → correct both fields. → **KF-06**

**Step 3 – "Sleeping…" shows while a waking is open.** ([shots/16](shots/16-night-waking-paused.png)) `getRelativeDateLabel` returns "Sleeping…" for any active entry with no end, ignoring `activePauseStart` ([SleepEntrySheet.tsx:232](../../../src/components/SleepEntrySheet.tsx#L232)), so it renders simultaneously with the "Night waking" status line. The baby is awake; the label says asleep. → **KF-14**

**Step 4 – Editing + persistence are solid.** ([shots/17](shots/17-night-waking-recorded.png), [shots/18](shots/18-night-waking-edit-fields.png)) Editable start + duration; 20min survived reopen. ✅

**Cross-cutting – emoji chips.** The qualitative chips render literal OS color emoji at `text-2xl` (⏳😢🛏🤱🚼🚗🎠😟😐😊, [SleepEntrySheet.tsx:67-113,289](../../../src/components/SleepEntrySheet.tsx#L67)). [brand_guidelines.md:262](../../../.context/guidelines/brand_guidelines.md#L262) lists "Emoji style" under **Avoid**; the rest of the app uses rounded-line SVGs. "Upset"/"Bad mood" labels also lean evaluative vs the non-judgemental voice. → **KF-15**

---

## 4. Findings

### 4.1 Frictions
- **Wake Up dead-end (KF-01)** — the single highest-friction moment: a primary action opens into a disabled-Save error for most of the day.
- **Buried/real-time-only night-waking logging (KF-06)** — the common "log it next morning" case is a 4-step treasure hunt with a wrong default time.
- **Ambiguous active-night controls (KF-05)** — "end the night" and "log a waking" are visually indistinguishable.
- **Onboarding DOB skip (KF-02)** — frictionless path to wrong data.
- **No nap guidance when overtired (KF-04)** — the app goes quiet exactly when the parent most needs a "do this now".

### 4.2 Inconsistencies

| Area | What differs | Expected uniform behavior |
|---|---|---|
| Greeting | Empty-Today hardcodes "Good morning"; Profile is hour-based | Both use the same time-of-day computation |
| "Wake Up" entry point | No active sleep → full "Night sleep" error sheet; active sleep → focused WakeUpSheet | Wake Up always reads/looks like a wake-up |
| Validation color | Hard-block errors use red; soft warnings use amber | Normal-flow validation stays amber (red reserved for destructive) — [PRD §4.2](../../../.context/core/prd.md#L67) |
| Onboarding chrome | Steps 1–5 have back + step counter; account step has neither | Back affordance present on every step |
| Active-night status | "Sleeping…" and "Night waking" shown together | One unambiguous current-state label |
| Icon language | Qualitative chips use OS emoji; rest of app uses line-SVG | Line-SVG everywhere |
| Prediction guard | Bedtime card suppressed during active night; nap cards not | Both suppressed during active night |

### 4.3 Dependencies
- **KF-10** (wake-aware sheet) and **KF-01** (don't open a failing sheet) touch the same wake-up entry point — design them together.
- **KF-03 / KF-04 / KF-08** all live in the `TodayView` prediction memo + `dateUtils` schedule; fix as one prediction-correctness pass to avoid churn.
- **KF-09** (error color) is a prerequisite cleanup that also improves KF-01's recovered state.
- **KF-11** is the only item that may need a **schema change** (or a product decision to stay single-owned-baby); everything else is component-level.

*Mobile-web parity: skipped — there is no shipped native app to compare against yet (an iOS rebuild is planned but not live).*

---

## 5. Improvements

No **P0** found: no security/XSS, no WCAG-A failures, nothing breaks for an entire segment. The wake-up dead-end is recoverable by editing the time, so it's P1, not P0.

### 5.1 P1 — Important (significant UX gaps / wrong data)

| ID | Issue | Location | Fix | Impact | Effort |
|---|---|---|---|---|---|
| KF-01 | "Wake Up" with no active sleep → night sleep 20:00→now → >14h error → Save disabled (dead-end most of the day) | `QuickActionSheet.tsx:88,102-117`; `App.tsx:480-510`; `SleepEntrySheet.tsx:167-173,371,505-510,1369` | **Preferred:** hide the Wake Up tile when no sleep is active (route "forgot last night" to the existing `MissingBedtimeModal`). **Or:** when `defaultEndTimeToNow` + night, default start to ~11h before now so the sheet opens valid | High | Low |
| KF-02 | Onboarding DOB pre-fills today + Next enabled → "born today" baby → wrong wake-windows (regression vs lessons §11.18) | `Onboarding/OnboardingFlow.tsx:66,89,188-191` | Set `babyDob: ''` in `defaultDraft()` and the restore fallback; `canProceed` already blocks empty → Next disabled until picked (2-line change) | Medium (data→accuracy) | Low |
| KF-03 | Predicted nap shown during active night sleep | `TodayView.tsx:760-761` (and memo `:261`) | Mirror the lesson-1.3 guard on the nap block; cleaner: early-return `predictions: []` in the nap memo when `activeSleep?.type==='night'` | High | Low |
| KF-04 | Overdue naps >60min silently dropped → no nap/overtired guidance for a long-awake baby (violates lessons §1.4) | `TodayView.tsx:25,297-303,362` | After the loop, if no future/within-60 nap and baby is past `wakeWindows.max`, push one "NAP NOW" overdue card (`time: now`, `isOverdue`) gated on awake-minutes | High | Medium |
| KF-05 | Active-night controls are two identical unlabeled periwinkle circles (waking vs end) | `SleepEntrySheet.tsx:1341-1390` | Add a small text caption under each ("Night waking" / "End night"); optionally differentiate the end button visually | High | Low |
| KF-06 | No first-class way to log a *past* night waking (FAB active-only; editor button buried + fabricates time) | `App.tsx:139,367,370`; `SleepEntrySheet.tsx:638,1204` | Un-gate the FAB for a recent completed night (wire the existing `:370` branch) and focus the start-time input on the new card instead of a midpoint default | Medium | Low |
| KF-07 | Onboarding account step drops back button + step counter; can't go back to fix name/relationship | `Onboarding/OnboardingFlow.tsx:153,198`; `Auth/SignUpForm.tsx:10-18` | Add `onBack?` to `SignUpForm` and render a floating `BackButton` (pattern already in `LoginForm`); pass `onBack={goBack}` | Medium | Low |
| KF-08 | Prediction can emit a nap that ends after bedtime | `dateUtils.ts:1444-1473,1715-1776`; `TodayView.tsx:742,769` | In `predictDaySchedule`, clamp `bedtime ≥ last nap end` (or drop a nap whose end exceeds the bedtime ceiling); belt-and-suspenders guard in the nap render | Medium | Low |

### 5.2 P2 — Nice to have (polish, tone, hygiene)

| ID | Issue | Location | Fix | Impact | Effort |
|---|---|---|---|---|---|
| KF-09 | Red, clinical validation error ("Night sleep exceeds 14 hours") violates "no red / empathetic errors" | `SleepEntrySheet.tsx:507,1029-1035`; `index.css:140`; `en.json:508` | Route normal-flow errors to `var(--wake-color)` (amber lane already exists); soften copy ("That's a very long night — double-check the times?") in en/es/ca | Medium | Low |
| KF-10 | "Wake Up" tile opens a moon/periwinkle "Night sleep" sheet | `App.tsx:501-508`; `SleepEntrySheet.tsx:796,918,924` | When `logWakeUpMode`, set a wake-themed heading + sunrise icon + `var(--wake-color)` (keep entry type `night`) | Medium | Low |
| KF-11 | "Baby profiles" (plural) + gallery imply multi-baby, but owners can't add a second (1:1 `profiles` row) | `MyBabiesView.tsx:327`; `useBabyProfile.ts:203-222`; `supabase.ts:13` | **Low-effort:** align copy to the single-owned model (don't over-promise). **Or product call:** real multi-baby = schema change (separate `babies` table) before flipping the UI conditional | Medium | High |
| KF-12 | SubViewHeader subtitle clipped under absolute back button (worse in ES) | `Profile/SubViewHeader.tsx:18-33` | Add `px-12` to the centered container (reserves the 44px button zone) or `max-w` the text so it wraps | Low | Low |
| KF-13 | Empty-Today greeting hardcoded "Good morning" | `TodayView.tsx:573`; `ProfileMenu.tsx:91-94` | Compute greeting from in-scope `now` using existing `goodAfternoon`/`goodEvening` keys (same `<12/<18/else` thresholds as Profile) | Low | Low |
| KF-14 | "Sleeping…" shown while a night waking is open | `SleepEntrySheet.tsx:232,462,987-995` | Pass `!!activePauseStart` into `getRelativeDateLabel`; return `''` (or "Awake") while paused so the "Night waking" line is the single source of truth | Medium | Low |
| KF-15 | Qualitative chips use OS color emoji (clash w/ matte palette + "not playful" brand); "Upset"/"Bad mood" evaluative | `SleepEntrySheet.tsx:67-113,289`; `brand_guidelines.md:262` | Replace emoji with rounded-line SVGs (`icon` → `ReactNode`, `currentColor`); soften labels ("Fussy"/"Unsettled") | Medium | Medium |
| KF-16 | No lower-bound warning for implausibly short naps (2-min accepted; skews predictions) | `SleepEntrySheet.tsx:494-512`; `dateUtils.ts:833` | Add a soft amber warning for naps <~5min (Save stays enabled — respect no-judgement) | Medium | Low |

### Task Groups

**Task Group A — Wake-up flow integrity (KF-01, KF-10, KF-09)**
**Depends on:** nothing · **Files:** `QuickActionSheet.tsx`, `App.tsx`, `SleepEntrySheet.tsx`, `index.css`, locales
1. Gate the Wake Up tile / route forgotten-bedtime to `MissingBedtimeModal` (KF-01)
2. Make the sheet wake-aware (heading/icon/color) for the kept case (KF-10)
3. Re-color + soften normal-flow validation (KF-09)

**Task Group B — Onboarding create-baby (KF-02, KF-07)**
**Depends on:** nothing · **Files:** `Onboarding/OnboardingFlow.tsx`, `Auth/SignUpForm.tsx`
1. DOB default empty + Next disabled (KF-02)
2. Restore back button on the account step (KF-07)

**Task Group C — Today prediction correctness (KF-03, KF-04, KF-08)**
**Depends on:** nothing · **Files:** `TodayView.tsx`, `utils/dateUtils.ts`
1. Suppress nap predictions during active night (KF-03)
2. "NAP NOW" fallback for overtired/long-awake (KF-04)
3. Clamp bedtime ≥ last nap end (KF-08)

**Task Group D — Night-waking clarity (KF-05, KF-06, KF-14)**
**Depends on:** A (shares `SleepEntrySheet.tsx`) · **Files:** `SleepEntrySheet.tsx`, `App.tsx`
1. Label the active-night controls (KF-05)
2. First-class retrospective waking (KF-06)
3. Paused-aware status label (KF-14)

**Task Group E — Polish & brand (KF-11 copy, KF-12, KF-13, KF-15, KF-16)**
**Depends on:** nothing · **Files:** misc components + locales

### Execution order

```
Group A ── start immediately ─┐
Group B ── start immediately  │ (independent files)
Group C ── start immediately  │
Group A ───────────────────────► Group D (shares SleepEntrySheet.tsx — sequence after A)
Group E ── start anytime (low risk)
```

**Minimum viable improvement:** **Group A + KF-02 + KF-05.** They are the highest-impact, lowest-effort items and hit the exact 3am sleep-deprived parent the product is built for: stop the wake-up dead-end, stop creating wrong-age babies, and make the night-waking buttons legible. All are confirmed (≥0.92 confidence) and Low effort.

---

## 6. Debrief

### Key problems
- **The wake-up entry point fails its own user (KF-01).** A primary action opens straight into a disabled-Save red error for most of the day, recoverable only by editing a pre-filled wrong time. Root cause: a hard-coded `20:00` default start + end=now, with the Wake Up tile shown when nothing is asleep.
- **The prediction layer presents contradictions as certainty (KF-03/04/08).** A deterministic timeline shows a nap during night sleep, a nap ending after bedtime, and silence when a baby is overtired. The model is fine; the UI lacks the reconciliation/guard layer that the project's own lessons (§1.3/§1.4) already established for sibling cases.
- **Night-waking logging is built for real-time only (KF-05/06).** The pause/resume model is excellent live, but the controls are ambiguous and the (more common) next-morning retrospective case is buried behind a fabricated-time editor.
- **Onboarding can capture wrong data with no friction (KF-02).** The one input that drives every prediction defaults to "today" and can be skipped.

### Highest-impact improvements
- **KF-01** unblocks the most-used 3am action — biggest felt improvement for the lowest effort.
- **KF-04 + KF-03** restore decision-replacement on Today: always tell the parent what to do next, and never tell them something contradictory.
- **KF-02** protects prediction accuracy at the source — cheap, and it stops a whole class of "the app is wrong about my baby" trust damage.

### Risk if nothing changes
- **Trust erosion at the worst moment.** The PRD says accuracy is "felt emotionally." A dead-ended wake-up, a "start a nap" prompt during night sleep, and a born-today baby all read as "this app doesn't understand my night" — precisely when the parent is least able to forgive it.
- **Silent data drift.** Skippable DOB + unwarned 2-min naps quietly degrade predictions, which compounds the trust risk above.
- **Hidden model uncertainty.** Per [design_critique.md](../../../.context/guidelines/design_critique.md), the deterministic timeline currently hides the probabilistic layer's contradictions instead of surfacing or resolving them — the long-term resilience cost is users learning to distrust the plan.

### Suggested next tests
1. Ship Group A + KF-02 + KF-05, then re-run this same Playwright walkthrough at a morning, midday, and 3am clock to confirm the wake-up and prediction states read correctly across the circadian themes.
2. A quick "log last night" usability pass with 2–3 real parents on the night-waking retrospective flow (KF-06) to confirm the un-gated FAB matches their mental model.
