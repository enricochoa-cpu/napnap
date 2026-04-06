# Sleep Pause — Phase 2 Design: Live Pause/Resume

> Real-time pause/resume during an active nap or bedtime

## Overview

Add the ability to pause and resume the live timer during an ongoing sleep session. When the parent taps Pause, the timer freezes. When they tap Play (resume), a pause record is created with the computed duration. This builds on Phase 1's `sleep_pauses` table — no schema changes needed.

**Out of scope:** Night waking labelling (Phase 3), qualitative tags (Phase 4).

---

## UI: Active Sleep Sheet — Two Buttons

When the SleepEntrySheet opens for an active entry (`endTime === null`), the bottom action area shows **two side-by-side circular buttons** instead of the current single Stop button:

| Button | Icon | Position | Action |
|--------|------|----------|--------|
| Pause/Play | `⏸` (pause) / `▶` (play) | Left | Toggle pause state |
| Stop | `⏹` (square) | Right | End sleep session |

Both buttons: `w-14 h-14`, rounded-full, themed with the entry colour (`--nap-color` or `--night-color`).

**When paused:**
- The Pause button icon switches to Play (triangle)
- A subtle pulsing ring (`--wake-color`, opacity animation) appears around the Play button to indicate "action needed"
- The Stop button remains available — tapping Stop while paused ends the pause first, then ends the sleep

**When not paused:**
- Normal state: Pause button shows `⏸`, Stop shows `⏹`

---

## Pause State Management

### Local state in SleepEntrySheet

```typescript
const [activePauseStart, setActivePauseStart] = useState<Date | null>(null);
```

This is purely local — an in-progress pause has no DB record until it's completed (on resume or stop).

### Tap Pause (start a pause)

1. Set `activePauseStart = new Date()`
2. No DB call — the pause is "in flight"

### Tap Play (resume / end the pause)

1. Compute `durationMinutes = Math.max(1, Math.round((Date.now() - activePauseStart.getTime()) / 60000))`
2. Call `onAddPause(entry.id, { startTime: activePauseStart.toISOString(), durationMinutes })`
3. Clear `activePauseStart = null`
4. Timer resumes counting

Minimum duration is 1 minute — sub-minute pauses are rounded up.

### Tap Stop (while paused)

1. End the in-flight pause first (same as "Tap Play" above)
2. Then proceed with existing Stop logic (set endTime to now)

### Tap Stop (while not paused)

Existing behaviour unchanged — sets endTime to now.

### Sheet close / unmount while paused

If the sheet closes while a pause is in flight (user swipes down), the pause is **discarded** — no DB record created. This is intentional: the parent may have tapped Pause accidentally and dismissed. The timer resumes as if no pause happened. A brief toast or subtle visual cue could warn "Pause discarded" but is not required for Phase 2.

---

## Timer Display

### Normal (not paused)

Current behaviour: live counter shows elapsed minutes since `startTime`, updates every 60 seconds.

### During pause

- The elapsed time display **freezes** at the value it had when Pause was tapped
- Below the frozen time, show "Paused" in italic, `--wake-color` text
- The duration label in the SleepEntrySheet shows net sleep (gross minus completed pauses minus in-flight pause time)

### After resume

Timer resumes counting from the frozen value, adding only actual sleep time (excluding pause duration). The formula:

```
displayedMinutes = grossElapsed - completedPauseMinutes - inFlightPauseMinutes
```

Where:
- `grossElapsed = differenceInMinutes(now, entry.startTime)`
- `completedPauseMinutes = sum of entry.pauses[].durationMinutes`
- `inFlightPauseMinutes = activePauseStart ? Math.round((now - activePauseStart) / 60000) : 0`

---

## TodayView Active Card

The hero card for active sleep in TodayView should reflect the pause state:

- **When paused:** Show a small "Paused" text badge (italic, `--wake-color`) below the duration counter. The duration counter freezes (stops incrementing).
- **When not paused:** Current behaviour (live counter).

### How TodayView knows about pause state

The pause state (`activePauseStart`) lives in SleepEntrySheet (local state). TodayView doesn't need to know about in-flight pauses directly — it already reads `entry.pauses` from the hook for completed pauses. For the in-flight pause:

**Approach:** Lift `activePauseStart` to App.tsx state so both SleepEntrySheet and TodayView can read it. This is a simple `useState<Date | null>(null)` in App, passed as props to both components.

---

## No Database Changes

The existing `sleep_pauses` table handles this. A live pause becomes a regular pause record when the user taps Play/Stop. The `start_time` is the moment Pause was tapped, `duration_minutes` is computed on resume.

---

## i18n

New keys in `sleepEntrySheet` namespace (en/es/ca):

| Key | EN | ES | CA |
|-----|----|----|-----|
| `pauseAction` | Pause | Pausar | Pausar |
| `resumeAction` | Resume | Reanudar | Reprendre |
| `pausedStatus` | Paused | En pausa | En pausa |

---

## Files Touched

| File | Change |
|------|--------|
| `src/components/SleepEntrySheet.tsx` | Add activePauseStart state, Pause/Play button, timer freeze logic, paused status label, handle stop-while-paused |
| `src/components/TodayView.tsx` | Show "Paused" badge on active card, freeze counter when paused |
| `src/App.tsx` | Lift activePauseStart state, pass as prop to SleepEntrySheet and TodayView |
| `src/locales/en.json` | 3 new keys |
| `src/locales/es.json` | 3 new keys |
| `src/locales/ca.json` | 3 new keys |

---

## What This Does NOT Cover

- Night waking labelling and QuickActionSheet integration (Phase 3)
- Qualitative tags (Phase 4)
- Pause persistence across app restarts (in-flight pause is lost on refresh — acceptable for Phase 2)
- Multiple concurrent pauses (only one pause can be in-flight at a time)
