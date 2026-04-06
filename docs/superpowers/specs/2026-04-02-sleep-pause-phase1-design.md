# Sleep Pause — Phase 1 Design

> Pause data layer + edit-mode UI for completed sleep entries

## Overview

Add the ability to log one or more pauses (interruptions) within a completed sleep entry. Each pause has a start time and a duration. The net sleep time (total span minus sum of pauses) replaces gross duration everywhere in the app.

This is Phase 1 of the Sleep Log Enrichment feature set. It covers:
- Database table + RLS policies for pauses
- TypeScript types
- CRUD operations in `useSleepEntries`
- Edit-mode UI in `SleepEntrySheet` (no live pause/resume yet — that's Phase 2)
- Net sleep calculation in all duration displays and summaries
- i18n for en/es/ca

**Out of scope (later phases):** Live pause/resume on active entries (Phase 2), night waking labelling + QuickActionSheet integration (Phase 3), qualitative tags (Phase 4).

---

## Database

### New table: `sleep_pauses`

```sql
CREATE TABLE sleep_pauses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sleep_entry_id UUID NOT NULL REFERENCES sleep_entries(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sleep_pauses_entry_id ON sleep_pauses(sleep_entry_id);
```

### RLS policies

Mirror `sleep_entries` policies — access is determined by the parent entry's ownership/sharing:

```sql
ALTER TABLE sleep_pauses ENABLE ROW LEVEL SECURITY;

-- Owner: full access via join on sleep_entries
CREATE POLICY "Owner can manage pauses"
  ON sleep_pauses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM sleep_entries
      WHERE sleep_entries.id = sleep_pauses.sleep_entry_id
        AND sleep_entries.user_id = auth.uid()
    )
  );

-- Shared caregiver: full access
CREATE POLICY "Caregiver can manage pauses"
  ON sleep_pauses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM sleep_entries
      JOIN baby_shares ON baby_shares.baby_owner_id = sleep_entries.user_id
      WHERE sleep_entries.id = sleep_pauses.sleep_entry_id
        AND baby_shares.shared_with_user_id = auth.uid()
        AND baby_shares.status = 'accepted'
        AND baby_shares.role = 'caregiver'
    )
  );

-- Shared viewer: read only
CREATE POLICY "Viewer can read pauses"
  ON sleep_pauses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sleep_entries
      JOIN baby_shares ON baby_shares.baby_owner_id = sleep_entries.user_id
      WHERE sleep_entries.id = sleep_pauses.sleep_entry_id
        AND baby_shares.shared_with_user_id = auth.uid()
        AND baby_shares.status = 'accepted'
        AND baby_shares.role = 'viewer'
    )
  );
```

### Migration file

`supabase/migrations/YYYYMMDDHHMMSS_sleep_pauses.sql` — contains the table, index, and RLS policies above.

---

## Types

### New interface: `SleepPause`

```typescript
// src/types/index.ts
export interface SleepPause {
  id: string;
  sleepEntryId: string;
  startTime: string;       // ISO datetime (UTC)
  durationMinutes: number;  // always > 0
}
```

### Extended `SleepEntry`

```typescript
export interface SleepEntry {
  id: string;
  date: string;
  startTime: string;
  endTime: string | null;
  type: 'nap' | 'night';
  notes?: string;
  pauses?: SleepPause[];  // NEW — empty array or undefined means no pauses
}
```

### New DB interface: `DbSleepPause`

```typescript
// src/lib/supabase.ts
export interface DbSleepPause {
  id: string;
  sleep_entry_id: string;
  start_time: string;
  duration_minutes: number;
  created_at: string;
}
```

---

## Data Layer (`useSleepEntries`)

### Fetching pauses

`fetchEntries()` performs a second query after fetching entries:

```
supabase.from('sleep_pauses')
  .select('*')
  .in('sleep_entry_id', entryIds)
  .order('start_time', { ascending: true })
```

Pauses are grouped by `sleep_entry_id` and attached to their parent entry as `pauses: SleepPause[]`.

### New CRUD functions

| Function | Signature | Notes |
|----------|-----------|-------|
| `addPause` | `(entryId: string, data: { startTime: string; durationMinutes: number }) => Promise<SleepPause>` | Validates before insert. Optimistic UI update. |
| `updatePause` | `(pauseId: string, data: Partial<{ startTime: string; durationMinutes: number }>) => Promise<void>` | Partial update on start_time and/or duration_minutes. |
| `deletePause` | `(pauseId: string) => Promise<void>` | Hard delete. Optimistic removal from local state. |

### Net sleep calculation

New utility function in `dateUtils.ts`:

```typescript
export function getNetSleepMinutes(entry: SleepEntry): number | null {
  if (!entry.endTime) return null; // active entry — no net calculation
  const grossMinutes = computeDurationMinutes(entry.startTime, entry.endTime);
  const totalPauseMinutes = (entry.pauses ?? [])
    .reduce((sum, p) => sum + p.durationMinutes, 0);
  return Math.max(0, grossMinutes - totalPauseMinutes);
}
```

### Impact on existing calculations

All existing duration displays switch to net sleep:

| Location | Change |
|----------|--------|
| `SleepEntrySheet` duration label | Use `getNetSleepMinutes()` instead of `computeDurationMinutes()` |
| `getDailySummary()` in `useSleepEntries` | Subtract pause minutes from nap/night totals |
| Compact timeline cards (TodayView, SleepList) | Show net duration |
| `StatsView` charts | Net sleep feeds all chart data |
| `SleepReportView` | Net sleep in report calculations |
| Prediction engine (`dateUtils.ts`) | **No change in Phase 1** — predictions use entry start/end times (wake windows), not durations. Net sleep impact on predictions is Phase 2 scope. |

---

## UI: SleepEntrySheet

### Layout

The pause section is always rendered below the time inputs and above the save button. It has two visual states:

**Empty state (no pauses):**
- Thin divider line
- Dashed-border button: "+ Add pause" (full width, centered text)
- Subtle/muted styling — doesn't draw attention when unused

**Populated state (1+ pauses):**
- Thin divider line
- Collapsible pause cards stacked vertically (8px gap)
- "+ Add pause" button below the cards

### Pause card

**Collapsed (default):**
- Single row: `⏸ Pause {N}` left-aligned, `{startTime} · {duration}min` below in muted text
- Right side: delete icon (trash) + expand chevron (▼)
- Background: `rgba(255,255,255,0.04)` (matches existing glass pattern via `var(--glass-bg)`)
- Border-radius: 12px

**Expanded (on tap):**
- Same header row but chevron flips (▲)
- Below: two side-by-side input fields
  - **Start**: time input (`type="time"`) with "Start" label
  - **Duration**: number input (minutes) with "Duration" label
- Inputs use existing `.input` class styling

### Adding a new pause

Tapping "+ Add pause" immediately inserts a new pause to the DB (optimistic UI) with smart defaults:
- Start time: midpoint of the entry's time span (or after last pause end if pauses exist)
- Duration: 5 minutes

The card appears in expanded state so the user can adjust values. Each field change triggers an `updatePause` call (debounced). This keeps the data model simple — no "draft" pause state to manage.

### Deleting a pause

Tapping the trash icon shows inline confirmation (the card background flashes `var(--danger-color)` briefly) then deletes. No modal — too heavy for this context.

### Duration label change

When pauses exist, the duration label below start time shows:
- `"1h 15min"` (the net value) with a subtle `"(net)"` suffix in muted text
- When no pauses: plain `"1h 30min"` with no suffix (unchanged from current behaviour)

### Max pauses

At 5 pauses, the "+ Add pause" button text changes to "+ Add pause (max reached)" and becomes disabled with reduced opacity. Soft cap — no hard error.

---

## Validation

All validation runs client-side before save. Errors display as inline text below the pause card (same pattern as existing time validation errors).

| Rule | Error message (i18n key) |
|------|-------------------------|
| Pause start < entry start | `pauseBeforeStart`: "Pause must start after the entry begins" |
| Pause start >= entry end | `pauseAfterEnd`: "Pause must start before the entry ends" |
| Pause start + duration > entry end | `pauseExceedsEnd`: "Pause extends beyond the entry end" |
| Duration <= 0 | `pauseZeroDuration`: "Pause must have a duration" |
| Overlaps another pause | `pauseOverlap`: "Pauses cannot overlap" |

Overlap detection: for each pause, check that its range `[start, start + duration]` doesn't intersect any other pause's range. Pauses are sorted by start time for display and validation.

---

## i18n

New keys added to all three locale files (en/es/ca):

```json
{
  "sleepEntry": {
    "addPause": "Add pause",
    "pause": "Pause",
    "pauseStart": "Start",
    "pauseDuration": "Duration",
    "pauseDurationUnit": "min",
    "netSleep": "net",
    "maxPausesReached": "Max reached",
    "pauseBeforeStart": "Pause must start after the entry begins",
    "pauseAfterEnd": "Pause must start before the entry ends",
    "pauseExceedsEnd": "Pause extends beyond the entry end",
    "pauseZeroDuration": "Pause must have a duration",
    "pauseOverlap": "Pauses cannot overlap"
  }
}
```

Spanish and Catalan translations follow the same structure with localised strings.

---

## Files touched

| File | Change |
|------|--------|
| `supabase/migrations/YYYYMMDDHHMMSS_sleep_pauses.sql` | **New** — table, index, RLS |
| `src/types/index.ts` | Add `SleepPause`, extend `SleepEntry` |
| `src/lib/supabase.ts` | Add `DbSleepPause` interface |
| `src/hooks/useSleepEntries.ts` | Fetch pauses, merge into entries, add/update/delete pause functions, net sleep in `getDailySummary()` |
| `src/utils/dateUtils.ts` | Add `getNetSleepMinutes()` utility |
| `src/components/SleepEntrySheet.tsx` | Pause section UI (add/edit/delete cards), net duration label |
| `src/components/TodayView.tsx` | Use net duration in compact cards |
| `src/components/SleepList.tsx` or entry display components | Use net duration |
| `src/components/DailySummary.tsx` | No code change — receives net values from hook |
| `src/locales/en.json` | New pause-related keys |
| `src/locales/es.json` | Spanish translations |
| `src/locales/ca.json` | Catalan translations (if file exists) |

---

## What this does NOT cover

- **Live pause/resume** on active entries (Phase 2)
- **Night waking** labelling and QuickActionSheet action (Phase 3)
- **Qualitative tags** and notes textarea (Phase 4)
- **Prediction engine changes** — net sleep impact on predictions is Phase 2 scope
- **Anonymised tables** — `anonymized_sleep_entries` does not need pause data (aggregate-only)
