# Product Requirements Document (PRD)

## 1. North Star

> **To replace sleep-deprived parental anxiety with calm, definitive guidance.**

The app does not present data for parents to interpret. It tells them what to do: "Your baby should nap at 13:42." Every design decision, every interaction, every pixel must serve this single principle: **decision replacement, not decision support.**

---

## 2. Target User

### Primary Persona: The Anxious First-Time Parent

| Attribute | Detail |
|-----------|--------|
| **Who** | First-time parent (mum or dad), baby aged 0–18 months |
| **Emotional state on open** | Anxious, uncertain, exhausted |
| **Core need** | Reassurance that they are doing it right |
| **Context of use** | One-handed, in the dark, at 3AM, often while holding/feeding the baby |
| **Technical skill** | Varies widely — the app must require zero learning curve |

### What They Fear
- Making the wrong decision about when baby should sleep
- Feeling judged for irregular schedules or "bad" data
- Complex interfaces that demand cognitive effort they don't have

### What They Crave
- A single, confident answer: "Next nap at 13:42"
- Feeling that someone (the app) has their back
- Calm visual reassurance — the opposite of a clinical dashboard

---

## 3. Killer Feature

### Zero Learning Curve

The app must be so intuitive that a sleep-deprived parent can use it perfectly on their very first session, with zero onboarding, no tooltips, and no help text.

This means:
- Every action must be self-evident from its visual design
- The most common task (logging sleep) must be reachable in one tap
- The interface must be scannable, not readable — glanceable information at arm's length
- New features must never add friction to existing flows

**Competitive framing:** Most baby trackers (Huckleberry, Baby Tracker) require onboarding tutorials and multi-step configuration. We don't. A parent downloads the app and is productive in seconds.

---

## 4. Non-Negotiable Constraints

### 4.1 3AM Usability
- All interactive elements: minimum **56px** touch targets (buttons already enforce this)
- **One-handed, thumb-zone operation** — primary actions anchored to bottom of screen
- **Low-saturation, calming colour palette** — no bright whites, no alerting reds in normal flow
- Circadian theme system: night mode is the default, morning/afternoon are daytime-only
- Large typography — body at 17px, hero countdown at 56px, legible at arm's length in darkness

### 4.2 No Judgement
- **Tone of voice**: gentle friend, never clinical instructor
- Allow retrospective editing without penalty — parents can fix/adjust times freely
- Never show "streaks," "scores," or "grades" that imply failure
- Error states must be empathetic: "Let's try that again" not "Invalid input"
- No red warning colours in normal UI — reserve `--danger-color` strictly for destructive confirmations (delete account, remove access)
- The algorithm's calibration states (Learning → Calibrating → Optimised) must frame the app as "still learning" rather than framing the parent as "not logging enough"

---

## 5. Success Metric

### Calm Confidence

> After using the app, the parent feels **calmer and more confident** about their baby's sleep schedule.

This is an emotional outcome, not a quantitative metric. We measure it through design quality:

| Signal | How We Verify |
|--------|---------------|
| The parent trusts the prediction | Predictions are presented as confident statements, not suggestions |
| The parent doesn't second-guess | No overwhelming data — minimal, at-a-glance display |
| The parent feels cared for | Calming visual design, empathetic copy, no visual noise |
| The parent returns daily | The app feels pleasant to open, not like a chore |

### Supporting Metrics (secondary)
- Log a sleep event in **under 3 seconds** from app open (tap [+] → tap action)
- Complete any core task without help text or onboarding
- The app looks and feels indistinguishable from a premium paid product (Napper-grade)

---

## 6. Current Pain Points

### 6.1 Today View (Dashboard)
**Status: Needs polish**

The main dashboard — the very first thing the parent sees — does not yet feel premium enough. Specific concerns:
- Predictions could be presented more elegantly
- The visual hierarchy between active state, predictions, and completed events needs refinement
- The "hero" moment (the primary piece of information the parent came for) should be unmistakable and calming

### 6.3 History View (Date Navigation)
**Status: Redesigned (2026-02-10)**

The date navigation was upgraded from a basic prev/next arrow picker to a Napper-style week strip + calendar modal:
- Swipeable week strip with entry dots for context
- Tappable date header opens full calendar bottom sheet
- Baby age displayed as subtitle
- Premium feel matching the rest of the app

### 6.2 Profile Section
**Status: Significantly improved (2026-02-09)**

The profile/settings area has been redesigned with:
- AAA-grade card gallery with `active:brightness` and `active:scale` feedback
- Full-screen `BabyDetailView` for editing (profile + sharing in one flow)
- Shared `SubViewHeader` and `ListRow` components for visual consistency
- AnimatePresence slide transitions between all sub-views
- Light-mode compliant glassmorphism (no hardcoded `white/` tokens)

**Remaining concerns:**
- Delete Account button is still a TODO (does nothing)
- Delete Baby functionality shows confirmation but doesn't actually delete

---

## 7. Product Principles

These guide every decision when requirements are ambiguous:

1. **Tell, don't ask.** Replace decisions, don't support them. "Nap at 13:42" beats "Your baby has been awake for 2h 15m."
2. **Calm over clever.** If a feature feels impressive but adds anxiety, cut it.
3. **One glance, one answer.** Every screen should have one obvious focal point.
4. **Forgive everything.** Let parents edit, delete, and adjust without friction or judgement.
5. **Night-first design.** Design for 3AM in the dark, then verify it works in daylight — not the reverse.

---

## 8. Scope Boundaries

### In Scope (Current Product)
- Sleep tracking (naps + night sleep)
- Predictive nap/bedtime suggestions based on baby's age and logged history
- Multi-caregiver sharing (caregiver + viewer roles)
- Sleep statistics with visual charts
- Circadian-adaptive theme (morning/afternoon/night)

### Out of Scope (Not Planned)
- Feeding tracking, nappy tracking, or general baby journaling
- Social features (community, forums, comparing with other babies)
- Wearable device integrations
- Paid subscription or monetisation features (for now)
- Push notifications (for now)
