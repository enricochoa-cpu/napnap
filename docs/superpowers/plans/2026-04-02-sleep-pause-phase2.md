# Sleep Pause Phase 2 — Live Pause/Resume Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add real-time pause/resume during active sleep — Pause freezes the timer, Play resumes it and creates a pause record.

**Architecture:** Local `activePauseStart` state lifted to App.tsx, passed to SleepEntrySheet (for Pause/Play buttons) and TodayView (for frozen counter + "Paused" badge). On resume, a pause record is created via the existing `addPause` hook function. No DB changes needed.

**Tech Stack:** React 18, TypeScript, Framer Motion, i18next, date-fns.

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/App.tsx` | Modify | Lift `activePauseStart` state, pass to SleepEntrySheet and TodayView |
| `src/components/SleepEntrySheet.tsx` | Modify | Pause/Play + Stop buttons for active entries, timer freeze, "Paused" label |
| `src/components/TodayView.tsx` | Modify | Freeze duration counter when paused, show "Paused" badge |
| `src/locales/en.json` | Modify | 3 new keys |
| `src/locales/es.json` | Modify | 3 new keys |
| `src/locales/ca.json` | Modify | 3 new keys |

---

## Task 1: i18n Keys

**Files:**
- Modify: `src/locales/en.json`
- Modify: `src/locales/es.json`
- Modify: `src/locales/ca.json`

- [ ] **Step 1: Add English keys**

In `src/locales/en.json`, inside the `"sleepEntrySheet"` object, after the `"pauseOverlap"` key, add:

```json
"pauseAction": "Pause",
"resumeAction": "Resume",
"pausedStatus": "Paused"
```

- [ ] **Step 2: Add Spanish keys**

In `src/locales/es.json`, inside the `"sleepEntrySheet"` object, after the `"pauseOverlap"` key, add:

```json
"pauseAction": "Pausar",
"resumeAction": "Reanudar",
"pausedStatus": "En pausa"
```

- [ ] **Step 3: Add Catalan keys**

In `src/locales/ca.json`, inside the `"sleepEntrySheet"` object, after the `"pauseOverlap"` key, add:

```json
"pauseAction": "Pausar",
"resumeAction": "Reprendre",
"pausedStatus": "En pausa"
```

- [ ] **Step 4: Commit**

```bash
git add src/locales/en.json src/locales/es.json src/locales/ca.json
git commit -m "feat: add i18n keys for live pause/resume (en/es/ca)"
```

---

## Task 2: Lift activePauseStart State to App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add activePauseStart state**

In `src/App.tsx`, after the existing `editingEntryId` / `editingEntry` block (around line 183), add:

```typescript
  // Live pause: tracks when the current pause started (null = not paused)
  const [activePauseStart, setActivePauseStart] = useState<Date | null>(null);
```

- [ ] **Step 2: Clear pause state when sheet closes or entry changes**

Find the `onClose` callback in the SleepEntrySheet JSX (around line 871). Add `setActivePauseStart(null)` to the close handler:

```tsx
onClose={() => {
  setShowEntrySheet(false);
  setEditingEntryId(null);
  setEntrySheetError(null);
  setLogWakeUpMode(false);
  setPredictedStartTime(undefined);
  setPredictedEndTime(undefined);
  setActivePauseStart(null);
}}
```

- [ ] **Step 3: Pass activePauseStart and setter to SleepEntrySheet**

Add these props to the SleepEntrySheet JSX:

```tsx
<SleepEntrySheet
  // ... existing props
  activePauseStart={activePauseStart}
  onPauseStart={() => setActivePauseStart(new Date())}
  onPauseEnd={() => setActivePauseStart(null)}
/>
```

- [ ] **Step 4: Pass activePauseStart to TodayView**

Add the prop to the TodayView JSX:

```tsx
<TodayView
  // ... existing props
  activePauseStart={activePauseStart}
/>
```

- [ ] **Step 5: Verify the build compiles**

Run: `npm run build`
Expected: TypeScript errors about missing props on SleepEntrySheet and TodayView (expected — we'll add them next)

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx
git commit -m "feat: lift activePauseStart state to App for live pause"
```

---

## Task 3: SleepEntrySheet — Pause/Play + Stop Buttons

**Files:**
- Modify: `src/components/SleepEntrySheet.tsx`

- [ ] **Step 1: Add new props**

Add to the `SleepEntrySheetProps` interface:

```typescript
  /** When non-null, a pause is in-flight (started at this time). */
  activePauseStart?: Date | null;
  /** Called when user taps Pause — parent sets activePauseStart. */
  onPauseStart?: () => void;
  /** Called when pause ends (resume or stop) — parent clears activePauseStart. */
  onPauseEnd?: () => void;
```

Destructure in the component function:

```typescript
  activePauseStart,
  onPauseStart,
  onPauseEnd,
```

- [ ] **Step 2: Add PauseIcon component**

Add after the existing `StopIcon` component (around line 46):

```typescript
const PauseIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="5" width="4" height="14" rx="1" />
    <rect x="14" y="5" width="4" height="14" rx="1" />
  </svg>
);
```

- [ ] **Step 3: Add handlePause and handleResume handlers**

Add after the existing `handleDeletePause` function:

```typescript
  const handlePause = () => {
    if (!onPauseStart) return;
    onPauseStart();
  };

  const handleResume = async () => {
    if (!activePauseStart || !onPauseEnd || !onAddPause || !entry) return;
    const durationMinutes = Math.max(1, Math.round((Date.now() - activePauseStart.getTime()) / 60000));
    await onAddPause(entry.id, {
      startTime: activePauseStart.toISOString(),
      durationMinutes,
    });
    onPauseEnd();
  };
```

- [ ] **Step 4: Update handleSave to end pause before stopping**

In the existing `handleSave` function, right at the top (after the early returns), add logic to end an in-flight pause before saving:

Find this block:
```typescript
    const resolvedEndTime = (isActiveEntry && !endTime && !hasChanges) ? getCurrentTime() : endTime;
```

Add before it:
```typescript
    // If paused, end the pause first before stopping
    if (activePauseStart && onPauseEnd && onAddPause && entry) {
      const pauseDuration = Math.max(1, Math.round((Date.now() - activePauseStart.getTime()) / 60000));
      await onAddPause(entry.id, {
        startTime: activePauseStart.toISOString(),
        durationMinutes: pauseDuration,
      });
      onPauseEnd();
    }
```

- [ ] **Step 5: Update the duration label for active entries to show net sleep**

Update the `durationLabel` useMemo to handle active entries with pauses. Replace the entire `durationLabel` useMemo with:

```typescript
  const durationLabel = useMemo(() => {
    // Active entry: show net elapsed time (gross minus completed pauses minus in-flight pause)
    if (isActiveEntry && entry) {
      const grossMinutes = calculateDuration(entry.startTime, null);
      const completedPauseMins = pauseEntries.reduce((sum, p) => sum + p.durationMinutes, 0);
      const inFlightMins = activePauseStart
        ? Math.max(0, Math.round((now.getTime() - activePauseStart.getTime()) / 60000))
        : 0;
      const netMins = Math.max(0, grossMinutes - completedPauseMins - inFlightMins);
      const hours = Math.floor(netMins / 60);
      const mins = netMins % 60;
      if (hours === 0) return `${mins}min`;
      if (mins === 0) return `${hours}h`;
      return `${hours}h ${mins}min`;
    }

    const raw = formatDurationLong(startTime, endTime);
    if (!raw) return '';

    // Completed entry with pauses: show net duration
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
  }, [startTime, endTime, pauseEntries, entry, isActiveEntry, activePauseStart, now]);
```

You need to add `calculateDuration` to the imports from `../utils/dateUtils` (if not already imported — check the file, it's a local function with the same name, so use the local `computeDurationMinutes` approach or import from dateUtils).

Actually, looking at the file, `calculateDuration` is defined locally in SleepEntrySheet as a different function (takes HH:mm strings). For active entries we need the one from dateUtils that works with ISO datetimes. Add this import at the top:

```typescript
import { calculateDuration as calculateDurationFromISO } from '../utils/dateUtils';
```

Then use `calculateDurationFromISO(entry.startTime, null)` in the active entry branch above.

- [ ] **Step 6: Replace single save button with Pause/Play + Stop for active entries**

Replace the entire save button section (the `<div className="flex flex-col items-center pb-8 pt-4">` block) with:

```tsx
              {/* Action buttons */}
              <div className="flex items-center justify-center gap-6 pb-8 pt-4">
                {/* Pause/Play button — only for active entries */}
                {isActiveEntry && (
                  <motion.button
                    onClick={activePauseStart ? handleResume : handlePause}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg relative"
                    style={{
                      backgroundColor: themeBg,
                      color: sleepType === 'night' ? 'var(--text-on-accent)' : 'var(--bg-deep)',
                    }}
                    aria-label={activePauseStart ? t('sleepEntrySheet.resumeAction') : t('sleepEntrySheet.pauseAction')}
                  >
                    {/* Pulsing ring when paused */}
                    {activePauseStart && (
                      <span
                        className="absolute inset-0 rounded-full animate-ping"
                        style={{ border: '2px solid var(--wake-color)', opacity: 0.4 }}
                      />
                    )}
                    {activePauseStart ? <PlayIcon /> : <PauseIcon />}
                  </motion.button>
                )}

                {/* Stop / Save button */}
                <motion.button
                  onClick={handleSave}
                  disabled={!validation.isValid || (isEditing && !hasChanges && !isActiveEntry) || isSaving}
                  whileTap={(validation.isValid && (!isEditing || hasChanges || isActiveEntry) && !isSaving) ? { scale: 0.9 } : undefined}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  className={`${isActiveEntry ? 'w-14 h-14' : 'w-16 h-16'} rounded-full flex items-center justify-center shadow-lg ${
                    (validation.isValid && (!isEditing || hasChanges || isActiveEntry) && !isSaving)
                      ? ''
                      : 'opacity-40 cursor-not-allowed'
                  }`}
                  style={{
                    backgroundColor: (validation.isValid && (!isEditing || hasChanges || isActiveEntry) && !isSaving) ? themeBg : 'var(--text-muted)',
                    color: sleepType === 'night' ? 'var(--text-on-accent)' : 'var(--bg-deep)',
                  }}
                  aria-label={isSaving ? t('common.saving') : t('sleepEntrySheet.save')}
                  aria-busy={isSaving}
                >
                  {isSaving ? (
                    <div className="w-8 h-8 rounded-full border-2 border-current/30 border-t-current animate-spin" aria-hidden="true" />
                  ) : (
                    saveIcon === 'play' ? <PlayIcon /> : saveIcon === 'stop' ? <StopIcon /> : <CheckIcon />
                  )}
                </motion.button>
              </div>
```

- [ ] **Step 7: Add "Paused" status label below the time display**

In the JSX, find the duration/relative date labels section (the `<div className="flex justify-center items-baseline gap-4 mt-5">` block). After it, add:

```tsx
                {/* Paused status indicator */}
                {isActiveEntry && activePauseStart && (
                  <p className="text-center text-sm font-display italic mt-2" style={{ color: 'var(--wake-color)' }}>
                    {t('sleepEntrySheet.pausedStatus')}
                  </p>
                )}
```

- [ ] **Step 8: Verify the build compiles**

Run: `npm run build`
Expected: May still have TS error for TodayView prop (that's Task 4). Otherwise clean.

- [ ] **Step 9: Commit**

```bash
git add src/components/SleepEntrySheet.tsx
git commit -m "feat: add Pause/Play + Stop buttons for active sleep entries"
```

---

## Task 4: TodayView — Frozen Counter + "Paused" Badge

**Files:**
- Modify: `src/components/TodayView.tsx`

- [ ] **Step 1: Add activePauseStart prop**

In the `TodayViewProps` interface, add:

```typescript
  activePauseStart?: Date | null;
```

Destructure it in the component function.

- [ ] **Step 2: Update currentSleepDuration to account for pauses**

Replace the existing `currentSleepDuration` useMemo (around line 506):

```typescript
  const currentSleepDuration = useMemo(() => {
    if (!activeSleep) return 0;
    return calculateDuration(activeSleep.startTime, null);
  }, [activeSleep]);
```

With:

```typescript
  const currentSleepDuration = useMemo(() => {
    if (!activeSleep) return 0;
    const gross = calculateDuration(activeSleep.startTime, null);
    const completedPauseMins = (activeSleep.pauses ?? []).reduce((sum, p) => sum + p.durationMinutes, 0);
    const inFlightMins = activePauseStart
      ? Math.max(0, Math.round((now.getTime() - activePauseStart.getTime()) / 60000))
      : 0;
    return Math.max(0, gross - completedPauseMins - inFlightMins);
  }, [activeSleep, activePauseStart, now]);
```

Note: `now` is already available in TodayView (it re-renders every minute). Check if `now` is in the component — if not, this useMemo already depends on values that update. The component already has `const [now, setNow] = useState(() => new Date())` with a 60-second interval. But for pause, we want more frequent updates. We don't need to change the interval — the counter will update every 60 seconds which is fine (it shows minutes, not seconds).

- [ ] **Step 3: Add "Paused" badge to the hero card**

In the hero card section, find the active sleep display (around line 658-672). After the duration display line:

```tsx
<h1 className="hero-countdown text-[var(--nap-color)] mb-2 sm:mb-3">
  {formatDuration(currentSleepDuration)}
</h1>
```

Add:

```tsx
{activePauseStart && (
  <p className="text-sm font-display italic mb-2" style={{ color: 'var(--wake-color)' }}>
    {t('sleepEntrySheet.pausedStatus')}
  </p>
)}
```

- [ ] **Step 4: Add "Paused" badge to the active nap timeline card**

Find the active nap card in the timeline (around line 864-889). After the duration display:

```tsx
<p className="text-[var(--text-on-accent)]/80 font-display text-sm font-medium">
  {formatDuration(currentSleepDuration)}
</p>
```

Add:

```tsx
{activePauseStart && (
  <p className="text-[var(--wake-color)] text-xs font-display italic">
    {t('sleepEntrySheet.pausedStatus')}
  </p>
)}
```

- [ ] **Step 5: Verify the build compiles**

Run: `npm run build`
Expected: Successful compilation

- [ ] **Step 6: Commit**

```bash
git add src/components/TodayView.tsx
git commit -m "feat: show paused state on TodayView hero and timeline cards"
```

---

## Task 5: Build Verification and Manual QA

- [ ] **Step 1: Run full build**

```bash
npm run build
```

Expected: Clean compilation, no errors.

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Expected: No new lint errors (only pre-existing warnings).

- [ ] **Step 3: Manual testing checklist**

Test in the browser (`npm run dev`):

1. Start a new nap (tap Nap from QuickActionSheet)
2. Open the active nap entry → see two buttons: Pause (left) + Stop (right)
3. Tap Pause → button changes to Play with pulsing ring, timer freezes, "Paused" label appears
4. Wait ~1 minute → timer stays frozen, TodayView hero also shows "Paused"
5. Tap Play → timer resumes, "Paused" disappears, pause card appears in the entry
6. Tap Pause again → second pause starts
7. Tap Stop while paused → pause is saved, sleep ends, sheet shows completed entry with pauses
8. Verify net duration is correct (total minus pause times)
9. Close sheet while paused (swipe down) → pause discarded, timer resumes
10. Check Spanish/Catalan: switch language, verify "Pausar"/"En pausa" labels
