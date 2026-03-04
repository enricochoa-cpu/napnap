# UX/UI Audit Instructions

## Purpose

This folder centralizes **UX/UI audits** for Baby Sleep Tracker (Today view, Sleep Log, Stats, Profile, onboarding, auth, measures, sharing, and any related flows). Each audit should:

- Expose **frictions** and **risks** in real user flows.
- Surface **inconsistencies** and **broken abstractions** between UX and the domain model.
- Produce **clear, actionable improvements** that can be turned into tickets.

Keep audits **practical and concise**: they should help a developer or designer quickly understand what to fix and why.

---

## What every audit MUST cover

Each audit, regardless of scope, must explicitly address at least these sections:

- **1. Frictions**
  - Steps that feel slow, confusing, or heavier than necessary.
  - Too many taps, modals, or data-entry steps.
  - Missing defaults or autofill where the app clearly knows the data (e.g. current time, selected baby, locale).

- **2. Inconsistencies**
  - Same concept named differently in different places (labels, tooltips, API vs UI, i18n keys).
  - Different patterns or components used for the same type of interaction (e.g. sheets vs modals for similar actions).
  - Behaviour that changes between screens without a good reason (e.g. different validation rules for similar fields, different empty states).

- **3. Dependencies**
  - Preconditions the user must satisfy before the flow works (e.g. must have a baby profile, must be shared with a baby, feature/state like “published” or “calibrated”).
  - Hidden dependencies discovered only through errors (e.g. you only learn you need a baby when save fails).
  - Coupling between flows (e.g. must create a baby in Profile before Today shows predictions).

- **4. Corner cases**
  - Empty states (no babies, first time use, no sleep entries, no measures, no pending invites).
  - Error states: validation errors, network/API errors, collision modals, Supabase/Edge Function errors.
  - Edge inputs: many entries, very long names/notes, missing translations (en/es/ca), 0 values, min/max values, dates in the past, future dates.

- **5. Entity relationships**
  - How the UI exposes (or hides) the actual domain model (babies, sleep entries, measures, shares, invitations).
  - Where the parent’s mental model might diverge from the data model (e.g. “one baby” vs multi-baby, “night sleep” vs overnight entry spanning two calendar days).
  - Any place where a relationship is implicit but not visible (e.g. baby ↔ sleep entries, owner vs shared-with).

- **6. Improvements**
  - Concrete, implementable suggestions grouped by priority:
    - **P0**: Must-fix for correctness or severe UX pain (e.g. wrong prediction, impossible flow, emotional safety violation).
    - **P1**: Important improvements with clear value (e.g. fewer taps, clearer copy, consistent patterns).
    - **P2**: Nice-to-have polish, copy, micro-interactions.
  - Where relevant, propose **alternative flows** (e.g. wizard, inline edit, batch operations) instead of only small tweaks.

You can add extra sections if the context needs it (e.g. **Accessibility**, **Performance**, **Localization**).

---

## How to run an audit

Each audit is tied to a **specific user goal** and **persona** (e.g. “Sleep-deprived parent logging a nap at 3AM” or “Caregiver accepting an invite to a shared baby”). Work strictly from that perspective.

### 1. Define scope and goal

- Short description of the flow (e.g. “Log a nap from the Today view using the FAB” or “Add a second baby and switch between them”).
- Persona (role, knowledge level, typical constraints — see PRD: first-time parent, caregiver, returning user).
- Entry point(s) (where the user starts: tab, FAB, header avatar, profile menu, etc.).
- Exit criteria (what it means to have successfully completed the flow).

### 2. Walk the flow end-to-end

For the chosen scenario:

- Navigate the UI **exactly as the persona would** (including one-handed, thumb-zone, night-mode assumptions where relevant).
- For each step/screen:
  - Note what the user **sees** (copy, layout, loading/empty/error states).
  - Note what the user **does** (taps, key steps, decisions).
  - Capture any **questions** the user might have (“What does this mean?”, “Why is this disabled?”, “Which baby is selected?”).

Keep raw notes chronological; structure them afterwards.

### 3. Capture findings by category

After the walkthrough, re-structure the notes into the sections above:

- Move each observation under **Frictions**, **Inconsistencies**, **Dependencies**, **Corner cases**, **Entity relationships**, or **Improvements**.
- It’s OK if the same issue appears in more than one category (e.g. a confusing dependency is both a friction and a dependency).

### 4. Debrief and synthesize

End each audit with a short debrief:

- 3–7 bullet points summarizing the **most important problems**.
- 3–7 bullet points with the **highest-impact improvements**.
- Optional: risks if nothing is changed (support load, misconfigurations, user trust, emotional safety, drop-off).

This debrief should be readable on its own by someone who won’t read the full walkthrough.

---

## Output format for each audit

Create one markdown file per audit in this folder, named:

- `YYYY-MM-DD-<area>-<short-topic>-audit.md`

**Area** should be one of: `today` | `sleep-log` | `stats` | `profile` | `onboarding` | `auth` | `measures` | `sharing` | `other`.

**Examples:**

- `2026-03-04-today-quick-action-flow-audit.md`
- `2026-03-04-onboarding-new-user-audit.md`
- `2026-03-04-profile-invite-accept-audit.md`
- `2026-03-04-sleep-log-edit-entry-audit.md`

Each file should roughly follow this structure:

```markdown
# <Area> – <Audit topic>

- **Date**: YYYY-MM-DD
- **Area**: today | sleep-log | stats | profile | onboarding | auth | measures | sharing | other
- **Persona**: role + short description (e.g. first-time parent, caregiver)
- **User goal**: one-sentence description of what they are trying to do

## 1. Scenario & flow
- Entry point(s)
- Happy path description (short)
- Any important variations you tested

## 2. Step-by-step walkthrough
For each key step/screen:
- **Step X – Screen / action**
  - What the user sees
  - What the user does
  - Questions/doubts
  - Notes (screenshots, references to components/routes if needed)

## 3. Findings

### 3.1 Frictions
- …

### 3.2 Inconsistencies
- …

### 3.3 Dependencies
- …

### 3.4 Corner cases
- …

### 3.5 Entity relationships
- …

### 3.6 Other observations (optional)
- …

## 4. Improvements

### 4.1 P0 – Must fix
- …

### 4.2 P1 – Important
- …

### 4.3 P2 – Nice to have
- …

## 5. Debrief
- 3–7 bullets summarizing key problems
- 3–7 bullets summarizing key recommendations
```

---

## Notes for future audits

- Prefer **specific examples** (“When I tap Wake Up with an active night entry, I see X”) over generic statements.
- Link to **screens, routes, or components** when it clarifies where something happens (e.g. `TodayView`, `QuickActionSheet`, `SleepEntrySheet`, profile subviews). See `.context/reference/app_flow.md` for navigation and component names.
- When you identify an issue that clearly maps to a ticket, note it in a way that is easy to copy into your backlog (problem, impact, suggested fix).
- Keep audits **agnostic of implementation details** unless they directly affect UX (e.g. slow queries, missing indexes, API limitations).
- Align with project principles: **decision replacement**, **3AM usability**, **no judgement**, **emotional safety**. Call out any finding that conflicts with these (see `CLAUDE.md`, `.context/core/prd.md`, `product-research/ux-ui-findings.md`).

Use this document as the baseline. Individual audits can extend it, but should not contradict it.
