# SleepEntrySheet Qualitative Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign qualitative section with Napper-style tall grid cards, add End/Wake mood sections, compact pause button, floating action buttons with blur, and Notes header.

**Architecture:** Two new DB columns (`wake_method`, `wake_mood`). Types extended. Existing pill chips replaced with tall card grid. New constants and i18n keys. Action buttons get gradient blur overlay. All changes in SleepEntrySheet.tsx + data layer.

**Tech Stack:** React 18, TypeScript, Supabase (Postgres), i18next, Tailwind CSS.

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `supabase/migrations/20260404000000_wake_method_mood.sql` | Create | ADD COLUMN wake_method, wake_mood |
| `src/types/index.ts` | Modify | Extend SleepEntry |
| `src/lib/supabase.ts` | Modify | Extend DbSleepEntry |
| `src/hooks/useSleepEntries.ts` | Modify | Map new fields in fetch/add/update |
| `src/locales/en.json` | Modify | 8 new keys |
| `src/locales/es.json` | Modify | 8 new keys |
| `src/locales/ca.json` | Modify | 8 new keys |
| `src/components/SleepEntrySheet.tsx` | Modify | Card grids, new sections, compact pause, blur overlay, Notes header |

---

## Task 1: DB Migration + Types + i18n + Data Layer

All foundation work in one task since it's small and mechanical.

**Files:**
- Create: `supabase/migrations/20260404000000_wake_method_mood.sql`
- Modify: `src/types/index.ts`
- Modify: `src/lib/supabase.ts`
- Modify: `src/hooks/useSleepEntries.ts`
- Modify: `src/locales/en.json`, `src/locales/es.json`, `src/locales/ca.json`

- [ ] **Step 1: Create migration**

```sql
-- Wake method and mood qualitative metadata.
ALTER TABLE sleep_entries ADD COLUMN wake_method text DEFAULT NULL;
ALTER TABLE sleep_entries ADD COLUMN wake_mood text DEFAULT NULL;
```

- [ ] **Step 2: Extend SleepEntry type**

In `src/types/index.ts`, add after `sleepMethod`:
```typescript
  wakeMethod?: string;   // 'woke_up_child' | 'woke_up_naturally'
  wakeMood?: string;     // 'bad' | 'neutral' | 'good'
```

- [ ] **Step 3: Extend DbSleepEntry**

In `src/lib/supabase.ts`, add after `sleep_method`:
```typescript
  wake_method: string | null;
  wake_mood: string | null;
```

- [ ] **Step 4: Update useSleepEntries fetch mapping**

In `fetchEntries`, in the entry mapping, add after `sleepMethod`:
```typescript
          wakeMethod: entry.wake_method ?? undefined,
          wakeMood: entry.wake_mood ?? undefined,
```

- [ ] **Step 5: Update useSleepEntries addEntry insert**

In `addEntry`, in the insert object, add after `sleep_method`:
```typescript
          wake_method: data.wakeMethod ?? null,
          wake_mood: data.wakeMood ?? null,
```

- [ ] **Step 6: Update useSleepEntries addEntry newEntry mapping**

In the `newEntry` mapping, add after `sleepMethod`:
```typescript
        wakeMethod: inserted.wake_method ?? undefined,
        wakeMood: inserted.wake_mood ?? undefined,
```

- [ ] **Step 7: Update useSleepEntries updateEntry**

In `updateEntry`, add after the `sleepMethod` line:
```typescript
      if (data.wakeMethod !== undefined) updateData.wake_method = data.wakeMethod ?? null;
      if (data.wakeMood !== undefined) updateData.wake_mood = data.wakeMood ?? null;
```

- [ ] **Step 8: Add i18n keys**

In ALL THREE locale files, inside `"sleepEntry"`, after `"swing"`, add:

**en.json:**
```json
"endLabel": "End",
"wakeMoodLabel": "Wake up mood",
"wokeUpChild": "Woke up child",
"wokeUpNaturally": "Woke up naturally",
"badMood": "Bad mood",
"neutralMood": "Neutral",
"goodMood": "Good mood",
"notesLabel": "Notes"
```

**es.json:**
```json
"endLabel": "Final",
"wakeMoodLabel": "Humor al despertar",
"wokeUpChild": "Lo despertaron",
"wokeUpNaturally": "Se despertó solo",
"badMood": "Mal humor",
"neutralMood": "Neutral",
"goodMood": "Buen humor",
"notesLabel": "Notas"
```

**ca.json:**
```json
"endLabel": "Final",
"wakeMoodLabel": "Humor al despertar",
"wokeUpChild": "El van despertar",
"wokeUpNaturally": "Es va despertar sol",
"badMood": "Mal humor",
"neutralMood": "Neutral",
"goodMood": "Bon humor",
"notesLabel": "Notes"
```

- [ ] **Step 9: Verify build and commit**

Run: `npm run build`

```bash
git add supabase/migrations/20260404000000_wake_method_mood.sql src/types/index.ts src/lib/supabase.ts src/hooks/useSleepEntries.ts src/locales/en.json src/locales/es.json src/locales/ca.json
git commit -m "feat: add wake_method and wake_mood columns, types, i18n, and data layer"
```

---

## Task 2: SleepEntrySheet — Card Grids + New Sections

Replace inline pill chips with Napper-style tall card grids. Add End and Wake up mood sections.

**Files:**
- Modify: `src/components/SleepEntrySheet.tsx`

- [ ] **Step 1: Add new constants for End and Wake mood options**

After the existing `METHOD_I18N` constant, add:

```typescript
const END_OPTIONS = [
  { key: 'woke_up_child', icon: '🔔' },
  { key: 'woke_up_naturally', icon: '🌤' },
] as const;

const END_I18N: Record<string, string> = {
  woke_up_child: 'sleepEntry.wokeUpChild',
  woke_up_naturally: 'sleepEntry.wokeUpNaturally',
};

const MOOD_OPTIONS = [
  { key: 'bad', icon: '😟' },
  { key: 'neutral', icon: '😐' },
  { key: 'good', icon: '😊' },
] as const;

const MOOD_I18N: Record<string, string> = {
  bad: 'sleepEntry.badMood',
  neutral: 'sleepEntry.neutralMood',
  good: 'sleepEntry.goodMood',
};
```

- [ ] **Step 2: Add state for new fields**

After the existing `entryNotes` state, add:

```typescript
  const [wakeMethod, setWakeMethod] = useState<string | undefined>();
  const [wakeMood, setWakeMood] = useState<string | undefined>();
```

- [ ] **Step 3: Reset new state when sheet opens**

In the existing useEffect that resets on `entryId`/`isOpen`, inside the `if (isOpen)` block (where `setOnsetTags`, `setSleepMethod`, `setEntryNotes` are), add:

```typescript
      setWakeMethod(entry?.wakeMethod);
      setWakeMood(entry?.wakeMood);
```

- [ ] **Step 4: Update hasChanges**

In the `hasChanges` useMemo, add two more change checks before the return:

```typescript
    const wakeMethodChanged = wakeMethod !== (entry?.wakeMethod ?? undefined);
    const wakeMoodChanged = wakeMood !== (entry?.wakeMood ?? undefined);
    return startTime !== currentInitialStart || endTime !== currentInitialEnd || tagsChanged || methodChanged || notesChanged || wakeMethodChanged || wakeMoodChanged;
```

Add `wakeMethod` and `wakeMood` to the dependency array.

- [ ] **Step 5: Update handleSave payload**

In both the nap and night payload objects in `handleSave`, add after `notes`:

```typescript
        wakeMethod: wakeMethod ?? undefined,
        wakeMood: wakeMood ?? undefined,
```

- [ ] **Step 6: Add toggle handlers for new fields**

After the existing `toggleSleepMethod`, add:

```typescript
  const toggleWakeMethod = (key: string) => {
    setWakeMethod((prev) => (prev === key ? undefined : key));
  };

  const toggleWakeMood = (key: string) => {
    setWakeMood((prev) => (prev === key ? undefined : key));
  };
```

- [ ] **Step 7: Create reusable TagCard component**

Add a local component before the `SleepEntrySheet` function (after the constants):

```typescript
/** Napper-style tall card button for qualitative tags */
function TagCard({ icon, label, selected, onClick }: {
  icon: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl text-xs font-medium transition-colors ${
        selected
          ? 'bg-[var(--nap-color)]/20 text-[var(--nap-color)] border border-[var(--nap-color)]/30'
          : 'border border-[var(--glass-border)] text-[var(--text-muted)]'
      }`}
      style={!selected ? { background: 'var(--glass-bg)' } : undefined}
    >
      <span className="text-2xl">{icon}</span>
      <span className="leading-tight text-center px-1">{label}</span>
    </button>
  );
}
```

- [ ] **Step 8: Replace the entire qualitative section JSX**

Find the block starting with `{/* Qualitative info — onset tags, sleep method, notes */}` (around line 975) through the closing `</div>` before `{/* Save error from parent */}`. Replace the entire section with:

```tsx
              {/* Qualitative info — Napper-style card grids */}
              <div className="px-6 pb-4">
                {/* Divider */}
                <div className="h-px bg-[var(--text-muted)]/10 mb-4" />

                {/* Start (onset quality) — multi-select, 2×1 */}
                <div className="mb-5">
                  <p className="text-[var(--text-muted)] text-xs uppercase tracking-wider font-semibold mb-2">
                    {t('sleepEntry.onsetLabel')}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {ONSET_OPTIONS.map(({ key, icon }) => (
                      <TagCard
                        key={key}
                        icon={icon}
                        label={t(ONSET_I18N[key]!)}
                        selected={onsetTags.includes(key)}
                        onClick={() => toggleOnsetTag(key)}
                      />
                    ))}
                  </div>
                </div>

                {/* How (sleep method) — single-select, 3×3 */}
                <div className="mb-5">
                  <p className="text-[var(--text-muted)] text-xs uppercase tracking-wider font-semibold mb-2">
                    {t('sleepEntry.howLabel')}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {METHOD_OPTIONS.map(({ key, icon }) => (
                      <TagCard
                        key={key}
                        icon={icon}
                        label={t(METHOD_I18N[key]!)}
                        selected={sleepMethod === key}
                        onClick={() => toggleSleepMethod(key)}
                      />
                    ))}
                  </div>
                </div>

                {/* End (wake method) — single-select, 2×1 */}
                <div className="mb-5">
                  <p className="text-[var(--text-muted)] text-xs uppercase tracking-wider font-semibold mb-2">
                    {t('sleepEntry.endLabel')}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {END_OPTIONS.map(({ key, icon }) => (
                      <TagCard
                        key={key}
                        icon={icon}
                        label={t(END_I18N[key]!)}
                        selected={wakeMethod === key}
                        onClick={() => toggleWakeMethod(key)}
                      />
                    ))}
                  </div>
                </div>

                {/* Wake up mood — single-select, 3×1 */}
                <div className="mb-5">
                  <p className="text-[var(--text-muted)] text-xs uppercase tracking-wider font-semibold mb-2">
                    {t('sleepEntry.wakeMoodLabel')}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {MOOD_OPTIONS.map(({ key, icon }) => (
                      <TagCard
                        key={key}
                        icon={icon}
                        label={t(MOOD_I18N[key]!)}
                        selected={wakeMood === key}
                        onClick={() => toggleWakeMood(key)}
                      />
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <p className="text-[var(--text-muted)] text-xs uppercase tracking-wider font-semibold mb-2">
                    {t('sleepEntry.notesLabel')}
                  </p>
                  <textarea
                    rows={2}
                    value={entryNotes}
                    onChange={(e) => setEntryNotes(e.target.value)}
                    placeholder={t('sleepEntry.notesPlaceholder')}
                    className="input w-full text-sm resize-none"
                  />
                </div>
              </div>
```

- [ ] **Step 9: Verify build and commit**

Run: `npm run build`

```bash
git add src/components/SleepEntrySheet.tsx
git commit -m "feat: Napper-style tall card grids with End and Wake mood sections"
```

---

## Task 3: Compact Pause Button + Floating Blur Overlay

**Files:**
- Modify: `src/components/SleepEntrySheet.tsx`

- [ ] **Step 1: Replace the "Add pause" button styling**

Find the "Add pause" button (the one with `w-full py-2.5 rounded-xl text-sm font-medium border border-dashed`). Replace the entire button element with:

```tsx
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={handleAddPause}
                      disabled={pauseEntries.length >= 5}
                      className={`py-2 px-5 rounded-full text-sm font-medium transition-colors ${
                        pauseEntries.length >= 5
                          ? 'opacity-30 cursor-not-allowed'
                          : 'hover:brightness-110'
                      }`}
                      style={{
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {addPauseLabel} +
                      {pauseEntries.length >= 5 && ` (${t('sleepEntrySheet.maxPausesReached')})`}
                    </button>
                  </div>
```

Note: keep the surrounding `{entry?.endTime && ... }` conditional wrapper intact.

- [ ] **Step 2: Add gradient blur overlay above action buttons**

Find the `</div>{/* end scrollable content */}` line. Right AFTER it and BEFORE `{/* Action buttons */}`, add:

```tsx
              {/* Gradient blur hint — signals more content above */}
              <div
                className="h-6 -mt-6 pointer-events-none relative z-10"
                style={{
                  background: 'linear-gradient(transparent, var(--bg-card))',
                }}
              />
```

- [ ] **Step 3: Verify build and commit**

Run: `npm run build`

```bash
git add src/components/SleepEntrySheet.tsx
git commit -m "feat: compact pause button pill + floating blur overlay on action buttons"
```

---

## Task 4: Build Verification and Manual QA

- [ ] **Step 1: Run full build**

```bash
npm run build
```

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

- [ ] **Step 3: Manual testing checklist**

1. Open a completed nap → see tall card grids for Start (2×1), How (3×3), End (2×1), Wake mood (3×1)
2. Tap a Start card → highlights in nap-color (multi-select: both can be selected)
3. Tap a How card → highlights (single-select: only one at a time)
4. Tap an End card → highlights (single-select)
5. Tap a Wake mood card → highlights (single-select)
6. "Notes" header visible above textarea
7. "Add pause" button is a compact centered pill (not full-width)
8. Scroll the sheet → gradient blur visible above action buttons
9. Save → reopen → all selections persist
10. New entry → all sections visible, all optional
11. Check Spanish/Catalan labels
12. Active entry → Pause/Play + Stop buttons still work, blur hint visible
