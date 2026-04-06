# Sleep Qualitative Information — Phase 4 Design

> Structured onset tags, sleep method chips, and notes textarea in SleepEntrySheet

## Overview

Add optional structured metadata to each sleep entry: onset quality tags (multi-select), sleep method (single-select), and a visible notes textarea. All data is stored as new columns on `sleep_entries` — no new tables. The UI uses tappable chip components in the SleepEntrySheet, below the pause section.

**Out of scope:** Report integration (qualitative patterns in SleepReportView), showing tags on compact timeline cards. These are documented in the backlog for future work.

---

## 1. Database Migration

Add two columns to `sleep_entries`:

```sql
ALTER TABLE sleep_entries ADD COLUMN onset_tags text[] DEFAULT NULL;
ALTER TABLE sleep_entries ADD COLUMN sleep_method text DEFAULT NULL;
```

No RLS changes — these columns inherit the existing row-level policies on `sleep_entries`.

---

## 2. Types

Extend `SleepEntry` in `src/types/index.ts`:

```typescript
export interface SleepEntry {
  // ... existing fields
  onsetTags?: string[];     // e.g. ['long_onset', 'upset'] — multi-select
  sleepMethod?: string;      // e.g. 'nursing' — single-select
}
```

Extend `DbSleepEntry` in `src/lib/supabase.ts`:

```typescript
export interface DbSleepEntry {
  // ... existing fields
  onset_tags: string[] | null;
  sleep_method: string | null;
}
```

---

## 3. Data Layer (useSleepEntries)

### Fetch mapping

In `fetchEntries`, map the new DB fields:

```typescript
onsetTags: entry.onset_tags ?? undefined,
sleepMethod: entry.sleep_method ?? undefined,
```

### Save/Update

In `addEntry` and `updateEntry`, include the new fields in the Supabase insert/update:

```typescript
onset_tags: data.onsetTags ?? null,
sleep_method: data.sleepMethod ?? null,
```

### onSave callback

The `SleepEntrySheet.onSave` signature is `(data: Omit<SleepEntry, 'id' | 'date'>) => void | Promise<void>`. The new fields are already part of `SleepEntry`, so they flow through without signature changes.

---

## 4. SleepEntrySheet UI

### Layout position

Below the pause section, above the save button. Three subsections stacked vertically:

1. **"Start" label + onset chips** (multi-select)
2. **"How" label + method chips** (single-select)
3. **Notes textarea**

Separated from the pause section by a thin divider. All sections visible for both new and editing entries (not just completed entries like pauses).

### Onset chips (multi-select)

| Key | Label | Icon |
|-----|-------|------|
| `long_onset` | Long time to fall asleep | Hourglass (⏳) |
| `upset` | Upset | Sad face (😢) |

Chips are horizontal, wrapping if needed. Tap toggles selection. Selected state: `--nap-color` bg at 20% opacity + `--nap-color` text + subtle border. Unselected: `var(--glass-bg)` + `--text-muted`.

### Sleep method chips (single-select)

| Key | Label | Icon |
|-----|-------|------|
| `in_bed` | In bed | 🛏 |
| `nursing` | Nursing | 🤱 |
| `worn_or_held` | Worn or held | 🤲 |
| `next_to_me` | Next to me | 👤 |
| `bottle_feeding` | Bottle feeding | 🍼 |
| `stroller` | Stroller | 🚼 |
| `car` | Car | 🚗 |
| `swing` | Swing | 🎠 |

Same chip styling as onset. Tap selects one — tapping the already-selected chip deselects it (back to none). Chips wrap in a flex-wrap row.

### Notes textarea

Reuses existing `notes` field on `SleepEntry`. 2-row textarea with `sleepEntry.notesPlaceholder` ("Add a note..."). Uses existing `.input` CSS class. Saves on blur (same pattern as pause duration).

### State management

Local state for onset tags and sleep method, initialised from `entry` prop (or empty for new entries). Included in the `handleSave` payload alongside startTime/endTime/type.

```typescript
const [onsetTags, setOnsetTags] = useState<string[]>([]);
const [sleepMethod, setSleepMethod] = useState<string | undefined>();
const [notes, setNotes] = useState('');
```

Reset when sheet opens (in the existing `useEffect`).

---

## 5. i18n

New keys in `sleepEntry` namespace:

| Key | EN | ES | CA |
|-----|----|----|-----|
| `onsetLabel` | Start | Inicio | Inici |
| `howLabel` | How | Cómo | Com |
| `longOnset` | Long time to fall asleep | Tardó en dormirse | Va tardar a adormir-se |
| `upset` | Upset | Irritable | Irritable |
| `inBed` | In bed | En cama | Al llit |
| `nursing` | Nursing | Lactancia | Lactància |
| `wornOrHeld` | Worn or held | En brazos | En braços |
| `nextToMe` | Next to me | A mi lado | Al meu costat |
| `bottleFeeding` | Bottle feeding | Biberón | Biberó |
| `stroller` | Stroller | Cochecito | Cotxet |
| `car` | Car | Coche | Cotxe |
| `swing` | Swing | Columpio | Gronxador |

---

## 6. Files Touched

| File | Change |
|------|--------|
| `supabase/migrations/20260402000001_sleep_qualitative.sql` | New — ADD COLUMN onset_tags, sleep_method |
| `src/types/index.ts` | Extend SleepEntry |
| `src/lib/supabase.ts` | Extend DbSleepEntry |
| `src/hooks/useSleepEntries.ts` | Map new fields in fetch, include in add/update |
| `src/components/SleepEntrySheet.tsx` | Chip sections + notes textarea |
| `src/locales/en.json` | 12 new keys |
| `src/locales/es.json` | 12 new keys |
| `src/locales/ca.json` | 12 new keys |

---

## 7. What This Does NOT Cover

- Qualitative patterns in SleepReportView (backlog item)
- Showing tags on compact timeline cards (backlog item)
- Stats/trends for sleep methods or onset quality (backlog item)
