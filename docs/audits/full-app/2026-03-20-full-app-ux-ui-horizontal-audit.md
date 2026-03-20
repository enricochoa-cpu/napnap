# Full App — UX/UI Horizontal Audit

- **Date**: 2026-03-20
- **Area**: Full app (React 19 + TypeScript + Vite + Tailwind CSS 4 + Framer Motion)
- **Persona**: Anxious first-time parent (25-45), sleep-deprived, one-handed operation at 3AM
- **User goal**: Track infant sleep (0-18 months) with zero friction, receive definitive predictions, feel calm and reassured

---

## 1. Scenario & flow

11 flows audited end-to-end via code inspection:

1. **New User Onboarding** — Landing page → Entry choice → Onboarding steps (baby name, DOB, parent name, relationship) → Account creation → Home
2. **Returning User Login** — Landing/deep link → Login (email/password or Google OAuth) → Home with data
3. **Adding a Sleep Entry** — FAB tap → QuickActionSheet (Wake Up/Nap/Bedtime) → SleepEntrySheet with time pickers → Collision detection → Entry saved
4. **Waking Up Active Sleep** — Active nap card → WakeUpSheet → Time confirmation → Predictions updated
5. **Navigating Sleep History** — History tab → Week strip navigator → Calendar modal → Day entries → Edit/delete
6. **Viewing Stats & Reports** — Stats tab → Date range picker → Section chips → Charts → Generate 30-day report
7. **Managing Multi-User Sharing** — Profile → My Babies → Baby detail → ShareAccess → Invite by email with role
8. **Accepting Pending Invite** — Empty state CTA → Profile → My Babies → Accept invite → Baby data synced
9. **Growth Measurements** — Baby detail → Measures → Add/edit weight/height/head → Past-value warnings
10. **Account & Settings** — Profile → Settings → Language/name/role → Sign out → Delete account
11. **Sleep Guides (Public)** — Landing → Sleep Guide Hub → Individual guide page

---

## 2. Step-by-step walkthrough

### Flow 1 — New User Onboarding

**Step 1 – Landing Page**

- LandingPage uses correct scroll container pattern with `height: 100dvh` inline + `overflow-y-auto` ([LandingPage.tsx:349](src/components/LandingPage.tsx#L349))
- Hero section has only 2 height breakpoints: `h-[360px] sm:h-[440px]` — no lg/xl coverage ([LandingPage.tsx:145](src/components/LandingPage.tsx#L145))
- All images have descriptive alt text ([LandingPage.tsx:477, 491, 505](src/components/LandingPage.tsx#L477))
- Glass fallback hardcodes `rgba(255,255,255,0.06)` which is invisible on light backgrounds ([LandingPage.tsx:384](src/components/LandingPage.tsx#L384))
- Fix: Add `lg:h-[520px]` to hero image; replace glass fallback with theme-aware value

**Step 2 – Entry Choice & Onboarding**

- AuthDivider uses `bg-white/10` for separator lines — invisible in morning/afternoon themes ([AuthDivider.tsx:7, 9](src/components/Auth/AuthDivider.tsx#L7))
- GoogleSignInButton uses hardcoded `bg-white/10`, `border-white/20`, `border-white/30` — all invisible in light mode ([GoogleSignInButton.tsx:34-35, 41](src/components/Auth/GoogleSignInButton.tsx#L34))
- Fix: Replace `bg-white/10` with `bg-[var(--glass-bg)]`; replace `border-white/20` with `border-[var(--glass-border)]`

**Step 3 – Account Creation (Sign Up)**

- SignUpForm has proper client-side validation: password match, min 6 chars, terms checkbox ([SignUpForm.tsx:28-45](src/components/Auth/SignUpForm.tsx#L28))
- Error messages display in danger-colored card — well-designed ([SignUpForm.tsx:104-108](src/components/Auth/SignUpForm.tsx#L104))
- Success state shows confetti screen — delightful touch ([SignUpForm.tsx:60-82](src/components/Auth/SignUpForm.tsx#L60))

### Flow 2 — Returning User Login

**Step 1 – Login Form**

- Error display is clear with `bg-[var(--danger-color)]/10` card ([LoginForm.tsx:54-58](src/components/Auth/LoginForm.tsx#L54))
- Button label changes during submission: `signingIn` vs `signIn` — good feedback ([LoginForm.tsx:103](src/components/Auth/LoginForm.tsx#L103))
- Inputs use `.input` CSS class with proper focus glow ([index.css:815-819](src/index.css#L815))

### Flow 3 — Adding a Sleep Entry

**Step 1 – QuickActionSheet**

- Spring animation with `stiffness: 300, damping: 30` — premium feel ([QuickActionSheet.tsx:84-88](src/components/QuickActionSheet.tsx#L84))
- Drag-to-dismiss with handle bar (`cursor-grab active:cursor-grabbing`) — discoverable ([QuickActionSheet.tsx:97-99](src/components/QuickActionSheet.tsx#L97))
- Backdrop opacity follows drag via `useTransform(y, [0, 300], [1, 0])` — smooth ([QuickActionSheet.tsx:53](src/components/QuickActionSheet.tsx#L53))
- Overlay uses `bg-black/60` ([QuickActionSheet.tsx:70](src/components/QuickActionSheet.tsx#L70))

**Step 2 – SleepEntrySheet**

- Comprehensive temporal validation: blocks 0-duration, nap > 5h, night > 14h; warns nap > 4h, night > 13h, cross-midnight nap ([SleepEntrySheet.tsx:312-349](src/components/SleepEntrySheet.tsx#L312))
- Dynamic save icon: Play (new) → Stop (active) → Check (completed) — clever affordance ([SleepEntrySheet.tsx:306-310](src/components/SleepEntrySheet.tsx#L306))
- Date picker label wraps hidden input; has `aria-label` but missing `htmlFor` association ([SleepEntrySheet.tsx:527-544](src/components/SleepEntrySheet.tsx#L527))
- `isSaving` state blocks double-submit — prevents data corruption ([SleepEntrySheet.tsx:257](src/components/SleepEntrySheet.tsx#L257))
- Overlay uses `bg-black/50` (inconsistent with QuickActionSheet's `bg-black/60`) ([SleepEntrySheet.tsx:446](src/components/SleepEntrySheet.tsx#L446))

### Flow 4 — Waking Up Active Sleep

**Step 1 – WakeUpSheet**

- 30-second interval updates relative time label — cleaned up properly ([WakeUpSheet.tsx:109-112](src/components/WakeUpSheet.tsx#L109))
- Defines own `SunriseIcon` — duplicated from TodayView icon set

### Flow 5 — Navigating Sleep History

**Step 1 – DayNavigator Week Strip**

- Day buttons: `min-h-[56px] min-w-[44px]` — width (44px) below 60px touch target requirement ([DayNavigator.tsx:117](src/components/DayNavigator.tsx#L117))
- Calendar modal overlay uses `bg-black/50` (inconsistent with other modals) ([DayNavigator.tsx:242](src/components/DayNavigator.tsx#L242))
- Calendar date buttons: `min-h-[44px]` — below 60px requirement ([DayNavigator.tsx:314](src/components/DayNavigator.tsx#L314))

**Step 2 – Sleep Entry Cards**

- Uses `<div role="button" tabIndex={0} onKeyDown>` instead of semantic `<button>` — functional but suboptimal ([SleepEntry.tsx:45-55, 114-124](src/components/SleepEntry.tsx#L45))
- All cards have `active:opacity-90 transition-opacity` feedback ([SleepEntry.tsx:47, 115](src/components/SleepEntry.tsx#L47))

**Step 3 – SleepList Empty State**

- Clear empty state with moon icon, message, and CTA hint ([SleepList.tsx:195-212](src/components/SleepList.tsx#L195)) — well done

### Flow 6 — Viewing Stats & Reports

**Step 1 – StatsView**

- Section chips with scroll-into-view — keeps selected chip centered
- Date range picker capped at 15 days — prevents overwhelming data
- Report generation disabled (commented import): `// import { SleepReportView }` ([StatsView.tsx:43-44](src/components/Stats/StatsView.tsx#L43))
- Missing: Empty state when no data available for selected date range

### Flow 7 — Managing Multi-User Sharing

**Step 1 – MyBabiesView**

- Invite cards appear first (above owned babies) — correct priority
- Baby cards use `rounded-3xl` with glass bg and nap-color border when selected — AAA gallery pattern
- "Add baby" ghost card present when user has no own profile

**Step 2 – ShareAccess**

- `setTimeout(() => setSuccess(null), 3000)` for success notification — acceptable one-off timer ([ShareAccess.tsx](src/components/ShareAccess.tsx))
- Bottom sheet uses `max-h-[85vh]` — allows scroll on small screens ([ShareAccess.tsx:355](src/components/ShareAccess.tsx#L355))

### Flow 9 — Growth Measurements

**Step 1 – MeasuresView**

- Clear empty state with icon, message, subtitle, and CTA button ([MeasuresView.tsx:125-145](src/components/Profile/MeasuresView.tsx#L125))
- Loading state shows `animate-spin` spinner ([MeasuresView.tsx:123](src/components/Profile/MeasuresView.tsx#L123))
- Back button has proper `aria-label={t('common.ariaGoBack')}` ([MeasuresView.tsx:97](src/components/Profile/MeasuresView.tsx#L97))

**Step 2 – MeasureLogSheet**

- Nav hidden via `NavHiddenWhenModalContext` so Save button stays visible — smart pattern
- Footer respects safe area: `paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 0px))'` ([MeasureLogSheet.tsx:346](src/components/Profile/MeasureLogSheet.tsx#L346))

### Flow 10 — Account & Settings

**Step 1 – ProfileMenu**

- ListRow items: `px-5 py-4` creating ~48px height — below 60px touch target ([ProfileMenu.tsx:66](src/components/Profile/ProfileMenu.tsx#L66))
- Warm dot on My Babies row when pending invite — good discoverability
- Overlay uses `bg-black/60` ([AccountSettingsView.tsx:297](src/components/Profile/AccountSettingsView.tsx#L297))

### Flow 11 — Sleep Guides

**Step 1 – Landing Pages (Terms/Privacy)**

- LandingTermsPage and LandingPrivacyPage use `min-h-[100dvh]` without `style={{ height: '100dvh' }}` — incomplete scroll container pattern per lessons.md §6.8 ([LandingTermsPage.tsx:28](src/components/LandingTermsPage.tsx#L28), [LandingPrivacyPage.tsx:30](src/components/LandingPrivacyPage.tsx#L30))
- Fix: Add `style={{ height: '100dvh' }}` to match LandingPage pattern

---

## 3. Findings

### 3.1 Frictions

- **Light mode auth invisibility**: AuthDivider, GoogleSignInButton use hardcoded `white/` values that vanish on morning/afternoon themes — users may not see the OAuth option or divider
- **Ghost card text invisible in light mode**: Active nap/bedtime ghost cards in TodayView use `text-white`, `border-white/20` — disappear on cream backgrounds
- **API errors silently swallowed**: All Supabase errors in hooks go to `console.error` only — user sees nothing when network fails
- **No skip-to-content link**: Keyboard users must Tab through all nav tabs before reaching content
- **Calendar date buttons too small**: 44px touch targets in calendar modal make date selection frustrating on mobile
- **Profile menu items undersized**: ~48px height makes tapping between items error-prone for sleep-deprived parents
- **StatsView has no empty state**: When no data exists for selected range, user sees blank content with no guidance

### 3.2 Inconsistencies


| Area             | What differs                                                                                       | Expected uniform behavior                          |
| ---------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Modal overlays   | `bg-black/50` (SleepEntrySheet, DayNavigator) vs `bg-black/60` (QuickActionSheet, AccountSettings) | Single opacity value (recommend `bg-black/50`)     |
| Icon definitions | SunIcon/CloudIcon/MoonIcon duplicated across TodayView, SleepEntrySheet, WakeUpSheet               | Shared `src/components/icons/` folder              |
| Card borders     | Some inline (`1px solid var(--glass-border)`), some class-based, some missing                      | Consistent class-based pattern                     |
| Touch targets    | Range from 44px to 56px across interactive elements                                                | Minimum 56px everywhere (60px for primary actions) |
| Spacing          | ProfileMenu `py-4` (16px vertical) vs cards `p-5` (20px all sides)                                 | Unified vertical padding on list items             |


### 3.3 Dependencies

- Light-mode color fixes (U-01, U-02, U-03) are independent and can be done in parallel
- Skip-to-content link (U-04) is standalone
- Touch target fixes (U-08, U-09) require layout changes that may affect spacing elsewhere
- Console.log cleanup (U-06) is fully independent
- Icon extraction (U-14) should happen before adding new icon usage

### 3.4 Mobile-web parity gaps

*This is a web-only app — no native mobile counterpart exists. Section skipped.*

---

## 4. Improvements

### 4.1 P0 — Must fix


| ID   | Issue                                                                                                       | Location                           | Fix                                                                                                   | Impact   | Effort |
| ---- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------- | -------- | ------ |
| U-01 | Ghost card text/borders use `text-white`, `border-white/20` — invisible in morning/afternoon light mode     | `TodayView.tsx:779-939`            | Replace with `text-[var(--text-on-accent)]` and `border-[var(--glass-border)]`                        | Critical | Low    |
| U-02 | AuthDivider `bg-white/10` invisible in light mode                                                           | `AuthDivider.tsx:7, 9`             | Replace with `bg-[var(--text-muted)]/20`                                                              | High     | Low    |
| U-03 | GoogleSignInButton `bg-white/10`, `border-white/20` invisible in light mode — OAuth button appears disabled | `GoogleSignInButton.tsx:34-35, 41` | Replace with `bg-[var(--glass-bg)]`, `border-[var(--glass-border)]`                                   | Critical | Low    |
| U-04 | No skip-to-content link for keyboard navigation                                                             | `index.html` / `App.tsx`           | Add `<a href="#main" class="sr-only focus:not-sr-only">` skip link before nav (WCAG SC 2.4.1 Level A) | High     | Low    |
| U-05 | Night theme contrast: `--text-on-accent: #1A1B2E` on `--night-color: #A5B4FC` ≈ 4.1:1 — fails WCAG AA       | `index.css:272`                    | Change night theme `--text-on-accent` to `#F1F5F9` for 7:1+ contrast (WCAG SC 1.4.3)                  | High     | Low    |


*P0 criteria: light-mode visibility bugs affect all light-mode users; WCAG Level A failure; contrast failure on core interaction elements.*

### 4.2 P1 — Important


| ID   | Issue                                                                                | Location                                                               | Fix                                                                 | Impact | Effort |
| ---- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------- | ------ | ------ |
| U-06 | 10+ `console.log` statements in production hooks leak debug info                     | `useBabyProfile.ts:52, 77, 86, 88, 114, 150, 162`; `useBabyShares.ts`  | Remove all `console.log`; keep `console.error` for actual errors    | High   | Low    |
| U-07 | API errors silently swallowed — user sees nothing on network failure                 | `useSleepEntries.ts:54`, `useBabyProfile.ts:48`, `useGrowthLogs.ts:55` | Add error state to hooks; display toast/inline error in UI          | High   | Medium |
| U-08 | Nav tab height 48px below 60px touch target requirement                              | `index.css:934`                                                        | Increase `.nav-tab` height to 56px minimum                          | Medium | Low    |
| U-09 | Calendar date buttons 44px below 60px requirement                                    | `DayNavigator.tsx:314`                                                 | Increase `min-h-[44px]` to `min-h-[56px]`                           | Medium | Low    |
| U-10 | StatsView has no empty state when no data for selected range                         | `StatsView.tsx`                                                        | Add empty state component with guidance message                     | Medium | Low    |
| U-11 | Morning theme `--text-muted` at 45% opacity may fail WCAG AA on `#FFFBF2`            | `index.css:144-145`                                                    | Test contrast ratio; increase to 55% if below 4.5:1 (WCAG SC 1.4.3) | Medium | Low    |
| U-12 | Terms/Privacy landing pages missing fixed `height: 100dvh` inline style              | `LandingTermsPage.tsx:28`, `LandingPrivacyPage.tsx:30`                 | Add `style={{ height: '100dvh' }}` per lessons.md §6.8 pattern      | Medium | Low    |
| U-13 | TodayView 60-second tick re-renders entire component even when predictions unchanged | `TodayView.tsx:157-159`                                                | Apply frozen `useRef` pattern documented in MEMORY.md               | Medium | Medium |


*P1 criteria: debug info leaks; silent errors degrade trust; touch targets below requirement; missing empty states.*

### 4.3 P2 — Nice to have


| ID   | Issue                                                                                | Location                                                                                                    | Fix                                                                     | Impact | Effort |
| ---- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------ | ------ |
| U-14 | Icon components (Sun, Cloud, Moon) duplicated across 3+ files                        | `TodayView.tsx:111-136`, `SleepEntrySheet.tsx:37-47`, `WakeUpSheet.tsx`                                     | Extract to `src/components/icons/` shared folder                        | Low    | Low    |
| U-15 | Modal overlay opacity inconsistent (50% vs 60%)                                      | `DayNavigator.tsx:242`, `SleepEntrySheet.tsx:446`, `QuickActionSheet.tsx:70`, `AccountSettingsView.tsx:297` | Standardize to `bg-black/50` everywhere                                 | Low    | Low    |
| U-16 | SleepEntry cards use `<div role="button">` instead of semantic `<button>`            | `SleepEntry.tsx:45-55, 114-124`                                                                             | Replace with `<button>` element for better default a11y (WCAG SC 4.1.2) | Low    | Low    |
| U-17 | ProfileMenu list items ~48px height below 60px                                       | `ProfileMenu.tsx:66`                                                                                        | Increase `py-4` to `py-5` for ~56px height                              | Low    | Low    |
| U-18 | Landing hero image only 2 breakpoints (`h-[360px] sm:h-[440px]`)                     | `LandingPage.tsx:145`                                                                                       | Add `lg:h-[520px]` for larger screens                                   | Low    | Low    |
| U-19 | Fire-and-forget stale shares cleanup without `.catch()`                              | `useBabyProfile.ts:150-157`                                                                                 | Add `.catch()` to prevent unobserved promise rejection                  | Low    | Low    |
| U-20 | SleepEntrySheet date picker label missing `htmlFor` association                      | `SleepEntrySheet.tsx:527-544`                                                                               | Add `id` to input and `htmlFor` to label (WCAG SC 1.3.1)                | Low    | Low    |
| U-21 | No `loading="lazy"` on baby avatar images in lists                                   | `BabyAvatarPicker.tsx`                                                                                      | Add `loading="lazy"` to avatar `<img>` tags                             | Low    | Low    |
| U-22 | Limited responsive breakpoints — no tablet (768-1024px) or desktop (1024px+) layouts | App-wide                                                                                                    | Add `lg:` breakpoint styles for wider viewports                         | Low    | High   |


*P2 criteria: code hygiene, minor inconsistencies, polish items.*

### Task Groups

### Task Group A — Light Mode Visibility Fixes (U-01, U-02, U-03)

**Depends on**: nothing
**Files**: `TodayView.tsx`, `AuthDivider.tsx`, `GoogleSignInButton.tsx`

1. Replace all `text-white`, `bg-white/`, `border-white/` on ghost cards in TodayView (lines 779-939) with theme-aware variables
2. Replace `bg-white/10` in AuthDivider with `bg-[var(--text-muted)]/20`
3. Replace hardcoded white values in GoogleSignInButton with `var(--glass-bg)` / `var(--glass-border)`
4. Test in all 3 circadian themes (morning, afternoon, night)

### Task Group B — Accessibility Fixes (U-04, U-05, U-16, U-20)

**Depends on**: nothing
**Files**: `index.html` or `App.tsx`, `index.css`, `SleepEntry.tsx`, `SleepEntrySheet.tsx`

1. Add skip-to-content link as first child in App.tsx
2. Fix night theme `--text-on-accent` contrast in index.css
3. Replace `<div role="button">` with semantic `<button>` in SleepEntry.tsx
4. Add `htmlFor`/`id` association to date picker in SleepEntrySheet

### Task Group C — Production Cleanup (U-06, U-19)

**Depends on**: nothing
**Files**: `useBabyProfile.ts`, `useBabyShares.ts`

1. Remove all `console.log` statements (keep `console.error`)
2. Add `.catch()` to fire-and-forget Supabase call

### Task Group D — Error Handling & Empty States (U-07, U-10)

**Depends on**: nothing
**Files**: `useSleepEntries.ts`, `useBabyProfile.ts`, `useGrowthLogs.ts`, `StatsView.tsx`

1. Add `error` state to data hooks alongside `loading`
2. Create reusable error/empty state components
3. Wire up error display in TodayView, SleepList, StatsView, MeasuresView
4. Add empty state to StatsView for no-data scenarios

### Task Group E — Touch Target & Responsive Fixes (U-08, U-09, U-12, U-17, U-18)

**Depends on**: nothing
**Files**: `index.css`, `DayNavigator.tsx`, `LandingTermsPage.tsx`, `LandingPrivacyPage.tsx`, `ProfileMenu.tsx`, `LandingPage.tsx`

1. Increase nav tab height to 56px in index.css
2. Increase calendar date buttons to `min-h-[56px]`
3. Add `style={{ height: '100dvh' }}` to Terms/Privacy landing pages
4. Increase ProfileMenu item padding
5. Add `lg:` breakpoint to landing hero image

### Task Group F — Performance (U-13, U-21)

**Depends on**: nothing
**Files**: `TodayView.tsx`, avatar image components

1. Implement frozen `useRef` pattern for prediction memoization
2. Add `loading="lazy"` to avatar images

### Task Group G — Code Hygiene (U-14, U-15, U-22)

**Depends on**: nothing
**Files**: Multiple component files, new `src/components/icons/` directory

1. Extract shared icon components to `src/components/icons/`
2. Standardize modal overlay opacity to `bg-black/50`
3. (Low priority) Add tablet/desktop responsive breakpoints

### Task Group H — Contrast Audit (U-11)

**Depends on**: Task Group A (light-mode fixes provide context)
**Files**: `index.css`

1. Measure `--text-muted` contrast on morning theme background
2. Adjust opacity if below 4.5:1

### Execution order

```
Task Group A ── start immediately (critical visibility)
Task Group B ── start immediately (accessibility)
Task Group C ── start immediately (quick cleanup)
Task Group D ── start immediately (error UX)
Task Group E ── start immediately (touch targets)
Task Group F ── after A completes (TodayView shared file)
Task Group G ── after F completes (icon extraction)
Task Group H ── after A completes (contrast depends on theme fixes)
```

Minimum viable improvement: **Task Groups A + B + C** — fixes the most impactful user-facing issues (light mode invisibility, WCAG failures, debug info leaks) with minimal effort. These 3 groups cover all P0 items and the highest-impact P1 items, and can be completed in a single session.

---

## 5. Debrief

### Key problems

- **Light mode color collapse** — Hardcoded `white/` values in TodayView ghost cards, AuthDivider, and GoogleSignInButton become invisible when the circadian theme switches to morning or afternoon. Root cause: using literal white opacity instead of theme-aware CSS variables. Scope: affects every user during daytime hours (roughly 06:00-19:00).
- **Silent API failures** — All Supabase hook errors are logged to `console.error` with no user-facing feedback. When network fails or Supabase is down, the app appears frozen with no explanation. Root cause: hooks don't expose error state. Scope: affects all data operations (sleep entries, profiles, growth logs, sharing).
- **WCAG compliance gaps** — Missing skip-to-content link (Level A), night theme contrast failure on accent colors (Level AA), non-semantic interactive elements. Root cause: accessibility wasn't systematically reviewed. Scope: affects keyboard users, screen reader users, and users with visual impairments.

### Highest-impact improvements

- **Fix light mode white/ values (Task Group A)** — Restores visibility of core UI elements (ghost cards, OAuth button, dividers) for all daytime users. Currently, the app's most important features (sleep predictions, authentication) are partially invisible during morning/afternoon hours. Effort is low (CSS variable swaps).
- **Add error state to data hooks (Task Group D)** — Transforms silent failures into visible feedback, building the trust that the product strategy depends on. Without this, a single network hiccup makes the app feel broken with no recovery path. Unblocks future reliability improvements.
- **Remove console.log statements (Task Group C)** — Eliminates debug info leaking to production (user IDs, table names, query results). Quick win that improves professionalism and reduces information exposure.

### Risk if nothing changes

- **User trust erosion** — Silent failures and invisible UI elements in light mode undermine the "calm confidence" metric that defines product success. Sleep-deprived parents encountering a seemingly broken app at 6AM will abandon it, and the product's core value proposition (certainty) collapses.
- **Accessibility liability** — Missing skip-to-content (WCAG 2.4.1 Level A) and contrast failures (WCAG 1.4.3 Level AA) are testable violations. As the app grows, these become compliance risks and exclude users with disabilities.
- **Debug info exposure** — Console.log statements outputting user IDs and database structure are visible to anyone opening browser DevTools. While not a direct security vulnerability, it leaks implementation details and looks unprofessional.

