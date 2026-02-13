# Empty states, wake-up flow, and “Forgot bedtime?” — plan and data logic analysis

## Data logic analysis: why “Forgot bedtime?” appears after adding a bedtime

### 1. Root cause: modal condition is too narrow

The modal is shown when `shouldShowMissingBedtimeModal` is true. That is computed in [App.tsx](src/App.tsx) (lines 127–167). The intent is: “show the modal when there’s no activity today (so we might have forgotten to log last night’s bedtime).”

**Current “we have a wake-up” check:**

```ts
const hasMorningWakeUp = entries.some(
  (e) => e.type === 'night' && e.endTime && isToday(parseISO(e.endTime))
);
```

So we only suppress the modal if there is at least one **night** entry whose **end time’s calendar date is today**.

**What happens when the user adds “bedtime + wake-up” from the sheet:**

In [SleepEntrySheet.tsx](src/components/SleepEntrySheet.tsx) (lines 326–343), for a **night** entry:

- `selectedDate` is the date the user is editing (often **today**).
- Bedtime (start) is e.g. 20:00, wake (end) is e.g. 08:00.
- Because wake is “before” bedtime in clock time, the sheet treats it as **next day**:  
  `endDateTime = combineDateTime(getNextDay(bedtimeDate), resolvedEndTime)`  
  so the stored **endTime** is **tomorrow** at 08:00 (e.g. `2024-02-14T08:00` when today is 2024-02-13).

So the user has just logged a **completed** night (bedtime today 20:00, wake tomorrow 08:00). The entry is correct. But:

- `hasMorningWakeUp` only looks for `isToday(parseISO(e.endTime))`.
- This entry’s `endTime` is **tomorrow**, so `isToday(...)` is **false**.
- So `hasMorningWakeUp` stays false, and the modal still shows.

So the bug is **not** “modal opens by mistake once” — it’s that the **definition of “we already have a completed night”** is too strict: we only count “night that **ended today**”, and we ignore “night that **ends tomorrow**” (which is exactly what we store when they log tonight’s bedtime and tomorrow’s wake).

**Conclusion:** The modal appears after adding bedtime + wake-up because the data model correctly stores wake-up on the next calendar day, but the modal logic only treats “ended today” as “we logged a wake-up”. So we need to **widen the condition** so that any **completed night whose end time is today or tomorrow** (in local date) counts as “we have a wake-up” and we do **not** show the modal.

---

### 2. Consistency of dates and timestamps

- **Client → Supabase:** [useSleepEntries.ts](src/hooks/useSleepEntries.ts) uses `toSupabaseTimestamp(localDateTime)`: `new Date(localDateTime)` (interpreted as local) then `formatISO(date)`, so we send local time with offset. Behaviour is consistent.
- **Supabase → client:** `fromSupabaseTimestamp(utcTimestamp)` uses `parseISO` then `getFullYear()`, `getMonth()`, etc. (local), and returns `YYYY-MM-DDTHH:mm` in local time. So entries in state have `startTime` / `endTime` as local date-time strings.
- **Modal check:** `parseISO(e.endTime)` on strings like `"2024-02-14T08:00"` (no Z) is interpreted as **local** by date-fns/JS, so the calendar date used by `isToday()` is correct. The only issue is that we restrict to “today” instead of “today or tomorrow”.

So there is **no** timezone or format bug in reading/writing; the only logic bug is the “today only” condition for `hasMorningWakeUp`.

---

### 3. Other data/consistency points

**addEntry failure**

- In [App.tsx](src/App.tsx) `handleAddEntry` (lines 192–207): we `await addEntry(data)` (or `updateEntry`). If `addEntry` fails it returns `null` and does not update `entries`. We still call `setShowEntrySheet(false)` and close the sheet. So the user thinks they saved, but `entries` is unchanged, and the modal can appear because “no morning wake-up” is still true.
- **Recommendation:** Only close the sheet and clear editing state when the mutation succeeds. If `addEntry`/`updateEntry` fails, keep the sheet open and surface an error (e.g. toast or inline message). That avoids confusing “I just saved, why is the modal here?” and keeps data and UI consistent.

**Modal initial state**

- `showMissingBedtimeModal` is initialized to `true`. So on every app load we “want” to show the modal if conditions pass. That’s fine; the fix is to make the conditions correct (today-or-tomorrow for end date, and optionally not showing when entries are empty or we’ve never had data).

---

### 4. Recommended data/UX fixes for the modal

1. **Widen “has morning wake-up”:**  
   Suppress the modal if there is any night entry with `endTime` whose **local calendar date** is **today or tomorrow**.  
   Example:

   - `const hasCompletedNightRecently = entries.some((e) => { if (e.type !== 'night' || !e.endTime) return false; const d = parseISO(e.endTime); return isToday(d) || isTomorrow(d); });`  
   (add `isTomorrow` from date-fns or implement as “date is today + 1 day”).  
   Then use `hasCompletedNightRecently` (or keep the name `hasMorningWakeUp` but with this definition) in the condition that hides the modal.

2. **Optional:** Only show the modal when the user has at least one entry in the past (so we’re not prompting a brand‑new user who hasn’t logged anything yet). We already have `if (entries.length === 0) return false;`, so new users with no entries don’t see it. No change needed there.

3. **Error handling:** In `handleAddEntry`, only call `setShowEntrySheet(false)` and `setEditingEntry(null)` when the mutation succeeds. On failure, show an error and leave the sheet open.

---

## Summary: what to change in code

| Area | Issue | Fix |
|------|--------|-----|
| **Modal condition** | Only “night ended **today**” suppresses modal; “night ended **tomorrow**” (tonight’s bedtime + tomorrow’s wake) does not. | Extend condition: suppress modal if any night has `endTime` with local date **today or tomorrow**. |
| **handleAddEntry** | Sheet closes even when addEntry/updateEntry fails; entries don’t update, modal can show. | Close sheet and clear state only on success; on failure show error and keep sheet open. |
| **Data/format** | No bug found in timestamp format or timezone handling. | No change. |

---

## Rest of the plan (unchanged scope)

### 1. My Babies: show empty state first, open add-baby sheet on tap only

- **File:** [src/components/Profile/MyBabiesView.tsx](src/components/Profile/MyBabiesView.tsx)
- **Change:** Remove the `useEffect` that sets `isAddSheetOpen(true)` when `!hasAnyBabies && !profile`. Keep initial state `useState(false)` so the empty state and “Add your first baby” + ghost card are visible; sheet opens only when user taps the card.

### 2. Baby picture empty state: camera icon instead of “?”

- **File:** [src/components/Profile/BabyAvatarPicker.tsx](src/components/Profile/BabyAvatarPicker.tsx)
- **Change:** When there is no `avatarUrl`, show the existing `CameraIcon` in the circle instead of the letter or “?”. Call sites can keep passing `babyName`; the picker simply uses the camera icon as placeholder when `!avatarUrl`.

### 3. First-time wake-up: require bedtime, default 20:00

- **Current:** Tapping “Wake up” with no active night creates an entry with bedtime = now − 8h and closes the menu.
- **Change:** Open SleepEntrySheet (same as “Bedtime”) with: `selectedDate` = yesterday, `initialType = 'night'`, start default 20:00 (already from `getDefaultTime(yesterday, 'night')`), end default = current time (new prop or flag). Require end time for this flow so the user confirms or edits both times. No automatic “8h ago” entry.

### 4. “Forgot bedtime?” modal — data logic (above) + optional UX

- Implement the **data logic** fixes in § “Recommended data/UX fixes for the modal” (widen condition to today-or-tomorrow; only close sheet on save success).
- Optionally: do not show the modal on first load until we have at least one entry (already the case) or add a short delay; no other modal logic change needed once the condition is fixed.

### 5. Empty-case audit (summary)

- **My Babies:** Auto-open removed (§1).
- **Baby avatar:** Camera icon (§2).
- **First-time Wake up:** Sheet with 20:00 default (§3).
- **Forgot bedtime modal:** Data logic and error handling (§ above and §4).
- **Today / History / Stats empty states:** No further issues identified; optional time-based greeting on Today.

---

## Implementation order

1. **Data logic:** Fix `shouldShowMissingBedtimeModal` (today-or-tomorrow for night end date) and `handleAddEntry` (close sheet only on success, show error on failure).
2. **My Babies:** Remove auto-open effect.
3. **Baby avatar:** Camera icon when no photo.
4. **Wake-up flow:** Open sheet for “no active night” with yesterday + 20:00 and end = now; require end time.
5. **Optional:** Add `isTomorrow`/date helper and a brief comment next to the modal condition for future maintainers.

No new dependencies. All changes in existing components and hooks.
