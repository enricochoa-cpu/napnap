# UX/UI Audit Instructions

## Purpose

This folder centralizes **UX/UI audits** for PALC (backoffice, landing, mobile, and any related tools). Each audit should:
- Expose **frictions** and **risks** in real user flows.
- Surface **inconsistencies** and **broken abstractions** between UX and the domain model.
- Produce **clear, actionable improvements** that can be turned into tickets.

Keep audits **practical and concise**: they should help a developer or designer quickly understand what to fix and why.

---

## What every audit MUST cover

Each audit, regardless of scope, must explicitly address at least these sections:

- **1. Frictions**
  - Steps that feel slow, confusing, or heavier than necessary.
  - Too many clicks, modals, or data entry steps.
  - Missing defaults or autofill where the system clearly knows the data.

- **2. Inconsistencies**
  - Same concept named differently in different places (labels, tooltips, API vs UI, etc.).
  - Different patterns/components used for the same type of interaction.
  - Behaviour that changes between screens without a good reason (e.g. different validation rules for similar fields).

- **3. Dependencies**
  - Preconditions the user must satisfy before the flow works (entities that must exist, states like "published", roles/permissions, feature flags, etc.).
  - Hidden dependencies discovered only through errors (e.g. you only learn you need a TicketType when save fails).
  - Any coupling between flows (e.g. you must create X in screen A before you can proceed in screen B).

- **4. Corner cases**
  - Empty states (no data, first time use, no permissions).
  - Error states: validation errors, network/API errors, backoffice rules.
  - Edge inputs: many items, very long texts, no translations, 0 values, max/min values, dates in the past, etc.

- **5. Entity relationships**
  - How the UI exposes (or hides) the actual domain model relationships.
  - Where the user mental model might diverge from the data model.
  - Any place where a relationship is implicit but not visible (e.g. pivot tables, side effects).

- **6. Improvements**
  - Concrete, implementable suggestions grouped by priority:
    - **P0**: Must-fix for correctness or severe UX pain.
    - **P1**: Important improvements with clear value.
    - **P2**: Nice-to-have polish, copy, micro-interactions.
  - Where relevant, propose **alternative flows** (e.g. wizard, inline edit, batch operations) instead of just small tweaks.

You can add extra sections if the context needs it (e.g. Accessibility, Performance, Localization).

---

## How to run an audit

Each audit is tied to a **specific user goal** and **persona** (e.g. "Backoffice content manager adding packages to an Experience"). Work strictly from that perspective.

### 1. Define scope and goal

- Short description of the flow (e.g. "Add 2 experience packages to an existing Experience").
- Persona (role, knowledge level, typical constraints).
- Entry point(s) (where the user starts in the product).
- Exit criteria (what it means to have successfully completed the flow).

### 2. Walk the flow end-to-end

For the chosen scenario:
- Navigate the UI **exactly as the persona would**.
- For each step/screen:
  - Note what the user **sees** (copy, layout, states).
  - Note what the user **does** (clicks, key steps, decisions).
  - Capture any **questions** the user might have at that point ("What does this mean?", "Why is this disabled?").

Keep raw notes chronological; we’ll structure them afterwards.

### 3. Capture findings by category

After the walkthrough, re-structure the notes into the sections described above:
- Move each observation under **Frictions**, **Inconsistencies**, **Dependencies**, **Corner cases**, **Entity relationships**, or **Improvements**.
- It’s OK if the same issue appears in more than one category (e.g. a confusing dependency is both a friction and a dependency).

### 4. Debrief and synthesize

End each audit with a short debrief:
- 3–7 bullet points summarizing the **most important problems**.
- 3–7 bullet points with the **highest-impact improvements**.
- Optional: risks if nothing is changed (support load, misconfigurations, revenue impact, user trust, etc.).

This debrief should be readable on its own by someone who won’t go through all the detailed notes.

---

## Output format for each audit

Create one markdown file per audit in this folder, named like:

- `YYYY-MM-DD-<area>-<short-topic>-audit.md`
  - Examples:
    - `2026-03-04-backoffice-experience-packages-audit.md`
    - `2026-03-04-landing-booking-flow-audit.md`

Each file should roughly follow this structure:

```markdown
# <Area> – <Audit topic>

- **Date**: YYYY-MM-DD
- **Area**: backoffice | landing | mobile | other
- **Persona**: role + short description
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
  - Notes (screenshots, references to code/routes if needed)

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

- Prefer **specific examples** ("When I click X with Y configured, I see Z") over generic statements.
- Link to **screens, routes, or components** when it clarifies where something happens (backoffice path, Vue component, GraphQL operation, etc.).
- When you identify an issue that clearly maps to a ticket, note it in a way that is easy to copy into Jira (problem, impact, suggested fix).
- Keep audits **agnostic of implementation details** unless they directly affect UX (e.g. slow queries, missing indexes, API limitations).

Use this document as the baseline. Individual audits can extend it, but should not contradict it.

