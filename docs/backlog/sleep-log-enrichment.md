# Sleep Log Enrichment

> Pause on logs + Night waking + Qualitative information

## Overview

Three related features that deepen the existing sleep log without changing the app's core mental model. All three enrich `SleepEntry` — they don't introduce new event types.

**Key insight from the notes:** Pause and night waking are the **same underlying mechanism** (an interruption within a sleep session). In Napper, bedtime doesn't have "pause" — instead it has "night waking," which is functionally a pause labeled differently. We should unify them under one data model and surface them with context-appropriate labels.

---

## 1. Pause on Logs

### What the user wants
Users can add one or more pauses to an ongoing or completed nap/bedtime. Each pause has a start time and a duration. The net sleep time = total span minus sum of pauses.

### How Napper does it
- **Completed entry (edit mode):** User opens the entry dialog, drags it up or taps "..." to expand. An "Add pause +" button appears below the time span. Each pause shows as a collapsible card ("Pause 1 — 5m 00s") with expand arrow and delete (bin) icon. Expanded view: Start datetime picker + Duration picker (not end time).
- **Active entry (live):** Dialog shows a live counter (mm:ss). Two buttons: **Pause** (||) and **Stop** (square). Tapping Pause starts a pause — the button becomes a **Play** (triangle) button. Tapping Play ends the pause and resumes the timer. The pause is registered as a valid entry.
- **Validations:** (a) Pause must have a duration, (b) Pause cannot fall outside the log's time span.

### Key UX/UI decisions

| Decision | Rationale |
|----------|-----------|
| Unified "interruption" model for pauses AND night wakings | Avoids two parallel features with identical mechanics. A pause on a nap is called "Pause"; a pause on a bedtime is called "Night waking." Same data, different label. |
| Start time + duration (not start + end) | Matches Napper. Simpler mental model — parents think "baby woke up for 10 minutes," not "baby woke at 02:14 and fell back asleep at 02:24." |
| Collapsible pause cards | Keeps the sheet clean when there are 0 pauses (most entries). Progressive disclosure — expand only when needed. |
| Live pause/resume on active entries | Critical for real-time use at 3AM. One tap to pause, one tap to resume. No form fields needed in the moment. |
| Net sleep time displayed | Show both total span and net sleep (span minus pauses). Net sleep is the more useful number for predictions. |
| Max ~5 pauses per entry | Practical cap. A nap with 5+ pauses is an outlier — warn but don't block. |

### Data model

```typescript
interface SleepPause {
  id: string;
  sleepEntryId: string;
  startTime: string;       // ISO datetime
  durationMinutes: number;  // user sets this, not end time
}

// SleepEntry gains:
interface SleepEntry {
  // ... existing fields
  pauses?: SleepPause[];
}
```

**Database:** New `sleep_pauses` table (id, sleep_entry_id FK, start_time, duration_minutes, created_at). RLS mirrors `sleep_entries` policies. Loaded as a join or separate query.

### Validation rules
- Pause start must be >= entry start and < entry end (if completed)
- Pause start + duration must be <= entry end (if completed)
- Pauses cannot overlap each other
- Duration must be > 0
- For active entries: pause start must be >= entry start, no end constraint (entry is still open)

---

## 2. Night Waking

### What the user wants
Track when a baby wakes up during the night and how long they were awake before falling back to sleep.

### How Napper does it
- During an active bedtime, a **Play** button in the dialog starts a "Night waking" event.
- The dialog switches to a "Night waking" state with an orange/red storm-cloud icon, showing the current time and -1min / +1min adjustment buttons.
- When the baby falls back to sleep, the user taps Play again (or Stop). The waking is logged as an interruption within the bedtime.
- Night wakings appear in the quick action sheet grid (row 2, alongside feeding actions) for direct logging outside of an active bedtime.

### Key UX/UI decisions

| Decision | Rationale |
|----------|-----------|
| Night waking = pause on bedtime, with distinct visual treatment | Same underlying data as pause, but emotionally different for parents. Use a different icon (storm cloud / lightning), a warm/alert colour (`--wake-color`), and the label "Night waking" instead of "Pause." |
| Allow logging from QuickActionSheet | Sometimes parents log retrospectively. A "Night waking" action in the grid creates a pause on the most recent active or last-completed bedtime. If no bedtime exists, prompt user to log bedtime first. |
| Show night wakings in daily summary | "3 night wakings (22 min total)" — this is high-value info for parents tracking sleep regressions. |
| Impact on predictions | Net night sleep (total minus wakings) feeds into next-day predictions. A night with many wakings may shift the first nap earlier. |

### Interaction flow

**From active bedtime:**
1. User taps on active bedtime card (or FAB → opens active sleep dialog)
2. Dialog shows live timer + Pause + Stop buttons
3. User taps Pause → timer pauses, button becomes Play, label changes to "Night waking started"
4. User taps Play → waking ends, timer resumes, waking logged as pause
5. Saved automatically (optimistic update)

**Retrospective (from QuickActionSheet or edit):**
1. User opens completed bedtime → taps "Add night waking +"
2. Same UI as "Add pause +" but with night-waking icon and label
3. User sets start time + duration

---

## 3. Qualitative Information

### What the user wants
Structured metadata on each sleep entry: how the baby fell asleep, their mood at sleep onset, and free-text comments.

### How Napper does it
Below the pause section in the expanded dialog, Napper shows two tag-chip sections:
- **Start:** "Long time to fall asleep" | "Upset" (icon chips, multi-select)
- **How:** "In bed" | "Nursing" | "Worn or held" | "Next to me" | "Bottle feeding" | "Stroller" | "Car" | "Swing" (icon chips, single-select)

Plus a free-text comment field at the bottom.

### Key UX/UI decisions

| Decision | Rationale |
|----------|-----------|
| Chip-based selection (not dropdowns) | Tappable at 3AM with one hand. Visual scanning > reading dropdown options. Matches Napper's proven pattern. |
| "Start" is multi-select, "How" is single-select | A baby can be both upset AND take long to fall asleep. But they fall asleep in one way (in bed OR nursing, not both). |
| Optional — never required | Adding quality info is bonus context, never a gate. Empty chips = no judgement. Aligns with PRD's "no judgement" principle. |
| Show in expanded entry only | Don't clutter the compact timeline card. Show chips only when user opens the entry detail. |
| Comment field = existing `notes` field | SleepEntry already has `notes?: string`. Reuse it — just give it a proper text area in the UI. |
| Localise chip labels | All chips must go through i18n (en/es/ca). |

### Categories

**Start (onset quality):**
| Key | Label (en) | Icon suggestion |
|-----|-----------|-----------------|
| `long_onset` | Long time to fall asleep | Hourglass |
| `upset` | Upset | Sad face |

**How (sleep method):**
| Key | Label (en) | Icon suggestion |
|-----|-----------|-----------------|
| `in_bed` | In bed | Bed |
| `nursing` | Nursing | Breast |
| `worn_or_held` | Worn or held | Arms/carry |
| `next_to_me` | Next to me | Person lying |
| `bottle_feeding` | Bottle feeding | Baby bottle |
| `stroller` | Stroller | Stroller |
| `car` | Car | Car |
| `swing` | Swing | Swing |

### Data model

```typescript
// New fields on SleepEntry:
interface SleepEntry {
  // ... existing fields
  pauses?: SleepPause[];
  onsetTags?: string[];      // e.g. ['long_onset', 'upset']
  sleepMethod?: string;       // e.g. 'nursing' (single value)
  notes?: string;             // already exists — promoted to visible textarea
}
```

**Database:** Add columns to `sleep_entries`: `onset_tags text[]` (Postgres array), `sleep_method text`. No new table needed — these are 1:1 with the entry.

---

## Phased Implementation Plan

### Phase 1 — Data layer + Pause on completed entries
**Scope:** Database migration, types, CRUD for pauses. Edit-mode UI only (no live pause yet).
- Create `sleep_pauses` table + RLS policies
- Extend `SleepEntry` type with `pauses`
- Update `useSleepEntries` to fetch/save pauses
- Add "Add pause +" UI to `SleepEntrySheet` (collapsed cards, expand to edit start + duration)
- Validation: pause within bounds, no overlap, duration > 0
- Display net sleep time in entry detail
- i18n for all new strings

### Phase 2 — Live pause/resume on active entries
**Scope:** Real-time pause during an active nap or bedtime.
- Add Pause/Play button to active sleep dialog (alongside existing Stop)
- Optimistic pause creation on tap
- Live timer that freezes during pause and shows "Paused" state
- Resume creates the pause record with calculated duration
- Update TodayView active-sleep card to show pause indicator

### Phase 3 — Night waking (builds on pause)
**Scope:** Contextual labelling + QuickActionSheet integration.
- When entry type is `night`, label pauses as "Night waking" with wake-color styling and storm-cloud icon
- Add "Night waking" to QuickActionSheet grid (row 2, first position) — only shown when a bedtime exists
- Night waking action: creates a pause on the active/last bedtime
- Update DailySummary to show "X night wakings (Ym total)"
- Update StatsView with night waking trends (count + total duration over time)

### Phase 4 — Qualitative information
**Scope:** Structured tags + comment promotion.
- Add `onset_tags` and `sleep_method` columns to `sleep_entries`
- Update types and CRUD
- Add chip sections to SleepEntrySheet (below pauses, above notes)
- Promote `notes` to a visible textarea with placeholder
- Show selected tags as small pills on compact timeline cards (optional, if space allows)
- i18n for all chip labels (en/es/ca)
- Update SleepReportView to include qualitative patterns ("Most naps: nursing, 3 nights with upset onset")

### Dependencies
```
Phase 1 (Pause data + edit UI)
  └── Phase 2 (Live pause/resume)
       └── Phase 3 (Night waking)
Phase 4 (Qualitative) — independent, can run in parallel with Phase 2/3
```

### Risks and considerations
- **Prediction impact:** Net sleep (minus pauses) should feed the prediction engine. If we just use total span, predictions won't account for fragmented sleep. Update `dateUtils.ts` prediction functions in Phase 2.
- **Shared access:** Pauses inherit the parent entry's sharing permissions via RLS join on `sleep_entries.baby_id`. No extra sharing logic needed.
- **Migration:** Existing entries have 0 pauses and no tags — all new fields are nullable/optional. No backfill needed.
- **PRD tension:** The PRD lists feeding/nappy as "out of scope." Qualitative info is borderline — but it enriches sleep data (not a separate tracker), so it aligns with the sleep-focused mission.
