# Sleep Pause — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add pause tracking to completed sleep entries — database, types, CRUD, edit UI in SleepEntrySheet, and net sleep duration everywhere.

**Architecture:** New `sleep_pauses` Supabase table (FK to `sleep_entries`, CASCADE delete). Pauses are fetched alongside entries in `useSleepEntries` and merged into the `SleepEntry` type. A new `getNetSleepMinutes()` utility replaces gross duration in all display locations. The SleepEntrySheet gains an always-visible pause section with collapsible cards.

**Tech Stack:** React 18, TypeScript, Supabase (Postgres + RLS), Framer Motion, i18next, date-fns, Tailwind CSS with CSS custom properties.

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `supabase/migrations/20260402000000_sleep_pauses.sql` | Create | Table, index, RLS policies |
| `src/types/index.ts` | Modify | Add `SleepPause`, extend `SleepEntry` |
| `src/lib/supabase.ts` | Modify | Add `DbSleepPause` interface |
| `src/utils/dateUtils.ts` | Modify | Add `getNetSleepMinutes()` |
| `src/hooks/useSleepEntries.ts` | Modify | Fetch/merge pauses, CRUD functions, net sleep in summary |
| `src/components/SleepEntrySheet.tsx` | Modify | Pause section UI, net duration label |
| `src/components/SleepEntry.tsx` | Modify | Use net duration in NapEntry |
| `src/components/TodayView.tsx` | Modify | Use net duration in compact cards |
| `src/components/SleepList.tsx` | Modify | Use net duration in NightSleepSummary |
| `src/locales/en.json` | Modify | New pause i18n keys |
| `src/locales/es.json` | Modify | Spanish translations |
| `src/locales/ca.json` | Modify | Catalan translations |

---

## Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/20260402000000_sleep_pauses.sql`

- [ ] **Step 1: Create migration file**

```sql
-- Sleep pauses: interruptions within a sleep entry (nap or night).
-- Each pause has a start time and a duration in minutes.
-- Net sleep = entry duration minus sum of pause durations.

CREATE TABLE sleep_pauses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sleep_entry_id UUID NOT NULL REFERENCES sleep_entries(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sleep_pauses_entry_id ON sleep_pauses(sleep_entry_id);

-- RLS: access mirrors sleep_entries via join
ALTER TABLE sleep_pauses ENABLE ROW LEVEL SECURITY;

-- Owner: full access
CREATE POLICY "Owner can manage pauses"
  ON sleep_pauses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM sleep_entries
      WHERE sleep_entries.id = sleep_pauses.sleep_entry_id
        AND sleep_entries.user_id = auth.uid()
    )
  )
  WITH CHECK (
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
  )
  WITH CHECK (
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

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260402000000_sleep_pauses.sql
git commit -m "feat: add sleep_pauses table with RLS policies"
```

---

## Task 2: Types and DB Interface

**Files:**
- Modify: `src/types/index.ts:17-24`
- Modify: `src/lib/supabase.ts:24-32`

- [ ] **Step 1: Add SleepPause type and extend SleepEntry**

In `src/types/index.ts`, add `SleepPause` before `SleepEntry` and add `pauses` to `SleepEntry`:

```typescript
export interface SleepPause {
  id: string;
  sleepEntryId: string;
  startTime: string;       // ISO datetime (UTC)
  durationMinutes: number;  // always > 0
}

export interface SleepEntry {
  id: string;
  date: string; // ISO date (YYYY-MM-DD)
  startTime: string; // ISO datetime
  endTime: string | null; // null if still sleeping
  type: 'nap' | 'night';
  notes?: string;
  pauses?: SleepPause[];
}
```

- [ ] **Step 2: Add DbSleepPause interface**

In `src/lib/supabase.ts`, add after the `DbSleepEntry` interface (after line 32):

```typescript
export interface DbSleepPause {
  id: string;
  sleep_entry_id: string;
  start_time: string;
  duration_minutes: number;
  created_at: string;
}
```

- [ ] **Step 3: Verify the build compiles**

Run: `npm run build`
Expected: Successful compilation (no consumers of `pauses` yet, so no type errors)

- [ ] **Step 4: Commit**

```bash
git add src/types/index.ts src/lib/supabase.ts
git commit -m "feat: add SleepPause type and DbSleepPause interface"
```

---

## Task 3: Net Sleep Utility

**Files:**
- Modify: `src/utils/dateUtils.ts:98-103`

- [ ] **Step 1: Add getNetSleepMinutes function**

Add after the existing `calculateDuration` function (after line 103) in `src/utils/dateUtils.ts`:

```typescript
/**
 * Net sleep duration in minutes: gross duration minus total pause time.
 * Returns null for active entries (no endTime).
 * Falls back to gross duration when there are no pauses.
 */
export function getNetSleepMinutes(entry: { startTime: string; endTime: string | null; pauses?: { durationMinutes: number }[] }): number {
  const gross = calculateDuration(entry.startTime, entry.endTime);
  const totalPauseMinutes = (entry.pauses ?? []).reduce((sum, p) => sum + p.durationMinutes, 0);
  return Math.max(0, gross - totalPauseMinutes);
}
```

- [ ] **Step 2: Verify the build compiles**

Run: `npm run build`
Expected: Successful compilation

- [ ] **Step 3: Commit**

```bash
git add src/utils/dateUtils.ts
git commit -m "feat: add getNetSleepMinutes utility for pause-aware duration"
```

---

## Task 4: i18n — Add Pause Keys

**Files:**
- Modify: `src/locales/en.json`
- Modify: `src/locales/es.json`
- Modify: `src/locales/ca.json`

- [ ] **Step 1: Add English pause keys**

In `src/locales/en.json`, inside the `"sleepEntrySheet"` object (after the `"logForDate"` key), add:

```json
"addPause": "Add pause",
"pause": "Pause",
"pauseNumber": "Pause {{number}}",
"pauseStart": "Start",
"pauseDuration": "Duration",
"pauseDurationUnit": "min",
"netSuffix": "(net)",
"maxPausesReached": "Max reached",
"pauseBeforeStart": "Pause must start after the entry begins",
"pauseAfterEnd": "Pause must start before the entry ends",
"pauseExceedsEnd": "Pause extends beyond the entry end",
"pauseZeroDuration": "Pause must have a duration",
"pauseOverlap": "Pauses cannot overlap"
```

- [ ] **Step 2: Add Spanish pause keys**

In `src/locales/es.json`, inside the `"sleepEntrySheet"` object (after the `"logForDate"` key), add:

```json
"addPause": "Añadir pausa",
"pause": "Pausa",
"pauseNumber": "Pausa {{number}}",
"pauseStart": "Inicio",
"pauseDuration": "Duración",
"pauseDurationUnit": "min",
"netSuffix": "(neto)",
"maxPausesReached": "Máximo alcanzado",
"pauseBeforeStart": "La pausa debe empezar después del inicio",
"pauseAfterEnd": "La pausa debe empezar antes de que termine",
"pauseExceedsEnd": "La pausa se extiende más allá del final",
"pauseZeroDuration": "La pausa debe tener una duración",
"pauseOverlap": "Las pausas no pueden solaparse"
```

- [ ] **Step 3: Add Catalan pause keys**

In `src/locales/ca.json`, inside the `"sleepEntrySheet"` object (after the `"logForDate"` key), add:

```json
"addPause": "Afegir pausa",
"pause": "Pausa",
"pauseNumber": "Pausa {{number}}",
"pauseStart": "Inici",
"pauseDuration": "Durada",
"pauseDurationUnit": "min",
"netSuffix": "(net)",
"maxPausesReached": "Màxim assolit",
"pauseBeforeStart": "La pausa ha de començar després de l'inici",
"pauseAfterEnd": "La pausa ha de començar abans que acabi",
"pauseExceedsEnd": "La pausa s'estén més enllà del final",
"pauseZeroDuration": "La pausa ha de tenir una durada",
"pauseOverlap": "Les pauses no es poden solapar"
```

- [ ] **Step 4: Verify the build compiles**

Run: `npm run build`
Expected: Successful compilation

- [ ] **Step 5: Commit**

```bash
git add src/locales/en.json src/locales/es.json src/locales/ca.json
git commit -m "feat: add i18n keys for sleep pauses (en/es/ca)"
```

---

## Task 5: Hook — Fetch and Merge Pauses

**Files:**
- Modify: `src/hooks/useSleepEntries.ts`

- [ ] **Step 1: Import new types**

At the top of `src/hooks/useSleepEntries.ts`, update the import from types:

```typescript
import type { SleepEntry, SleepPause } from '../types';
```

And add the DB type import:

```typescript
import type { DbSleepPause } from '../lib/supabase';
```

- [ ] **Step 2: Add pause mapping helper**

Add a helper function before the `useSleepEntries` function (after the `toSupabaseTimestamp` helper, around line 13):

```typescript
/** Map DB pause row to app type. */
const mapDbPause = (row: DbSleepPause): SleepPause => ({
  id: row.id,
  sleepEntryId: row.sleep_entry_id,
  startTime: row.start_time,
  durationMinutes: row.duration_minutes,
});
```

- [ ] **Step 3: Fetch pauses and merge into entries**

In the `fetchEntries` function, after the entries are mapped (after the line `setEntries(mappedEntries);` around line 69), replace the entries-setting block with pause fetching:

Replace this block inside `fetchEntries`:
```typescript
      if (data) {
        const mappedEntries: SleepEntry[] = data.map((entry) => ({
          id: entry.id,
          date: format(parseISO(entry.start_time), 'yyyy-MM-dd'),
          startTime: entry.start_time,
          endTime: entry.end_time ?? null,
          type: entry.type as 'nap' | 'night',
          notes: entry.notes || undefined,
        }));
        setEntries(mappedEntries);
      } else {
        setEntries([]);
      }
```

With:
```typescript
      if (data && data.length > 0) {
        const entryIds = data.map((e) => e.id);

        // Fetch all pauses for these entries in one query
        const { data: pauseData } = await supabase
          .from('sleep_pauses')
          .select('*')
          .in('sleep_entry_id', entryIds)
          .order('start_time', { ascending: true });

        // Group pauses by entry id
        const pausesByEntry = new Map<string, SleepPause[]>();
        if (pauseData) {
          for (const row of pauseData) {
            const pause = mapDbPause(row as DbSleepPause);
            const list = pausesByEntry.get(pause.sleepEntryId) ?? [];
            list.push(pause);
            pausesByEntry.set(pause.sleepEntryId, list);
          }
        }

        const mappedEntries: SleepEntry[] = data.map((entry) => ({
          id: entry.id,
          date: format(parseISO(entry.start_time), 'yyyy-MM-dd'),
          startTime: entry.start_time,
          endTime: entry.end_time ?? null,
          type: entry.type as 'nap' | 'night',
          notes: entry.notes || undefined,
          pauses: pausesByEntry.get(entry.id) ?? [],
        }));
        setEntries(mappedEntries);
      } else {
        setEntries([]);
      }
```

- [ ] **Step 4: Verify the build compiles**

Run: `npm run build`
Expected: Successful compilation

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useSleepEntries.ts
git commit -m "feat: fetch sleep pauses and merge into entries"
```

---

## Task 6: Hook — Pause CRUD Functions

**Files:**
- Modify: `src/hooks/useSleepEntries.ts`

- [ ] **Step 1: Add addPause function**

Add after the `endSleep` function (around line 183) in `useSleepEntries`:

```typescript
  const addPause = useCallback(async (entryId: string, data: { startTime: string; durationMinutes: number }): Promise<SleepPause | null> => {
    try {
      const { data: inserted, error } = await supabase
        .from('sleep_pauses')
        .insert({
          sleep_entry_id: entryId,
          start_time: toSupabaseTimestamp(data.startTime),
          duration_minutes: data.durationMinutes,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding pause:', error);
        return null;
      }

      const newPause = mapDbPause(inserted as DbSleepPause);

      // Optimistic update: add pause to the entry in local state
      setEntries((prev) =>
        prev.map((entry) => {
          if (entry.id !== entryId) return entry;
          const pauses = [...(entry.pauses ?? []), newPause].sort(
            (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          );
          return { ...entry, pauses };
        })
      );

      return newPause;
    } catch (err) {
      console.error('Error adding pause:', err);
      return null;
    }
  }, []);

  const updatePause = useCallback(async (pauseId: string, data: { startTime?: string; durationMinutes?: number }): Promise<boolean> => {
    try {
      const updateData: Record<string, unknown> = {};
      if (data.startTime !== undefined) updateData.start_time = toSupabaseTimestamp(data.startTime);
      if (data.durationMinutes !== undefined) updateData.duration_minutes = data.durationMinutes;

      const { error } = await supabase
        .from('sleep_pauses')
        .update(updateData)
        .eq('id', pauseId);

      if (error) {
        console.error('Error updating pause:', error);
        return false;
      }

      // Optimistic update
      setEntries((prev) =>
        prev.map((entry) => {
          const pauseIndex = (entry.pauses ?? []).findIndex((p) => p.id === pauseId);
          if (pauseIndex === -1) return entry;
          const updatedPauses = [...entry.pauses!];
          updatedPauses[pauseIndex] = {
            ...updatedPauses[pauseIndex],
            ...(data.startTime !== undefined ? { startTime: toSupabaseTimestamp(data.startTime) } : {}),
            ...(data.durationMinutes !== undefined ? { durationMinutes: data.durationMinutes } : {}),
          };
          updatedPauses.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
          return { ...entry, pauses: updatedPauses };
        })
      );

      return true;
    } catch (err) {
      console.error('Error updating pause:', err);
      return false;
    }
  }, []);

  const deletePause = useCallback(async (pauseId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('sleep_pauses')
        .delete()
        .eq('id', pauseId);

      if (error) {
        console.error('Error deleting pause:', error);
        return false;
      }

      // Optimistic removal
      setEntries((prev) =>
        prev.map((entry) => {
          const pauses = (entry.pauses ?? []).filter((p) => p.id !== pauseId);
          return { ...entry, pauses };
        })
      );

      return true;
    } catch (err) {
      console.error('Error deleting pause:', err);
      return false;
    }
  }, []);
```

- [ ] **Step 2: Add the new functions to the return object**

Update the return statement to include the new functions:

```typescript
  return {
    entries,
    loading,
    error,
    addEntry,
    updateEntry,
    deleteEntry,
    endSleep,
    addPause,
    updatePause,
    deletePause,
    getEntriesForDate,
    activeSleep,
    lastCompletedSleep,
    awakeMinutes,
    getDailySummary,
    refreshEntries: fetchEntries,
  };
```

- [ ] **Step 3: Verify the build compiles**

Run: `npm run build`
Expected: Successful compilation

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useSleepEntries.ts
git commit -m "feat: add pause CRUD functions to useSleepEntries"
```

---

## Task 7: Net Sleep in Daily Summary

**Files:**
- Modify: `src/hooks/useSleepEntries.ts` (the `computeDailySummary` function, lines 237-318)

- [ ] **Step 1: Import getNetSleepMinutes**

Add to the imports at the top of `src/hooks/useSleepEntries.ts`:

```typescript
import { calculateDuration, getNetSleepMinutes } from '../utils/dateUtils';
```

Remove `calculateDuration` from the existing import if it was imported standalone (it's already imported on line 3).

- [ ] **Step 2: Update computeDailySummary to use net sleep**

In the `computeDailySummary` function, replace the duration calculations:

Replace:
```typescript
  const totalNapMinutes = napEntries.reduce(
    (sum, e) => sum + calculateDuration(e.startTime, e.endTime),
    0,
  );

  const totalNightMinutes = nightEntries.reduce(
    (sum, e) => sum + calculateDuration(e.startTime, e.endTime),
    0,
  );
```

With:
```typescript
  const totalNapMinutes = napEntries.reduce(
    (sum, e) => sum + getNetSleepMinutes(e),
    0,
  );

  const totalNightMinutes = nightEntries.reduce(
    (sum, e) => sum + getNetSleepMinutes(e),
    0,
  );
```

- [ ] **Step 3: Verify the build compiles**

Run: `npm run build`
Expected: Successful compilation

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useSleepEntries.ts
git commit -m "feat: use net sleep (minus pauses) in daily summary"
```

---

## Task 8: Net Sleep in Display Components

**Files:**
- Modify: `src/components/SleepEntry.tsx:96`
- Modify: `src/components/TodayView.tsx` (multiple lines)
- Modify: `src/components/SleepList.tsx:94-101`

- [ ] **Step 1: Update NapEntry to use net duration**

In `src/components/SleepEntry.tsx`, add the import:

```typescript
import { formatTime, calculateDuration, formatDuration, getNetSleepMinutes } from '../utils/dateUtils';
```

Then on line 96, replace:
```typescript
  const duration = calculateDuration(entry.startTime, entry.endTime);
```

With:
```typescript
  const duration = getNetSleepMinutes(entry);
```

- [ ] **Step 2: Update TodayView to use net duration for completed naps**

In `src/components/TodayView.tsx`, the import already includes `calculateDuration` and `formatDuration`. Add `getNetSleepMinutes`:

```typescript
import {
  formatDuration,
  calculateDuration,
  getNetSleepMinutes,
  // ... other imports
} from '../utils/dateUtils';
```

On line 914, replace the duration display for completed naps in the timeline:
```typescript
{formatDuration(calculateDuration(nap.startTime, nap.endTime))}
```

With:
```typescript
{formatDuration(getNetSleepMinutes(nap))}
```

Also on line 155, where total nap minutes are accumulated, replace:
```typescript
      return total + calculateDuration(nap.startTime, nap.endTime);
```

With:
```typescript
      return total + getNetSleepMinutes(nap);
```

And on line 466, where last completed sleep duration is calculated, replace:
```typescript
      ? calculateDuration(lastCompletedSleep.startTime, lastCompletedSleep.endTime)
```

With:
```typescript
      ? getNetSleepMinutes(lastCompletedSleep)
```

**Note:** Lines 385, 507, and 664 use `calculateDuration(activeSleep.startTime, null)` for live active-sleep timers. These should NOT change — active entries don't have pauses in Phase 1 (live pause is Phase 2), and the timer shows elapsed wall time.

- [ ] **Step 3: Update SleepList NightSleepSummary duration**

In `src/components/SleepList.tsx`, add the import:

```typescript
import { getNetSleepMinutes } from '../utils/dateUtils';
```

On lines 94-101, where `nightDuration` is calculated for the NightSleepSummary, replace:
```typescript
        const nightDuration = calculateMinutesBetween(
```

Find the full block that calculates `nightDuration` using `calculateMinutesBetween` and replace it with `getNetSleepMinutes`. Specifically, find:
```typescript
        const nightDuration = calculateMinutesBetween(
          bedtimeEntry.startTime,
          bedtimeEntry.endTime!
        );
```

Replace with:
```typescript
        const nightDuration = getNetSleepMinutes(bedtimeEntry);
```

- [ ] **Step 4: Verify the build compiles and renders**

Run: `npm run build`
Expected: Successful compilation

- [ ] **Step 5: Commit**

```bash
git add src/components/SleepEntry.tsx src/components/TodayView.tsx src/components/SleepList.tsx
git commit -m "feat: display net sleep duration (minus pauses) in all components"
```

---

## Task 9: SleepEntrySheet — Pause Section UI

This is the largest task. It adds the always-visible pause section to the SleepEntrySheet bottom sheet.

**Files:**
- Modify: `src/components/SleepEntrySheet.tsx`

- [ ] **Step 1: Add new props for pause operations**

Update the `SleepEntrySheetProps` interface to accept pause callbacks. Add these props:

```typescript
interface SleepEntrySheetProps {
  // ... existing props unchanged
  onAddPause?: (entryId: string, data: { startTime: string; durationMinutes: number }) => Promise<SleepPause | null>;
  onUpdatePause?: (pauseId: string, data: { startTime?: string; durationMinutes?: number }) => Promise<boolean>;
  onDeletePause?: (pauseId: string) => Promise<boolean>;
}
```

Add the import for SleepPause at the top:

```typescript
import type { SleepEntry, SleepPause } from '../types';
```

Destructure the new props in the component function signature alongside existing ones:

```typescript
  onAddPause,
  onUpdatePause,
  onDeletePause,
```

- [ ] **Step 2: Add pause validation helpers**

Add these helper functions inside the `SleepEntrySheet` component (after the existing validation `useMemo`, around line 320):

```typescript
  // --- Pause validation ---
  const pauseEntries = entry?.pauses ?? [];

  /** Validate a single pause against the entry bounds and other pauses. Returns i18n error key or null. */
  const validatePause = useCallback((pause: { startTime: string; durationMinutes: number }, pauseId: string): string | null => {
    if (!entry || !startTime || !endTime) return null;

    const entryStartDate = parseISO(entry.startTime);
    const pauseStart = parseISO(pause.startTime);
    const pauseEndMs = pauseStart.getTime() + pause.durationMinutes * 60 * 1000;

    // Entry end as Date
    const entryEnd = entry.endTime ? parseISO(entry.endTime) : null;

    if (pause.durationMinutes <= 0) return 'sleepEntrySheet.pauseZeroDuration';
    if (pauseStart.getTime() < entryStartDate.getTime()) return 'sleepEntrySheet.pauseBeforeStart';
    if (entryEnd && pauseStart.getTime() >= entryEnd.getTime()) return 'sleepEntrySheet.pauseAfterEnd';
    if (entryEnd && pauseEndMs > entryEnd.getTime()) return 'sleepEntrySheet.pauseExceedsEnd';

    // Overlap check
    for (const other of pauseEntries) {
      if (other.id === pauseId) continue;
      const otherStart = parseISO(other.startTime).getTime();
      const otherEnd = otherStart + other.durationMinutes * 60 * 1000;
      if (pauseStart.getTime() < otherEnd && pauseEndMs > otherStart) {
        return 'sleepEntrySheet.pauseOverlap';
      }
    }

    return null;
  }, [entry, startTime, endTime, pauseEntries]);
```

- [ ] **Step 3: Add pause state management**

Add state for expanded pause card tracking (after existing state declarations):

```typescript
  const [expandedPauseId, setExpandedPauseId] = useState<string | null>(null);
  const [pauseErrors, setPauseErrors] = useState<Record<string, string | null>>({});
```

Reset expanded pause when sheet opens/closes (add to the existing `useEffect` that resets on `isOpen`):

```typescript
  // Inside the existing useEffect that runs when isOpen changes:
  setExpandedPauseId(null);
  setPauseErrors({});
```

- [ ] **Step 4: Add pause action handlers**

Add these handlers after the existing `handleDelete` / `handleConfirmDelete` block:

```typescript
  const handleAddPause = async () => {
    if (!entry || !onAddPause || !entry.endTime) return;
    if (pauseEntries.length >= 5) return;

    // Smart default: midpoint of entry, or after last pause
    const entryStartMs = parseISO(entry.startTime).getTime();
    const entryEndMs = parseISO(entry.endTime).getTime();

    let defaultStartMs: number;
    if (pauseEntries.length > 0) {
      const lastPause = pauseEntries[pauseEntries.length - 1];
      const lastPauseEnd = parseISO(lastPause.startTime).getTime() + lastPause.durationMinutes * 60 * 1000;
      defaultStartMs = lastPauseEnd + Math.floor((entryEndMs - lastPauseEnd) / 2);
    } else {
      defaultStartMs = entryStartMs + Math.floor((entryEndMs - entryStartMs) / 2);
    }

    // Clamp to entry bounds
    defaultStartMs = Math.max(entryStartMs, Math.min(defaultStartMs, entryEndMs - 5 * 60 * 1000));

    const defaultStart = new Date(defaultStartMs).toISOString();
    const result = await onAddPause(entry.id, { startTime: defaultStart, durationMinutes: 5 });
    if (result) {
      setExpandedPauseId(result.id);
    }
  };

  const handleUpdatePause = async (pauseId: string, data: { startTime?: string; durationMinutes?: number }) => {
    if (!onUpdatePause) return;

    // Find the current pause to validate merged values
    const currentPause = pauseEntries.find((p) => p.id === pauseId);
    if (!currentPause) return;

    const merged = {
      startTime: data.startTime ?? currentPause.startTime,
      durationMinutes: data.durationMinutes ?? currentPause.durationMinutes,
    };

    const errorKey = validatePause(merged, pauseId);
    setPauseErrors((prev) => ({ ...prev, [pauseId]: errorKey }));
    if (errorKey) return;

    await onUpdatePause(pauseId, data);
  };

  const handleDeletePause = async (pauseId: string) => {
    if (!onDeletePause) return;
    await onDeletePause(pauseId);
    setPauseErrors((prev) => {
      const next = { ...prev };
      delete next[pauseId];
      return next;
    });
  };
```

- [ ] **Step 5: Update duration label to show net sleep**

Replace the `durationLabel` useMemo (around line 270):

```typescript
  const durationLabel = useMemo(() => {
    const raw = formatDurationLong(startTime, endTime);
    if (!raw) return '';

    // If entry has pauses, show net duration
    if (pauseEntries.length > 0 && entry?.endTime) {
      const totalPauseMins = pauseEntries.reduce((sum, p) => sum + p.durationMinutes, 0);
      const grossMins = computeDurationMinutes(startTime, endTime);
      const netMins = Math.max(0, grossMins - totalPauseMins);
      const hours = Math.floor(netMins / 60);
      const mins = netMins % 60;
      let netStr: string;
      if (hours === 0) netStr = `${mins}min long`;
      else if (mins === 0) netStr = `${hours}h long`;
      else netStr = `${hours}h ${mins}min long`;
      return netStr;
    }

    return raw;
  }, [startTime, endTime, pauseEntries, entry?.endTime]);

  const showNetSuffix = pauseEntries.length > 0 && !!entry?.endTime;
```

- [ ] **Step 6: Add pause section JSX**

In the component's JSX, add the pause section between the validation messages and the save error. Specifically, after the closing `</div>` of the `{/* Time inputs - large, horizontal */}` div (around line 576), and before the `{/* Save error from parent */}` block, add:

```tsx
              {/* Pause section — only for completed entries being edited */}
              {isEditing && entry?.endTime && (
                <div className="px-6 pb-4">
                  {/* Divider */}
                  <div className="h-px bg-[var(--text-muted)]/10 mb-4" />

                  {/* Pause cards */}
                  {pauseEntries.length > 0 && (
                    <div className="flex flex-col gap-2 mb-3">
                      {pauseEntries.map((pause, index) => {
                        const isExpanded = expandedPauseId === pause.id;
                        const pauseStartLocal = format(parseISO(pause.startTime), 'HH:mm');
                        const errorKey = pauseErrors[pause.id];

                        return (
                          <div
                            key={pause.id}
                            className="rounded-xl"
                            style={{ background: 'var(--glass-bg)' }}
                          >
                            {/* Collapsed header */}
                            <button
                              type="button"
                              className="w-full flex items-center justify-between p-3 text-left"
                              onClick={() => setExpandedPauseId(isExpanded ? null : pause.id)}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="text-[var(--text-muted)] text-sm">⏸</span>
                                <div>
                                  <p className="text-[var(--text-primary)] text-sm font-medium">
                                    {t('sleepEntrySheet.pauseNumber', { number: index + 1 })}
                                  </p>
                                  <p className="text-[var(--text-muted)] text-xs">
                                    {pauseStartLocal} · {pause.durationMinutes}{t('sleepEntrySheet.pauseDurationUnit')}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeletePause(pause.id);
                                  }}
                                  className="p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--danger-color)] transition-colors"
                                  aria-label={t('common.ariaDelete')}
                                >
                                  <TrashIcon />
                                </button>
                                <span className="text-[var(--text-muted)] text-xs">
                                  {isExpanded ? '▲' : '▼'}
                                </span>
                              </div>
                            </button>

                            {/* Expanded: start time + duration inputs */}
                            {isExpanded && (
                              <div className="px-3 pb-3">
                                <div className="flex gap-3">
                                  <div className="flex-1">
                                    <label className="text-[var(--text-muted)] text-xs uppercase tracking-wider mb-1 block">
                                      {t('sleepEntrySheet.pauseStart')}
                                    </label>
                                    <input
                                      type="time"
                                      value={pauseStartLocal}
                                      onChange={(e) => {
                                        if (!e.target.value) return;
                                        const newStartTime = combineDateTime(entry.date, e.target.value);
                                        handleUpdatePause(pause.id, { startTime: newStartTime });
                                      }}
                                      className="input w-full text-center text-sm"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <label className="text-[var(--text-muted)] text-xs uppercase tracking-wider mb-1 block">
                                      {t('sleepEntrySheet.pauseDuration')}
                                    </label>
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="number"
                                        min="1"
                                        max="120"
                                        value={pause.durationMinutes}
                                        onChange={(e) => {
                                          const val = parseInt(e.target.value, 10);
                                          if (!isNaN(val) && val > 0) {
                                            handleUpdatePause(pause.id, { durationMinutes: val });
                                          }
                                        }}
                                        className="input w-full text-center text-sm"
                                      />
                                      <span className="text-[var(--text-muted)] text-xs shrink-0">
                                        {t('sleepEntrySheet.pauseDurationUnit')}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                {/* Pause validation error */}
                                {errorKey && (
                                  <p className="text-xs mt-2" style={{ color: 'var(--danger-color)' }}>
                                    {t(errorKey)}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add pause button */}
                  <button
                    type="button"
                    onClick={handleAddPause}
                    disabled={pauseEntries.length >= 5}
                    className={`w-full py-2.5 rounded-xl text-sm font-medium border border-dashed transition-colors ${
                      pauseEntries.length >= 5
                        ? 'border-[var(--text-muted)]/10 text-[var(--text-muted)]/30 cursor-not-allowed'
                        : 'border-[var(--text-muted)]/20 text-[var(--text-muted)] hover:border-[var(--text-muted)]/40'
                    }`}
                  >
                    + {t('sleepEntrySheet.addPause')}
                    {pauseEntries.length >= 5 && ` (${t('sleepEntrySheet.maxPausesReached')})`}
                  </button>
                </div>
              )}
```

- [ ] **Step 7: Update the duration label display to show "(net)" suffix**

Find the existing duration label `<p>` in the JSX (around line 545):

```tsx
                  <p className="min-w-[7ch] text-center text-sm tracking-wide text-[var(--text-muted)] whitespace-nowrap">
                    {durationLabel}
                  </p>
```

Replace with:

```tsx
                  <p className="min-w-[7ch] text-center text-sm tracking-wide text-[var(--text-muted)] whitespace-nowrap">
                    {durationLabel}
                    {showNetSuffix && (
                      <span className="text-xs ml-1 opacity-60">{t('sleepEntrySheet.netSuffix')}</span>
                    )}
                  </p>
```

- [ ] **Step 8: Verify the build compiles**

Run: `npm run build`
Expected: Successful compilation

- [ ] **Step 9: Commit**

```bash
git add src/components/SleepEntrySheet.tsx
git commit -m "feat: add pause section UI to SleepEntrySheet with collapsible cards"
```

---

## Task 10: Wire Pause Props Through App

**Files:**
- Modify: `src/App.tsx` (or wherever SleepEntrySheet is rendered)

- [ ] **Step 1: Find where SleepEntrySheet is rendered**

Search for `<SleepEntrySheet` in the codebase to find all render sites. Pass the new pause props from the `useSleepEntries` hook:

```tsx
<SleepEntrySheet
  // ... existing props
  onAddPause={addPause}
  onUpdatePause={updatePause}
  onDeletePause={deletePause}
/>
```

The `addPause`, `updatePause`, and `deletePause` functions come from the `useSleepEntries` hook return value. Destructure them where the hook is called:

```typescript
const {
  // ... existing destructured values
  addPause,
  updatePause,
  deletePause,
} = useSleepEntries({ babyId });
```

- [ ] **Step 2: Verify the build compiles and the app renders**

Run: `npm run build`
Expected: Successful compilation. Run `npm run dev` and verify:
1. Open a completed sleep entry — see the "+ Add pause" button
2. Add a pause — card appears expanded with defaults
3. Edit start time and duration — updates persist
4. Delete a pause — card removes
5. Duration label shows net time with "(net)" when pauses exist
6. Daily summary reflects net sleep totals

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire pause CRUD props to SleepEntrySheet"
```

---

## Task 11: Manual QA and Final Verification

- [ ] **Step 1: Run full build**

```bash
npm run build
```

Expected: Clean compilation, no errors.

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Expected: No new lint errors.

- [ ] **Step 3: Manual testing checklist**

Test in the browser (`npm run dev`):

1. Open a completed nap → "+ Add pause" button visible
2. Tap "+ Add pause" → pause card appears expanded, start time = midpoint, duration = 5min
3. Change duration → value persists after closing and reopening the sheet
4. Add second pause → "Pause 2" card appears
5. Verify net duration label updates (shows less time than before pauses)
6. Verify "(net)" suffix shows only when pauses exist
7. Delete a pause → card disappears, duration updates
8. Add 5 pauses → button disables with "Max reached" text
9. Check DailySummary → totals reflect net sleep
10. Check timeline cards → nap duration shows net
11. Open an **active** entry → no pause section visible (correct — Phase 2)
12. Verify Spanish locale: switch language, check pause labels
13. Verify no console errors
