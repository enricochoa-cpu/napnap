# Sleep Pause Phase 3 — Night Waking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Label pauses on night entries as "Night waking" with distinct visual treatment, add a QuickActionSheet shortcut, and show night waking counts in the daily summary.

**Architecture:** Purely presentational — no data model changes. Night waking = pause where `entry.type === 'night'`. Contextual labels in SleepEntrySheet, a new button in QuickActionSheet, and two new fields in `computeDailySummary`.

**Tech Stack:** React 18, TypeScript, i18next, Tailwind CSS with CSS custom properties.

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/locales/en.json` | Modify | New night waking keys |
| `src/locales/es.json` | Modify | Spanish translations |
| `src/locales/ca.json` | Modify | Catalan translations |
| `src/components/SleepEntrySheet.tsx` | Modify | Contextual labels + storm cloud icon for night entries |
| `src/hooks/useSleepEntries.ts` | Modify | Add nightWakingCount/Minutes to computeDailySummary |
| `src/components/DailySummary.tsx` | Modify | Night waking count row |
| `src/components/QuickActionSheet.tsx` | Modify | Night waking button (second row) |
| `src/App.tsx` | Modify | Pass hasNightEntry + onNightWaking to QuickActionSheet |

---

## Task 1: i18n Keys

**Files:**
- Modify: `src/locales/en.json`
- Modify: `src/locales/es.json`
- Modify: `src/locales/ca.json`

- [ ] **Step 1: Add English keys**

In `src/locales/en.json`:

Inside `"sleepEntrySheet"`, after `"pausedStatus"`, add:
```json
"nightWaking": "Night waking",
"nightWakingNumber": "Night waking {{number}}",
"addNightWaking": "Add night waking",
"nightWakingStatus": "Night waking"
```

Inside `"quickActions"`, after the last existing key, add:
```json
"nightWaking": "Night waking"
```

Inside `"history"` (where dailySummary keys live), add:
```json
"nightWakings": "{{count}} night waking",
"nightWakingsPlural": "{{count}} night wakings",
"nightWakingsDuration": "({{duration}} total)"
```

- [ ] **Step 2: Add Spanish keys**

In `src/locales/es.json`:

Inside `"sleepEntrySheet"`, after `"pausedStatus"`, add:
```json
"nightWaking": "Despertar nocturno",
"nightWakingNumber": "Despertar nocturno {{number}}",
"addNightWaking": "Añadir despertar nocturno",
"nightWakingStatus": "Despertar nocturno"
```

Inside `"quickActions"`, add:
```json
"nightWaking": "Despertar nocturno"
```

Inside `"history"`, add:
```json
"nightWakings": "{{count}} despertar nocturno",
"nightWakingsPlural": "{{count}} despertares nocturnos",
"nightWakingsDuration": "({{duration}} en total)"
```

- [ ] **Step 3: Add Catalan keys**

In `src/locales/ca.json`:

Inside `"sleepEntrySheet"`, after `"pausedStatus"`, add:
```json
"nightWaking": "Despertar nocturn",
"nightWakingNumber": "Despertar nocturn {{number}}",
"addNightWaking": "Afegir despertar nocturn",
"nightWakingStatus": "Despertar nocturn"
```

Inside `"quickActions"`, add:
```json
"nightWaking": "Despertar nocturn"
```

Inside `"history"`, add:
```json
"nightWakings": "{{count}} despertar nocturn",
"nightWakingsPlural": "{{count}} despertars nocturns",
"nightWakingsDuration": "({{duration}} en total)"
```

- [ ] **Step 4: Commit**

```bash
git add src/locales/en.json src/locales/es.json src/locales/ca.json
git commit -m "feat: add i18n keys for night waking (en/es/ca)"
```

---

## Task 2: Contextual Labels in SleepEntrySheet

**Files:**
- Modify: `src/components/SleepEntrySheet.tsx`

- [ ] **Step 1: Add StormCloudIcon**

Add after the existing `PauseIcon` component:

```typescript
const StormCloudIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" opacity="0.7" />
    <path d="M13 16l-2 4m3-6l-2 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </svg>
);
```

- [ ] **Step 2: Add contextual label helpers**

Inside the component, after `const pauseEntries = entry?.pauses ?? [];`, add:

```typescript
  // Contextual labels: "Night waking" for night entries, "Pause" for naps
  const isNightEntry = entry?.type === 'night';
  const pauseNumberLabel = (n: number) => isNightEntry
    ? t('sleepEntrySheet.nightWakingNumber', { number: n })
    : t('sleepEntrySheet.pauseNumber', { number: n });
  const addPauseLabel = isNightEntry
    ? t('sleepEntrySheet.addNightWaking')
    : t('sleepEntrySheet.addPause');
  const pausedStatusLabel = isNightEntry
    ? t('sleepEntrySheet.nightWakingStatus')
    : t('sleepEntrySheet.pausedStatus');
```

- [ ] **Step 3: Update pause card icon and title**

In the pause card JSX, find the icon and title:

```tsx
<span className="text-[var(--text-muted)] text-sm">⏸</span>
```

Replace with:
```tsx
{isNightEntry
  ? <StormCloudIcon className="w-4 h-4 text-[var(--wake-color)]" />
  : <span className="text-[var(--text-muted)] text-sm">⏸</span>
}
```

Find the pause number label:
```tsx
{t('sleepEntrySheet.pauseNumber', { number: index + 1 })}
```

Replace with:
```tsx
{pauseNumberLabel(index + 1)}
```

Update the title text colour — find:
```tsx
<p className="text-[var(--text-primary)] text-sm font-medium">
```

Replace with:
```tsx
<p className={`text-sm font-medium ${isNightEntry ? 'text-[var(--wake-color)]' : 'text-[var(--text-primary)]'}`}>
```

- [ ] **Step 4: Update "Add pause" button label**

Find:
```tsx
+ {t('sleepEntrySheet.addPause')}
```

Replace with:
```tsx
+ {addPauseLabel}
```

- [ ] **Step 5: Update "Paused" status label**

Find the paused status indicator (around line 738):
```tsx
{t('sleepEntrySheet.pausedStatus')}
```

Replace with:
```tsx
{pausedStatusLabel}
```

- [ ] **Step 6: Update Pause button aria-label for night entries**

Find the Pause/Play button's aria-label:
```tsx
aria-label={activePauseStart ? t('sleepEntrySheet.resumeAction') : t('sleepEntrySheet.pauseAction')}
```

Replace with:
```tsx
aria-label={activePauseStart ? t('sleepEntrySheet.resumeAction') : (isNightEntry ? t('sleepEntrySheet.nightWaking') : t('sleepEntrySheet.pauseAction'))}
```

- [ ] **Step 7: Verify build and commit**

Run: `npm run build`
Expected: Successful compilation

```bash
git add src/components/SleepEntrySheet.tsx
git commit -m "feat: contextual night waking labels and storm cloud icon in SleepEntrySheet"
```

---

## Task 3: Night Waking Count in computeDailySummary

**Files:**
- Modify: `src/hooks/useSleepEntries.ts`

- [ ] **Step 1: Add nightWakingCount and nightWakingMinutes**

In the `computeDailySummary` function, after the `totalNightMinutes` calculation, add:

```typescript
  // Night waking stats: count and total duration of pauses on night entries
  const nightWakingCount = nightEntries.reduce(
    (sum, e) => sum + (e.pauses ?? []).length,
    0,
  );

  const nightWakingMinutes = nightEntries.reduce(
    (sum, e) => sum + (e.pauses ?? []).reduce((pSum, p) => pSum + p.durationMinutes, 0),
    0,
  );
```

Update the return object to include the new fields:

```typescript
  return {
    totalNapMinutes,
    totalNightMinutes,
    totalSleepMinutes: totalNapMinutes + totalNightMinutes,
    napCount: napEntries.length,
    nightCount: nightEntries.length,
    averageWakeWindowMinutes,
    nightWakingCount,
    nightWakingMinutes,
  };
```

- [ ] **Step 2: Verify build and commit**

Run: `npm run build`
Expected: Successful compilation

```bash
git add src/hooks/useSleepEntries.ts
git commit -m "feat: add nightWakingCount and nightWakingMinutes to daily summary"
```

---

## Task 4: DailySummary — Night Waking Row

**Files:**
- Modify: `src/components/DailySummary.tsx`

- [ ] **Step 1: Update DailySummaryProps**

Add the two new fields to the summary type in `DailySummaryProps`:

```typescript
interface DailySummaryProps {
  summary: {
    totalNapMinutes: number;
    totalNightMinutes: number;
    totalSleepMinutes: number;
    napCount: number;
    nightCount: number;
    averageWakeWindowMinutes: number | null;
    nightWakingCount: number;
    nightWakingMinutes: number;
  };
}
```

- [ ] **Step 2: Add night waking row**

After the closing `</div>` of the `grid grid-cols-4` div, add:

```tsx
      {/* Night waking summary — only shown when there are night wakings */}
      {summary.nightWakingCount > 0 && (
        <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-[var(--text-muted)]/10">
          <svg className="w-4 h-4 text-[var(--wake-color)]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" opacity="0.7" />
            <path d="M13 16l-2 4m3-6l-2 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
          <span className="text-sm text-[var(--wake-color)]">
            {summary.nightWakingCount === 1
              ? t('history.nightWakings', { count: summary.nightWakingCount })
              : t('history.nightWakingsPlural', { count: summary.nightWakingCount })}
          </span>
          <span className="text-sm text-[var(--text-muted)]">
            {t('history.nightWakingsDuration', { duration: formatDuration(summary.nightWakingMinutes) })}
          </span>
        </div>
      )}
```

- [ ] **Step 3: Verify build and commit**

Run: `npm run build`
Expected: Successful compilation

```bash
git add src/components/DailySummary.tsx
git commit -m "feat: show night waking count and duration in daily summary"
```

---

## Task 5: QuickActionSheet — Night Waking Button

**Files:**
- Modify: `src/components/QuickActionSheet.tsx`

- [ ] **Step 1: Add new props**

Update `QuickActionSheetProps`:

```typescript
interface QuickActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWakeUp: () => void;
  onSelectNap: () => void;
  onSelectBedtime: () => void;
  hasActiveSleep: boolean;
  onEndSleep?: () => void;
  hasNightEntry: boolean;
  onNightWaking?: () => void;
}
```

Destructure `hasNightEntry` and `onNightWaking` in the component function.

- [ ] **Step 2: Add StormCloudIcon**

Add after the existing icon imports:

```typescript
const StormCloudIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" opacity="0.7" />
    <path d="M13 16l-2 4m3-6l-2 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </svg>
);
```

- [ ] **Step 3: Add night waking button as second row**

In the no-active-sleep branch (`else` of `hasActiveSleep`), after the closing `</div>` of the `grid grid-cols-3` div, add:

```tsx
                {/* Night Waking — second row, only when a bedtime exists */}
                {hasNightEntry && onNightWaking && (
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={() => {
                        onNightWaking();
                        onClose();
                      }}
                      className="flex flex-col items-center gap-3 p-4 rounded-3xl bg-[var(--wake-color)]/10 active:bg-[var(--wake-color)]/20 active:scale-95 transition-all"
                    >
                      <div className="w-14 h-14 rounded-full bg-[var(--wake-color)] flex items-center justify-center text-[var(--bg-deep)]">
                        <StormCloudIcon />
                      </div>
                      <span className="font-display font-semibold text-sm text-[var(--wake-color)]">
                        {t('quickActions.nightWaking')}
                      </span>
                    </button>
                  </div>
                )}
```

- [ ] **Step 4: Verify build and commit**

Run: `npm run build`
Expected: May have TS errors about missing props in App.tsx (expected — Task 6 fixes this).

```bash
git add src/components/QuickActionSheet.tsx
git commit -m "feat: add night waking button to QuickActionSheet"
```

---

## Task 6: Wire Night Waking in App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Compute hasNightEntry**

After the existing `activeSleep` / `lastCompletedSleep` destructuring from `useSleepEntries`, add:

```typescript
  // Night waking: there's a bedtime to attach a waking to (active or recent completed)
  const hasNightEntry = !!(activeSleep?.type === 'night' || lastCompletedSleep?.type === 'night');
```

- [ ] **Step 2: Add handleNightWaking handler**

Add after the existing `handleEdit` function:

```typescript
  const handleNightWaking = () => {
    if (activeSleep?.type === 'night') {
      // Active bedtime: start a live pause and open the sheet
      setActivePauseStart(new Date());
      setEditingEntryId(activeSleep.id);
      setShowEntrySheet(true);
    } else if (lastCompletedSleep?.type === 'night') {
      // Last completed bedtime: open it for retrospective pause adding
      setEditingEntryId(lastCompletedSleep.id);
      setSelectedDate(lastCompletedSleep.date);
      setShowEntrySheet(true);
    }
  };
```

- [ ] **Step 3: Pass props to QuickActionSheet**

Add the new props to the `<QuickActionSheet>` JSX:

```tsx
<QuickActionSheet
  // ... existing props
  hasNightEntry={hasNightEntry}
  onNightWaking={handleNightWaking}
/>
```

- [ ] **Step 4: Verify build and commit**

Run: `npm run build`
Expected: Successful compilation

```bash
git add src/App.tsx
git commit -m "feat: wire night waking handler to QuickActionSheet"
```

---

## Task 7: Build Verification and Manual QA

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

1. Open a completed **bedtime** entry → pause cards show "Night waking 1" with storm cloud icon and `--wake-color` text
2. "+ Add night waking" button (not "+ Add pause")
3. Open a completed **nap** entry → still shows "Pause 1" with ⏸ icon (unchanged)
4. Start a bedtime, open it, tap Pause → "Night waking" label (not "Paused")
5. QuickActionSheet (no active sleep): if a bedtime was logged → second row shows "Night waking" button
6. QuickActionSheet: if NO bedtime exists → no night waking button
7. Tap "Night waking" from QuickActionSheet with active bedtime → opens sheet with live pause started
8. Tap "Night waking" from QuickActionSheet with completed bedtime → opens sheet for retrospective pause
9. DailySummary on a day with night wakings → "2 night wakings (15m total)" row
10. DailySummary on a day without night wakings → no extra row
11. Check Spanish/Catalan: "Despertar nocturno" / "Despertar nocturn" labels
