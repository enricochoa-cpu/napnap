# Backlog

**Purpose:** Pending work for the product. Done items live in `.context/operational/progress.txt` and `.context/logs/`. Resolved bugs and patterns live in `.context/reference/lessons.md`.

**Last updated:** 2026-03-14

---

## 1. Profiles table semantics (current)

**Clarification:** The `profiles` table is **one row per user** (`id` = `auth.users.id`), not one row per baby. The name is misleading: each row holds both **user-level** and **baby-level** data.

| Stored in `profiles` | Meaning |
|----------------------|--------|
| `user_name`, `user_role`, `locale` | **User** preferences (app language is per user, not per baby). |
| `baby_name`, `baby_date_of_birth`, `baby_gender`, etc. | The **owner’s primary baby** (exactly one set of baby fields per row). |

**Implication:** Today, **one user = one “own” baby** in the DB. A second child (e.g. sibling) cannot be stored as a second “own” baby — there is no second row or second set of baby columns. Sharing (`baby_shares`) is for “see another person’s baby,” not “my second baby.”

**Documentation:** Table and column comments were added in `supabase/migrations/20260220000000_add_profiles_locale.sql`. When adding a proper multi-baby model, `profiles` should hold only user data and a separate `babies` table should hold one row per baby per owner (see §3 below).

---

## 2. Onboarding — Optional draft persistence

| Gap | UI | Backend |
|-----|----|---------|
| Optional: persist draft across refresh | No | Optional: localStorage (or similar) so refresh doesn’t lose onboarding progress (sessionStorage is tab-scoped). |

**Summary:** “Has completed onboarding” is done (localStorage flag + AuthGuard so returning users go straight to Login). Optional remaining: persist onboarding draft across refresh.

---

## 3. Supabase base schema (reproducibility)

| Gap | Notes |
|-----|--------|
| Initial schema migration | Only `multi_user_sharing.sql` (and later migrations) are in repo. `profiles` and `sleep_entries` are assumed in Supabase but not created by any migration. Add an **initial migration** that creates `profiles` and `sleep_entries` (and their RLS) so the project is self-contained and reproducible. |

---

## 4. Multi-baby (2+ babies per account, e.g. siblings)

**Current state:** UI has “Add your baby”, active-baby switch, and scoped Today/History/Stats. Backend is still **1 user = 1 profile row = 1 own baby** (see §1). Sleep entries are tied to `user_id`; there is no `baby_id`.

| Gap | UI | Backend |
|-----|----|---------|
| Add second (or more) baby | Partial (card + sheet exist; createProfile only works for first baby) | New schema: `babies` table + `profiles` user-only; `sleep_entries` and `baby_shares` reference `baby_id`. |
| Switch active baby | Done | — |
| Scope entries/filters per baby | Done | — |

**To do — Database**

1. **New `babies` table:** `id` (PK), `owner_id` (FK → auth.users), `name`, `date_of_birth`, `gender`, `weight`, `height`, `avatar_url`, `created_at`. One user can have many rows.
2. **`profiles`:** Keep for **user-only** data (`user_name`, `user_role`, `locale`); one row per user. Remove or migrate baby columns into `babies` (with backward-compat migration if needed).
3. **`sleep_entries`:** Add `baby_id` (FK → babies.id). Migrate existing: set `baby_id` from current user’s single baby (or equivalent) where possible.
4. **`baby_shares`:** Reference `baby_id` (babies.id) instead of `baby_owner_id` (profiles.id). Update RLS and app.
5. **App:** useBabyProfile, useSleepEntries, createProfile/updateProfile/deleteProfile, and all RLS updated for `babies` table and new FKs.

**Summary:** Implement the database changes first, then align app code. See lessons.md §3.1 (update both owner and shared queries when adding columns) and §3.2 (upsert for profile row) when touching profiles.

---

## 5. Invitation emails in production

| Gap | Notes |
|-----|--------|
| Resend domain verification | Operational: verify your own domain in Resend so invitation emails don’t use `onboarding@resend.dev`. |

---

## 6. Prediction system (TodayView / dateUtils)

Gaps i millores prioritzades del motor de predicció. Referència tècnica: `.context/reference/docs/TODAY_VIEW_PREDICTION_SYSTEM.md` i `lessons.md` §1.

**Implemented (2026-02-24):** Bedtime window constraint — if projected bedtime would be before `config.bedtime.earliest` (e.g. 16:30), simulation adds one rescue catnap for 2–3 nap ages so bedtime falls in [earliest, latest]; `calculateDynamicBedtime` floors result to earliest when we don't add a nap (e.g. 1‑nap toddler). See `lessons.md` §1.7 and `.context/reference/docs/BEDTIME_WINDOW_RESEARCH_AND_SCENARIOS.md`.

### 6.1 Flexibilitat en el deute de son (bedtime)

| Aspecte | Detall |
|--------|--------|
| **Estat actual** | Si el nadó té dèficit de son diürn ≥ 30 min, l'algoritme només avança l'hora de dormir un **màxim de 20 minuts** (`BEDTIME_EARLIER_CAP_MINUTES`, `dateUtils.ts` ~1151). La fórmula és `min(20, deficit/2)` aplicada a la finestra final. |
| **Millora proposada** | Nudge dinàmic més agressiu en casos de deute extrem o migdiada sencera saltada: basar el límit en la finestra de vigília final realment suportable per edat (p.ex. no superar `config.wakeWindows.max` o un múltiple segons edat). |
| **Tradeoffs / riscos** | **Risc:** avançar massa el bedtime pot generar despertar molt matiner (e.g. 04:00) si el nadó no necessita tantes hores de nit. Cal mantenir un cap superior o una corba que no sigui lineal (més agressiu amb poca dada, més conservador amb deute molt gran). **Oportunitat:** el sistema ja té `totalDaytimeSleepMinutes` i `deficit`; afegir un tram de "deute extrem" (p.ex. ≥ 60 min o ≥ 1 migdiada equivalent) amb cap més alt (30–45 min) seria coherent amb la literatura (recovery bedtime). |
| **Prioritat** | Alta (impacte directe en UX i benestar; lògica aïllada a `calculateDynamicBedtime`). |

---

### 6.2 Gestió del salt de migdiades "overdue"

| Aspecte | Detall |
|--------|--------|
| **Estat actual** | Si la primera migdiada prevista porta **> 60 min** de retard (`OVERDUE_NAP_PERSISTENCE_MINUTES`, `TodayView.tsx` ~25), el sistema deixa de mostrar "NAP NOW" i tracta la migdiada com a **saltada**, ancorant la resta del dia en l'hora originalment prevista (sense preguntar l'usuari). |
| **Millora proposada** | Transició més suau: notificació o diàleg que pregunti si la migdiada s'ha produït (i no s'ha registrat) o si es vol recalcular la resta del dia segons l'estat de vigília actual (el nadó segueix despert, la pressió de son augmenta). |
| **Tradeoffs / riscos** | **Risc:** massa interrupcions (modals) poden cansar; el producte prioritza "decision replacement" i ús amb una mà. **Alternativa sense modal:** mantenir "NAP NOW" més temps (p.ex. 90 min) amb un indicador visual "migdiada molt en retard – considera registrar-la o saltar" i un botó discret "Recalcular dia" que reancori des de "ara". Així s'evita el canvi brusc sense obligar a un diàleg. |
| **Prioritat** | Mitjana (millora UX; dependència principalment de TodayView i còpia de text/flow). |

---

### 6.3 Unificació del doble càlcul de migdiades

| Aspecte | Detall |
|--------|--------|
| **Estat actual** | **Doble camí:** `simulateDay()` (dateUtils) decideix l'**estructura** del dia (quantes migdiades, tipus, compressió, bedtime en minuts des de mitjanit). `calculateSuggestedNapTimeWithMetadata()` decideix l'**hora de rellotge** de cada migdiada (amb blending 70/30, calibratge, confiança). TodayView crida `calculateAllNapWindows()` (que usa `simulateDay`) per la llista de finestres i després, per cada finestra, `calculateSuggestedNapTimeWithMetadata()` per l'hora real. |
| **Millora proposada** | Un sol motor de simulació que retorni tant l'estructura com els objectes de predicció amb metadades (confiança, calibratge, hora). Elimina possibles desajustos entre el "Hero" i la línia temporal i facilita el manteniment. |
| **Tradeoffs / riscos** | **Risc:** refactor gran; `simulateDay` actualment no coneix l'historial (wake windows apresos, duracions apreses). Unificar implica passar dades d'historial al motor o moure el blending dins del motor. **Recomanació:** fer-ho per fases: (1) que `simulateDay` retorni també "hora de rellotge" per cada nap (convertint minuts → Date amb la data del dia); (2) que TodayView només passi dates i consumi un únic flux; (3) integrar blending/calibratge dins del motor o en una capa única. Documentar bé el contracte per no reintroduir bugs de prioritat (lessons.md §1). |
| **Prioritat** | Alta (base per a 6.4, 6.5, 6.6 i per reduir bugs recurrents de prioritat/filtres). |

---

### 6.4 Refinament del blending 70/30 segons maduresa

| Aspecte | Detall |
|--------|--------|
| **Estat actual** | El pes és **fix:** 70% configuració estàndard + 30% historial apres (finestres de vigília i duracions de migdiada). Es aplica a `getProgressiveWakeWindow()` i `getLearnedNapDurationMinutes()`. No es distingeix entre fase "Learning" (poca dada) i "Optimized" (molta dada). El sistema ja exposa `determineCalibrationState()` i `getAlgorithmStatusTier()` ('learning' \| 'calibrating' \| 'optimized'). |
| **Millora proposada** | Pes dinàmic segons maduresa: p.ex. 90/10 (més config) al principi i 50/50 o més historial quan el sistema està "optimized". Això redueix variabilitat en fase de calibratge i aprofita millor l'historial quan n'hi ha prou. |
| **Tradeoffs / riscos** | **Risc:** si el pes de l'historial puja massa ràpid, un parell de dies atípics poden desviar les prediccions. Cal definir llindars (nombre d'entrades, variabilitat) i potser una corba gradual (no un salt 90/10 → 50/50). **Oportunitat:** reutilitzar els llindars de calibratge existents (`MIN_CALIBRATION_ENTRIES`, `MAX_ACCEPTABLE_STD_DEV_RATIO`) per decidir el ratio. |
| **Prioritat** | Mitjana (millora incremental de precisió; es pot implementar sobre l'API actual de blending). |

---

### 6.5 Resolució del límit "minuts des de mitjanit"

| Aspecte | Detall |
|--------|--------|
| **Estat actual** | La simulació interna (`simulateDay`, `calculateAllNapWindows`) treballa en **minuts des de la mitjanit** (0–1439). Les migdiades no solen creuar mitjanit, però el despertar nocturn o nadons amb horaris molt desplaçats podrien fer que intervals prop de 00:00 es tractessin incorrectament (e.g. 23:30 → 00:15). La persistència i la UI ja usen `Date` / ISO. |
| **Millora proposada** | Usar objectes `Date` (o instants UTC) en tota la cadena de simulació, com en la persistència, per evitar ambigüitats en dies que creuen mitjanit. |
| **Tradeoffs / riscos** | **Risc:** canvi de representació afecta `simulateDay`, `calculateAllNapWindows`, i tot el que consumeix `NapWindow` / `ProjectedNap`. Cal tests de regressió (incl. casos prop de mitjanit). **Benefici:** elimina un risc tècnic latent; facilita extensions (p.ex. suport a timezone explícit). Millor abordar-ho després d'unificar el motor (6.3) per no fer el refactor dues vegades. |
| **Prioritat** | Mitjana–alta (correctesa tècnica; recomanable després de 6.3). |

---

### 6.6 Ús del temps de vigília acumulat

| Aspecte | Detall |
|--------|--------|
| **Estat actual** | L'algoritme es basa en la **darrera activitat** i la **finestra de vigília progressiva** (first/mid/final). No es té en compte de forma explícita el **temps total despert durant el dia** per ajustar la darrera finestra abans de la nit. Un nadó amb migdiades molt fragmentades (moltes microsiestes) pot acumular més fatiga i necessitar un bedtime encara més d'hora del que prediu la fórmula elàstica estàndard. |
| **Millora proposada** | Incloure en el càlcul de bedtime un factor basat en vigília acumulada (p.ex. suma de intervals despert des del matí): si supera un llindar per edat, reduir la finestra final (bedtime una mica més d'hora) dins de caps segurs. |
| **Tradeoffs / riscos** | **Risc:** doble comptatge amb el deute de son (6.1): deute de son ja redueix la finestra final; vigília acumulada podria redundar o contradir. Cal definir si són dos eixos (son insuficient vs. temps despert excessiu) o un sol "estat de fatiga" que aglutini ambdós. **Recomanació:** implementar després de 6.1 i 6.3; unificar en una sola "fatiga del dia" (deute + vigília acumulada) amb un sol cap per no avançar el bedtime en excés. |
| **Prioritat** | Mitjana (millora de precisió; dependència conceptual de 6.1 i preferible amb motor unificat 6.3). |

---

## 7. Algorithm granularity — weekly newborn + monthly infant age brackets

**Current state:** `SLEEP_DEVELOPMENT_MAP` has 13 age brackets covering 0–24 months, with variable granularity (e.g. 0–1.5mo is one bracket, 3–4mo is another). Newborns (0–12 weeks) change rapidly but are covered by only 2 brackets.

**Done (2026-03-14):** Content pages — 17 public sleep guide pages at `/sleep-guides/:slug` (4 newborn + 10 infant + 3 toddler) with full SEO (meta tags, JSON-LD, BreadcrumbList, sitemap). See `docs/superpowers/specs/2026-03-14-sleep-guide-content-hub-design.md`.

**Still pending:** More granular `SLEEP_DEVELOPMENT_MAP` — weekly brackets for 0–12 weeks, monthly for 3–24 months. Improves prediction accuracy for the fastest-changing age range.

**What to do:**
1. Research wake windows, nap counts, and total sleep needs at weekly granularity for 0–12 weeks (cross-reference Huckleberry, AAP, peer-reviewed sleep science).
2. Expand `SLEEP_DEVELOPMENT_MAP` with finer brackets (weekly for newborns, monthly for 3–24mo).
3. Validate that `getSleepConfigForAge()` and prediction engine handle the increased resolution without regression.
4. Extend app's age range to 24 months (currently 0–18 months data, 18–24 exists but app scope says 0–18).

**Priority:** Medium-high (improves prediction quality for youngest babies — the segment with most anxious parents and highest app adoption).

**Dependencies:** Best done after 6.3 (unified simulation engine) to avoid double refactoring.

---

## 8. QA findings — SleepEntrySheet (2026-04-06)

Issues found during Playwright-driven QA of the add/edit sleep log modal. **Context:** This is a mobile-first SPA aiming for native-app feel — all fixes should use native-like patterns (haptic feedback, spring animations, iOS/Android-style controls).

### 8.1 Chip buttons missing `aria-pressed` state

| Aspect | Detail |
|--------|--------|
| **Current** | Onset, method, wake method, and wake mood chip buttons communicate selection only via CSS class changes. No `aria-pressed` or `aria-selected` attribute. |
| **Impact** | Screen readers (VoiceOver on iOS, TalkBack on Android) cannot tell which chips are selected. WCAG 4.1.2 violation. Critical for future native app accessibility compliance. |
| **Fix** | Add `aria-pressed={isSelected}` to all chip buttons. Also consider a subtle scale + haptic-style spring animation on toggle (like iOS selection feedback). |
| **Priority** | Medium (accessibility — required for App Store/Play Store compliance). |

### 8.2 "Despert des de fa" timer appears frozen

| Aspect | Detail |
|--------|--------|
| **Current** | The "Despert des de fa Xm" text in the TodayView hero card stayed at "7m" across several minutes of interaction. |
| **Impact** | On a native app, a frozen timer screams "this app is broken." Users expect real-time ticking. |
| **Fix** | Investigate whether the awake-since label uses the live `now` value or gets frozen by the ref snapshot logic. Ensure it ticks at least every 30s. |
| **Priority** | Medium (native apps never show stale timers). |

### 8.3 Playwright click timeouts on all app buttons

| Aspect | Detail |
|--------|--------|
| **Current** | Every Playwright `click()` via the native API times out after 5s. All clicks require `page.evaluate()` workaround. Likely caused by framer-motion drag handlers or touch event listeners intercepting pointer events. |
| **Impact** | Blocks automated E2E testing. Also signals that touch/pointer event handling may be fragile on real devices (e.g. accidental drag-to-dismiss when user taps a button). |
| **Fix** | Investigate which event listeners block pointer completion. Review `touch-action` CSS and framer-motion drag configs. Ensure buttons within draggable sheets have proper event isolation so taps feel instant and reliable on phones. |
| **Priority** | Medium (E2E automation + potential real-device tap reliability). |

---

## 9. QA findings — Pause & validation bugs (2026-04-06)

Issues found during Playwright-driven QA of the pause flow within SleepEntrySheet. **Context:** Pause editing is a one-handed, often nighttime operation — it must feel effortless and forgiving.

### 9.1 Pause validation stuck after editing duration

| Aspect | Detail |
|--------|--------|
| **Current** | When adding a pause and then editing the duration, the validation error "La pausa s'estén més enllà del final" persists even when the new duration is valid (e.g. 3min pause starting at 16:04 in a nap ending 16:15). The "Desar" button stays disabled. |
| **Impact** | **Blocker** — user cannot save a pause after editing its duration. Must delete and re-add. On a phone at 3AM this is rage-quit territory. |
| **Root cause** | Likely the validation runs on an old/stale duration value and doesn't recompute when the spinbutton changes. The pause header updates correctly ("16:04 · 3min") but the validation check uses a previous value. |
| **Priority** | High (blocks core pause editing flow). |

### 9.2 Negative "awake since" time in TodayView hero

| Aspect | Detail |
|--------|--------|
| **Current** | After ending a nap in the past (e.g. end time 16:15 when current time is ~16:12), the hero card shows "Despert des de fa -1h -3m" — negative awake duration. |
| **Impact** | On a native app, negative counters look like a critical bug. Destroys trust immediately. |
| **Fix** | Clamp awake-since to `max(0, now - lastSleepEnd)`. If end time is in the future, show "Dormint" with the active nap state instead of a negative counter. |
| **Priority** | Medium-high (trust-breaking visual bug). |

### 9.3 Nested `<button>` inside pause card header

| Aspect | Detail |
|--------|--------|
| **Current** | The pause card's collapsible header is a `<button>` that contains the delete `<button>` — invalid HTML nesting. React logs: "In HTML, `<button>` cannot be a descendant of `<button>`". |
| **Impact** | On phones, tap targets overlap — tapping delete may also toggle collapse. Native apps never nest tappable areas. |
| **Fix** | Restructure: use a `<div role="button" tabIndex={0}>` for the collapsible header, or move the delete button outside the toggle hit area (e.g. swipe-to-reveal like iOS list rows). |
| **Priority** | Medium (touch target reliability + accessibility). |

### 9.4 Default pause start time equals nap start time

| Aspect | Detail |
|--------|--------|
| **Current** | When clicking "Afegir pausa +", the new pause defaults to start=nap start time (e.g. 16:03) with 5min duration. For most use cases, a pause happens *during* the nap, not at the very start. |
| **Impact** | Extra taps on a phone at night. Every tap counts at 3AM. |
| **Fix** | Smart default: pause start = midpoint of nap (if completed) or current time (if active). If there are existing pauses, start after the last one ends. Minimise required edits to zero when possible. |
| **Priority** | Low-medium (UX polish — native apps predict what you need). |

---

## 10. Stats screen UX overhaul — "Warm data" (2026-04-06)

Findings from Playwright-driven visual audit of the Tendències (Stats) screen. Core problem: the screen **informs but doesn't comfort**. Data is cold, clinical, and provides no reassurance — directly contradicting the PRD's "calm confidence" north star. **Context:** Native health/baby apps (Apple Health, Huckleberry, Napper) wrap data in warm narrative. On a phone, this screen competes with those apps.

### 10.1 No reference ranges or "is this normal?" messaging

| Aspect | Detail |
|--------|--------|
| **Current** | Charts show raw data (averages, trends, distributions) with no age-appropriate reference. "Mitjana: 09:11" and "Mitjana: 20:40" are just numbers — parent has no idea if these are healthy. |
| **Impact** | **High** — Parents leave more anxious than before. Opposite of product goal. Native competitors (Huckleberry, Baby Tracker) show age-appropriate ranges. |
| **Fix** | Add healthy-range bands/zones to line charts (e.g. shaded green area for "typical wake time for 8-month-old"). Source ranges from `SLEEP_DEVELOPMENT_MAP`. Add a warm summary per chart: "Wake-up time is right on track for Ferran's age 🌟". |
| **Priority** | High (core product gap — table stakes for native baby apps). |

### 10.2 Data is cold — no narrative, no warmth

| Aspect | Detail |
|--------|--------|
| **Current** | Every card is chart + "Mitjana:" line. No encouraging micro-copy, no "gentle friend" tone, no insights. Subtitle is clinical. |
| **Impact** | **High** — Violates "gentle friend" persona. Native baby apps use warm language throughout. |
| **Fix** | Add interpretive layer: (1) warm subtitle ("Let's see how your little one is sleeping"), (2) per-section insight cards with native-style rounded cards and emoji ("Bedtimes have been consistent this week — great routine! 🌙"), (3) contextual tips on variability ("Bedtime varied by 45min — totally normal during growth spurts"). Style like iOS Health summaries. |
| **Priority** | High (brand + native-app parity). |

### 10.3 Today's incomplete data looks alarming

| Aspect | Detail |
|--------|--------|
| **Current** | In "Son diari" bar chart and "Tendència del son" area chart, today shows a tiny sliver / sharp drop because the day isn't over yet. |
| **Impact** | **Medium** — On a phone glance, this looks like "something went very wrong today." |
| **Fix** | Mark today's bar with a dashed outline + "in progress" pill badge (native-style). Or exclude today from trend calculations and show it separately as "Today so far." |
| **Priority** | Medium. |

### 10.4 HORARI DIARI needs mobile-optimised redesign

| Aspect | Detail |
|--------|--------|
| **Current** | Gantt-style daily schedule chart shows small colored dots. 6-item legend. No narrative. Dots are too small for comfortable phone reading. |
| **Impact** | **Medium** — Hard to decode on a 390px screen. A native app would use larger, more readable elements. |
| **Fix** | (1) Increase dot/bar size — minimum 8px diameter, ideally 12px, (2) add a one-line insight card above ("Routine is becoming more consistent"), (3) add subtle time-of-day background bands (morning/afternoon/evening), (4) consider tappable rows that expand to show detail (native list-style). |
| **Priority** | Medium. |

### 10.5 Date range picker needs native-style presets

| Aspect | Detail |
|--------|--------|
| **Current** | Max range is 15 days but UI shows no indication. No presets. Calendar picker works but requires multiple taps. The "7d" badge looks like a label, not interactive. |
| **Impact** | **Medium** — Native apps use segmented controls for quick range switching (7d / 14d / 30d). |
| **Fix** | (1) Replace the "7d" badge with a native-style segmented control (7d / 14d pill toggle), (2) auto-disable dates beyond max range in the calendar, (3) add a subtle "Max 15 days" hint. The segmented control should be the primary interaction; calendar picker secondary (for custom ranges). |
| **Priority** | Medium. |

### 10.6 Chip bar should be sticky with scroll affordance

| Aspect | Detail |
|--------|--------|
| **Current** | Section chips (Resum de son, Migdiades, Son nocturn, Creixement) scroll with the page. "Creixement" is off-screen on smaller phones. No visual hint that more chips exist. |
| **Impact** | **Low-medium** — Native apps use sticky tab bars. Scrolling up just to switch tabs feels like a web page, not an app. |
| **Fix** | (1) Make chip bar sticky (fixed below the date range picker while scrolling), (2) add a fade gradient on the trailing edge when chips overflow, (3) consider snap-scroll behaviour for the chip strip. |
| **Priority** | Low-medium (native-feel polish). |

### 10.7 Missing "Generate report" button

| Aspect | Detail |
|--------|--------|
| **Current** | Per architecture, there should be a "Generate report (last 30 days)" entry point opening SleepReportView. Not visible on any tab during the audit. |
| **Impact** | **Low-medium** — Feature exists in code but may be unreachable. |
| **Fix** | Verify whether it was removed or is hidden by a condition. Restore if missing — place it as a prominent CTA card at the bottom of "Resum de son" tab (native-style action card). |
| **Priority** | Low-medium. |

---

## 11. Baby profile edit — native polish (2026-04-06)

Findings from Playwright-driven QA of the baby profile edit flow (Profile → Els meus nadons → Baby detail). **Context:** This is a settings-style screen — should feel like iOS Settings or native profile editors.

### 11.1 No save confirmation feedback

| Aspect | Detail |
|--------|--------|
| **Current** | After tapping "Desar canvis", the button silently greys out. No toast, no animation, no haptic-style feedback. User must infer success from the header updating. |
| **Impact** | **Medium** — Native apps always confirm saves (iOS shows a checkmark animation, Android shows a Snackbar toast). Silent save feels broken. |
| **Fix** | Add a native-style toast/snackbar sliding up from the bottom: "Changes saved ✓" — auto-dismiss after 2s. Use framer-motion spring animation consistent with existing sheet transitions. |
| **Priority** | Medium (native-feel essential). |

### 11.2 No unsaved changes warning on back navigation

| Aspect | Detail |
|--------|--------|
| **Current** | If user edits fields and taps the back arrow without saving, changes are silently lost. No confirmation prompt. |
| **Impact** | **Medium** — Native apps show "Discard changes?" action sheet when navigating away from dirty forms. Silent data loss breaks trust. |
| **Fix** | Detect dirty form state. On back navigation, show a native-style bottom sheet: "You have unsaved changes" with "Discard" / "Keep editing" actions. |
| **Priority** | Medium (data safety). |

### 11.3 Header doesn't preview edits live

| Aspect | Detail |
|--------|--------|
| **Current** | The header still shows the old name and age while editing. Name changes only appear after save. |
| **Impact** | **Low** — Minor disconnect. Native profile editors sometimes preview live, sometimes don't. |
| **Fix** | Optional: bind header name to the form input value for a live-preview feel. Low effort, nice polish. |
| **Priority** | Low (polish). |

### 11.4 Avatar picker has no preview/crop step

| Aspect | Detail |
|--------|--------|
| **Current** | Tapping the avatar triggers the native file picker immediately. Selected image is uploaded and compressed (400x400 JPEG) with no preview, crop, or loading indicator. |
| **Impact** | **Low-medium** — Native apps typically show a crop circle overlay before confirming the avatar. Without it, user can't adjust framing. No loading state means the avatar just "pops" into place. |
| **Fix** | (1) Add a circular crop overlay after file selection (like WhatsApp/Instagram profile photo flow), (2) show a loading spinner on the avatar circle during upload. Consider this for a future polish pass. |
| **Priority** | Low (native polish — not blocking). |

---

## Quick reference (pending only)

| Item | UI | Backend |
|------|----|---------|
| Optional: onboarding draft across refresh | Missing | Optional |
| Base Supabase schema (profiles, sleep_entries) | N/A | Not in repo |
| Multi-baby (add 2+ own babies, e.g. siblings) | Partial | Schema + app |
| Invitation emails production | N/A | Resend domain |
| **Prediction (see §6)** | | |
| 6.1 Bedtime flexibility (sleep debt) | — | dateUtils |
| 6.2 Overdue nap / "saltada" UX | TodayView | — |
| 6.3 Unify double nap calculation | TodayView + dateUtils | — |
| 6.4 Dynamic 70/30 blending | — | dateUtils |
| 6.5 Minutes-from-midnight → Date | — | dateUtils |
| 6.6 Accumulated wake time | — | dateUtils |
| 7. Weekly newborn + monthly age brackets | — | dateUtils (SLEEP_DEVELOPMENT_MAP) |
| **QA — SleepEntrySheet (§8)** | | |
| 8.1 Chips missing `aria-pressed` | SleepEntrySheet | — |
| 8.2 Frozen "awake since" timer | TodayView | — |
| 8.3 Playwright click timeouts (touch events) | App-wide | — |
| **QA — Pause & validation bugs (§9)** | | |
| 9.1 Pause validation stuck after edit | SleepEntrySheet | — |
| 9.2 Negative "awake since" time | TodayView | — |
| 9.3 Nested `<button>` in pause card | SleepEntrySheet | — |
| 9.4 Pause default start = nap start | SleepEntrySheet | — |
| **Stats UX overhaul — native warm data (§10)** | | |
| 10.1 No reference ranges / "is this normal?" | StatsView | dateUtils (age ranges) |
| 10.2 Cold data — no narrative or warmth | StatsView | — |
| 10.3 Today's incomplete data looks alarming | StatsView (charts) | — |
| 10.4 HORARI DIARI too small for mobile | StatsView (Gantt) | — |
| 10.5 Date range needs native segmented control | StatsView (picker) | — |
| 10.6 Chip bar should be sticky | StatsView (nav) | — |
| 10.7 Missing "Generate report" button | StatsView | — |
| **Baby profile edit — native polish (§11)** | | |
| 11.1 No save confirmation toast | BabyDetailView | — |
| 11.2 No unsaved changes warning on back | BabyDetailView | — |
| 11.3 Header doesn't preview edits live | BabyDetailView | — |
| 11.4 Avatar picker: no crop/loading UI | BabyAvatarPicker | — |

---

## Suggested order of work

1. **Supabase base schema** — Initial migration for `profiles` and `sleep_entries` (and RLS).
2. **Multi-baby** — Only if required for launch: schema change first (babies table, profiles user-only), then app alignment.
3. **Production emails** — Resend domain verification when sending real invitation emails.

**Prediction system (§6) — recommended sequence**

1. **6.3 Unificació doble càlcul** — Un sol motor (estructura + hora + metadades). Base per a 6.4–6.6 i menys bugs de prioritat.
2. **6.1 Flexibilitat deute de son** — Cap més alt dinàmic per bedtime en deute extrem (impacte directe UX).
3. **6.5 Minuts des de mitjanit → Date** — Correctesa tècnica; fer després de 6.3 per no refactorar dues vegades.
4. **6.2 Overdue / salt de migdiades** — Transició suau o "Recalcular dia" sense modal excessiu.
5. **6.4 Blending dinàmic 70/30** — Pes segons maduresa (learning vs optimized); aprofita `getAlgorithmStatusTier`.
6. **6.6 Vigília acumulada** — Factor fatiga del dia; coordinar amb 6.1 (un sol "estat de fatiga" si és possible).
