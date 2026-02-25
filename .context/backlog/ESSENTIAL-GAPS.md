# Essential Gaps — Pending Only

**Purpose:** What’s still missing for the product. Done items live in `.context/progress.txt` and `.context/logs/`. Resolved bugs and patterns live in `.context/lessons.md`.

**Last updated:** 2026-02-24

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

Gaps i millores prioritzades del motor de predicció. Referència tècnica: `.context/docs/TODAY_VIEW_PREDICTION_SYSTEM.md` i `lessons.md` §1.

**Implemented (2026-02-24):** Bedtime window constraint — if projected bedtime would be before `config.bedtime.earliest` (e.g. 16:30), simulation adds one rescue catnap for 2–3 nap ages so bedtime falls in [earliest, latest]; `calculateDynamicBedtime` floors result to earliest when we don't add a nap (e.g. 1‑nap toddler). See `lessons.md` §1.7 and `.context/docs/BEDTIME_WINDOW_RESEARCH_AND_SCENARIOS.md`.

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
