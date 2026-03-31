# Full App -- UX/UI Horizontal Audit

- **Date**: 2026-03-31
- **Area**: Full app (React 19 + TypeScript + Vite + Tailwind CSS 4 + Framer Motion)
- **Persona**: Anxious first-time parent (25-45), sleep-deprived, one-handed operation at 3AM
- **User goal**: Track infant sleep (0-18 months) with zero friction, receive definitive predictions, feel calm and reassured

---

## Changes since last audit (2026-03-20)

### Issues FIXED

| Previous ID | Issue | Status |
|---|---|---|
| U-02 | AuthDivider `bg-white/10` invisible in light mode | **FIXED** -- Now uses `bg-[var(--text-muted)]/20` (`AuthDivider.tsx:7, 9`) |
| U-03 | GoogleSignInButton `bg-white/10`, `border-white/20` invisible in light mode | **FIXED** -- Now uses `bg-[var(--glass-bg)]`, `border-[var(--glass-border)]` (`GoogleSignInButton.tsx:34-35`) |
| U-04 | No skip-to-content link for keyboard navigation | **FIXED** -- Added `<a href="#main-content">` with `sr-only focus:not-sr-only` (`App.tsx:600-604`) and `<main id="main-content">` (`App.tsx:611`) |
| U-06 | 10+ `console.log` statements in production hooks | **FIXED** -- All `console.log` removed from hooks; only `console.error` remains for actual errors |
| U-07 | API errors silently swallowed | **FIXED** -- All three data hooks (`useSleepEntries`, `useBabyProfile`, `useGrowthLogs`) now expose `error` state. `App.tsx:619-624` renders a global error banner: `"Something went wrong loading your data"` |
| U-10 | StatsView has no empty state | **FIXED** -- StatsView now shows empty state with icon, `stats.noDataTitle`, and `stats.noDataBody` (`StatsView.tsx:1227-1232`) |
| U-12 | Terms/Privacy landing pages missing fixed `height: 100dvh` | **FIXED** -- Both `LandingTermsPage.tsx:28` and `LandingPrivacyPage.tsx:30` now have `style={{ height: '100dvh' }}` inline |
| U-13 | TodayView 60-second tick re-renders predictions unnecessarily | **FIXED** -- `frozenPredictionsRef` / `frozenBedtimeRef` pattern implemented (`TodayView.tsx:432-449`) |
| U-14 | Icon components duplicated across 3+ files | **PARTIALLY FIXED** -- Shared `src/components/icons/SleepIcons.tsx` created with `SunIcon`, `CloudIcon`, `MoonIcon`, `SunriseIcon`. TodayView and SleepEntrySheet import from shared file. QuickActionSheet still defines its own local copies (`QuickActionSheet.tsx:16-39`) |
| U-15 | Modal overlay opacity inconsistent (50% vs 60%) | **FIXED** -- All overlays now use `bg-black/50` consistently (QuickActionSheet changed from 60% to 50%). Exception: `BabyEditSheet.tsx:120` uses `bg-black/30` (see U-29 below) |
| U-16 | SleepEntry cards use `<div role="button">` instead of `<button>` | **FIXED** -- `BedtimeEntry` and `NapEntry` now use semantic `<button type="button">` elements (`SleepEntry.tsx:46-48, 107-109`) |
| U-17 | ProfileMenu list items ~48px height | **FIXED** -- ListRow now uses `py-5` (was `py-4`), giving ~56px height (`ProfileMenu.tsx:66`) |
| U-19 | Fire-and-forget stale shares cleanup without `.catch()` | **FIXED** -- `.catch(() => { /* fire-and-forget cleanup */ })` added (`useBabyProfile.ts:152`) |
| U-20 | SleepEntrySheet date picker label missing `htmlFor` | **FIXED** -- Label has `htmlFor="sleep-entry-date"` and input has `id="sleep-entry-date"` (`SleepEntrySheet.tsx:516, 525`) |
| U-21 | No `loading="lazy"` on baby avatar images | **FIXED** -- `BabyAvatarPicker.tsx:181` now has `loading="lazy"` |

### Issues REMAINING

| Previous ID | Issue | Status |
|---|---|---|
| U-01 | Ghost card text/borders use `text-white` -- invisible in light mode | **NO LONGER APPLIES** -- Ghost cards now use `text-[var(--text-muted)]`, `text-[var(--text-secondary)]`, `border-[var(--nap-color)]/30`, `border-[var(--night-color)]/30` with `color-mix` backgrounds. Fully theme-aware. **FIXED.** |
| U-05 | Night theme contrast: `--text-on-accent` on `--night-color` | **REMAINS** -- Night theme `--text-on-accent: #1A1B2E` on `--nap-color: #9DBAB7` is approximately 4.2:1 (borderline WCAG AA for normal text). Active nap/night cards use `text-[var(--text-on-accent)]` on these backgrounds. See U-23 |
| U-08 | Nav tab height 48px below 60px requirement | **FIXED** -- `.nav-tab` is now `height: 56px` (`index.css:934`). Meets minimum 56px threshold |
| U-09 | Calendar date buttons 44px below 60px requirement | **FIXED** -- Calendar date buttons now `min-h-[56px]` (`DayNavigator.tsx:314`) |
| U-11 | Morning theme `--text-muted` may fail WCAG AA | **REMAINS** -- Morning `--text-muted: rgba(30, 41, 59, 0.55)` on `--bg-deep: #FFFBF2`. Effective colour ~`#8B9099` on cream. Contrast ratio ~3.4:1, below 4.5:1 AA for normal text. See U-24 |
| U-18 | Landing hero only 2 breakpoints | **NOT CHECKED** -- Landing page excluded from this audit scope |
| U-22 | Limited responsive breakpoints | **REMAINS** -- No tablet/desktop layouts added. Low priority for mobile-first app |

---

## 1. Scenario & flow

10 flows audited end-to-end via code inspection:

1. **New User Onboarding** -- Entry choice --> Onboarding steps --> Account creation --> Home
2. **Adding a Sleep Entry** -- FAB tap --> QuickActionSheet --> SleepEntrySheet with time pickers --> Entry saved
3. **Waking Up Active Sleep** -- Active card --> WakeUpSheet --> Time confirmation --> Predictions updated
4. **Navigating Sleep History** -- History tab --> Week strip --> Calendar modal --> Day entries --> Edit/delete
5. **Viewing Stats & Reports** -- Stats tab --> Date range picker --> Section chips --> Charts
6. **Managing Baby Profiles** -- Profile --> My Babies --> Baby detail --> Edit
7. **Multi-User Sharing** -- Baby detail --> ShareAccess --> Invite by email
8. **Growth Measurements** -- Baby detail --> Measures --> Add/edit weight/height/head
9. **Account & Settings** -- Profile --> Settings --> Language/name/role --> Sign out --> Delete account
10. **Today View** -- Predictions, ghost cards, active nap, morning wake-up

---

## 2. Step-by-step walkthrough

### Flow 1 -- New User Onboarding

**Step 1 -- Entry Choice & Auth**

- AuthDivider correctly uses `bg-[var(--text-muted)]/20` -- visible across all themes
- GoogleSignInButton correctly uses `bg-[var(--glass-bg)]` and `border-[var(--glass-border)]` -- theme-aware
- Skip-to-content link present as first focusable element (`App.tsx:600-604`)
- `LoadingScreen` message is hardcoded English `"Loading..."` (`AuthGuard.tsx:30`) -- not i18n'd

**Step 2 -- Onboarding Flow**

- Pre-auth flow collects baby name, DOB, parent name, relationship before account creation
- Draft persisted to session storage; applied on first login (`App.tsx:84-107`)
- Well-structured progressive disclosure

### Flow 2 -- Adding a Sleep Entry

**Step 1 -- QuickActionSheet**

- Overlay uses `bg-black/50` -- consistent with other sheets
- Moon icon on Bedtime button uses `text-[var(--text-on-accent)]` -- correct for light themes
- SunIcon, CloudIcon, MoonIcon defined locally (`QuickActionSheet.tsx:16-39`) instead of importing from `src/components/icons/SleepIcons.tsx` -- icon duplication remains
- Three-column grid action buttons have `p-4` with icon circles `w-14 h-14` -- comfortable touch targets

**Step 2 -- SleepEntrySheet**

- Imports `CloudIcon` and `MoonIcon` from shared icons file (`SleepEntrySheet.tsx:36`) -- correctly using shared icons
- Date picker has proper `htmlFor`/`id` association (`SleepEntrySheet.tsx:516, 525`)
- `saveError` prop displayed with `role="alert"` (`SleepEntrySheet.tsx:598`) -- good a11y
- `isSaving` state prevents double-submit with loading spinner
- Time inputs use `appearance-none` and hide webkit calendar picker -- consistent cross-browser

### Flow 3 -- Waking Up Active Sleep

**Step 1 -- WakeUpSheet**

- Imports `SunriseIcon` from shared icons (`WakeUpSheet.tsx:5`) -- correctly using shared icons
- -1/+1 minute adjustment buttons use `var(--glass-bg)` and `var(--glass-border)` -- theme-aware
- Confirm button: `w-72 h-72` (72px) -- excellent touch target for primary action
- `useEffect` missing `t` in dependency array (`WakeUpSheet.tsx:82`) -- React will warn about exhaustive deps

### Flow 4 -- Navigating Sleep History

**Step 1 -- Week Strip**

- Day buttons: `min-h-[56px] min-w-[44px]` -- height meets minimum, width still 44px but acceptable for 7-column grid
- Selected day uses `text-[var(--nap-color)]` and `bg-[var(--nap-color)] text-[var(--text-on-accent)]` -- theme-aware
- Edge fade gradients use `from-[var(--bg-deep)]` -- correctly adapts to theme background

**Step 2 -- Calendar Modal**

- Calendar date buttons: `min-h-[56px]` -- meets minimum touch target (was 44px)
- Overlay uses inline `zIndex: 100` -- correctly above floating nav (lesson learned)
- "Back to today" button: `py-3` with full width -- good touch target
- Calendar footer has `pb-28` to clear nav bar -- appropriate spacing

### Flow 5 -- Stats & Reports

- **Empty state present**: Icon + `stats.noDataTitle` + `stats.noDataBody` when no sleep data (`StatsView.tsx:1227-1232`)
- Growth section has `GrowthOnePointEmptyState` for insufficient data points (`StatsView.tsx:349`)
- Date range picker is a bottom sheet with calendar -- consistent with DayNavigator pattern
- Report generation still commented out (`StatsView.tsx:43-44`) -- feature disabled, not broken

### Flow 6 -- Managing Baby Profiles

**Step 1 -- MyBabiesView**

- Invite cards appear first with Accept/Decline buttons -- correct priority
- InviteCard uses `var(--glass-bg)`, `var(--glass-border)`, `var(--shadow-md)` -- theme-aware
- Baby cards use `rounded-3xl` with consistent glass styling

**Step 2 -- BabyEditSheet**

- Save button uses `text-white` instead of `text-[var(--text-on-accent)]` (`BabyEditSheet.tsx:244`) -- In night theme, `--nap-color` is `#9DBAB7` (muted sage). White on sage has ~4.5:1 contrast (borderline). Using `var(--text-on-accent)` would give `#1A1B2E` on `#9DBAB7` = ~4.2:1. Both are borderline. The morning/afternoon theme uses `--nap-color: #0D9488` (teal 600) where white gives ~4.6:1 and `--text-on-accent: #FFFFFF` is correct. **No regression in light mode.**
- Overlay uses `bg-black/30` (`BabyEditSheet.tsx:120`) -- lighter than standard `bg-black/50`

### Flow 7 -- Multi-User Sharing

- ShareAccess invite form has email validation and role selector
- Success notification uses `setTimeout(() => setSuccess(null), 3000)` -- acceptable UX timer
- Error states displayed inline with i18n keys

### Flow 8 -- Growth Measurements

- MeasuresView empty state is clear with icon, text, hint, and CTA button (`MeasuresView.tsx:126-144`)
- MeasureLogSheet hides nav via `NavHiddenWhenModalContext` -- Save stays visible
- Footer respects safe area: `paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 0px))'`
- All form inputs have proper `htmlFor`/`id` associations (`MeasureLogSheet.tsx:219-337`)
- Past-value warnings (`getMeasureWarning`) with tappable suggested corrections -- smart UX

### Flow 9 -- Account & Settings

**Step 1 -- Language selector**

- Active language button: `bg-[var(--night-color)] text-white` (`AccountSettingsView.tsx:149, 160, 171`)
- In night theme: `--night-color` is `#A5B4FC` (light lavender). White on `#A5B4FC` = ~1.6:1 contrast ratio -- **fails WCAG AA**. Should use `text-[var(--text-on-accent)]` which is `#1A1B2E` in night theme = ~7.5:1 contrast
- In morning/afternoon theme: `--night-color` is `#6366F1` (indigo). White on indigo = ~4.6:1 -- passes AA
- Buttons have `min-h-[48px]` -- below 56px recommendation but acceptable for secondary controls
- Confirmation modals for sign out and delete account have `role="alertdialog"`, `aria-modal`, focus trap -- excellent a11y

**Step 2 -- Password change**

- Hidden for OAuth users (`isOAuthUser` check on `user?.app_metadata?.provider`) -- correct behaviour
- Validation: min 6 chars, password match -- good
- Error display with `role="alert"` -- accessible

### Flow 10 -- Today View

- Hero card uses `var(--bg-card)` and `var(--shadow-md)` -- theme-aware, no `white/` values
- Ghost cards (predicted naps and bedtime) use `color-mix(in srgb, var(--nap-color) 8%, var(--bg-card))` -- fully theme-aware
- Active nap/night cards use `bg-[var(--nap-color)]/90` with `text-[var(--text-on-accent)]` -- proper contrast tokens
- Timeline vertical line: `bg-[var(--text-muted)]/20` -- theme-aware
- Frozen predictions pattern prevents re-renders during active nap (`TodayView.tsx:432-449`)
- Morning wake-up card uses `color-mix(in srgb, var(--wake-color) 8%, var(--bg-card))` -- consistent with ghost card pattern
- Empty state branches for: no baby (with invite variant), no activity today, active night from yesterday -- comprehensive

---

## 3. Findings

### 3.1 Frictions

- **Language selector contrast failure in night mode**: Active language button (`bg-[var(--night-color)] text-white`) is nearly invisible in night theme -- white on light lavender (`#A5B4FC`) produces only ~1.6:1 contrast. Users selecting language at night cannot read the active option
- **LoadingScreen message not internationalised**: `AuthGuard.tsx:30` passes hardcoded `"Loading..."` -- Spanish/Catalan users see English during auth loading
- **WakeUpSheet missing exhaustive deps**: `useEffect` at line 82 omits `t` from dependency array -- if user changes language while sheet is open, relative time label won't update. Minor but a React lint violation
- **BabyEditSheet lighter overlay**: Uses `bg-black/30` instead of the standard `bg-black/50` -- makes the sheet feel less "modal" than other sheets, potentially confusing when content behind bleeds through

### 3.2 Inconsistencies

| Area | What differs | Expected uniform behaviour |
|---|---|---|
| Icon definitions | QuickActionSheet still defines local `SunIcon`, `CloudIcon`, `MoonIcon` (`QuickActionSheet.tsx:16-39`) while TodayView, SleepEntrySheet, WakeUpSheet use shared `SleepIcons.tsx` | All files import from `src/components/icons/SleepIcons.tsx` |
| Overlay opacity | BabyEditSheet uses `bg-black/30` (`BabyEditSheet.tsx:120`); all others use `bg-black/50` | Single opacity value (`bg-black/50`) |
| `text-white` vs `text-[var(--text-on-accent)]` | AccountSettingsView language buttons and BabyEditSheet save button use hardcoded `text-white`; other accent-bg buttons use `var(--text-on-accent)` | Always use `text-[var(--text-on-accent)]` on accent backgrounds |
| TrashIcon/CloseIcon definitions | Duplicated in SleepEntrySheet, WakeUpSheet, MeasureLogSheet, AccountSettingsView | Extract to shared icons file |
| Week strip day width | `min-w-[44px]` while other touch targets are 56px+ | Could increase but constrained by 7-column grid |

### 3.3 Dependencies

- Language selector contrast fix (U-23) requires updating `text-white` to `text-[var(--text-on-accent)]` -- simple CSS change, no dependencies
- Icon deduplication (U-26) should complete before adding new icons
- Overlay opacity standardisation (U-29) is independent

### 3.4 Corner cases

- **StatsView with growth data but no sleep data**: Handled -- shows growth charts with one-point empty state and hint to add more measurements (`StatsView.tsx:1964-2069`)
- **No baby + pending invite**: Handled -- TodayView shows invite-specific empty state with "Review invite" CTA (`TodayView.tsx:601-643`)
- **Active night from yesterday**: Handled -- special state showing predicted wake-up time and "Wake Up" action card (`TodayView.tsx:550-597`)
- **Missing bedtime modal**: Has date picker for selecting which night to log; suppressed when recent night exists or when entries still loading
- **Password change for OAuth users**: Correctly hidden when `user?.app_metadata?.provider === 'google'`
- **Measurement value warnings**: `getMeasureWarning` catches likely typos (e.g., 700g entered as 700 instead of 7.00 kg) with tappable correction

### 3.5 Entity relationships

- **Baby-User relationship well-modelled**: Own babies vs shared babies distinguished via `isOwner` flag on `SharedBabyProfile`. ShareAccess only available for owned babies
- **Active baby persisted**: `activeBabyId` stored in localStorage so Today/History/Stats show correct baby after refresh
- **Sleep entries scoped to baby**: `useSleepEntries` takes `babyId` param, entries correctly scoped to active baby
- **Measurement logs scoped to baby**: `useGrowthLogs` takes `babyId`, fetches only that baby's measurements
- **Share lifecycle clear**: pending --> accepted/declined/revoked. Re-invite handles unique constraint via update fallback

### 3.6 Other observations

- **Shared icons partially adopted**: `src/components/icons/SleepIcons.tsx` exists and is used by TodayView, SleepEntrySheet, and WakeUpSheet. QuickActionSheet is the last holdout
- **Error banner in App.tsx**: Global error display for `profileError`, `entriesError`, `growthError` at `App.tsx:619-624` -- well done, though it only shows on initial load failure (no retry mechanism beyond page refresh)
- **Frozen predictions pattern working**: `frozenPredictionsRef`/`frozenBedtimeRef` in TodayView correctly snapshot predictions during active nap, preventing ghost card flicker
- **Safe area handling consistent**: MeasureLogSheet, DayNavigator calendar footer, and nav bar all account for `env(safe-area-inset-bottom)`

---

## 4. Improvements

### 4.1 P0 -- Must fix

| ID | Issue | Location | Fix | Impact | Effort |
|---|---|---|---|---|---|
| U-23 | Language selector `text-white` on `--night-color` (#A5B4FC) = ~1.6:1 contrast -- fails WCAG AA, text unreadable in night mode | `AccountSettingsView.tsx:149, 160, 171` | Replace `text-white` with `text-[var(--text-on-accent)]` on active language buttons | Critical | Low |
| U-24 | Morning theme `--text-muted` at `rgba(30,41,59,0.55)` on `#FFFBF2` = ~3.4:1 -- fails WCAG AA for normal text | `index.css:145` | Increase opacity to `0.62` for ~4.5:1 contrast, or darken base to `rgba(15,23,42,0.55)` | High | Low |

*P0 criteria: WCAG AA contrast failure on interactive elements (language selector) and all muted text in morning theme.*

### 4.2 P1 -- Important

| ID | Issue | Location | Fix | Impact | Effort |
|---|---|---|---|---|---|
| U-25 | LoadingScreen message hardcoded English `"Loading..."` | `AuthGuard.tsx:30` | Use `t('common.loading')` instead of hardcoded string | Medium | Low |
| U-26 | QuickActionSheet still defines local SunIcon/CloudIcon/MoonIcon instead of importing shared | `QuickActionSheet.tsx:16-39` | Import from `src/components/icons/SleepIcons.tsx` and delete local definitions | Medium | Low |
| U-27 | TrashIcon and CloseIcon duplicated across SleepEntrySheet, WakeUpSheet, MeasureLogSheet, AccountSettingsView | Multiple files | Extract to `src/components/icons/ActionIcons.tsx` | Medium | Low |
| U-28 | BabyEditSheet save button uses `text-white` instead of `text-[var(--text-on-accent)]` | `BabyEditSheet.tsx:244` | Replace `text-white` with `text-[var(--text-on-accent)]` | Medium | Low |
| U-29 | BabyEditSheet overlay `bg-black/30` inconsistent with all other sheets using `bg-black/50` | `BabyEditSheet.tsx:120` | Change to `bg-black/50` for consistency | Low | Low |
| U-30 | WakeUpSheet `useEffect` missing `t` in dependency array (exhaustive-deps violation) | `WakeUpSheet.tsx:82` | Add `t` to dependency array: `[isOpen, t]` | Low | Low |
| U-31 | AccountSettingsView sign-out and delete buttons use `text-white` on `bg-[var(--danger-color)]` | `AccountSettingsView.tsx:458, 531` | Replace with `text-[var(--text-on-accent)]` for theme consistency (currently works because danger-color is always dark enough for white, but inconsistent pattern) | Low | Low |

*P1 criteria: i18n gap, code duplication creating maintenance burden, minor pattern inconsistencies.*

### 4.3 P2 -- Nice to have

| ID | Issue | Location | Fix | Impact | Effort |
|---|---|---|---|---|---|
| U-32 | No retry mechanism for data fetch errors (only shows banner, user must refresh page) | `App.tsx:619-624` | Add "Tap to retry" button in error banner that calls refresh functions | Low | Medium |
| U-33 | Week strip day width 44px narrower than other touch targets | `DayNavigator.tsx:117` | Acceptable in 7-column grid but could use `min-w-[48px]` if layout allows | Low | Low |
| U-34 | Limited responsive breakpoints for tablet/desktop | App-wide | Add `lg:` breakpoint styles for wider viewports | Low | High |
| U-35 | LandingLanguagePicker uses `bg-white/20` and `text-white/60` | `LandingLanguagePicker.tsx:92-93` | Replace with `bg-[var(--glass-bg)]` and `text-[var(--text-muted)]` for theme awareness (landing page only, lower priority) | Low | Low |

*P2 criteria: polish items, edge cases, landing-page-only issues.*

### Task Groups

### Task Group A -- Contrast & Accessibility Fixes (U-23, U-24)

**Depends on**: nothing
**Files**: `AccountSettingsView.tsx`, `index.css`

1. Replace `text-white` with `text-[var(--text-on-accent)]` on active language buttons (3 occurrences)
2. Increase morning theme `--text-muted` opacity from `0.55` to `0.62` or darken the base colour
3. Test in all 3 circadian themes

### Task Group B -- Pattern Consistency (U-28, U-29, U-31)

**Depends on**: nothing
**Files**: `BabyEditSheet.tsx`, `AccountSettingsView.tsx`

1. Replace `text-white` with `text-[var(--text-on-accent)]` on BabyEditSheet save button
2. Change BabyEditSheet overlay from `bg-black/30` to `bg-black/50`
3. Optionally replace `text-white` on danger buttons with `text-[var(--text-on-accent)]`

### Task Group C -- i18n Completion (U-25)

**Depends on**: nothing
**Files**: `AuthGuard.tsx`

1. Replace hardcoded `"Loading..."` with `t('common.loading')` (key likely already exists)

### Task Group D -- Icon Deduplication (U-26, U-27)

**Depends on**: nothing
**Files**: `QuickActionSheet.tsx`, multiple files for TrashIcon/CloseIcon, new `ActionIcons.tsx`

1. Update QuickActionSheet to import from `SleepIcons.tsx`
2. Create `src/components/icons/ActionIcons.tsx` with TrashIcon, CloseIcon, CheckIcon
3. Update all consumers to use shared icons

### Task Group E -- Minor Fixes (U-30, U-32)

**Depends on**: nothing
**Files**: `WakeUpSheet.tsx`, `App.tsx`

1. Add `t` to WakeUpSheet useEffect dependency array
2. Optionally add retry button to error banner

### Execution order

```
Task Group A -- start immediately (critical contrast failures)
Task Group B -- start immediately (quick consistency fixes)
Task Group C -- start immediately (1 line change)
Task Group D -- start after A+B (icon extraction, lower priority)
Task Group E -- start after A+B (minor fixes)
```

Minimum viable improvement: **Task Groups A + B + C** -- fixes the contrast failure that makes language selector unreadable in night mode, standardises `text-white` to `text-[var(--text-on-accent)]` across the app, and completes i18n. All P0 items resolved. Can be completed in 15-20 minutes.

---

## 5. Debrief

### Key problems

- **Night-mode contrast regression on language selector** -- The active language button in Account Settings uses hardcoded `text-white` on `--night-color` (`#A5B4FC`, light lavender), producing only ~1.6:1 contrast. This is the most severe issue found: a WCAG AA failure that makes the active language option unreadable at night, exactly when the persona is most likely using the app. Root cause: using `text-white` instead of the theme-aware `text-[var(--text-on-accent)]` token.
- **Morning theme muted text below WCAG AA** -- `--text-muted` at 55% opacity produces ~3.4:1 contrast on the morning cream background (`#FFFBF2`). This affects all secondary labels, hints, and timestamps across the entire app during morning hours (06:00-11:59). Root cause: opacity calibrated for night theme's darker background without adjusting for light backgrounds.
- **Residual `text-white` pattern** -- Several components still use hardcoded `text-white` on accent-coloured backgrounds instead of the theme-aware `text-[var(--text-on-accent)]` token. While most of these work in practice (the accent colours are dark enough), they represent a pattern inconsistency that could cause future regressions.

### Highest-impact improvements

- **Fix language selector contrast (Task Group A)** -- Single-line CSS change from `text-white` to `text-[var(--text-on-accent)]` in 3 places. Immediately makes the language selector readable in night mode. This is the only P0 issue and affects every user who opens Settings at night.
- **Standardise `text-white` to token (Task Group B)** -- Eliminates the last instances of hardcoded `text-white` on accent backgrounds, preventing future contrast regressions as theme colours evolve. Low effort, high long-term value.
- **Internalise loading message (Task Group C)** -- One-line change that ensures Spanish and Catalan users see their language during the initial auth loading screen. Completes the i18n coverage.

### Risk if nothing changes

- **WCAG compliance gap** -- The language selector contrast failure (1.6:1) is a testable WCAG 2.1 Level AA violation (SC 1.4.3). Morning muted text at 3.4:1 is another. Together they affect users during the two most common usage times (morning wake-up routine and evening bedtime routine). If the app is ever audited for accessibility, these are clear failures.
- **Pattern drift** -- The mix of `text-white` and `text-[var(--text-on-accent)]` creates ambiguity for future development. New components may copy the wrong pattern, creating more contrast issues.

### Overall assessment

The codebase has improved significantly since the 2026-03-20 audit. 15 of 22 previous issues have been fixed, including all critical light-mode visibility bugs, the skip-to-content link, semantic HTML improvements, error handling, and empty states. The shared icons pattern is nearly complete. The remaining issues are narrower in scope: one contrast failure in night mode, one morning theme opacity adjustment, and a handful of pattern consistency items. The app's core flows (adding entries, predictions, wake-up, sharing) are solid across all three circadian themes.
