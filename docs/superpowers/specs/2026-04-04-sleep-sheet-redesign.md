# SleepEntrySheet Qualitative Redesign

> Napper-style tall grid cards, new End/Wake mood sections, compact pause button, floating action buttons

## Overview

Redesign the qualitative section of SleepEntrySheet to match Napper's premium card-based layout. Replace inline pill chips with tall grid cards. Add two new tag sections (End, Wake up mood). Compact the "Add pause" button. Float action buttons over blurred content hint. Add "Notes" header.

---

## 1. Database Migration

Two new nullable columns on `sleep_entries`:

```sql
ALTER TABLE sleep_entries ADD COLUMN wake_method text DEFAULT NULL;
ALTER TABLE sleep_entries ADD COLUMN wake_mood text DEFAULT NULL;
```

No RLS changes — inherits existing row policies.

## 2. Types

Extend `SleepEntry`:
```typescript
wakeMethod?: string;   // 'woke_up_child' | 'woke_up_naturally'
wakeMood?: string;     // 'bad' | 'neutral' | 'good'
```

Extend `DbSleepEntry`:
```typescript
wake_method: string | null;
wake_mood: string | null;
```

## 3. Data Layer

Map `wake_method`/`wake_mood` in fetch, add, update — same pattern as `onset_tags`/`sleep_method`.

## 4. Card Grid Layout

Replace inline pill chips with Napper-style tall card buttons:

### Card component specs
- Height: ~80px
- Border-radius: rounded-2xl (16px)
- Background: `var(--glass-bg)`
- Border: `1px solid var(--glass-border)`
- Content: emoji icon centered (24-28px), label text below (12-13px)
- Selected state: `bg-[var(--nap-color)]/20`, `border-[var(--nap-color)]/30`, text `var(--nap-color)`
- Unselected: muted glass with `var(--text-muted)` text

### Section grids

**Start** (onset quality — multi-select):
| Key | Label | Emoji | Grid |
|-----|-------|-------|------|
| `long_onset` | Long time to fall asleep | ⏳ | 2×1 row |
| `upset` | Upset | 😢 | |

**How** (sleep method — single-select):
| Key | Label | Emoji | Grid |
|-----|-------|-------|------|
| `in_bed` | In bed | 🛏 | 3×3 grid |
| `nursing` | Nursing | 🤱 | |
| `worn_or_held` | Worn or held | 🤲 | |
| `next_to_me` | Next to me | 👤 | |
| `bottle_feeding` | Bottle feeding | 🍼 | |
| `stroller` | Stroller | 🚼 | |
| `car` | Car | 🚗 | |
| `swing` | Swing | 🎠 | |

**End** (wake method — single-select, NEW):
| Key | Label | Emoji | Grid |
|-----|-------|-------|------|
| `woke_up_child` | Woke up child | 🔔 | 2×1 row |
| `woke_up_naturally` | Woke up naturally | 🌤 | |

**Wake up mood** (single-select, NEW):
| Key | Label | Emoji | Grid |
|-----|-------|-------|------|
| `bad` | Bad mood | 😟 | 3×1 row |
| `neutral` | Neutral | 😐 | |
| `good` | Good mood | 😊 | |

All sections always visible (new entries, editing, active). All optional — no selection required.

## 5. "Add pause" Button Redesign

Replace the full-width dashed border button with a compact centered pill:
- Width: auto (~160px), centered
- Background: `var(--glass-bg)`
- Border: `1px solid var(--glass-border)` (visible, not dashed)
- Border-radius: rounded-full (pill shape)
- Text: "Add pause +" / "Add night waking +" in `var(--text-muted)`
- Padding: `py-2 px-5`

## 6. "Notes" Section Header

Add a section header label above the textarea:
- "Notes" — same uppercase muted style as "Start", "How", "End", "Wake up mood"
- Uses existing `sleepEntry.notes` i18n key

## 7. Floating Action Buttons with Blur Hint

The Pause/Play + Stop buttons (or Save button for completed entries) sit at the bottom of the sheet in a fixed area with:
- Gradient fade from transparent to `var(--bg-card)` behind the buttons
- `backdrop-blur-sm` on the gradient area
- This creates a visual hint that there's more scrollable content below

The buttons are already outside the scrollable area (from the 75dvh fix). Just add the gradient overlay above them.

## 8. i18n

New keys in `sleepEntry` namespace:

| Key | EN | ES | CA |
|-----|----|----|-----|
| `endLabel` | End | Final | Final |
| `wakeMoodLabel` | Wake up mood | Humor al despertar | Humor al despertar |
| `wokeUpChild` | Woke up child | Lo despertaron | El van despertar |
| `wokeUpNaturally` | Woke up naturally | Se despertó solo | Es va despertar sol |
| `badMood` | Bad mood | Mal humor | Mal humor |
| `neutralMood` | Neutral | Neutral | Neutral |
| `goodMood` | Good mood | Buen humor | Bon humor |
| `notesLabel` | Notes | Notas | Notes |

## 9. Files Touched

| File | Change |
|------|--------|
| `supabase/migrations/20260404000000_wake_method_mood.sql` | New columns |
| `src/types/index.ts` | Extend SleepEntry |
| `src/lib/supabase.ts` | Extend DbSleepEntry |
| `src/hooks/useSleepEntries.ts` | Map new fields |
| `src/components/SleepEntrySheet.tsx` | Card grids, compact pause button, Notes header, floating blur, new sections |
| `src/locales/en.json` | 8 new keys |
| `src/locales/es.json` | 8 new keys |
| `src/locales/ca.json` | 8 new keys |

## 10. What This Does NOT Cover

- Report integration for wake method/mood trends (backlog)
- Showing tags on compact timeline cards (backlog)
