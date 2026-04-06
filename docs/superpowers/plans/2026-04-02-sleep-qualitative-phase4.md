# Sleep Qualitative Phase 4 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add onset tags (multi-select chips), sleep method (single-select chips), and a visible notes textarea to the SleepEntrySheet.

**Architecture:** Two new nullable columns on `sleep_entries` (`onset_tags text[]`, `sleep_method text`). Types extended. Hook maps new fields in fetch/save. SleepEntrySheet gains chip sections + textarea below the pause section.

**Tech Stack:** React 18, TypeScript, Supabase (Postgres), i18next, Tailwind CSS.

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `supabase/migrations/20260402000001_sleep_qualitative.sql` | Create | ADD COLUMN onset_tags, sleep_method |
| `src/types/index.ts` | Modify | Extend SleepEntry |
| `src/lib/supabase.ts` | Modify | Extend DbSleepEntry |
| `src/hooks/useSleepEntries.ts` | Modify | Map new fields in fetch, include in add/update |
| `src/components/SleepEntrySheet.tsx` | Modify | Chip sections + notes textarea |
| `src/locales/en.json` | Modify | 12 new keys |
| `src/locales/es.json` | Modify | 12 new keys |
| `src/locales/ca.json` | Modify | 12 new keys |

---

## Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/20260402000001_sleep_qualitative.sql`

- [ ] **Step 1: Create migration file**

```sql
-- Qualitative sleep metadata: onset quality tags and sleep method.
-- Both are optional — no backfill needed for existing entries.

ALTER TABLE sleep_entries ADD COLUMN onset_tags text[] DEFAULT NULL;
ALTER TABLE sleep_entries ADD COLUMN sleep_method text DEFAULT NULL;
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260402000001_sleep_qualitative.sql
git commit -m "feat: add onset_tags and sleep_method columns to sleep_entries"
```

---

## Task 2: Types and DB Interface

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/lib/supabase.ts`

- [ ] **Step 1: Extend SleepEntry**

In `src/types/index.ts`, add two new fields to `SleepEntry` (after `pauses`):

```typescript
export interface SleepEntry {
  id: string;
  date: string;
  startTime: string;
  endTime: string | null;
  type: 'nap' | 'night';
  notes?: string;
  pauses?: SleepPause[];
  onsetTags?: string[];     // e.g. ['long_onset', 'upset'] — multi-select
  sleepMethod?: string;      // e.g. 'nursing' — single-select
}
```

- [ ] **Step 2: Extend DbSleepEntry**

In `src/lib/supabase.ts`, add to `DbSleepEntry`:

```typescript
export interface DbSleepEntry {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  type: 'nap' | 'night';
  notes: string | null;
  created_at: string;
  onset_tags: string[] | null;
  sleep_method: string | null;
}
```

- [ ] **Step 3: Verify build and commit**

Run: `npm run build`

```bash
git add src/types/index.ts src/lib/supabase.ts
git commit -m "feat: add onsetTags and sleepMethod to SleepEntry types"
```

---

## Task 3: i18n Keys

**Files:**
- Modify: `src/locales/en.json`
- Modify: `src/locales/es.json`
- Modify: `src/locales/ca.json`

- [ ] **Step 1: Add English keys**

In `src/locales/en.json`, inside the `"sleepEntry"` object (not `sleepEntrySheet`), after `"nightSleep"`, add:

```json
"onsetLabel": "Start",
"howLabel": "How",
"longOnset": "Long time to fall asleep",
"upset": "Upset",
"inBed": "In bed",
"nursing": "Nursing",
"wornOrHeld": "Worn or held",
"nextToMe": "Next to me",
"bottleFeeding": "Bottle feeding",
"stroller": "Stroller",
"car": "Car",
"swing": "Swing"
```

- [ ] **Step 2: Add Spanish keys**

In `src/locales/es.json`, inside `"sleepEntry"`, after `"nightSleep"`, add:

```json
"onsetLabel": "Inicio",
"howLabel": "Cómo",
"longOnset": "Tardó en dormirse",
"upset": "Irritable",
"inBed": "En cama",
"nursing": "Lactancia",
"wornOrHeld": "En brazos",
"nextToMe": "A mi lado",
"bottleFeeding": "Biberón",
"stroller": "Cochecito",
"car": "Coche",
"swing": "Columpio"
```

- [ ] **Step 3: Add Catalan keys**

In `src/locales/ca.json`, inside `"sleepEntry"`, after `"nightSleep"`, add:

```json
"onsetLabel": "Inici",
"howLabel": "Com",
"longOnset": "Va tardar a adormir-se",
"upset": "Irritable",
"inBed": "Al llit",
"nursing": "Lactància",
"wornOrHeld": "En braços",
"nextToMe": "Al meu costat",
"bottleFeeding": "Biberó",
"stroller": "Cotxet",
"car": "Cotxe",
"swing": "Gronxador"
```

- [ ] **Step 4: Commit**

```bash
git add src/locales/en.json src/locales/es.json src/locales/ca.json
git commit -m "feat: add i18n keys for qualitative sleep tags (en/es/ca)"
```

---

## Task 4: Data Layer — Fetch and Save New Fields

**Files:**
- Modify: `src/hooks/useSleepEntries.ts`

- [ ] **Step 1: Update fetchEntries mapping**

In the `fetchEntries` function, find the entry mapping block (around line 90):

```typescript
        const mappedEntries: SleepEntry[] = data.map((entry) => ({
          id: entry.id,
          date: format(parseISO(entry.start_time), 'yyyy-MM-dd'),
          startTime: entry.start_time,
          endTime: entry.end_time ?? null,
          type: entry.type as 'nap' | 'night',
          notes: entry.notes || undefined,
          pauses: pausesByEntry.get(entry.id) ?? [],
        }));
```

Add the new fields:

```typescript
        const mappedEntries: SleepEntry[] = data.map((entry) => ({
          id: entry.id,
          date: format(parseISO(entry.start_time), 'yyyy-MM-dd'),
          startTime: entry.start_time,
          endTime: entry.end_time ?? null,
          type: entry.type as 'nap' | 'night',
          notes: entry.notes || undefined,
          pauses: pausesByEntry.get(entry.id) ?? [],
          onsetTags: entry.onset_tags ?? undefined,
          sleepMethod: entry.sleep_method ?? undefined,
        }));
```

- [ ] **Step 2: Update addEntry insert**

In `addEntry`, find the insert object (around line 122):

```typescript
      const { data: inserted, error } = await supabase
        .from('sleep_entries')
        .insert({
          user_id: targetBabyId,
          start_time: toSupabaseTimestamp(data.startTime),
          end_time: data.endTime ? toSupabaseTimestamp(data.endTime) : null,
          type: data.type,
          notes: data.notes || null,
        })
```

Add the new fields to the insert:

```typescript
      const { data: inserted, error } = await supabase
        .from('sleep_entries')
        .insert({
          user_id: targetBabyId,
          start_time: toSupabaseTimestamp(data.startTime),
          end_time: data.endTime ? toSupabaseTimestamp(data.endTime) : null,
          type: data.type,
          notes: data.notes || null,
          onset_tags: data.onsetTags ?? null,
          sleep_method: data.sleepMethod ?? null,
        })
```

- [ ] **Step 3: Update addEntry mapping of inserted row**

In the `newEntry` mapping (around line 139):

```typescript
      const newEntry: SleepEntry = {
        id: inserted.id,
        date: format(parseISO(inserted.start_time), 'yyyy-MM-dd'),
        startTime: inserted.start_time,
        endTime: inserted.end_time ?? null,
        type: inserted.type as 'nap' | 'night',
        notes: inserted.notes || undefined,
      };
```

Add:

```typescript
      const newEntry: SleepEntry = {
        id: inserted.id,
        date: format(parseISO(inserted.start_time), 'yyyy-MM-dd'),
        startTime: inserted.start_time,
        endTime: inserted.end_time ?? null,
        type: inserted.type as 'nap' | 'night',
        notes: inserted.notes || undefined,
        onsetTags: inserted.onset_tags ?? undefined,
        sleepMethod: inserted.sleep_method ?? undefined,
      };
```

- [ ] **Step 4: Update updateEntry**

In `updateEntry`, find where update fields are mapped (around line 158):

```typescript
      const updateData: Record<string, unknown> = {};
      if (data.startTime !== undefined) updateData.start_time = toSupabaseTimestamp(data.startTime);
      if (data.endTime !== undefined) updateData.end_time = data.endTime ? toSupabaseTimestamp(data.endTime) : null;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.notes !== undefined) updateData.notes = data.notes || null;
```

Add:

```typescript
      if (data.onsetTags !== undefined) updateData.onset_tags = data.onsetTags ?? null;
      if (data.sleepMethod !== undefined) updateData.sleep_method = data.sleepMethod ?? null;
```

- [ ] **Step 5: Verify build and commit**

Run: `npm run build`

```bash
git add src/hooks/useSleepEntries.ts
git commit -m "feat: map onsetTags and sleepMethod in fetch/save"
```

---

## Task 5: SleepEntrySheet — Chips and Notes UI

**Files:**
- Modify: `src/components/SleepEntrySheet.tsx`

This is the main UI task. Read the file first.

- [ ] **Step 1: Add state for onset tags, sleep method, and notes**

After the existing `pauseErrors` state declaration, add:

```typescript
  const [onsetTags, setOnsetTags] = useState<string[]>([]);
  const [sleepMethod, setSleepMethod] = useState<string | undefined>();
  const [entryNotes, setEntryNotes] = useState('');
```

- [ ] **Step 2: Reset state when sheet opens**

In the existing `useEffect` that resets on `entryId` / `isOpen` change, add inside the `if (isOpen)` block:

```typescript
      setOnsetTags(entry?.onsetTags ?? []);
      setSleepMethod(entry?.sleepMethod);
      setEntryNotes(entry?.notes ?? '');
```

- [ ] **Step 3: Update hasChanges to include new fields**

Find the `hasChanges` useMemo. It currently checks `startTime` and `endTime`. Add checks for the new fields:

Replace:
```typescript
    return startTime !== currentInitialStart || endTime !== currentInitialEnd;
```

With:
```typescript
    const tagsChanged = JSON.stringify(onsetTags) !== JSON.stringify(entry?.onsetTags ?? []);
    const methodChanged = sleepMethod !== (entry?.sleepMethod ?? undefined);
    const notesChanged = entryNotes !== (entry?.notes ?? '');
    return startTime !== currentInitialStart || endTime !== currentInitialEnd || tagsChanged || methodChanged || notesChanged;
```

Add `onsetTags`, `sleepMethod`, and `entryNotes` to the useMemo dependency array.

- [ ] **Step 4: Include new fields in handleSave payload**

In `handleSave`, find where the payload is built. Both the `nap` and `night` branches build a `payload` object. After each payload assignment, spread in the new fields. For example, the nap branch:

```typescript
      payload = {
        startTime: combineDateTime(selectedDate, startTime),
        endTime: endDateTime,
        type: 'nap',
        onsetTags: onsetTags.length > 0 ? onsetTags : undefined,
        sleepMethod: sleepMethod ?? undefined,
        notes: entryNotes.trim() || undefined,
      };
```

And the night branch:

```typescript
      payload = {
        startTime: combineDateTime(bedtimeDate, startTime),
        endTime: endDateTime,
        type: 'night',
        onsetTags: onsetTags.length > 0 ? onsetTags : undefined,
        sleepMethod: sleepMethod ?? undefined,
        notes: entryNotes.trim() || undefined,
      };
```

- [ ] **Step 5: Define chip data constants**

Add at the top of the file (after the icon components, before the `SleepEntrySheet` function):

```typescript
const ONSET_OPTIONS = [
  { key: 'long_onset', icon: '⏳' },
  { key: 'upset', icon: '😢' },
] as const;

const METHOD_OPTIONS = [
  { key: 'in_bed', icon: '🛏' },
  { key: 'nursing', icon: '🤱' },
  { key: 'worn_or_held', icon: '🤲' },
  { key: 'next_to_me', icon: '👤' },
  { key: 'bottle_feeding', icon: '🍼' },
  { key: 'stroller', icon: '🚼' },
  { key: 'car', icon: '🚗' },
  { key: 'swing', icon: '🎠' },
] as const;

// Map option key to i18n key in sleepEntry namespace
const ONSET_I18N: Record<string, string> = {
  long_onset: 'sleepEntry.longOnset',
  upset: 'sleepEntry.upset',
};

const METHOD_I18N: Record<string, string> = {
  in_bed: 'sleepEntry.inBed',
  nursing: 'sleepEntry.nursing',
  worn_or_held: 'sleepEntry.wornOrHeld',
  next_to_me: 'sleepEntry.nextToMe',
  bottle_feeding: 'sleepEntry.bottleFeeding',
  stroller: 'sleepEntry.stroller',
  car: 'sleepEntry.car',
  swing: 'sleepEntry.swing',
};
```

- [ ] **Step 6: Add chip toggle handlers**

Inside the component, after the pause handlers:

```typescript
  const toggleOnsetTag = (key: string) => {
    setOnsetTags((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const toggleSleepMethod = (key: string) => {
    setSleepMethod((prev) => (prev === key ? undefined : key));
  };
```

- [ ] **Step 7: Add qualitative section JSX**

In the component JSX, AFTER the pause section's closing `)}` and BEFORE the `{/* Save error from parent */}` block, add:

```tsx
              {/* Qualitative info — onset tags, sleep method, notes */}
              {isEditing || !entry ? (
                <div className="px-6 pb-4">
                  {/* Divider */}
                  <div className="h-px bg-[var(--text-muted)]/10 mb-4" />

                  {/* Onset quality — multi-select */}
                  <div className="mb-4">
                    <p className="text-[var(--text-muted)] text-xs uppercase tracking-wider mb-2">
                      {t('sleepEntry.onsetLabel')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {ONSET_OPTIONS.map(({ key, icon }) => {
                        const selected = onsetTags.includes(key);
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => toggleOnsetTag(key)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                              selected
                                ? 'bg-[var(--nap-color)]/20 text-[var(--nap-color)] border border-[var(--nap-color)]/30'
                                : 'text-[var(--text-muted)] border border-[var(--text-muted)]/20 hover:border-[var(--text-muted)]/40'
                            }`}
                          >
                            <span>{icon}</span>
                            <span>{t(ONSET_I18N[key]!)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sleep method — single-select */}
                  <div className="mb-4">
                    <p className="text-[var(--text-muted)] text-xs uppercase tracking-wider mb-2">
                      {t('sleepEntry.howLabel')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {METHOD_OPTIONS.map(({ key, icon }) => {
                        const selected = sleepMethod === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => toggleSleepMethod(key)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                              selected
                                ? 'bg-[var(--nap-color)]/20 text-[var(--nap-color)] border border-[var(--nap-color)]/30'
                                : 'text-[var(--text-muted)] border border-[var(--text-muted)]/20 hover:border-[var(--text-muted)]/40'
                            }`}
                          >
                            <span>{icon}</span>
                            <span>{t(METHOD_I18N[key]!)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notes textarea */}
                  <div>
                    <textarea
                      rows={2}
                      value={entryNotes}
                      onChange={(e) => setEntryNotes(e.target.value)}
                      placeholder={t('sleepEntry.notesPlaceholder')}
                      className="input w-full text-sm resize-none"
                    />
                  </div>
                </div>
              ) : null}
```

- [ ] **Step 8: Verify build and commit**

Run: `npm run build`
Expected: Successful compilation

```bash
git add src/components/SleepEntrySheet.tsx
git commit -m "feat: add onset tags, sleep method chips, and notes textarea to SleepEntrySheet"
```

---

## Task 6: Build Verification and Manual QA

- [ ] **Step 1: Run full build**

```bash
npm run build
```

Expected: Clean compilation.

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Expected: No new errors.

- [ ] **Step 3: Manual testing checklist**

Test in the browser (`npm run dev`):

1. Open a completed nap → see "Start" chips (Long time to fall asleep, Upset), "How" chips (8 options), notes textarea
2. Tap "Upset" → chip highlights in nap-color. Tap again → deselects
3. Tap "Long time to fall asleep" AND "Upset" → both selected (multi-select)
4. Tap "Nursing" → highlights. Tap "In bed" → Nursing deselects, In bed selects (single-select)
5. Tap selected method again → deselects (back to none)
6. Type a note in the textarea
7. Save → close and reopen → all selections and notes persist
8. Create a NEW entry → chips and notes available, save with selections
9. Check Spanish/Catalan: chip labels translate correctly
10. Verify no console errors
