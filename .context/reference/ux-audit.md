# UX/UI Audit — Authenticated App

**Date**: 2026-03-06
**Last updated**: 2026-03-07
**Scope**: Authenticated experience only (post-login). Excludes landing page, onboarding, and auth flows.
**Method**: Screen-by-screen walkthrough against 5 product principles.

> **Progress**: 38/44 items resolved (✅ Done). 3 items deferred (⏸️ — Report section temporarily disabled for redesign). 3 items still pending (🔲 T-03, SP-01, SE-01). See severity summary below.

## Audit Principles

Every screen is scored against:

1. **Decision replacement** — Tell users what to do, don't make them figure it out
2. **3AM usability** — 60px+ touch targets, readable fonts, thumb-zone actions
3. **Emotional safety** — No guilt, no judgement, gentle friend persona
4. **Night-first design** — Calming palette, low saturation, dark-first
5. **Zero learning curve** — Self-evident actions, <3s to log sleep

## Severity Definitions

- **Critical**: Broken functionality, data loss risk, or blocked user flow
- **High**: Significant friction, brand violation, or accessibility failure affecting daily use
- **Medium**: Suboptimal UX that users can work around but degrades trust/polish
- **Low**: Minor polish item or edge case with minimal daily impact

---

## Section 0: Severity Summary

> **Status key**: ✅ = Done · 🔲 = Pending

| ID | Screen | Issue | Severity | Category | Status |
|----|--------|-------|----------|----------|--------|
| T-01 | Today | Ghost prediction cards are not tappable — no way to pre-log a predicted nap | Medium | Missing interaction | ✅ Done (#15) |
| T-02 | Today | No error state if entries fail to load — screen stays on skeleton forever | High | Error handling | ✅ Done (#9) |
| T-03 | Today | Timeline cards lack visible keyboard focus indicator | Medium | Accessibility | 🔲 Pending |
| H-01 | History | No empty state copy for a date with no entries (when baby exists) | Medium | Missing state | ✅ Done (#11) |
| H-02 | History | No loading skeleton for sleep entries | Medium | Missing state | ✅ Done (#12) |
| S-01 | Stats | No loading skeleton for charts — data pops in with no transition | Medium | Missing state | ✅ Done (#12) |
| S-02 | Stats | "Add weight"/"Add height" buttons navigate to Profile menu, not directly to MeasuresView | High | Navigation | ✅ Done (#10) |
| S-03 | Stats | Report uses last 30 days regardless of date picker — no explanation for disconnect | Medium | UX confusion | ⏸️ Deferred — Report section temporarily disabled; will be redesigned |
| S-04 | Stats | Tooltip labels ("Naps", "Night") hardcoded in English | Medium | i18n | ✅ Done (#2) |
| S-05 | Stats | Calendar weekday labels ("Mon", "Tue"...) hardcoded in English | Medium | i18n | ✅ Done (#2) |
| R-01 | Report | No export/share/print option — parents can't send to paediatrician | Medium | Missing feature | ✅ Done (#16) |
| R-02 | Report | Empty state says "Not enough data" but doesn't say how much is needed | Low | UX clarity | ⏸️ Deferred — Report section temporarily disabled |
| R-03 | Report | "Back to trends" label assumes Stats entry point | Low | Navigation | ⏸️ Deferred — Report section temporarily disabled |
| PM-01 | Profile Menu | Sign out is 4 taps deep (Profile > Settings > Sign Out > Confirm) | Medium | Navigation depth | ✅ Done — Sign-out shortcut added to Profile Menu (2 taps) |
| PM-02 | Profile Menu | Pending invite dot is 8px (`w-2 h-2`) — easy to miss at 3AM | Low | Touch target | ✅ Done — Increased to 12px (`w-3 h-3`) |
| MB-01 | My Babies | Two tap zones on baby card (card body = detail, button = select) with no visual separation | High | UX confusion | ✅ Done — Visual separator line between edit and select zones |
| MB-02 | My Babies | "Select" button is ~32px tall (`py-2`) — below 48px WCAG minimum and 60px brand minimum | High | Touch target | ✅ Done (#4) |
| MB-03 | My Babies | No save feedback after accepting/declining an invite | Medium | Error handling | ✅ Done (#8) |
| BD-01 | Baby Detail | No success feedback after saving profile changes | Medium | Error handling | ✅ Done (#8) |
| BD-02 | Baby Detail | Save button only appears when form has changes — no always-visible confirmation | Low | UX clarity | ✅ Done — Save button always visible (disabled when no changes) |
| BD-03 | Baby Detail | No confirmation when tapping back with unsaved changes during network failure | Medium | Error handling | ✅ Done — Discard confirmation modal on back with invalid unsaved changes |
| MV-01 | Measures | Edit button touch target is ~24px (`p-2` around 20px icon) — far below 48px minimum | Critical | Touch target | ✅ Done (#3) |
| MV-02 | Measures | No success/error feedback after saving a measurement | Medium | Error handling | ✅ Done (#8) |
| MV-03 | Measures | Empty state lacks inline CTA button — "+" is in header only | Low | UX clarity | ✅ Done — Inline CTA button added to empty state |
| SA-01 | Share Access | No explanation of caregiver vs viewer roles | Medium | UX clarity | ✅ Done (#13) |
| SA-02 | Share Access | Remove access is immediate with no undo | Medium | Error handling | ✅ Done — ConfirmationModal before revoke |
| SA-03 | Share Access | No handling if owner deletes baby while shared user is viewing | High | Corner case | ✅ Done (#20) |
| AS-01 | Account Settings | Language pills are ~36px tall — below 48px WCAG minimum | High | Touch target | ✅ Done (#5) |
| AS-02 | Account Settings | "Edit" profile link has no defined touch target (bare text) | Medium | Touch target | ✅ Done — `min-h-[48px]` added to Edit profile button |
| AS-03 | Account Settings | Delete account link is `text-xs opacity-50` — nearly invisible | High | Accessibility | ✅ Done (#7) |
| AS-04 | Account Settings | No success feedback when profile edit is saved | Medium | Error handling | ✅ Done (#8) |
| AS-05 | Account Settings | Sign out button uses `--night-color` instead of `--danger-color` | Low | Brand | ✅ Done — Confirmation modal button now uses `--danger-color` |
| AS-06 | Account Settings | Modal confirmation buttons are ~30px tall (`py-3`) — below minimum | High | Touch target | ✅ Done (#6) |
| SP-01 | Support | No "Still need help?" CTA at end of FAQs | Low | Navigation | 🔲 Pending |
| SP-02 | Support | Contact relies on `mailto:` with no fallback if no email client | Medium | Corner case | ✅ Done (#19) |
| SP-03 | Support | Privacy Policy only reachable via About (3+ taps from Support) or delete modal | Medium | Navigation | ✅ Done (#14) |
| QA-01 | Quick Action | Ending active nap calls `handleEndSleep` immediately — no time picker unlike night wake-up | Medium | Inconsistency | ✅ Done (#18) |
| SE-01 | Sleep Entry | Save error auto-clears on close with no retry guidance | Medium | Error handling | 🔲 Pending — Low priority, auto-dismiss is usable |
| WU-01 | Wake Up | `formatRelativeTime()` returns hardcoded English ("just now", "2h ago") | High | i18n | ✅ Done (#1) |
| WU-02 | Wake Up | Button labels "-1 min", "+1 min", "Saving...", "Confirm wake up" not translated | High | i18n | ✅ Done (#1) |
| WU-03 | Wake Up | Time input effective touch target is just the text (no padding wrapper) | Medium | Touch target | ✅ Done — Time inputs wrapped in padded container with wake-color tint |
| MB-01 | Missing Bedtime | Only shows once per session — dismissing = never see again until next load | Low | UX clarity | ✅ Done — sessionStorage persists dismissal per day |
| AC-01 | Collision | Only "Replace" or "Cancel" — no option to adjust times | Medium | Missing interaction | ✅ Done (#17) |
| AC-02 | Collision | Modal buttons use `.btn` class but may be ~36px effective height | Medium | Touch target | ✅ Done — `min-h-[48px]` added to all collision modal buttons |

---

## Section 1: Navigation Map

```
Tab Bar (4 tabs + FAB)
├── [Home] Today View
│   ├── Tap timeline card → SleepEntrySheet (edit)
│   ├── Tap header avatar → Profile > My Babies
│   ├── Empty: "Review invite" → Profile menu
│   └── Empty: "Add a baby" → Profile > My Babies
│
├── [History] Sleep Log
│   ├── DayNavigator: tap day / swipe week / tap header → calendar modal
│   ├── Tap entry → SleepEntrySheet (edit)
│   └── "Add baby" link → Profile > My Babies
│
├── [+] FAB → Quick Action Sheet
│   ├── Wake Up → WakeUpSheet (both nap and night)
│   ├── Nap → SleepEntrySheet (new)
│   ├── Bedtime → SleepEntrySheet (new)
│   └── [No baby] → Profile > My Babies > BabyEditSheet
│
├── [Stats] Stats View
│   ├── Section chips (Summary / Naps / Night / Growth)
│   ├── Date range → DateRangePickerSheet
│   ├── "Generate report" → ⏸️ Temporarily disabled (will be redesigned)
│   └── "Add weight/height" → MeasuresView (✅ fixed — direct navigation)
│
└── [Profile] Profile Section
    └── Menu
        ├── My Babies → MyBabiesView
        │   ├── Owned baby → BabyDetailView
        │   │   ├── Measures → MeasuresView → MeasureLogSheet
        │   │   ├── "Manage sharing" → ShareAccessView
        │   │   └── Delete baby → ConfirmationModal
        │   ├── Shared baby → BabyDetailView (read-only)
        │   ├── Accept/Decline invite cards
        │   └── Add baby ghost card → BabyEditSheet
        ├── Settings → AccountSettingsView
        │   ├── Language pills
        │   ├── Profile edit form (inline toggle)
        │   ├── Sign Out → ConfirmationModal
        │   └── Delete Account → ConfirmationModal → Edge Function
        ├── Support → SupportView
        │   ├── About → AboutView
        │   │   ├── Terms → TermsOfServiceView
        │   │   └── Privacy → PrivacyPolicyView
        │   ├── FAQs → FAQsView
        │   └── Contact → ContactView (mailto: + "Copy email" fallback ✅)
        └── Sign Out shortcut → ConfirmationModal (✅ 2 taps from home)
```

### Dead Ends

| Path | Issue | Status |
|------|-------|--------|
| Stats > "Add weight" | Navigates to Profile menu, not MeasuresView | ✅ Fixed — goes directly to MeasuresView |
| Contact > "Send Email" | Opens mailto: link — if no email client, nothing happens | ✅ Fixed — "Copy email" fallback button added |
| Delete Account | Confirmation modal exists but action was previously TODO | Verify current state |
| Delete Baby | Confirmation modal exists — verify actual deletion works | Verify current state |

### Navigation Depth Concerns

| Action | Taps from Home | Ideal | Status |
|--------|---------------|-------|--------|
| Log sleep | 2 (FAB > type) | 2 | ✅ OK |
| View history | 1 (History tab) | 1 | ✅ OK |
| Sign out | 2 (Profile > Sign Out shortcut > Confirm) | 2-3 | ✅ Fixed (was 4) |
| Delete account | 5 (Profile > Settings > scroll > Delete > Confirm) | 3-4 | 🔲 |
| Privacy Policy | 6 (Profile > Support > About > Privacy) | 3 | 🔲 |
| Add measurement | 5 (Profile > My Babies > Baby > Measures > +) | 3 | 🔲 |

---

## Section 2: Screen-by-Screen Audit

### Screen 1: Today View

**File**: `src/components/TodayView.tsx`
**Purpose**: See a live roadmap of the day and know what to do next.

#### What User Sees
1. Header avatar (top-left) — baby photo, pending invite dot
2. Hero card — countdown to next event ("Nap at 13:42") or active sleep duration
3. "Your Day" section label
4. Timeline river — chronological cards: wake-up → completed naps → active nap → predicted naps (ghost) → bedtime (ghost)

#### What User Can Do
- Tap header avatar → Profile > My Babies
- Tap [+] FAB → Quick Action Sheet
- Tap any logged entry card → SleepEntrySheet (edit)
- Tap "Review invite" (empty state) → Profile menu
- Tap hero card during active night → triggers wake-up flow

#### UX Issues

| ID | Issue | Severity | Category |
|----|-------|----------|----------|
| T-01 | Ghost prediction cards are not tappable — tapping a predicted nap should pre-fill SleepEntrySheet with that time window | Medium | Missing interaction |
| T-02 | No error state if entries fail to load — skeleton shows indefinitely | High | Error handling |
| T-03 | Timeline card buttons lack visible keyboard focus indicator | Medium | Accessibility |

#### Missing States
- **Loading**: Present — `SkeletonTimeline` + `SkeletonHero` match exact card dimensions
- **Error**: Missing — no error recovery if Supabase query fails
- **Empty**: Present — three variants: (1) no baby + invite, (2) no baby, (3) no activity today

#### Corner Cases
- **Active night from yesterday**: Shows dedicated UI (night duration + "Tap to wake up")
- **Overdue first nap >60min**: Capped at 60-minute persistence (`OVERDUE_NAP_PERSISTENCE_MINUTES`), then silently skipped — no user notification
- **No DOB set**: Predictions cannot calculate — shows no predictions without explaining why
- **Predictions during active nap**: Frozen via `frozenPredictionsRef` to prevent jittery re-renders

#### Brand Alignment
- **Decision replacement**: Pass — hero tells user exactly what to do next
- **3AM usability**: Pass — large hero countdown (56px font), FAB is 60px
- **Emotional safety**: Pass — gentle "Good morning" greeting, no guilt
- **Night-first design**: Pass — dark cards, calming palette, no high saturation
- **Zero learning curve**: Pass — glance at hero, tap FAB to log

---

### Screen 2: History View (Sleep Log)

**Files**: `src/App.tsx` (renderHistoryView), `src/components/DayNavigator.tsx`, `src/components/SleepList.tsx`
**Purpose**: Review and edit past sleep entries for any date.

#### What User Sees
1. Header avatar (same as Today)
2. DayNavigator — date header + week strip (Mon–Sun, swipeable) + entry dots
3. Sleep entry cards — NapEntry, BedtimeEntry, WakeUpEntry with color-coded types
4. Daily summary — total sleep stats

#### What User Can Do
- Tap day in week strip → jump to that date
- Swipe week strip left/right → navigate ±1 week
- Tap date header → open calendar modal (full month)
- Tap entry card → SleepEntrySheet (edit mode)
- Tap [+] FAB → Quick Action Sheet

#### UX Issues

| ID | Issue | Severity | Category |
|----|-------|----------|----------|
| H-01 | No empty state copy for a date with no entries when user has a baby — just blank | Medium | Missing state |
| H-02 | No loading skeleton while entries fetch for selected date | Medium | Missing state |

#### Missing States
- **Loading**: Missing — entries appear/disappear without transition
- **Error**: Missing — no error state for failed data fetch
- **Empty (no baby)**: Present — "Add baby to start"
- **Empty (no entries)**: Missing — blank space, no encouraging copy

#### Corner Cases
- **Cross-midnight editing**: Fixed — `handleEdit()` syncs `selectedDate` to entry date
- **Calendar modal z-index**: Fixed — uses inline `zIndex: 100` (Tailwind z-classes unreliable vs CSS)
- **Future dates**: Week strip allows navigating to future dates — should entries be blocked?

#### Brand Alignment
- **Decision replacement**: Partial — shows data for review, not actionable guidance
- **3AM usability**: Pass — week strip days are adequate touch targets, entry cards are full-width
- **Emotional safety**: Pass — no judgement language, neutral presentation
- **Night-first design**: Pass — follows circadian theme
- **Zero learning curve**: Pass — tap to select day, tap entry to edit

---

### Screen 3: Stats View

**File**: `src/components/StatsView.tsx`
**Purpose**: Reassurance that sleep patterns are forming.

#### What User Sees
1. Header — centered title + subtitle
2. Insight tag — algorithm status (Learning / Calibrating / Optimised)
3. Section chips — horizontal scroll (Sleep summary, Naps, Night sleep, Growth)
4. Date range picker (max 15 days)
5. Charts — distribution pie, daily bar, trend area, schedule
6. Growth charts — weight/height area charts (adaptive Y-axis)
7. "Generate report (last 30 days)" button

#### What User Can Do
- Tap section chips to switch content
- Tap date range to open picker sheet
- Scroll through charts
- Tap "Generate report" → SleepReportView
- Tap "Add weight"/"Add height" → Profile menu (wrong target)

#### UX Issues

| ID | Issue | Severity | Category |
|----|-------|----------|----------|
| S-01 | No loading skeleton for charts — data pops in abruptly | Medium | Missing state |
| S-02 | "Add weight"/"Add height" navigates to Profile menu, not MeasuresView | High | Navigation |
| S-03 | Report button says "last 30 days" but date picker controls chart range — confusing | Medium | UX confusion |
| S-04 | Chart tooltip labels ("Naps", "Night") hardcoded in English | Medium | i18n |
| S-05 | Calendar weekday labels ("Mon", "Tue"...) hardcoded in English | Medium | i18n |

#### Missing States
- **Loading**: Missing — no skeleton for charts
- **Error**: Missing — no error state for data fetch failure
- **Empty (no data)**: Present — "No sleep data for this period"
- **Empty (growth, 1 point)**: Present — ghost chart + "Add another to see trend" CTA

#### Corner Cases
- **Today excluded from averages**: Fixed — today's incomplete data excluded from calculations but shown on charts
- **Growth Y-axis**: Fixed — adaptive data-driven domain prevents wasted chart space
- **15-day max range**: Hard cap not explained to user

#### Brand Alignment
- **Decision replacement**: Partial — charts show data analysis, not direct guidance. The narrative report (SleepReportView) is better aligned
- **3AM usability**: Partial — charts are data-dense for night-time use; chip scroll works but requires precise taps
- **Emotional safety**: Pass — algorithm status framed as "still learning" not "insufficient data"
- **Night-first design**: Pass — chart colours use CSS variables per theme
- **Zero learning curve**: Partial — multiple chips + date picker adds cognitive load

---

### Screen 4: Sleep Report View

**File**: `src/components/SleepReportView.tsx`
**Purpose**: Narrative sleep report for emotional reassurance (last 30 days).

#### What User Sees
1. Header — "Sleep Report" + back button
2. Overview — warm narrative paragraph (no dates, no data)
3. Summary table — total sleep, naps, bedtime averages
4. Bedtime & wake times section — icon bullets (moon, sun)
5. "Patterns we're seeing" — icon bullets (pattern icon)
6. "What to try" — icon bullets (check icon)

#### What User Can Do
- Read report sections
- Tap "Back to trends" → return to Stats

#### UX Issues

| ID | Issue | Severity | Category |
|----|-------|----------|----------|
| R-01 | No export/share/print option — parents can't send report to partner or paediatrician | Medium | Missing feature |
| R-02 | Empty state says "Not enough data" without specifying minimum (5 days) | Low | UX clarity |
| R-03 | Back button says "Back to trends" — wrong if user navigated from elsewhere | Low | Navigation |

#### Missing States
- **Loading**: Not needed — data computed client-side from existing entries
- **Error**: Not needed — no network call
- **Empty**: Present — file icon + "Not enough data" (minimum 5 days)

#### Corner Cases
- **Report is always 30 days**: Independent of Stats date picker selection — may confuse users who set a 7-day range then see a 30-day report

#### Brand Alignment
- **Decision replacement**: Pass — narrative format tells parents what patterns exist and what to try
- **3AM usability**: Pass — large readable text, icon bullets for scanning
- **Emotional safety**: Pass — warm overview tone, "what to try" not "what you're doing wrong"
- **Night-first design**: Pass — follows circadian theme
- **Zero learning curve**: Pass — just read and scroll

---

### Screen 5: Profile Menu

**File**: `src/components/Profile/ProfileMenu.tsx`
**Purpose**: Navigate to profile sub-sections.

#### What User Sees
1. Time-based greeting — "Good evening, Sarah" + encouraging subtitle
2. Navigation rows — My Babies (with invite dot), Settings, Support
3. Each row has icon + title + subtitle + chevron

#### What User Can Do
- Tap My Babies → MyBabiesView
- Tap Settings → AccountSettingsView
- Tap Support → SupportView

#### UX Issues

| ID | Issue | Severity | Category |
|----|-------|----------|----------|
| PM-01 | Sign out requires 4 taps from here (Settings > scroll > Sign Out > Confirm) | Medium | Navigation depth |
| PM-02 | Pending invite dot is 8px — easy to miss, especially at 3AM | Low | Touch target |

#### Missing States
- **Loading**: Not needed — static navigation
- **Error**: Not needed — no data fetch
- **Empty**: Not applicable

#### Corner Cases
- None significant — this is a simple navigation hub

#### Brand Alignment
- **Decision replacement**: Not applicable — navigation screen
- **3AM usability**: Pass — large row touch targets (full width, adequate padding)
- **Emotional safety**: Pass — time-aware greeting with warmth
- **Night-first design**: Pass — follows theme
- **Zero learning curve**: Pass — three clear options

---

### Screen 6: My Babies View

**File**: `src/components/Profile/MyBabiesView.tsx`
**Purpose**: View baby gallery, accept invites, select active baby.

#### What User Sees
1. SubViewHeader — "Baby profiles" + context subtitle
2. Invite cards (top, if any) — baby avatar + name + "From {owner}" + Accept/Decline
3. Owned baby cards — avatar + name + age + "Select"/"Selected" button
4. Ghost card ("Add your baby") — dashed border, "+" icon

#### What User Can Do
- Tap card body → BabyDetailView (edit)
- Tap "Select" button → set active baby (e.stopPropagation)
- Tap Accept/Decline on invite cards
- Tap ghost card → BabyEditSheet (add new baby)

#### UX Issues

| ID | Issue | Severity | Category |
|----|-------|----------|----------|
| MB-01 | Card has two tap zones (body vs "Select" button) with no visual separation — confusing interaction model | High | UX confusion |
| MB-02 | "Select" button is ~32px tall (`py-2`) — far below 48px WCAG and 60px brand minimum | High | Touch target |
| MB-03 | No success/error feedback after accepting or declining an invite | Medium | Error handling |

#### Missing States
- **Loading**: Not needed — data loaded before navigation
- **Error**: Missing — no error state if invite accept/decline fails
- **Empty**: Present — "Add your first baby to get started" (but verify this string is translated)

#### Corner Cases
- **Shared baby deleted by owner while viewing**: No graceful handling — user may see stale data or crash
- **Owner name empty on shared baby**: "Shared by" shows empty string
- **Profile loading race**: Fixed — FAB checks `!profileLoading` before branching

#### Brand Alignment
- **Decision replacement**: Not applicable — management screen
- **3AM usability**: Fail — "Select" button too small for night-time use
- **Emotional safety**: Pass — no judgement, welcoming ghost card
- **Night-first design**: Pass — glass-bg, nap-color borders
- **Zero learning curve**: Partial — two tap zones on same card creates confusion

---

### Screen 7: Baby Detail View

**File**: `src/components/Profile/BabyDetailView.tsx`
**Purpose**: Edit baby profile (name, DOB, gender, avatar), access measures and sharing.

#### What User Sees
1. SubViewHeader — baby name + back arrow
2. Avatar picker — baby photo with "Tap to change" hint
3. Form fields — name, date of birth, gender selector
4. Measures row → MeasuresView
5. "Manage sharing" row → ShareAccessView (owners only)
6. Save button (only when changes exist)
7. Delete baby link (owners only, bottom)

#### What User Can Do
- Edit name, DOB, gender
- Upload/change avatar
- Tap Measures → MeasuresView
- Tap Manage sharing → ShareAccessView
- Tap Save (when visible)
- Tap Delete baby → confirmation modal

#### UX Issues

| ID | Issue | Severity | Category |
|----|-------|----------|----------|
| BD-01 | No success feedback after saving changes — silent save | Medium | Error handling |
| BD-02 | Save button only appears with changes — users may not know how to save | Low | UX clarity |
| BD-03 | If network fails during save + user taps back, changes are silently lost | Medium | Error handling |

#### Missing States
- **Loading**: Not needed — data loaded before navigation
- **Error**: Missing — no error message if save fails
- **Empty**: Not applicable

#### Corner Cases
- **Shared baby viewers**: See same form layout but fields should be disabled/read-only
- **Avatar upload failure**: Retry available via BabyAvatarPicker

#### Brand Alignment
- **Decision replacement**: Not applicable — settings screen
- **3AM usability**: Pass — form fields are adequate size, avatar picker is large
- **Emotional safety**: Pass — "Tap to change" hint is gentle
- **Night-first design**: Pass — follows theme
- **Zero learning curve**: Pass — standard form pattern

---

### Screen 8: Measures View

**File**: `src/components/Profile/MeasuresView.tsx`
**Purpose**: Log and review weight, height, head measurements over time.

#### What User Sees
1. SubViewHeader — "Measures" + baby name subtitle + back arrow + "+" add button
2. Date-grouped measurement cards — weight, height, head values with edit pencil
3. Notes (if any) below measurements

#### What User Can Do
- Tap "+" → MeasureLogSheet (add new)
- Tap edit pencil → MeasureLogSheet (edit existing)
- Delete measurement (via sheet header)

#### UX Issues

| ID | Issue | Severity | Category |
|----|-------|----------|----------|
| MV-01 | Edit button is `p-2` around `w-5 h-5` icon = ~36px touch target — below 48px WCAG minimum | Critical | Touch target |
| MV-02 | No success/error feedback after saving measurement | Medium | Error handling |
| MV-03 | Empty state shows text but CTA "+" is only in header — not inline | Low | UX clarity |

#### Missing States
- **Loading**: Present — spinner while data fetches
- **Error**: Missing — no error state for fetch failure
- **Empty**: Present — "No measurements logged" + hint text (if can edit)

#### Corner Cases
- **Past-value warning**: Hook supports it (`useGrowthLogs`) but not surfaced in UI
- **Viewer access**: Edit buttons hidden — read-only list

#### Brand Alignment
- **Decision replacement**: Not applicable — data entry screen
- **3AM usability**: Fail — edit pencil icon too small for night-time use
- **Emotional safety**: Pass — neutral presentation
- **Night-first design**: Pass — follows theme
- **Zero learning curve**: Partial — "+" in header may be missed on first use

---

### Screen 9: Share Access

**File**: `src/components/ShareAccess.tsx` wrapped by `src/components/Profile/ShareAccessView.tsx`
**Purpose**: Invite caregivers and manage their access roles.

#### What User Sees
1. SubViewHeader — "Share access" + back arrow
2. Invite form — email input + role selector (caregiver/viewer)
3. Pending invites list — email + status + revoke
4. Active shares list — email + role + edit/remove

#### What User Can Do
- Enter email + select role → send invitation
- Revoke pending invitation
- Edit role of active share
- Remove access from active share

#### UX Issues

| ID | Issue | Severity | Category |
|----|-------|----------|----------|
| SA-01 | No explanation of what caregiver vs viewer means — just two options | Medium | UX clarity |
| SA-02 | Remove access executes immediately — no undo or confirmation | Medium | Error handling |
| SA-03 | If baby owner deletes baby while shared user is on this screen — no handling | High | Corner case |

#### Missing States
- **Loading**: Missing — no loading skeleton for share list
- **Error**: Partial — invite success shows 3-second auto-dismiss toast, but error on remove is silent
- **Empty**: Present — "No one has access yet"

#### Corner Cases
- **Re-inviting revoked user**: Fixed — handles 409 conflict by updating existing row to pending
- **Invite timestamp**: Fixed — `invited_at` updates on re-invite

#### Brand Alignment
- **Decision replacement**: Not applicable — management screen
- **3AM usability**: Pass — form and buttons are adequate size
- **Emotional safety**: Pass — neutral, no blame language
- **Night-first design**: Pass — follows theme
- **Zero learning curve**: Partial — role selection has no guidance

---

### Screen 10: Account Settings

**File**: `src/components/Profile/AccountSettingsView.tsx`
**Purpose**: Update personal info, language, sign out, delete account.

#### What User Sees
1. SubViewHeader — "Account settings" + back arrow
2. Language section — pill buttons (English / Espanol / Catala)
3. Profile section — name, email (read-only), role (Dad/Mum/Other) + Edit toggle
4. Sign Out card — icon + "Sign out" + subtitle
5. Delete account text link (bottom, very subtle)

#### What User Can Do
- Tap language pill → change app language (immediate effect)
- Tap Edit → toggle form mode → edit name/role → Save/Cancel
- Tap Sign Out → confirmation modal
- Tap Delete Account → multi-step confirmation → Edge Function

#### UX Issues

| ID | Issue | Severity | Category |
|----|-------|----------|----------|
| AS-01 | Language pills are ~36px tall (`py-3` = 12px padding × 2 + text) — below 48px minimum | High | Touch target |
| AS-02 | "Edit" profile link is a bare text button with no defined min touch target | Medium | Touch target |
| AS-03 | Delete account is `text-xs opacity-50` — nearly invisible, may violate discoverability requirements | High | Accessibility |
| AS-04 | No success feedback when profile edit saves | Medium | Error handling |
| AS-05 | Sign out confirm button uses `--night-color` not `--danger-color` — inconsistent with destructive action | Low | Brand |
| AS-06 | Confirmation modal buttons are `py-3` = ~30px effective height — below minimum | High | Touch target |

#### Missing States
- **Loading**: Present — delete shows `isDeletingAccount` loading state
- **Error**: Present — delete error shown in modal
- **Empty**: Not applicable

#### Corner Cases
- **Language change**: Optimistic update (i18n + localStorage) before Supabase upsert — UI always responds immediately
- **Delete account**: Invokes Edge Function with JWT, then signOut (which may return 403 — expected, ignored)

#### Brand Alignment
- **Decision replacement**: Not applicable — settings screen
- **3AM usability**: Fail — language pills, edit link, delete link, modal buttons all below minimum touch targets
- **Emotional safety**: Pass — delete has multi-step warnings, no accusatory language
- **Night-first design**: Pass — follows theme, but language pill contrast questionable in night mode
- **Zero learning curve**: Pass — standard settings layout

---

### Screen 11: Support / About / FAQs / Contact

**Files**: `src/components/Profile/SupportView.tsx`, `AboutView.tsx`, `FAQsView.tsx`, `ContactView.tsx`
**Purpose**: Help, legal information, and contact.

#### What User Sees
- **Support**: Tip card + 3 navigation rows (About, FAQs, Contact)
- **About**: App name/version + Terms/Privacy links
- **FAQs**: Accordion (10 items), expand to read, one open at a time
- **Contact**: Subject + message fields → "Send Email" (mailto:)

#### What User Can Do
- Navigate between sub-screens
- Expand/collapse FAQ items
- Send email via mailto: link
- Read Terms of Service and Privacy Policy

#### UX Issues

| ID | Issue | Severity | Category |
|----|-------|----------|----------|
| SP-01 | No "Still need help?" CTA at bottom of FAQs linking to Contact | Low | Navigation |
| SP-02 | Contact "Send Email" relies on mailto: — no fallback if no email client configured | Medium | Corner case |
| SP-03 | Privacy Policy is 6 taps from home (Profile > Support > About > Privacy) — GDPR requires reasonable discoverability | Medium | Navigation |

#### Missing States
- **Loading**: Not needed — static content
- **Error**: Missing — mailto: failure is silent
- **Empty**: Not applicable

#### Corner Cases
- **FAQs search**: No search/filter — 10 items currently manageable but will scale poorly
- **App version**: Uses `__APP_VERSION__` build token — verify it resolves correctly

#### Brand Alignment
- **Decision replacement**: Not applicable — help section
- **3AM usability**: Pass — FAQ accordion has adequate touch targets
- **Emotional safety**: Pass — tip card uses warm, empathetic tone
- **Night-first design**: Pass — follows theme
- **Zero learning curve**: Pass — standard help structure

---

## Section 3: Global Overlays Audit

### Overlay 1: Quick Action Sheet

**File**: `src/components/QuickActionSheet.tsx`
**Trigger**: Centre [+] FAB (60px)
**Purpose**: Show available sleep logging actions.

| State | Actions Shown |
|-------|--------------|
| No active sleep | Wake Up, Nap, Bedtime (3-column grid) |
| Active sleep | Wake Up only (single button) |
| No baby profile | Redirect to My Babies > Add Baby |

#### UX Issues

| ID | Issue | Severity | Category |
|----|-------|----------|----------|
| QA-01 | Ending active nap calls `handleEndSleep` immediately with no time picker — inconsistent with night sleep which opens WakeUpSheet | Medium | Inconsistency |

#### Dismiss Methods
- Backdrop tap
- Drag down (handle bar)
- Escape key (via focus trap)

#### Accessibility
- Focus trap: Yes (useFocusTrap)
- aria-modal: Verify
- Escape key: Yes

---

### Overlay 2: Sleep Entry Sheet

**File**: `src/components/SleepEntrySheet.tsx`
**Trigger**: Quick Action (Nap/Bedtime) or tap existing entry
**Purpose**: Add or edit sleep entries with time pickers.

#### Features
- Time pickers (start + optional end)
- Type toggle (Nap / Night)
- Dynamic labels: start shows duration, end shows relative time
- Icon states: Play (new) → Stop (active) → Check (complete)
- Validation: blocks 0-duration, nap >5h, night >14h; warns nap >4h, night >13h, cross-midnight
- Smart defaults: 12:00 naps, 20:00 bedtime for past dates

#### UX Issues

| ID | Issue | Severity | Category |
|----|-------|----------|----------|
| SE-01 | Save error message auto-clears when sheet closes — no guidance on retry | Medium | Error handling |

#### Dismiss Methods
- X button (top-right)
- Drag-to-dismiss (swipe down, 150px offset or 500px/s velocity)
- Backdrop tap

#### Accessibility
- Focus trap: Yes
- aria-modal: Verify
- Escape key: Yes

---

### Overlay 3: Wake Up Sheet

**File**: `src/components/WakeUpSheet.tsx`
**Trigger**: Active night sleep + "Wake Up" action
**Purpose**: Log specific wake-up time for night sleep.

#### UX Issues

| ID | Issue | Severity | Category |
|----|-------|----------|----------|
| WU-01 | `formatRelativeTime()` returns hardcoded English strings ("just now", "Xm ago", "Xh ago") | High | i18n |
| WU-02 | Adjustment button labels ("-1 min", "+1 min") and "Saving...", "Confirm wake up" not wrapped in `t()` | High | i18n |
| WU-03 | Time input touch target is just the text element — no padding wrapper | Medium | Touch target |

#### Dismiss Methods
- X button (top-right)
- Drag-to-dismiss (swipe down)
- Backdrop tap

#### Accessibility
- Focus trap: Yes
- aria-modal: Verify
- Escape key: Yes

---

### Overlay 4: Missing Bedtime Modal

**File**: `src/components/MissingBedtimeModal.tsx`
**Trigger**: Auto on app open when no today activity but entries exist
**Purpose**: Remind parent to log a forgotten bedtime.

#### Suppression Rules
- Pending baby invites (skip)
- Data still loading
- No entries at all (new user)
- Night sleep ending today/tomorrow logged
- Naps logged today
- Active night sleep exists

#### UX Issues

| ID | Issue | Severity | Category |
|----|-------|----------|----------|
| MB-01 | Only shows once per session — dismissing means never seeing it again until reload | Low | UX clarity |

#### Dismiss Methods
- "Start a new day" button
- X button
- Backdrop tap

#### Accessibility
- Focus trap: Yes
- Escape key: Yes

---

### Overlay 5: Activity Collision Modal

**File**: `src/components/ActivityCollisionModal.tsx`
**Trigger**: Saving entry that overlaps with existing entry
**Purpose**: Resolve time overlaps between sleep entries.

#### UX Issues

| ID | Issue | Severity | Category |
|----|-------|----------|----------|
| AC-01 | Only "Replace" or "Cancel" — no "Adjust times" option to resolve without deleting | Medium | Missing interaction |
| AC-02 | Button height may be below 48px minimum (uses `.btn` class but effective height depends on content) | Medium | Touch target |

#### Dismiss Methods
- Cancel button
- Backdrop tap
- Escape key (focus trap)

#### Accessibility
- Focus trap: Yes (useFocusTrap)
- aria-labelledby: Yes (titleId)
- Escape key: Yes

---

### Overlay 6: Confirmation Modal

**File**: `src/components/ConfirmationModal.tsx`
**Trigger**: Delete actions, sign out, other destructive confirmations
**Purpose**: Reusable themed confirmation dialog.

Used by: SleepEntrySheet (delete entry), WakeUpSheet (delete entry), BabyEditSheet (delete baby), AccountSettingsView (sign out, delete account)

#### Accessibility
- role="alertdialog": Yes
- Focus trap: Yes
- Escape key: Yes

---

## Section 4: Cross-Screen Analysis

### 4.1 Silent Save Pattern

Multiple screens save data with no visual feedback to the user:

| Screen | Save Action | Feedback |
|--------|------------|----------|
| BabyDetailView | Profile save | None — silent |
| AccountSettingsView | Profile edit save | None — silent |
| MeasuresView | Measurement save | None — sheet closes |
| MyBabiesView | Invite accept/decline | None — button shows `disabled` only |
| AccountSettingsView | Language change | Immediate UI update (good) but no "saved" confirmation |

**Only ShareAccess has save feedback** (3-second auto-dismiss success toast).

**Impact**: Parents at 3AM don't know if their action worked. Erodes trust.
**Recommendation**: Add brief toast/confirmation after save operations.

### 4.2 Touch Target Violations

Elements below the 48px WCAG minimum or 60px brand minimum:

| Screen | Element | Actual Size | WCAG 48px | Brand 60px |
|--------|---------|-------------|-----------|------------|
| MeasuresView | Edit pencil button | ~36px (`p-2` + 20px icon) | Fail | Fail |
| MyBabiesView | "Select" button | ~32px (`py-2` + text) | Fail | Fail |
| AccountSettingsView | Language pills | ~36px (`py-3` + text) | Fail | Fail |
| AccountSettingsView | "Edit" text link | Undefined (bare text) | Fail | Fail |
| AccountSettingsView | Delete account link | ~16px (`text-xs`) | Fail | Fail |
| AccountSettingsView | Modal buttons | ~30px (`py-3`) | Fail | Fail |
| ActivityCollisionModal | Action buttons | ~36px (`.btn` class) | Borderline | Fail |

**Impact**: Night-time usability severely compromised on settings screens.
**Recommendation**: Enforce `min-h-[48px]` on all interactive elements, `min-h-[60px]` for primary actions.

### 4.3 Error Recovery Gaps

| Screen | Operation | On Failure |
|--------|-----------|-----------|
| TodayView | Load entries | Skeleton shows forever |
| History | Load entries | Blank screen |
| StatsView | Load chart data | Blank charts |
| BabyDetailView | Save profile | Silent failure, user navigates away |
| MeasuresView | Save measurement | Sheet closes, data not persisted |
| MyBabiesView | Accept invite | Button re-enables, no error message |

**Impact**: Users think their data is saved when it may not be. Network failures at 3AM (poor connectivity) are common.
**Recommendation**: Add retry-able error states with "We had a temporary issue. Your data is safe." messaging (per brand guidelines).

### 4.4 Missing Loading Skeletons

| Screen | Has Skeleton | Notes |
|--------|-------------|-------|
| TodayView | Yes | SkeletonTimeline + SkeletonHero, correct dimensions |
| History | No | Entries appear/disappear with no transition |
| StatsView | No | Charts pop in abruptly |
| MyBabiesView | No | Cards appear without skeleton |
| ShareAccess | No | Share list has no loading state |
| MeasuresView | Partial | Spinner only, no skeleton cards |

**Impact**: Layout shifts create jank and undermine premium feel.
**Recommendation**: Add skeleton cards matching exact target dimensions (following TodayView pattern).

### 4.5 Hardcoded English Strings

| File | String | Fix |
|------|--------|-----|
| WakeUpSheet | "just now", "Xm ago", "Xh ago", "Xh Xm ago" | Wrap in `t()` with interpolation |
| WakeUpSheet | "-1 min", "+1 min" | Wrap in `t()` |
| WakeUpSheet | "Saving...", "Confirm wake up" (aria-labels) | Wrap in `t()` |
| StatsView | "Naps", "Night" (chart tooltips) | Wrap in `t()` |
| StatsView | "Mon", "Tue", "Wed"... (calendar weekdays) | Use date-fns locale-aware formatting |

**Impact**: Spanish/Catalan users see English in specific UI elements, breaking immersion.
**Recommendation**: Audit all components for strings not wrapped in `t()`.

### 4.6 Navigation Depth

| Action | Taps | Acceptable? |
|--------|------|------------|
| Log sleep | 2 | Yes — core action |
| View today | 0 | Yes — home screen |
| View history | 1 | Yes |
| View stats | 1 | Yes |
| Edit baby profile | 3 | Acceptable |
| Add measurement | 5 | Too deep — consider shortcut from Stats |
| Sign out | 4 | Too deep — consider adding to Profile menu |
| Delete account | 5 | Acceptable for destructive action |
| Privacy Policy | 6 | Too deep — consider linking from Settings |
| Contact support | 3 | Acceptable |

### 4.7 Brand Voice Check

Overall the app follows "calm clarity, no drama" well. Potential deviations:

- **Activity Collision Modal**: "Replace Entry" is direct but could feel abrupt at 3AM. Consider "Use this instead" or "Keep the new one"
- **Delete confirmations**: Appropriate multi-step warnings
- **Empty states**: Generally warm and encouraging
- **Algorithm status**: "Learning", "Calibrating", "Optimised" — good framing, no guilt

### 4.8 Circadian Theme Consistency

Known resolved issues:
- `white/` opacity classes invisible on morning/afternoon themes — fixed by switching to `var(--glass-bg)` and `var(--glass-border)` tokens

Areas to verify:
- Language pill contrast on night theme (`bg-soft` = #25263D, `text-secondary` = #94A3B8 → 3.6:1 ratio, below AAA 4.5:1)
- Stats chart colours across all three themes
- Any components added after the 2026-02-09 light-mode sweep

---

## Section 5: Recommended Action Items

> **Progress**: 20/20 action items implemented · 14/17 remaining polish items also resolved (2026-03-07) · 3 still pending (T-03, SP-01, SE-01)

### Quick Wins (< 1 hour each) — ✅ All Done

1. ✅ **Fix WakeUpSheet i18n** — wrap all hardcoded strings in `t()` (WU-01, WU-02)
2. ✅ **Fix StatsView i18n** — translate tooltip labels and calendar weekdays (S-04, S-05)
3. ✅ **Increase Measures edit button** — change from `p-2` to `w-11 h-11` (44px) (MV-01)
4. ✅ **Increase My Babies "Select" button** — add `min-h-[48px]` or `py-3` (MB-02)
5. ✅ **Increase language pill height** — add `min-h-[48px]` (AS-01)
6. ✅ **Increase modal button height** — change `py-3` to `py-4` (AS-06)
7. ✅ **Make Delete Account link larger** — change to proper button with adequate touch target (AS-03)

### Medium Effort (1-4 hours each) — ✅ All Done

8. ✅ **Add save feedback toasts** — brief confirmation after profile, measurement, and invite saves (BD-01, MV-02, MB-03, AS-04)
9. ✅ **Add error states** — show retry-able error on data fetch failure (T-02, H-02, S-01)
10. ✅ **Fix Stats "Add weight" navigation** — route directly to MeasuresView for active baby, not Profile menu (S-02)
11. ✅ **Add History empty state** — encouraging copy when a date has no entries (H-01)
12. ✅ **Add loading skeletons** — History entries, Stats charts, My Babies gallery (H-02, S-01)
13. ✅ **Clarify share roles** — add subtitle explaining caregiver (can log sleep) vs viewer (view only) (SA-01)
14. ✅ **Add Privacy Policy link to Settings** — reduce navigation depth from 6 taps to 3 (SP-03)

### Significant Effort (4+ hours each) — ✅ All Done

15. ✅ **Make ghost predictions tappable** — tap to pre-fill SleepEntrySheet with predicted time window (T-01)
16. ✅ **Add report export** — print/share/PDF option for sleep report (R-01)
17. ✅ **Redesign collision modal** — add "Adjust times" option alongside Replace/Cancel (AC-01)
18. ✅ **Unify nap wake-up flow** — give nap wake-ups a time picker like night wake-ups (QA-01)
19. ✅ **Add Contact fallback** — show "Copy email address" button if mailto: fails (SP-02)
20. ✅ **Handle stale shared baby** — graceful fallback when owner deletes baby during shared session (SA-03)

---

## Section 6: Remaining Issues (Not Covered by Action Items 1–20)

Originally 17 items. After the 2026-03-07 polish pass, **14 resolved**, leaving 3 remaining:

| ID | Issue | Severity | Category | Status |
|----|-------|----------|----------|--------|
| T-03 | Timeline cards lack visible keyboard focus indicator | Medium | Accessibility | 🔲 Pending — Add `focus-visible:ring-2` to card buttons |
| S-03 | Report uses last 30 days regardless of date picker | Medium | UX confusion | ⏸️ Deferred — Report section temporarily disabled for redesign |
| R-02 | Empty state doesn't say how many days needed | Low | UX clarity | ⏸️ Deferred — Report section temporarily disabled |
| R-03 | "Back to trends" label assumes Stats entry point | Low | Navigation | ⏸️ Deferred — Report section temporarily disabled |
| PM-01 | Sign out 4 taps deep | Medium | Navigation depth | ✅ Done — Sign-out shortcut added to Profile Menu |
| PM-02 | Pending invite dot 8px, easy to miss | Low | Touch target | ✅ Done — Increased to 12px (`w-3 h-3`) |
| MB-01 | Two tap zones on baby card, no visual separation | High | UX confusion | ✅ Done — Visual separator between edit and select zones |
| BD-02 | Save button only appears with changes | Low | UX clarity | ✅ Done — Always visible, disabled when no changes |
| BD-03 | No confirmation when back + unsaved + network fail | Medium | Error handling | ✅ Done — Discard confirmation modal |
| MV-03 | Empty state lacks inline CTA | Low | UX clarity | ✅ Done — Inline CTA button in empty state |
| SA-02 | Remove access is immediate with no undo | Medium | Error handling | ✅ Done — ConfirmationModal before revoke |
| AS-02 | "Edit" link has no defined touch target | Medium | Touch target | ✅ Done — `min-h-[48px]` added |
| AS-05 | Sign out button uses `--night-color` not `--danger-color` | Low | Brand | ✅ Done — Changed to `--danger-color` |
| SP-01 | No "Still need help?" CTA at end of FAQs | Low | Navigation | 🔲 Pending |
| WU-03 | Time input touch target is just the text | Medium | Touch target | ✅ Done — Padded container with wake-color tint |
| MB-01 | Missing Bedtime only shows once per session | Low | UX clarity | ✅ Done — sessionStorage persists per day |
| AC-02 | Collision modal button height may be below 48px | Medium | Touch target | ✅ Done — `min-h-[48px]` on all buttons |
