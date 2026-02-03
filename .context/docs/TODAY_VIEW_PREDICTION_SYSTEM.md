# TodayView Prediction System - Complete Analysis

**Last Updated:** 2026-02-03
**Status:** Under active revision - recurring bugs identified

---

## Overview

The TodayView is the main screen showing:
1. **Hero Section**: Countdown to next event (nap/bedtime) or current sleep duration
2. **Timeline**: Visual flow of the day's events (wake-up → naps → bedtime)

The prediction system calculates:
- **Predicted naps**: When the next naps should occur
- **Expected bedtime**: When baby should go to sleep for the night

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         TodayView.tsx                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  INPUT DATA (from props):                                           │
│  ├── entries: SleepEntry[]        (all sleep records)               │
│  ├── activeSleep: SleepEntry|null (currently sleeping?)             │
│  ├── profile: BabyProfile         (baby's DOB for age calc)         │
│  └── awakeMinutes: number|null    (time since last sleep ended)     │
│                                                                      │
│  DERIVED STATE (useMemo):                                           │
│  ├── morningWakeUp          → from getMorningWakeUpEntry()          │
│  ├── todayNaps              → from getTodayNaps()                   │
│  ├── predictedNaps          → COMPLEX CALCULATION (see below)       │
│  ├── expectedBedtime        → COMPLEX CALCULATION (see below)       │
│  ├── nextEventCountdown     → derived from predictions              │
│  └── isBedtimeNext          → derived from predictions              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         dateUtils.ts                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  CONFIGURATION:                                                      │
│  ├── SLEEP_DEVELOPMENT_MAP[]      (age-based sleep configs)         │
│  └── getSleepConfigForAge()       (lookup config by DOB)            │
│                                                                      │
│  PREDICTION FUNCTIONS:                                               │
│  ├── getRecommendedSchedule()     (get nap count, bedtime window)   │
│  ├── getProgressiveWakeWindow()   (wake window by nap position)     │
│  ├── calculateSuggestedNapTime()  (next nap time calculation)       │
│  ├── calculateAllNapWindows()     (full day simulation)             │
│  ├── simulateDay()                (core simulation engine)          │
│  └── calculateDynamicBedtime()    (bedtime from anchor + WW)        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Key Concepts

### 1. Wake Windows
The time a baby can stay awake between sleep periods. Varies by:
- **Age**: Younger babies have shorter wake windows
- **Position in day**: First WW (after morning wake) is typically shortest
- **Previous nap duration**: Short naps → shorter next WW (compensation)

```typescript
wakeWindows: {
  first: number,   // Morning wake → first nap
  mid: number,     // Between naps
  final: number,   // Last nap → bedtime
  max: number,     // Maximum tolerable (overtired threshold)
}
```

### 2. Age-Based Configuration
From `SLEEP_DEVELOPMENT_MAP` in dateUtils.ts:

| Age (months) | Target Naps | First WW | Mid WW | Final WW |
|--------------|-------------|----------|--------|----------|
| 0-1.5        | 5           | 45m      | 45m    | 45m      |
| 3-4          | 4           | 75m      | 90m    | 90m      |
| 5-6          | 3           | 105m     | 120m   | 120m     |
| 8-9          | 2           | 150m     | 180m   | 195m     |
| 15-18        | 1           | 300m     | 300m   | 270m     |

### 3. Short Nap Compensation
If a nap is shorter than expected, the next wake window is reduced:

```typescript
< 30 min  → 0.65x (reduce by 35%)
< 45 min  → 0.75x (reduce by 25%)
< 60 min  → 0.85x (reduce by 15%)
≥ 60 min  → 1.0x  (no reduction)
```

---

## Prediction Flow (Step by Step)

### Step 1: Get Morning Wake-Up
```typescript
const morningWakeUpEntry = getMorningWakeUpEntry(entries);
// Finds: night sleep entry where endTime is TODAY
// Returns: null if no wake-up logged yet
```

**IMPORTANT**: If `morningWakeUp` is null, NO predictions are shown.

### Step 2: Get Today's Completed Naps
```typescript
const todayNaps = getTodayNaps(entries);
// Filters: type === 'nap' AND endTime !== null AND startTime is TODAY
// Sorted: chronologically by startTime
```

### Step 3: Calculate Predicted Naps (lines 127-225)

```typescript
const predictedNaps = useMemo(() => {
  // GATE 1: No predictions without morning wake-up
  if (!morningWakeUp) return [];
  if (!profile?.dateOfBirth) return [];

  // Build completed naps data for simulation
  const completedNapsData = todayNaps.map(nap => ({
    endTime: nap.endTime,
    durationMinutes: calculateDuration(nap.startTime, nap.endTime),
  }));

  // If there's an ACTIVE NAP, include it with expected end time
  if (activeSleep && activeSleep.type === 'nap') {
    const activeNapExpectedEnd = getExpectedWakeTime(activeSleep, profile);
    completedNapsData.push({
      endTime: activeNapExpectedEnd.toISOString(),
      durationMinutes: expectedDuration,
    });
  }

  // Run simulation to get remaining naps
  const projectedWindows = calculateAllNapWindows(dateOfBirth, completedNapsData);

  // Calculate actual times for each projected nap
  for (window of projectedWindows) {
    const nextNapTime = calculateSuggestedNapTime(...);

    // Only show if in the future
    if (isAfter(nextNapTime, now)) {
      predictions.push({ time, isCatnap, expectedDuration });
    }
  }

  return predictions;
}, [...]);
```

### Step 4: Calculate Expected Bedtime (lines 229-285)

```typescript
const expectedBedtime = useMemo(() => {
  // Priority 1: Use last PREDICTED nap's end as anchor
  if (predictedNaps.length > 0) {
    const lastPredicted = predictedNaps[predictedNaps.length - 1];
    anchorEndTime = addMinutes(lastPredicted.time, lastPredicted.expectedDuration);
  }
  // Priority 2: Use active nap's expected wake (only if NO predictions)
  else if (activeSleep && activeSleep.type === 'nap') {
    anchorEndTime = getExpectedWakeTime(activeSleep, profile);
  }
  // Priority 3: Use last completed nap's end
  else if (todayNaps.length > 0) {
    anchorEndTime = parseISO(lastNap.endTime);
  }

  // Calculate bedtime = anchor + final wake window
  return calculateDynamicBedtime(dateOfBirth, anchorEndTime, accumulatedSleep);
}, [...]);
```

---

## The Simulation Engine (dateUtils.ts)

### simulateDay() - Core Algorithm

```typescript
function simulateDay(dateOfBirth, morningWakeMinutes, completedNaps) {
  const config = getSleepConfigForAge(dateOfBirth);

  // Start from last completed nap or morning wake
  let currentMinutes = lastNapEnd || morningWakeMinutes;
  let napCount = completedNaps.length;

  // Keep adding naps until target reached or bedtime
  while (napCount < config.targetNaps) {
    // Calculate wake window for this position
    const wakeWindow = getWakeWindowForPosition(napCount);

    // Apply short nap compensation
    wakeWindow *= getShortNapCompensation(lastNapDuration);

    // Calculate nap start
    const napStart = currentMinutes + wakeWindow;

    // Is this a catnap? (after 16:00)
    const isCatnap = napStart >= 16 * 60;

    // Determine duration
    const duration = isCatnap ? microNap : standardNap;

    // Add nap if it fits or baby needs rest
    projectedNaps.push({ napStart, duration, ... });

    currentMinutes = napStart + duration;
    napCount++;
  }

  // Bedtime = last activity + final wake window
  const bedtime = currentMinutes + config.wakeWindows.final;

  return { projectedNaps, bedtime, ... };
}
```

### calculateDynamicBedtime() - Simple Formula

```typescript
function calculateDynamicBedtime(dateOfBirth, lastNapEndTime, _) {
  const config = getSleepConfigForAge(dateOfBirth);
  const lastNapEnd = parseISO(lastNapEndTime);

  // ELASTIC BEDTIME: anchor + final wake window
  return new Date(lastNapEnd.getTime() + config.wakeWindows.final * 60 * 1000);
}
```

---

## Current State Analysis (After Today's Fix)

### What We Fixed Today

**Bug**: Bedtime was showing at 15:30 when there were predicted naps at 14:38 and 18:08.

**Root Cause**: The priority order for bedtime anchor was wrong:
```typescript
// BEFORE (buggy):
1. Active nap → use expected wake time  ← WON, ignored predictions!
2. Predicted naps → use last predicted nap's end

// AFTER (fixed):
1. Predicted naps → use last predicted nap's end  ← Now first!
2. Active nap → use expected wake time
```

### Verification Test Cases

#### Test Case 1: Active Nap with Future Predictions
```
Scenario:
- Baby is 6 months old (3-nap schedule)
- Morning wake: 07:00
- Active nap: 11:45 (started, no end time)
- Expected predictions: ~14:38 (nap 2), ~18:08 (nap 3)

Expected behavior:
✓ Predicted naps show at 14:38 and 18:08
✓ Bedtime uses 18:08 + duration (~45min) + final WW (~150min) = ~20:43
✓ Bedtime does NOT use 11:45 + 45min + final WW = ~14:30

Current code: CORRECT (after today's fix)
```

#### Test Case 2: No Active Nap, All Predictions
```
Scenario:
- Baby is 6 months old
- Morning wake: 07:00
- No naps completed yet, baby is awake

Expected behavior:
✓ Predicted naps show for all 3 naps
✓ Bedtime uses last predicted nap's end as anchor

Current code: CORRECT
```

#### Test Case 3: All Naps Completed
```
Scenario:
- Baby is 6 months old
- Morning wake: 07:00
- 3 naps completed, last ended at 17:00

Expected behavior:
✓ No predicted naps (all done)
✓ Bedtime uses last completed nap (17:00) + final WW = ~19:30

Current code: CORRECT
```

#### Test Case 4: No Morning Wake-Up Logged
```
Scenario:
- Baby woke up but user hasn't logged it yet

Expected behavior:
✓ No predictions shown (line 128: `if (!morningWakeUp) return []`)
✓ Empty state or prompt to log wake-up

Current code: CORRECT
```

---

## Potential Edge Cases / Future Issues

### 1. Timezone Handling
All times use local timezone via `parseISO()` and `new Date()`. Should work correctly but not explicitly tested across timezone changes.

### 2. Overnight Sleep Display
Night sleep entries span two days. The `morningWakeUpEntry` finds night sleep where `endTime` is today, which correctly identifies yesterday's bedtime.

### 3. Stale Predictions
The `now` variable is created once per render. The component re-renders every minute (line 96-100), but predictions could be slightly stale between renders.

### 4. Missing Dependencies in useMemo
The `predictedNaps` calculation has a potential issue:
- It uses `profile` in `getExpectedWakeTime()` but also lists `profile` separately in deps
- Could cause unnecessary recalculations

### 5. Accumulated Sleep Not Used
In `calculateDynamicBedtime()`, the `_totalDaytimeSleepMinutes` parameter is ignored:
```typescript
export function calculateDynamicBedtime(
  dateOfBirth: string,
  lastNapEndTime: string,
  _totalDaytimeSleepMinutes: number  // UNUSED!
): Date {
```
This was likely intended to adjust bedtime based on total sleep but never implemented.

---

## Recommendations

1. **Add unit tests** for the prediction logic with various scenarios
2. **Document the priority order** clearly in code comments
3. **Consider simplifying** the dual calculation approach (TodayView calculates predictions, then recalculates times from those predictions)
4. **Add telemetry/logging** to track prediction accuracy over time

---

## Quick Reference: Key Functions

| Function | Location | Purpose |
|----------|----------|---------|
| `getTodayNaps()` | TodayView.tsx:27 | Filter completed naps for today |
| `getMorningWakeUpEntry()` | TodayView.tsx:34 | Find night sleep that ended today |
| `getExpectedWakeTime()` | TodayView.tsx:41 | Calculate when active nap should end |
| `getSleepConfigForAge()` | dateUtils.ts:382 | Get age-appropriate sleep config |
| `getProgressiveWakeWindow()` | dateUtils.ts:419 | Get wake window for nap position |
| `calculateSuggestedNapTime()` | dateUtils.ts:447 | Calculate next nap time |
| `calculateAllNapWindows()` | dateUtils.ts:708 | Run full day simulation |
| `simulateDay()` | dateUtils.ts:549 | Core simulation engine |
| `calculateDynamicBedtime()` | dateUtils.ts:676 | Calculate bedtime from anchor |
