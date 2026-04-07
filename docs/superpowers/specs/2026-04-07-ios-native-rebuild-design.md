# iOS Native Rebuild — Design Spec

## Overview

Full SwiftUI rebuild of the NapNap Baby Sleep Tracker as a native iOS app. The existing React web app continues to run; the iOS app connects to the same Supabase backend and shares the same database, auth, and storage.

**Primary motivation:** Native capabilities that the web cannot provide — Live Activities (lock screen nap timer with Stop button), push notifications, home screen widgets, and haptic feedback.

**Target:** iOS 17+ (required for modern ActivityKit, Swift Charts, interactive widgets).

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| UI framework | SwiftUI (full rebuild) | Native feel is the product's core value; wrapping React adds complexity without UX benefit |
| Architecture | Monolith (single Xcode project) | First iOS project — minimize tooling overhead; extract modules later if needed |
| Pattern | MVVM | Standard SwiftUI pattern; maps cleanly to existing React hooks approach |
| Backend | Supabase (unchanged) | supabase-swift SDK provides same API surface; same DB, auth, RLS policies |
| Font | Plus Jakarta Sans (bundled) | Maintain brand identity; bundle .ttf files in Xcode project |
| Min iOS version | 17.0 | Required for interactive widgets, advanced ActivityKit, Swift Charts |
| Language support | en, es, ca | Same as web app; use String Catalogs (.xcstrings) |

## Project Structure

### Xcode Targets

| Target | Type | Purpose |
|--------|------|---------|
| `NapNap` | App | Main SwiftUI app — all screens and logic |
| `NapNapWidgets` | Widget Extension | Home screen widgets (next nap, sleep status) |
| `NapNapLive` | Widget Extension (Live Activity) | Lock screen nap timer + Dynamic Island + Stop button |

### Folder Layout

```
NapNap/
├── App/
│   ├── NapNapApp.swift           # @main entry point
│   ├── MainTabView.swift         # TabView (Today, History, Stats, Profile)
│   └── AppState.swift            # Global app state (selected baby, auth)
├── Models/
│   ├── SleepEntry.swift          # Sleep record (start, end, type, pauses, tags, method)
│   ├── SleepPause.swift          # Interruption within sleep
│   ├── BabyProfile.swift         # Baby info (name, DOB, gender, avatarUrl)
│   ├── UserProfile.swift         # User info (email, name, role, locale)
│   ├── BabyShare.swift           # Sharing record (role, status)
│   └── MeasurementLog.swift      # Growth data (weight, height, head)
├── ViewModels/
│   ├── AuthViewModel.swift       # Sign up/in/out, OAuth, session
│   ├── SleepViewModel.swift      # CRUD entries/pauses, active nap, summaries
│   ├── ProfileViewModel.swift    # Baby CRUD, avatar upload, locale
│   ├── ShareViewModel.swift      # Invite, accept/decline, role management
│   ├── GrowthViewModel.swift     # Measurement CRUD
│   ├── PredictionEngine.swift    # Port of dateUtils prediction algorithms
│   └── ThemeManager.swift        # Circadian time-based palette
├── Views/
│   ├── Auth/
│   │   ├── WelcomeView.swift
│   │   ├── OnboardingView.swift
│   │   ├── LoginView.swift
│   │   └── ForgotPasswordView.swift
│   ├── Today/
│   │   ├── TodayView.swift           # Hero card, predictions, timeline
│   │   ├── SkyBackgroundView.swift   # Stars/sun/clouds (Canvas API)
│   │   ├── HeroCardView.swift        # Current status card
│   │   ├── TimelineCardView.swift    # Compact event cards
│   │   └── PredictedNapSheet.swift   # Prediction detail
│   ├── SleepLog/
│   │   ├── SleepLogView.swift        # History list with swipe actions
│   │   ├── DayNavigatorView.swift    # Week strip + calendar sheet
│   │   └── DailySummaryView.swift    # Aggregated stats
│   ├── Stats/
│   │   ├── StatsView.swift           # Swift Charts dashboard
│   │   └── SleepReportView.swift     # Narrative 30-day report
│   ├── Profile/
│   │   ├── ProfileMenuView.swift     # Greeting + nav
│   │   ├── MyBabiesView.swift        # Baby cards, invite cards
│   │   ├── BabyDetailView.swift      # Edit + sharing
│   │   ├── BabyEditSheet.swift       # Add baby
│   │   ├── ShareAccessView.swift     # Manage caregivers
│   │   ├── MeasuresView.swift        # Growth log list
│   │   ├── MeasureLogSheet.swift     # Add/edit measurement
│   │   ├── AccountSettingsView.swift # Settings, language, sign out
│   │   └── SupportView.swift        # Help, about, FAQs, legal
│   └── Shared/
│       ├── QuickActionSheet.swift    # 3-column action grid
│       ├── SleepEntrySheet.swift     # Add/edit sleep
│       ├── WakeUpSheet.swift         # Quick wake
│       ├── BabyAvatarPicker.swift    # Photo picker + compression
│       ├── LoadingView.swift         # Animated moon
│       └── SkeletonView.swift        # Shimmer placeholder
├── Services/
│   ├── SupabaseService.swift         # Client init, auth, queries, storage
│   ├── NotificationService.swift     # Schedule/cancel local notifications
│   └── LiveActivityService.swift     # Start/update/stop Live Activities
├── Theme/
│   ├── Colors.swift                  # Color extension (napColor, nightColor, etc.)
│   ├── Typography.swift              # Font definitions (Plus Jakarta Sans)
│   ├── Spacing.swift                 # Spacing tokens
│   └── ViewModifiers.swift           # CardStyle, button styles, glass morphism
├── Extensions/
│   ├── Date+Helpers.swift            # Formatting, duration, age calculation
│   └── View+Helpers.swift            # Convenience modifiers
├── Resources/
│   ├── Assets.xcassets               # App icon, colors, images
│   ├── Localizable.xcstrings         # String Catalog (en, es, ca)
│   └── Fonts/                        # Plus Jakarta Sans .ttf files
├── NapNapWidgets/
│   ├── SmallWidget.swift             # Next nap time
│   ├── MediumWidget.swift            # Next nap + bedtime + daily total
│   └── WidgetDataProvider.swift      # Reads from App Group
└── NapNapLive/
    ├── NapLiveActivity.swift         # Live Activity definition
    ├── NapActivityAttributes.swift   # Data model for the activity
    └── NapDynamicIsland.swift        # Compact + expanded layouts
```

### Shared Data (App Groups)

The main app, widget, and Live Activity extension share data via an App Group container (`group.com.napnap.shared`). This is a shared UserDefaults + file container that all three targets can read/write.

Shared data includes:
- Active nap state (is napping, start time, baby name)
- Next predicted nap/bedtime times
- Daily sleep totals
- Selected baby profile

When the main app updates sleep data, it writes to the App Group and reloads widget timelines. When the Live Activity Stop button is tapped, it writes a "stop requested" flag to the App Group; the main app observes this and saves the completed entry to Supabase.

## Design System

### Color Tokens

All colors defined as a `Color` extension, mirroring CSS custom properties:

| CSS Variable | Swift Property | Hex | Usage |
|---|---|---|---|
| `--bg-deep` | `.bgDeep` | #12141C | Primary background |
| `--bg-card` | `.bgCard` | #1E2230 | Card surfaces |
| `--bg-soft` | `.bgSoft` | #1E2230 | Soft background |
| `--nap-color` | `.napColor` | #9DBAB7 | Nap actions, nap-related UI |
| `--night-color` | `.nightColor` | #8A92B3 | Night/bedtime UI |
| `--wake-color` | `.wakeColor` | #E8D3A3 | Wake up, totals |
| `--text-primary` | `.textPrimary` | theme-dependent | Main text |
| `--text-secondary` | `.textSecondary` | theme-dependent | Secondary text |
| `--text-muted` | `.textMuted` | theme-dependent | Muted/hint text |
| `--success-color` | `.successColor` | theme-dependent | Success states |
| `--danger-color` | `.dangerColor` | theme-dependent | Delete, errors |

### Circadian Theme

`ThemeManager` is an `@Observable` class that:
1. Determines current period based on time of day (night: 8PM–6AM, morning: 6AM–12PM, afternoon: 12PM–8PM)
2. Publishes the active color palette (background, text, accent colors adjust per period)
3. Updates every 60 seconds via a Timer
4. Injected into the environment at app root so all views react to theme changes

### Typography

Plus Jakarta Sans bundled as custom font. Font definitions:

| Style | Font | Size | Weight |
|---|---|---|---|
| Display Large | Plus Jakarta Sans | 28 | Bold (700) |
| Display Medium | Plus Jakarta Sans | 22 | SemiBold (600) |
| Display Small | Plus Jakarta Sans | 18 | SemiBold (600) |
| Body | Plus Jakarta Sans | 16 | Medium (500) |
| Caption | Plus Jakarta Sans | 13 | Medium (500) |
| Label | Plus Jakarta Sans | 11 | SemiBold (600) |

### Component Styles

| Web Pattern | SwiftUI Equivalent |
|---|---|
| `.card` class | `CardStyle` ViewModifier (glass bg, subtle border, rounded corners) |
| `.btn-nap/night/wake` | Custom `ButtonStyle` per color |
| Framer Motion sheet | `.sheet(presentationDetents: [.medium, .large])` |
| Framer AnimatePresence | `.transition()` + `withAnimation(.spring())` |
| Custom skeleton | `.redacted(reason: .placeholder)` with shimmer |
| ConfirmationModal | `.confirmationDialog()` |
| react-i18next `t()` | `String(localized:)` with .xcstrings catalog |
| Recharts | Swift Charts framework |
| date-fns | Foundation `Date`, `Calendar`, `DateFormatter` |
| localStorage | `@AppStorage` / `UserDefaults` |
| CSS safe-area insets | Automatic in SwiftUI (`.safeAreaInset()` when needed) |

## Native Features

### 1. Live Activities + Dynamic Island

**The killer feature.** When a nap or bedtime is started:

1. App calls `LiveActivityService.startNapActivity(babyName:, startTime:, type:)`
2. iOS displays a Live Activity on the lock screen showing:
   - Baby name
   - Elapsed timer (counts up natively — no app process needed)
   - **Stop** button (ends nap, writes to App Group, main app syncs to Supabase)
   - **Pause** button (records pause start time)
3. Dynamic Island shows:
   - **Compact**: pulsing dot + elapsed time (visible on top of any app)
   - **Expanded** (long press): baby name, timer, Stop button
4. When stopped via Live Activity:
   - The button press is handled via ActivityKit's push token or App Intent action
   - The action writes `{ action: "stop", timestamp: Date() }` to the App Group
   - If the app is in the foreground/background: it observes the change and saves the completed `SleepEntry` to Supabase immediately
   - If the app was terminated: on next launch it checks the App Group for pending stop actions and syncs to Supabase
   - Live Activity is dismissed

**Data model (`NapActivityAttributes`):**
```
- babyName: String
- sleepType: "nap" | "night"
- startTime: Date
- isPaused: Bool
- pauseStartTime: Date? (optional)
```

### 2. Push Notifications

**Local notifications only — no server infrastructure required.**

`NotificationService` schedules notifications based on the prediction engine output:

| Notification | Trigger | Actions |
|---|---|---|
| "Nap time coming up" | 10 min before predicted nap window | Start Nap, Snooze 15m |
| "Bedtime approaching" | 15 min before predicted bedtime | Start Bedtime, Dismiss |
| "Good morning!" | At predicted wake time (optional) | Open App |

Notifications are rescheduled whenever:
- A sleep entry is created, updated, or deleted
- The app is opened (predictions may have changed)
- A notification action is taken (e.g., "Snooze 15m" reschedules)

**Actionable buttons:** "Start Nap" from a notification opens the app and immediately shows the Quick Action Sheet. "Snooze" reschedules the notification.

### 3. Home Screen Widgets

Two widget sizes using WidgetKit:

**Small Widget (2x2):**
- Shows next predicted nap time
- "in X min" countdown
- Tapping opens Today view

**Medium Widget (4x2):**
- Baby name + last nap info
- Three info boxes: next nap time, bedtime, nap count today
- Total sleep for the day
- Tapping opens Today view

**Data flow:**
1. Main app writes prediction data to App Group after each sleep event
2. Widget reads from App Group via `WidgetDataProvider`
3. Widget timeline refreshes on App Group change + every 15 minutes

### 4. Haptic Feedback

Integrated throughout via `UIImpactFeedbackGenerator` and `UINotificationFeedbackGenerator`:

| Action | Haptic Type |
|---|---|
| Start nap/bedtime | Medium impact |
| Stop nap/bedtime | Success notification |
| Pause/resume | Light impact |
| Delete entry | Warning notification |
| Scroll day navigator | Selection (tick) |
| Pull to refresh | Light impact |
| Tab switch | Light impact |

## Screen-by-Screen Port

### Auth Flow

| Screen | Source | SwiftUI View |
|---|---|---|
| Entry choice | `EntryChoice.tsx` | `WelcomeView` — "Get started" / "I have an account" |
| Onboarding | `OnboardingFlow.tsx` | `OnboardingView` — multi-step with NavigationStack |
| Login | `LoginForm.tsx` | `LoginView` — email/password + Google OAuth via `supabase.auth.signInWithOAuth(.google)` |
| Forgot password | `ForgotPasswordForm.tsx` | `ForgotPasswordView` — email input + reset link |

Google OAuth on iOS uses `ASWebAuthenticationSession` (system browser sheet) via the Supabase Swift SDK's built-in support.

### Main App

| Screen | Source | SwiftUI View |
|---|---|---|
| Tab navigation | `App.tsx` | `MainTabView` — `TabView` with 4 tabs (Today, History, Stats, Profile) |
| Today dashboard | `TodayView.tsx` | `TodayView` — hero card, timeline river, predictions |
| Sky background | `SkyBackground.tsx` | `SkyBackgroundView` — SwiftUI `Canvas` for stars/sun/clouds |
| Quick actions | `QuickActionSheet.tsx` | `QuickActionSheet` — native sheet with 3-column grid |
| Sleep entry | `SleepEntrySheet.tsx` | `SleepEntrySheet` — native sheet with time pickers, pauses, tags |
| Wake up | `WakeUpSheet.tsx` | `WakeUpSheet` — quick wake logging |
| Predicted nap | `PredictedNapSheet.tsx` | `PredictedNapSheet` — prediction details |
| Missing bedtime | `MissingBedtimeModal.tsx` | `MissingBedtimeAlert` — `.alert()` with DatePicker |

### History

| Screen | Source | SwiftUI View |
|---|---|---|
| Sleep log | `SleepList.tsx` | `SleepLogView` — `List` with `.swipeActions` (edit, delete) |
| Day navigator | `DayNavigator.tsx` | `DayNavigatorView` — horizontal week strip + calendar sheet |
| Daily summary | `DailySummary.tsx` | `DailySummaryView` — net sleep, night wakings |

### Stats

| Screen | Source | SwiftUI View |
|---|---|---|
| Stats dashboard | `StatsView.tsx` | `StatsView` — Swift Charts (bar, area, distribution) |
| Sleep report | `SleepReportView.tsx` | `SleepReportView` — narrative 30-day report |

### Profile

| Screen | Source | SwiftUI View |
|---|---|---|
| Menu | `ProfileMenu.tsx` | `ProfileMenuView` — greeting + navigation list |
| My babies | `MyBabiesView.tsx` | `MyBabiesView` — baby cards, invite cards |
| Baby detail | `BabyDetailView.tsx` | `BabyDetailView` — edit form + ShareAccess |
| Add baby | `BabyEditSheet.tsx` | `BabyEditSheet` — sheet for new baby |
| Share access | `ShareAccess.tsx` | `ShareAccessView` — invite/manage caregivers |
| Measures | `MeasuresView.tsx` | `MeasuresView` — growth log list |
| Measure entry | `MeasureLogSheet.tsx` | `MeasureLogSheet` — add/edit measurement |
| Account settings | `AccountSettingsView.tsx` | `AccountSettingsView` — language, sign out, delete |
| Support | `SupportView.tsx` + subviews | `SupportView` — about, FAQs, contact, legal |

## Data Layer

### Supabase Swift SDK

The `SupabaseService` singleton initializes the Supabase client and provides typed query methods:

```swift
// Same tables, same RLS policies, same queries
let client = SupabaseClient(
    supabaseURL: URL(string: "https://xxx.supabase.co")!,
    supabaseKey: "anon-key"
)
```

Each ViewModel calls SupabaseService for its domain:
- `AuthViewModel` → `supabase.auth.*`
- `SleepViewModel` → `supabase.from("sleep_entries").*`, `supabase.from("sleep_pauses").*`
- `ProfileViewModel` → `supabase.from("profiles").*`, `supabase.storage.*`
- `ShareViewModel` → `supabase.from("baby_shares").*`, `supabase.functions.invoke("send-invitation-email")`
- `GrowthViewModel` → `supabase.from("baby_measurement_logs").*`

### Prediction Engine

`PredictionEngine.swift` is a direct port of `dateUtils.ts` prediction functions:
- `getRecommendedSchedule(dateOfBirth:)` → age-based nap count and wake windows
- `calculateSuggestedNapTime()` → next nap prediction
- `calculateAllNapWindows()` → full day schedule
- `calculateDynamicBedtime()` → elastic bedtime based on completed naps

The algorithm logic is identical; only the language changes (TypeScript → Swift).

## Out of Scope

These features were explicitly excluded from this spec:
- **HealthKit integration** — no sync with Apple Health
- **Siri shortcuts** — no voice commands
- **Offline-first** — app requires internet for Supabase operations (same as web)
- **Backend migration** — Supabase stays as-is
- **iPad / macOS** — iPhone only for initial release
- **Web app deprecation** — both apps coexist

## Prerequisites

- **Apple Developer Account** ($99/year) — required for App Store, push notifications, Live Activities
- **Xcode 15+** — development environment (Mac required)
- **Physical iPhone** — Live Activities and push notifications cannot be fully tested in Simulator
