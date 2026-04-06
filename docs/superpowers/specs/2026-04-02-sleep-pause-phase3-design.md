# Sleep Pause — Phase 3 Design: Night Waking

> Contextual labelling of pauses on bedtime entries + QuickActionSheet integration + DailySummary count

## Overview

Night waking is a **pause on a night entry** with distinct visual treatment. No data model changes — the label is derived from `entry.type === 'night'`. This phase adds contextual labels, a QuickActionSheet shortcut, and night waking counts in the daily summary.

**Out of scope:** Qualitative tags (Phase 4), stats/report night waking trends (future).

---

## 1. Contextual Labels in SleepEntrySheet

When `entry.type === 'night'`, all pause-related UI changes:

| Element | Nap (unchanged) | Night (new) |
|---------|-----------------|-------------|
| Pause card title | "Pause 1" | "Night waking 1" |
| Pause card icon | ⏸ | Storm cloud icon |
| Card text colour | `--text-primary` | `--wake-color` |
| Add button | "+ Add pause" | "+ Add night waking" |
| Live pause label | "Paused" | "Night waking" |
| Pause/Play aria-label | "Pause" / "Resume" | "Night waking" / "Resume" |

The storm cloud icon is a small inline SVG (cloud with lightning bolt), rendered at 14px in the card header.

### Implementation

A helper derives the label context:

```typescript
const isNightEntry = entry?.type === 'night';
const pauseLabel = isNightEntry ? t('sleepEntrySheet.nightWaking') : t('sleepEntrySheet.pause');
const pauseNumberLabel = (n: number) => isNightEntry 
  ? t('sleepEntrySheet.nightWakingNumber', { number: n })
  : t('sleepEntrySheet.pauseNumber', { number: n });
const addPauseLabel = isNightEntry ? t('sleepEntrySheet.addNightWaking') : t('sleepEntrySheet.addPause');
const pausedStatusLabel = isNightEntry ? t('sleepEntrySheet.nightWakingStatus') : t('sleepEntrySheet.pausedStatus');
```

These replace hardcoded references throughout the pause section JSX.

---

## 2. QuickActionSheet — Night Waking Button

### Layout

A second row appears below the existing 3-column grid, containing a single centered "Night waking" button. Only visible when `hasNightEntry` is true (active bedtime or last completed night entry from today/yesterday).

```
Row 1:  [Wake Up]  [Nap]  [Bedtime]
Row 2:       [Night waking]
```

The button uses `--wake-color` styling with a storm cloud icon, matching the existing grid item pattern (icon circle + label).

### Props

New props on `QuickActionSheetProps`:

```typescript
  hasNightEntry: boolean;       // true when there's a bedtime to attach a waking to
  onNightWaking?: () => void;   // handler for the night waking action
```

### Tap Behaviour (handled in App.tsx)

The `onNightWaking` handler in App.tsx:
- If `activeSleep?.type === 'night'` → start a live pause (call `setActivePauseStart(new Date())`) and open the SleepEntrySheet for the active bedtime
- If no active sleep but last completed entry is night → open the SleepEntrySheet for that entry (retrospective — user manually adds the pause via "+ Add night waking")

---

## 3. DailySummary — Night Waking Count

Add a night waking stat row to `DailySummary` when the day has night entries with pauses.

### Data

`computeDailySummary` in `useSleepEntries.ts` already has access to night entries. Add two new fields to the return value:

```typescript
nightWakingCount: number;      // total pause count across all night entries for the day
nightWakingMinutes: number;    // total pause minutes across all night entries
```

### Display

In `DailySummary.tsx`, when `nightWakingCount > 0`, show an additional row below the existing 4-column grid:

```
"3 night wakings (22 min total)"
```

Styled in `--wake-color`, small text, with a storm cloud icon inline.

---

## 4. i18n

New keys in `sleepEntrySheet` namespace:

| Key | EN | ES | CA |
|-----|----|----|-----|
| `nightWaking` | Night waking | Despertar nocturno | Despertar nocturn |
| `nightWakingNumber` | Night waking {{number}} | Despertar nocturno {{number}} | Despertar nocturn {{number}} |
| `addNightWaking` | Add night waking | Añadir despertar nocturno | Afegir despertar nocturn |
| `nightWakingStatus` | Night waking | Despertar nocturno | Despertar nocturn |

New keys in `quickActions` namespace:

| Key | EN | ES | CA |
|-----|----|----|-----|
| `nightWaking` | Night waking | Despertar nocturno | Despertar nocturn |

New keys in `dailySummary` namespace:

| Key | EN | ES | CA |
|-----|----|----|-----|
| `nightWakings` | {{count}} night waking | {{count}} despertar nocturno | {{count}} despertar nocturn |
| `nightWakingsPlural` | {{count}} night wakings | {{count}} despertares nocturnos | {{count}} despertars nocturns |
| `nightWakingsDuration` | ({{duration}} total) | ({{duration}} en total) | ({{duration}} en total) |

---

## 5. Files Touched

| File | Change |
|------|--------|
| `src/components/SleepEntrySheet.tsx` | Contextual labels (night waking vs pause), storm cloud icon |
| `src/components/QuickActionSheet.tsx` | Night waking button (second row), new props |
| `src/components/DailySummary.tsx` | Night waking count + duration row |
| `src/hooks/useSleepEntries.ts` | Add `nightWakingCount` and `nightWakingMinutes` to `computeDailySummary` |
| `src/App.tsx` | Pass `hasNightEntry` and `onNightWaking` to QuickActionSheet |
| `src/locales/en.json` | New keys |
| `src/locales/es.json` | New keys |
| `src/locales/ca.json` | New keys |

---

## 6. No Database or Type Changes

Night waking = pause where parent entry type is 'night'. The distinction is purely presentational. No new tables, columns, or interfaces.
