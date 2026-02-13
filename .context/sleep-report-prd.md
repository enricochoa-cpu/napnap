# Sleep Report — Product Requirements Document (PRD)

**Feature:** Narrative sleep report with section blocks (“drafts”), triggered from Stats.  
**Last updated:** 2026-02-13

---

## 1. Purpose and goals

- Give the user a **narrative summary** of their baby’s sleep over a chosen period so they understand “where we’re at” and what to do next.
- Keep the same **decision-replacement** and **non-judgemental** tone as the rest of the app: gentle friend, no scores/grades, no blame.
- Report is **generated on demand** from existing data (rule-based, no LLM in v1). No backend persistence for v1.

---

## 2. Scope

### In scope for v1

- **Entry point:** A single primary button in the **Stats tab**: “Generate your report”.
- **Flow:** On tap, the report is computed for the **current Stats date range** (or default last 7 days) and shown in a **report sub-view** within the Stats tab. A “Back to trends” control returns the user to the Stats charts. No new tab; no bottom sheet for the report (Option 1 from the flow design).
- **Report sections (section blocks, non-editable):**
  - **Overview** — Who (baby name, age), period (date range), one line of context.
  - **Summary** — Totals in a compact data table (see Summary table below) plus optional short prose.
  - **Bedtime & wake times** — Feedback on typical times or variation (templates + conditions).
  - **Patterns we’re seeing** — Week-over-week, nap count, wake windows (templates + conditions).
  - **What to try** — 1–3 gentle, actionable recommendations (see §5 and Appendix A; content informed by research).
- **Empty/low-data state:** A single, empathetic line (e.g. “Log a few more days of sleep to see your first report”) with the same tone.
- **Content generation:** Rule-based only: compute aggregates and flags, then select and fill pre-written templates. No LLM, no external API in v1.

### Out of scope for v1

- Saving or listing past reports.
- Editable “draft” sections.
- Share / export (PDF, copy, etc.).
- AI-generated prose.

---

## 3. Flow and UI

1. **Stats tab**
   - Existing: date range picker, insight tag, summary cards, charts.
   - **Add:** A primary button **“Generate your report”** (e.g. under the date row or as the first card).

2. **On “Generate your report”**
   - Compute report for the current Stats date range (or default last 7 days).
   - **Switch to report sub-view:** Stats view shows a scrollable, full-height report screen instead of charts. No new tab; state is e.g. `statsSubView: 'charts' | 'report'`.

3. **Report screen**
   - **Header:** “Sleep report” + date range + optional baby name.
   - **Sections (in order):** Overview → Summary (with data table) → Bedtime & wake times → Patterns we’re seeing → What to try.
   - **Footer / navigation:** “Back to trends” returns to Stats charts (`statsSubView = 'charts'`).

4. **Consistency**
   - Same circadian theme and design system as the rest of the app (e.g. `--nap-color`, `--night-color`, `--wake-color`, card styles). Report is readable at a glance and one-handed friendly where possible.

---

## 4. Data and content sources

All report content is derived **client-side** from existing data:

- **Profile/context:** Baby name, age (`calculateAge(profile.dateOfBirth)`), report date range. From `useBabyProfile` and the chosen range.
- **Summary (totals):** Same logic as Stats: `rangeData` / `averages` (avg total sleep, avg naps per day, avg nap duration, avg night sleep). Reuse StatsView-style logic.
- **Bedtime & wake-up:** Stats already has wake-up distribution; add bedtime spread (min/max or std dev). Conditional copy (e.g. “Most nights between X–Y” vs “Bedtime varies — that’s normal while we’re learning”).
- **Patterns:** From `getDailySummary`, `extractWakeWindowsFromEntries`, `getRecommendedSchedule` (dateUtils): week-over-week comparison, nap count range, average wake window. Pre-written templates + conditions.
- **What to try:** Selected from a **curated tip pool** based on computed flags (see §5). No LLM in v1.

**Generation mechanism:** Compute numbers and flags → select which templates/tips apply → fill placeholders (baby name, numbers, dates) → render. Instant, offline-capable.

---

## 5. “What to try” — research and depth

The “What to try” section must go **beyond generic encouragement** and offer **concrete, evidence-informed suggestions** that feel relevant to the baby’s age and the family’s current pattern. Research is completed; the tip pool and trigger logic are in Appendix A.

### 5.1 Research summary (details in Appendix A)

- **Identify 1–2 trusted sources** (e.g. evidence-based sleep guidelines, paediatric sleep frameworks) that align with our 0–18 month audience and non-judgemental stance.
- **Map recommendations to:**
  - **Baby age bands** (e.g. 0–3 mo, 3–6 mo, 6–12 mo, 12–18 mo).
  - **Data signals we can compute** (e.g. bedtime spread, wake window length, nap count, night length, consistency of wake-up, week-over-week change).
- **Define a small set of “What to try” tip types**, e.g.:
  - Consistency (bedtime/wake-up).
  - Logging quality (e.g. log wake-up for better predictions).
  - Age-appropriate expectations (e.g. nap count, wake windows).
  - Gentle next steps when we detect patterns (e.g. “You’re close to a stable bedtime window — small tweaks can help.”).
- **Write 1–3 sentences per tip** in the app’s voice: gentle friend, decision replacement, no judgement. Each tip must be **actionable** (“try X”) not vague (“sleep is important”).

### 5.2 Implementation (research done — see Appendix A)

- **Tip pool:** A fixed set of tips (see Appendix A table), each with trigger conditions, optional age band, and copy with placeholders.
- **Selection logic:** Pick 1–3 tips by priority and relevance (deterministic). Prefer tips whose triggers match report data; respect age band when applicable. Never show conflicting or overwhelming advice.
- **Placeholders:** Tips can include `{babyName}`, `{avgWakeWindow}`, etc., filled from report data.

**See Appendix A** for the full tip pool, trigger conditions, and selection rules. Appendix A is the single source of truth.

---

## 6. Summary data table (in report)

The Summary section **must** include the following data table so the user has the key numbers at a glance. Keep this table in the report UI.

| Metric              | Value / description |
|---------------------|---------------------|
| **Avg total sleep** | e.g. 12h 20m (from `averages.avgTotal`) |
| **Avg naps per day**| e.g. 2.4 (from `averages.avgNapCount`) |
| **Avg nap length**  | e.g. 1h 15m (from `averages.avgNapDuration`) |
| **Avg night sleep** | e.g. 9h 30m (from `averages.avgNight`) |

Presentation can be compact (e.g. a small card or table using existing design tokens). Same numbers as Stats summary cards for consistency.

---

## 7. Technical approach (high level)

- **New component:** `SleepReportView` — receives `entries`, `profile`, `onBack`; computes last-30-day range internally; renders Overview, Summary, Bedtime & wake, Patterns, What to try (icon bullets, same line height). Location: `src/components/SleepReportView.tsx`.
- **Data:** Reuse Stats’ `rangeData` / `averages` logic; add a small hook or util (e.g. `useReportData(entries, startDate, endDate)`) that returns aggregates, bedtime/wake stats, week-over-week and pattern flags for templates.
- **Navigation:** StatsView holds internal state (e.g. `showReport: boolean` or `statsSubView: 'charts' | 'report'`). “Generate your report” sets report mode; “Back to trends” clears it. No change to App-level tab state.
- **No backend in v1:** Report is generated entirely on the client. No storage of reports, no Edge Function, no AI.

---

## 8. Optional later steps

The following are **not** in v1 but are listed for roadmap and alignment:

- **Editable “drafts” (B):** Allow the user to edit one or more sections (e.g. “What to try”) in local state or simple persistence, and optionally “finalise” or copy the report.
- **Share / export:** “Copy report” (plain text or formatted) or “Share” (e.g. PDF, link) once the report structure is stable and we have a clear sharing story.
- **AI-generated sentences:** Optional Edge Function that takes structured report data (averages, flags, baby name, date range) and calls an LLM to return short narrative snippets for some sections, with **rule-based fallbacks** if the service fails or is slow. Tone and safety must remain consistent (gentle friend, no judgement).
- **Report history:** Persist generated reports (e.g. by date range and generated-at timestamp) so the user can revisit “last week’s report” without regenerating.
- **Deeper “What to try”:** After the first research pass, iterate with more age-specific or pattern-specific tips, or tie tips to calendar events (e.g. “before a trip”) if we add that context later.

---

## 9. Summary (reference table)

| Question               | Decision |
|------------------------|----------|
| What are “drafts”?     | Section blocks of the report (Overview, Summary, Bedtime/wake, Patterns, What to try). Start non-editable. |
| Where is the button?   | Stats tab: “Generate your report”. |
| What happens on click? | Report is computed for last 30 days of data and shown in report sub-view. “Back to trends” returns to Stats charts. |
| What’s in the report?  | Overview, Summary (with data table), bedtime/wake feedback, pattern detection, 1–3 “What to try” tips; all from existing data and rules. |
| “What to try” depth   | Research completed (Appendix A): evidence-based, age- and pattern-aware tip pool with trigger conditions; ready for implementation. |
| Tone                   | Non-judgemental, gentle friend; decision replacement where applicable. |
| Tech                   | New `SleepReportView` + report data hook/util; no backend, no LLM in v1. |

---

## 10. Success criteria

- User can open the Stats tab, tap “Generate your report”, and see a coherent narrative report for the selected date range.
- User can return to Stats charts with one tap (“Back to trends”).
- Report feels consistent with the rest of the app (tone, visuals, data).
- “What to try” is informed by research and feels actionable and relevant, not generic.
- No external services or LLM required for v1; report works offline once data is loaded.

---

## Implementation note (as built 2026-02-13)

- **Report window:** Last **30 days** only (not Stats date range). Rationale: babies vary a lot; parents need a precise, recent picture.
- **Button copy:** "Generate report (last 30 days)" so expectations are explicit.
- **Overview:** Warm tone, no dates; subtitle "Based on the last 30 days of logs." Header subtitle "Last 30 days".
- **Sections:** Bedtime & wake times, Patterns, What to try use **icon bullets** (moon, sun, pattern, check) and **same line height** (`leading-relaxed`, `space-y-2`) across all bullet lists. Bullet accent: `--night-color`.
- **Age display:** Baby age uses `calculateAge()` in `dateUtils.ts`; "days" part is days since last month anniversary (see lessons.md re bug fix).

---

## Appendix A — "What to try" research summary and tip pool

### A.1 Trusted sources consulted

| Source | Type | Use |
|--------|------|-----|
| AAP / HealthyChildren.org | Medical (pediatrics) | Sleep safety, sleep duration, bedtime routines |
| Sleep Foundation | Medically reviewed, citation-backed | Wake windows by age, newborn sleep, nap counts |
| NHS (UK) | National health service | Helping baby sleep, routines |
| Mayo Clinic | Medical | Baby sleep habits, good sleep habits in infants |
| Cleveland Clinic | Medical | Wake windows by age, bedtime routines |
| AASM (American Academy of Sleep Medicine) | Professional society | Behavioral interventions = STANDARD for bedtime problems; consistent routines |
| Taking Cara Babies | High-trust parent resource | Wake windows, nap transitions (3→2, 2→1), overtiredness |
| What to Expect | Parent resource | Bedtime routine steps |
| BabyCenter, Pampers, Baby Sleep Site | Parent / expert | Overtiredness, wake windows, nap transitions |
| Peer-reviewed | AASM guideline, NSF consensus, Pediatrics | Sleep duration recommendations, routine benefits |

### A.2 Age-band reference (for tip logic and copy)

**Wake windows (Sleep Foundation, Cleveland Clinic, Taking Cara Babies):**

| Age | Wake window length |
|-----|--------------------|
| 0–1 month | 0.5–1.5 hours |
| 1–4 months | 1–3 hours |
| 5–7 months | 1.5–4.5 hours |
| 7–10 months | 1.5–6 hours |
| 10–12 months | 3–7.5 hours |

**Sleep needs (AASM / NSF consensus):**

| Age | Total sleep per 24 h (incl. naps) |
|-----|-----------------------------------|
| 0–3 months | 14–17 hours |
| 4–12 months | 12–16 hours |
| 1–2 years | 11–14 hours |

**Nap transitions:** 3→2 naps typically 6.5–8 months; 2→1 nap typically 13–18 months. Before that, expecting 2–3 naps (or more for young infants) is age-appropriate.

### A.3 Evidence used for tip themes

- **Consistent bedtime routine:** AASM rates behavioral interventions (including consistent sleep routines) as STANDARD (high-certainty) for bedtime problems and night wakings. Research shows children with a nightly routine sleep longer, fall asleep faster, and have fewer night wakings; benefits are dose-dependent (every night > several nights > occasional).
- **Avoiding overtiredness:** Overtiredness triggers stress hormones (cortisol/adrenaline), making it harder to fall and stay asleep. Put baby down before they are too tired; watch for early cues (eye rubbing, yawning, less engagement). Newborns often need sleep within ~45–90 minutes of waking.
- **Logging wake-up:** Accurate wake-up time improves prediction quality (app-specific; aligns with “decision replacement”).
- **Consistent bedtime window:** Same-time routines help set circadian rhythm; variation is normal early on but narrowing the window can help patterns emerge.

### A.4 Tip pool (final list for implementation)

Each tip has: **ID**, **Copy** (with placeholders), **Trigger conditions** (flags we compute), **Age band** (optional filter). Selection: pick 1–3 tips by priority; prefer triggers that match; respect age band. Placeholders: `{babyName}`, `{avgWakeWindow}`, `{earliestBedtime}`, `{latestBedtime}` as needed.

| ID | Copy | Trigger conditions | Age band |
|----|------|--------------------|----------|
| T1 | Sticking close to today's suggested bedtime will help the algorithm tune in. | Always eligible (default) | All |
| T2 | Logging when {babyName} wakes up helps keep predictions accurate — try tapping wake up when they get out of bed. | `wakeUpOftenMissing` | All |
| T3 | A more consistent bedtime window can help patterns emerge. Try aiming for within about 30 minutes of the same time most nights. | `bedtimeVeryVariable` | 4+ mo |
| T4 | A few more days of logging will make the report and predictions more personal. | `!hasEnoughData` (e.g. fewer than 3 days with data) | All |
| T5 | Putting {babyName} down before they're overtired often helps — watch for early tired cues like eye rubbing or zoning out, and offer sleep before fussiness. | `avgWakeWindow` often above age-typical max (see A.2) or frequent short/fragmented naps | 0–12 mo |
| T6 | This week sleep looked a bit lighter; one-off days are normal. Keeping a consistent bedtime can help. | `sleepDecreasedThisWeek` | All |
| T7 | Nice consistency this period. Keeping the same bedtime window will help the algorithm stay in sync. | `bedtimeStable` (low spread) | All |
| T8 | For {babyName}'s age, wake windows around {avgWakeWindow} are in a typical range — the app's suggested nap times are tuned to that. | `hasEnoughData` and we show avg wake window in report | All |
| T9 | Most babies this age do well with 2–3 naps. If you're seeing a lot of resistance at nap time, a small shift in timing might help — the app's suggestions adapt as you log. | Nap count inconsistent or often outside 2–3; age 6–15 mo | 6–15 mo |
| T10 | A short wind-down before bed (e.g. dim lights, same steps each night) can help {babyName} recognise bedtime. | `bedtimeVeryVariable` or new user (few nights logged) | 4+ mo |

**Priority order when multiple triggers match:** Prefer T2 (logging) and T4 (need more data) when relevant, then T3/T5 (consistency / overtiredness), then T6/T7 (week-over-week / stability), then T8/T9/T10 (age-appropriate / routine). Cap at 3 tips; never show conflicting advice (e.g. don’t show both T3 and T7).
