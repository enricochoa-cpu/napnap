# App Flow

No router library. Navigation is state-driven (`useState`) inside `App.tsx` and `ProfileSection.tsx`. `AuthGuard` wraps the entire app in `main.tsx`.

---

## Entry Point

```
main.tsx → <AuthGuard> → <App />
```

---

## 1. Auth Gate (unauthenticated)

### 1.1 Loading Screen

| Field | Value |
|-------|-------|
| **Path** | (initial render) |
| **Component** | `LoadingScreen` → `components/LoadingScreen.tsx` |
| **Primary Goal** | Reassure the user while auth status is checked |
| **Golden Path** | Auto-resolve → Login or App |
| **Branching Options** | None |
| **Escape Routes** | None |

### 1.2 Login

| Field | Value |
|-------|-------|
| **Path** | `authView === 'login'` |
| **Component** | `LoginForm` → `components/Auth/LoginForm.tsx` |
| **Primary Goal** | Authenticate and enter the app |
| **Golden Path** | Submit credentials → App |
| **Branching Options** | 1. Google Sign In, 2. "Forgot password?" link, 3. "Sign up" link |
| **Escape Routes** | None (this IS the entry point) |

### 1.3 Sign Up

| Field | Value |
|-------|-------|
| **Path** | `authView === 'signup'` |
| **Component** | `SignUpForm` → `components/Auth/SignUpForm.tsx` |
| **Primary Goal** | Create an account |
| **Golden Path** | Submit form → App |
| **Branching Options** | 1. Google Sign In, 2. "Sign in" link (back to Login) |
| **Escape Routes** | "Sign in" link → Login |

### 1.4 Forgot Password

| Field | Value |
|-------|-------|
| **Path** | `authView === 'forgot-password'` |
| **Component** | `ForgotPasswordForm` → `components/Auth/ForgotPasswordForm.tsx` |
| **Primary Goal** | Request a password reset email |
| **Golden Path** | Submit email → confirmation → Login |
| **Branching Options** | None |
| **Escape Routes** | Back button → Login |

---

## 2. Main App (authenticated)

Tab bar with 4 tabs + centre [+] button. `App.tsx` manages `currentView: 'home' | 'history' | 'stats' | 'profile'`.

```
Tab Bar
├── [1] Today (home)
├── [2] History
├── [+] Centre Action → QuickActionSheet
├── [3] Stats
└── [4] Profile
```

---

### 2.1 Today (Home)

| Field | Value |
|-------|-------|
| **Path** | `currentView === 'home'` |
| **Component** | `TodayView` → `components/TodayView.tsx` |
| **Primary Goal** | See a live roadmap of the day — where we are in the sleep cycle and what events are ahead |
| **Golden Path** | Glance at hero countdown → tap [+] to log the event when it happens |
| **Branching Options** | 1. Tap any timeline card → SleepEntrySheet (edit), 2. Tab bar navigation |
| **Escape Routes** | None (this is home) |

**Conditional states:**
- **Loading**: Skeleton cards (`SkeletonTimelineCard`)
- **Active night from yesterday**: Hero shows night duration + "Tap to log wake up" card
- **Empty** (no today activity): "Good morning" prompt to tap [+]
- **Normal**: Hero countdown (next nap/bedtime) + timeline river (wake up → naps → predictions → bedtime)

### 2.2 History

| Field | Value |
|-------|-------|
| **Path** | `currentView === 'history'` |
| **Component** | Inline in `App.tsx` (`renderHistoryView`) |
| **Primary Goal** | Review and edit past sleep entries for a specific date |
| **Golden Path** | Tap day in week strip → review entries |
| **Branching Options** | 1. `DayNavigator` week strip (tap day or swipe ±1 week), 2. Tap date header → calendar modal (jump to any date), 3. "+ Add Entry" dropdown (Nap / Bedtime), 4. Tap any entry → SleepEntrySheet (edit), 5. Tab bar navigation |
| **Escape Routes** | Tab bar → other views |

**Sub-components:**
- `DayNavigator` → `components/DayNavigator.tsx` — Napper-style date picker with 3 parts:
  - **Date header**: tappable "Today" / "February 10" + chevron → opens calendar modal. Baby age subtitle
  - **Week strip**: 7-day Mon–Sun grid, swipeable ±1 week. Entry dots on days with data
  - **Calendar modal**: bottom sheet with full month grid, month navigation, entry dots, "Back to today" button
- `SleepList` → `components/SleepList.tsx` (list container)
- `NapEntry` / `BedtimeEntry` / `WakeUpEntry` → `components/SleepEntry.tsx` (entry rows)
- `DailySummary` → `components/DailySummary.tsx` (daily totals)

### 2.3 Stats

| Field | Value |
|-------|-------|
| **Path** | `currentView === 'stats'` |
| **Component** | `StatsView` → `components/StatsView.tsx` |
| **Primary Goal** | Reassurance that sleep patterns are forming |
| **Golden Path** | Glance at summary cards → adjust date range if needed |
| **Branching Options** | 1. Start date picker, 2. End date picker, 3. Tab bar navigation |
| **Escape Routes** | Tab bar → other views |

**Contents:** Insight tag, 4 summary cards (avg total, avg naps/day, avg nap time, avg night), stacked bar chart (daily sleep), area chart (sleep trend). Date range max 15 days.

### 2.4 Profile (container)

| Field | Value |
|-------|-------|
| **Path** | `currentView === 'profile'` |
| **Component** | `ProfileSection` → `components/Profile/ProfileSection.tsx` |
| **Primary Goal** | Manage baby profiles, account, and sharing |
| **Golden Path** | Glance at baby card → tap into My Babies if needed |

`ProfileSection` manages nested navigation: `currentView: 'menu' | 'my-babies' | 'baby-detail' | 'account-settings' | 'support' | 'faqs' | 'contact'`.

---

### 2.4.1 Profile Menu

| Field | Value |
|-------|-------|
| **Path** | `ProfileSection.currentView === 'menu'` |
| **Component** | `ProfileMenu` → `components/Profile/ProfileMenu.tsx` |
| **Primary Goal** | Navigate to profile sub-sections |
| **Golden Path** | Tap primary baby card → My Babies |
| **Branching Options** | 1. Primary baby card → My Babies, 2. Algorithm status pill → toggle AlgorithmStatusCard, 3. My Babies row → My Babies, 4. Support row → Support, 5. Settings row → Account Settings, 6. Accept/Decline pending invitations |
| **Escape Routes** | Tab bar → other main views |

> **DENSITY AUDIT FLAG**: This screen has **6 interactive elements** (baby card, status pill, 3 nav rows, invitation actions). If invitations are present, the count rises further. Consider whether the primary baby card and the "My Babies" list row are redundant — they both navigate to the same destination.

### 2.4.2 My Babies

| Field | Value |
|-------|-------|
| **Path** | `ProfileSection.currentView === 'my-babies'` |
| **Component** | `MyBabiesView` → `components/Profile/MyBabiesView.tsx` |
| **Primary Goal** | View baby gallery and select which baby to edit or activate |
| **Golden Path** | Tap owned baby card → Baby Detail (full-screen edit) |
| **Branching Options** | 1. Tap owned baby → Baby Detail (2.4.2a), 2. Tap shared baby → select as active, 3. "Add your baby" ghost card → BabyEditSheet (create, bottom sheet) |
| **Escape Routes** | Back button → Profile Menu |

**Note:** ShareAccess (sharing management) has been moved to the Baby Detail view. BabyEditSheet is now only used for the "Add Baby" ghost card flow.

### 2.4.2a Baby Detail

| Field | Value |
|-------|-------|
| **Path** | `ProfileSection.currentView === 'baby-detail'` |
| **Component** | `BabyDetailView` → `components/Profile/BabyDetailView.tsx` |
| **Primary Goal** | Edit baby profile and manage sharing for a specific baby |
| **Golden Path** | Edit fields → save changes |
| **Branching Options** | 1. Edit profile fields (name, DOB, gender, weight, height), 2. Upload avatar, 3. ShareAccess section (invite, edit role, revoke — owners only), 4. Delete baby link (owners only) |
| **Escape Routes** | Back button → My Babies |

**Sections:**
1. Avatar + profile form (name, DOB, gender, measurements)
2. ShareAccess component (owners only — invite caregivers, manage roles)
3. Save button (only visible when form has changes)
4. Delete baby link (owners only, at bottom)

### 2.4.3 Account Settings

| Field | Value |
|-------|-------|
| **Path** | `ProfileSection.currentView === 'account-settings'` |
| **Component** | `AccountSettingsView` → `components/Profile/AccountSettingsView.tsx` |
| **Primary Goal** | Update personal info or sign out |
| **Golden Path** | Review profile info → sign out when needed |
| **Branching Options** | 1. Edit profile (inline form toggle), 2. Sign Out card → confirmation modal, 3. "Delete account" text link → confirmation modal |
| **Escape Routes** | Back button → Profile Menu |

**Inline modals:** Logout confirmation, Delete account confirmation (delete is TODO — not yet implemented).

### 2.4.4 Support

| Field | Value |
|-------|-------|
| **Path** | `ProfileSection.currentView === 'support'` |
| **Component** | `SupportView` → `components/Profile/SupportView.tsx` |
| **Primary Goal** | Find help |
| **Golden Path** | Tap FAQs |
| **Branching Options** | 1. FAQs row → FAQs, 2. Contact Us row → Contact |
| **Escape Routes** | Back button → Profile Menu |

### 2.4.5 FAQs

| Field | Value |
|-------|-------|
| **Path** | `ProfileSection.currentView === 'faqs'` |
| **Component** | `FAQsView` → `components/Profile/FAQsView.tsx` |
| **Primary Goal** | Read answers to common questions |
| **Golden Path** | Expand a FAQ accordion → read answer |
| **Branching Options** | None |
| **Escape Routes** | Back button → Support (or Profile Menu, depending on entry path) |

### 2.4.6 Contact

| Field | Value |
|-------|-------|
| **Path** | `ProfileSection.currentView === 'contact'` |
| **Component** | `ContactView` → `components/Profile/ContactView.tsx` |
| **Primary Goal** | Reach the support team |
| **Golden Path** | Use provided contact method |
| **Branching Options** | None |
| **Escape Routes** | Back button → Support (or Profile Menu, depending on entry path) |

---

## 3. Global Overlays

These float above all content. Managed by boolean state in `App.tsx`. Available from any tab.

### 3.1 Quick Action Sheet

| Field | Value |
|-------|-------|
| **Trigger** | Centre [+] nav button |
| **Component** | `QuickActionSheet` → `components/QuickActionSheet.tsx` |
| **Primary Goal** | Log a sleep event in one tap |
| **Golden Path (no active sleep)** | Tap Nap or Bedtime → SleepEntrySheet |
| **Golden Path (active sleep)** | Tap Wake Up → ends active sleep immediately |
| **Branching Options (no active sleep)** | 1. Wake Up, 2. Nap, 3. Bedtime |
| **Branching Options (active sleep)** | 1. Wake Up (only option shown) |
| **Escape Routes** | Tap backdrop, swipe down |

### 3.2 Sleep Entry Sheet

| Field | Value |
|-------|-------|
| **Trigger** | Quick action (Nap/Bedtime), tap entry to edit, "+ Add Entry" in History |
| **Component** | `SleepEntrySheet` → `components/SleepEntrySheet.tsx` |
| **Primary Goal** | Set start/end time for a sleep event |
| **Golden Path** | Adjust times → tap save (Play/Stop/Check icon depending on state) |
| **Branching Options** | 1. Toggle type (nap ↔ night), 2. Set start time, 3. Set end time (optional), 4. Delete entry (edit mode only) |
| **Escape Routes** | Close button (X), tap backdrop, drag-to-dismiss (swipe down) |

**Validation:** Blocks save for 0-duration entries, naps > 5h, nights > 14h. Warns (amber) for naps > 4h, nights > 13h, cross-midnight naps (but allows save).

**Icon states:** Play (new entry, no end) → Stop (editing active entry) → Check (has end time or editing completed entry).

**Dynamic labels:** Start label shows duration when end time exists. End label shows relative "ago" time, "Sleeping..." for active entries.

### 3.3 Missing Bedtime Modal

| Field | Value |
|-------|-------|
| **Trigger** | Auto on app open when no activity logged today and entries exist |
| **Component** | `MissingBedtimeModal` → `components/MissingBedtimeModal.tsx` |
| **Primary Goal** | Remind parent to log a forgotten bedtime |
| **Golden Path** | Select date → "Log bedtime" → SleepEntrySheet |
| **Branching Options** | 1. Date picker (which night?), 2. "Log bedtime" button, 3. "Start a new day" button |
| **Escape Routes** | "Start a new day" button, tap backdrop, close (X) button |

### 3.4 Activity Collision Modal

| Field | Value |
|-------|-------|
| **Trigger** | Saving a sleep entry that overlaps with an existing one |
| **Component** | `ActivityCollisionModal` → `components/ActivityCollisionModal.tsx` |
| **Primary Goal** | Resolve a time overlap between entries |
| **Golden Path** | "Replace Entry" (delete old, save new) |
| **Branching Options** | 1. Replace Entry, 2. Cancel |
| **Escape Routes** | Cancel button, tap backdrop |

---

## 4. Ambient Layer

| Element | Component | File |
|---------|-----------|------|
| Sky background | `SkyBackground` | `components/SkyBackground.tsx` |

Contains inline `NightSky` (stars + moon), `MorningSky` (sun), `AfternoonSky` (clouds) based on circadian theme. Renders behind all content at `z-index: -10`. Non-interactive.

---

## 5. Density Audit Flags

| Screen | Interactive Count | Concern |
|--------|-------------------|---------|
| **Profile Menu (2.4.1)** | 5 | Baby card navigates to My Babies. Redundant "My Babies" ListRow was removed (2026-02-09). Invitation actions (accept/decline per row) still add unbounded elements when present. |
| ~~**My Babies (2.4.2)**~~ | **Resolved** | ShareAccess moved to Baby Detail view (2026-02-09). My Babies is now a clean gallery with baby cards + ghost card only. |

All other screens have 3 or fewer branching options.

---

## 6. Disconnected Flow Flags

| Item | Concern |
|------|---------|
| **Delete Account** (`AccountSettingsView`) | The "Delete" confirmation button handler is a `TODO` — it calls `setShowDeleteConfirm(false)` but does not actually delete the account. This is a dead-end action. |

---

## 7. User Intents to Confirm

All primary goals were inferred from the code. If any feel wrong, correct them:

- ~~**Today**~~: Confirmed — "See a live roadmap of the day — where we are in the sleep cycle and what events are ahead"
- ~~**Stats**~~: Confirmed — "Reassurance that sleep patterns are forming"
- ~~**Profile Menu**~~: Confirmed — navigation is the primary value
