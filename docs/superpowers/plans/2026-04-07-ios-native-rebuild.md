# iOS Native Rebuild — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full SwiftUI iOS app for NapNap Baby Sleep Tracker with Live Activities, push notifications, widgets, and haptic feedback — achieving feature parity with the existing React web app.

**Architecture:** Monolith Xcode project with MVVM pattern. Three targets: main app, widget extension, Live Activity extension. Supabase Swift SDK connects to the existing backend (same DB, auth, RLS). App Group shares data between targets.

**Tech Stack:** SwiftUI, Swift 5.9+, supabase-swift, ActivityKit, WidgetKit, UserNotifications, Swift Charts, iOS 17+

**Spec:** `docs/superpowers/specs/2026-04-07-ios-native-rebuild-design.md`

---

## Phase Overview

| Phase | What | Milestone |
|-------|------|-----------|
| 1 | Xcode project + theme + models | App launches with placeholder tabs, correct fonts/colors |
| 2 | Supabase service + auth flow | User can sign up, log in, see loading screen |
| 3 | Today view + sleep logging | Core loop works: start nap → see timer → stop nap → see timeline |
| 4 | Sleep log + day navigator | History tab with entries, date navigation, daily summary |
| 5 | Sleep entry sheet (full) | Full edit: pauses, tags, methods, validation |
| 6 | Prediction engine | Predictions display on Today view with confidence |
| 7 | Stats + reports | Charts dashboard with Swift Charts |
| 8 | Profile + baby management | Full profile section with sharing, measures, settings |
| 9 | Live Activities + Dynamic Island | Lock screen nap timer with Stop button |
| 10 | Push notifications | Local notification scheduling for predictions |
| 11 | Home screen widgets | Small + medium widgets |
| 12 | Haptics + polish | Haptic feedback, animations, final QA |

---

## Phase 1: Xcode Project + Theme + Models

### Task 1.1: Create Xcode Project

**Files:**
- Create: `NapNap/NapNap.xcodeproj`
- Create: `NapNap/NapNap/App/NapNapApp.swift`
- Create: `NapNap/NapNap/Info.plist`

- [ ] **Step 1: Create new Xcode project**

Open Xcode → File → New → Project → iOS → App.
- Product Name: `NapNap`
- Team: Your Apple Developer account (or Personal Team for now)
- Organization Identifier: `com.napnap`
- Interface: SwiftUI
- Language: Swift
- Storage: None
- Uncheck "Include Tests" (we'll add later)

Place the project inside the repo root so the structure is:
```
baby-sleep-tracker/
├── NapNap/                  ← new Xcode project folder
│   ├── NapNap.xcodeproj
│   └── NapNap/
│       ├── App/
│       ├── NapNapApp.swift
│       └── ...
├── src/                     ← existing web app
├── docs/
└── ...
```

- [ ] **Step 2: Reorganize default files into folder structure**

Move `NapNapApp.swift` into `NapNap/NapNap/App/`. Create the folder structure from the spec:

```
NapNap/NapNap/
├── App/
├── Models/
├── ViewModels/
├── Views/
│   ├── Auth/
│   ├── Today/
│   ├── SleepLog/
│   ├── Stats/
│   ├── Profile/
│   └── Shared/
├── Services/
├── Theme/
├── Extensions/
└── Resources/
    └── Fonts/
```

Create each directory. In Xcode, create Groups matching this structure (File → New → Group).

- [ ] **Step 3: Add supabase-swift dependency**

In Xcode: File → Add Package Dependencies → Enter URL:
```
https://github.com/supabase/supabase-swift
```
- Version: Up to Next Major (latest 2.x)
- Add to target: NapNap

This brings in `Supabase`, `Auth`, `PostgREST`, `Storage`, `Functions`, `Realtime`.

- [ ] **Step 4: Configure minimum deployment target**

In Xcode → NapNap target → General → Minimum Deployments → set to **iOS 17.0**.

- [ ] **Step 5: Add .gitignore entries**

Add to the repo root `.gitignore`:
```
# Xcode
NapNap/NapNap.xcodeproj/xcuserdata/
NapNap/NapNap.xcodeproj/project.xcworkspace/xcuserdata/
NapNap/**/*.xcuserdata/
*.xcworkspace/xcuserdata/
DerivedData/
*.hmap
*.ipa
*.dSYM.zip
*.dSYM
```

- [ ] **Step 6: Verify project builds and runs**

Run: Cmd+R in Xcode (select iPhone 15 Pro simulator).
Expected: blank app launches in simulator with "Hello, world!" default view.

- [ ] **Step 7: Commit**

```bash
git add NapNap/ .gitignore
git commit -m "feat: create Xcode project with supabase-swift dependency"
```

---

### Task 1.2: Design Tokens — Colors

**Files:**
- Create: `NapNap/NapNap/Theme/Colors.swift`

- [ ] **Step 1: Create Colors.swift with all theme colors**

```swift
import SwiftUI

// MARK: - NapNap Color Tokens
// Mirrors CSS custom properties from src/index.css
extension Color {
    // Backgrounds
    static let bgDeep = Color(hex: "12141C")
    static let bgCard = Color(hex: "1E2230")
    static let bgSoft = Color(hex: "1E2230")

    // Semantic colors
    static let napColor = Color(hex: "9DBAB7")      // Matte sage — daytime naps
    static let nightColor = Color(hex: "8A92B3")     // Muted periwinkle — night sleep
    static let wakeColor = Color(hex: "E8D3A3")      // Warm parchment — wake up, totals

    // Text
    static let textPrimary = Color(hex: "F0F0F5")
    static let textSecondary = Color(hex: "A0A4B8")
    static let textMuted = Color(hex: "6B7084")

    // Status
    static let successColor = Color(hex: "7BC47F")
    static let dangerColor = Color(hex: "E07575")

    // Glass morphism
    static let glassBg = Color.white.opacity(0.06)
    static let glassBorder = Color.white.opacity(0.08)
}

// MARK: - Hex Initializer
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 6: // RGB
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
```

- [ ] **Step 2: Verify colors compile**

Run: Cmd+B in Xcode.
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add NapNap/NapNap/Theme/Colors.swift
git commit -m "feat: add color token system mirroring CSS design tokens"
```

---

### Task 1.3: Design Tokens — Typography

**Files:**
- Create: `NapNap/NapNap/Theme/Typography.swift`
- Create: `NapNap/NapNap/Resources/Fonts/PlusJakartaSans-Medium.ttf`
- Create: `NapNap/NapNap/Resources/Fonts/PlusJakartaSans-SemiBold.ttf`
- Create: `NapNap/NapNap/Resources/Fonts/PlusJakartaSans-Bold.ttf`

- [ ] **Step 1: Download Plus Jakarta Sans font files**

Download from Google Fonts: https://fonts.google.com/specimen/Plus+Jakarta+Sans
Extract the .ttf files for weights 500 (Medium), 600 (SemiBold), 700 (Bold).
Place them in `NapNap/NapNap/Resources/Fonts/`.

- [ ] **Step 2: Register fonts in Info.plist**

In Xcode → NapNap target → Info tab → add key "Fonts provided by application" (UIAppFonts) with values:
```
PlusJakartaSans-Medium.ttf
PlusJakartaSans-SemiBold.ttf
PlusJakartaSans-Bold.ttf
```

Make sure font files are added to the NapNap target (check "Target Membership" in File Inspector).

- [ ] **Step 3: Create Typography.swift**

```swift
import SwiftUI

// MARK: - NapNap Typography
// Mirrors CSS typography from src/index.css
extension Font {
    static let displayLarge = Font.custom("PlusJakartaSans-Bold", size: 28)
    static let displayMedium = Font.custom("PlusJakartaSans-SemiBold", size: 22)
    static let displaySmall = Font.custom("PlusJakartaSans-SemiBold", size: 18)
    static let bodyDefault = Font.custom("PlusJakartaSans-Medium", size: 16)
    static let caption = Font.custom("PlusJakartaSans-Medium", size: 13)
    static let label = Font.custom("PlusJakartaSans-SemiBold", size: 11)
}
```

- [ ] **Step 4: Test fonts load correctly**

Temporarily add to NapNapApp.swift body:
```swift
Text("NapNap")
    .font(.displayLarge)
    .foregroundColor(.napColor)
```

Run: Cmd+R. Expected: "NapNap" appears in Plus Jakarta Sans Bold 28pt in sage color.
Remove temporary test code after verifying.

- [ ] **Step 5: Commit**

```bash
git add NapNap/NapNap/Theme/Typography.swift NapNap/NapNap/Resources/Fonts/ NapNap/NapNap/Info.plist
git commit -m "feat: add Plus Jakarta Sans font and typography tokens"
```

---

### Task 1.4: Design Tokens — Spacing & View Modifiers

**Files:**
- Create: `NapNap/NapNap/Theme/Spacing.swift`
- Create: `NapNap/NapNap/Theme/ViewModifiers.swift`

- [ ] **Step 1: Create Spacing.swift**

```swift
import SwiftUI

// MARK: - NapNap Spacing Tokens
// Mirrors CSS --space-* tokens
enum Spacing {
    static let xs: CGFloat = 4
    static let sm: CGFloat = 8
    static let md: CGFloat = 16
    static let lg: CGFloat = 24
    static let xl: CGFloat = 32
    static let xxl: CGFloat = 48
}

// MARK: - Radius Tokens
enum Radius {
    static let sm: CGFloat = 8
    static let md: CGFloat = 12
    static let lg: CGFloat = 16
    static let xl: CGFloat = 24
    static let xxl: CGFloat = 40  // AAA gallery cards
    static let full: CGFloat = 9999
}
```

- [ ] **Step 2: Create ViewModifiers.swift**

```swift
import SwiftUI

// MARK: - Card Style (glass morphism)
struct CardStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .background(Color.bgCard)
            .clipShape(RoundedRectangle(cornerRadius: Radius.lg))
            .overlay(
                RoundedRectangle(cornerRadius: Radius.lg)
                    .stroke(Color.glassBorder, lineWidth: 1)
            )
    }
}

extension View {
    func cardStyle() -> some View {
        modifier(CardStyle())
    }
}

// MARK: - NapNap Button Styles
struct NapButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.bodyDefault)
            .fontWeight(.semibold)
            .foregroundColor(.bgDeep)
            .padding(.horizontal, Spacing.lg)
            .padding(.vertical, Spacing.md)
            .background(Color.napColor)
            .clipShape(RoundedRectangle(cornerRadius: Radius.md))
            .scaleEffect(configuration.isPressed ? 0.97 : 1.0)
            .animation(.spring(duration: 0.2), value: configuration.isPressed)
    }
}

struct NightButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.bodyDefault)
            .fontWeight(.semibold)
            .foregroundColor(.bgDeep)
            .padding(.horizontal, Spacing.lg)
            .padding(.vertical, Spacing.md)
            .background(Color.nightColor)
            .clipShape(RoundedRectangle(cornerRadius: Radius.md))
            .scaleEffect(configuration.isPressed ? 0.97 : 1.0)
            .animation(.spring(duration: 0.2), value: configuration.isPressed)
    }
}

struct WakeButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.bodyDefault)
            .fontWeight(.semibold)
            .foregroundColor(.bgDeep)
            .padding(.horizontal, Spacing.lg)
            .padding(.vertical, Spacing.md)
            .background(Color.wakeColor)
            .clipShape(RoundedRectangle(cornerRadius: Radius.md))
            .scaleEffect(configuration.isPressed ? 0.97 : 1.0)
            .animation(.spring(duration: 0.2), value: configuration.isPressed)
    }
}

struct GhostButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.bodyDefault)
            .foregroundColor(.textSecondary)
            .padding(.horizontal, Spacing.lg)
            .padding(.vertical, Spacing.md)
            .background(Color.glassBg)
            .clipShape(RoundedRectangle(cornerRadius: Radius.md))
            .overlay(
                RoundedRectangle(cornerRadius: Radius.md)
                    .stroke(Color.glassBorder, lineWidth: 1)
            )
            .scaleEffect(configuration.isPressed ? 0.97 : 1.0)
            .animation(.spring(duration: 0.2), value: configuration.isPressed)
    }
}

struct DangerButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.bodyDefault)
            .fontWeight(.semibold)
            .foregroundColor(.white)
            .padding(.horizontal, Spacing.lg)
            .padding(.vertical, Spacing.md)
            .background(Color.dangerColor)
            .clipShape(RoundedRectangle(cornerRadius: Radius.md))
            .scaleEffect(configuration.isPressed ? 0.97 : 1.0)
            .animation(.spring(duration: 0.2), value: configuration.isPressed)
    }
}
```

- [ ] **Step 3: Verify build**

Run: Cmd+B. Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add NapNap/NapNap/Theme/Spacing.swift NapNap/NapNap/Theme/ViewModifiers.swift
git commit -m "feat: add spacing tokens, radius tokens, and button/card styles"
```

---

### Task 1.5: Data Models

**Files:**
- Create: `NapNap/NapNap/Models/SleepEntry.swift`
- Create: `NapNap/NapNap/Models/SleepPause.swift`
- Create: `NapNap/NapNap/Models/BabyProfile.swift`
- Create: `NapNap/NapNap/Models/UserProfile.swift`
- Create: `NapNap/NapNap/Models/BabyShare.swift`
- Create: `NapNap/NapNap/Models/MeasurementLog.swift`

- [ ] **Step 1: Create SleepPause.swift**

```swift
import Foundation

struct SleepPause: Identifiable, Codable, Equatable {
    let id: String
    let sleepEntryId: String
    let startTime: Date
    let durationMinutes: Int

    enum CodingKeys: String, CodingKey {
        case id
        case sleepEntryId = "sleep_entry_id"
        case startTime = "start_time"
        case durationMinutes = "duration_minutes"
    }
}
```

- [ ] **Step 2: Create SleepEntry.swift**

```swift
import Foundation

enum SleepType: String, Codable {
    case nap
    case night
}

struct SleepEntry: Identifiable, Codable, Equatable {
    let id: String
    let userId: String
    let startTime: Date
    var endTime: Date?
    let type: SleepType
    var notes: String?
    var pauses: [SleepPause]
    var onsetTags: [String]?
    var sleepMethod: String?
    var wakeMethod: String?
    var wakeMood: String?
    let createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case startTime = "start_time"
        case endTime = "end_time"
        case type
        case notes
        case onsetTags = "onset_tags"
        case sleepMethod = "sleep_method"
        case wakeMethod = "wake_method"
        case wakeMood = "wake_mood"
        case createdAt = "created_at"
    }

    // pauses are not stored in the same table — decoded separately
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        userId = try container.decode(String.self, forKey: .userId)
        startTime = try container.decode(Date.self, forKey: .startTime)
        endTime = try container.decodeIfPresent(Date.self, forKey: .endTime)
        type = try container.decode(SleepType.self, forKey: .type)
        notes = try container.decodeIfPresent(String.self, forKey: .notes)
        onsetTags = try container.decodeIfPresent([String].self, forKey: .onsetTags)
        sleepMethod = try container.decodeIfPresent(String.self, forKey: .sleepMethod)
        wakeMethod = try container.decodeIfPresent(String.self, forKey: .wakeMethod)
        wakeMood = try container.decodeIfPresent(String.self, forKey: .wakeMood)
        createdAt = try container.decode(Date.self, forKey: .createdAt)
        pauses = [] // populated after fetch
    }

    init(id: String, userId: String, startTime: Date, endTime: Date? = nil,
         type: SleepType, notes: String? = nil, pauses: [SleepPause] = [],
         onsetTags: [String]? = nil, sleepMethod: String? = nil,
         wakeMethod: String? = nil, wakeMood: String? = nil, createdAt: Date = Date()) {
        self.id = id
        self.userId = userId
        self.startTime = startTime
        self.endTime = endTime
        self.type = type
        self.notes = notes
        self.pauses = pauses
        self.onsetTags = onsetTags
        self.sleepMethod = sleepMethod
        self.wakeMethod = wakeMethod
        self.wakeMood = wakeMood
        self.createdAt = createdAt
    }

    /// Net sleep duration in minutes (gross minus pauses)
    var netSleepMinutes: Int {
        let end = endTime ?? Date()
        let gross = max(0, Int(end.timeIntervalSince(startTime) / 60))
        let pauseTotal = pauses.reduce(0) { $0 + $1.durationMinutes }
        return max(0, gross - pauseTotal)
    }

    /// Whether this entry is currently active (no end time)
    var isActive: Bool { endTime == nil }

    /// The date string (YYYY-MM-DD) derived from startTime in local timezone
    var date: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: startTime)
    }
}
```

- [ ] **Step 3: Create BabyProfile.swift**

```swift
import Foundation

enum BabyGender: String, Codable {
    case male
    case female
    case other
}

struct BabyProfile: Identifiable, Codable, Equatable {
    let id: String
    var babyName: String?
    var babyDateOfBirth: String?  // YYYY-MM-DD
    var babyGender: BabyGender?
    var babyAvatarUrl: String?
    var locale: String?
    let createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id
        case babyName = "baby_name"
        case babyDateOfBirth = "baby_date_of_birth"
        case babyGender = "baby_gender"
        case babyAvatarUrl = "baby_avatar_url"
        case locale
        case createdAt = "created_at"
    }
}
```

- [ ] **Step 4: Create UserProfile.swift**

```swift
import Foundation

enum UserRole: String, Codable {
    case dad
    case mum
    case other
}

struct UserProfile: Codable, Equatable {
    let email: String
    var userName: String?
    var userRole: UserRole?
    var locale: String?

    enum CodingKeys: String, CodingKey {
        case email
        case userName = "user_name"
        case userRole = "user_role"
        case locale
    }
}
```

- [ ] **Step 5: Create BabyShare.swift**

```swift
import Foundation

enum ShareRole: String, Codable {
    case caregiver
    case viewer
}

enum ShareStatus: String, Codable {
    case pending
    case accepted
    case revoked
}

struct BabyShare: Identifiable, Codable, Equatable {
    let id: String
    let babyOwnerId: String
    var sharedWithUserId: String?
    let sharedWithEmail: String
    var status: ShareStatus
    var role: ShareRole
    let invitedAt: Date
    var acceptedAt: Date?
    // Populated from joins for invite cards
    var babyName: String?
    var ownerName: String?
    var babyAvatarUrl: String?

    enum CodingKeys: String, CodingKey {
        case id
        case babyOwnerId = "baby_owner_id"
        case sharedWithUserId = "shared_with_user_id"
        case sharedWithEmail = "shared_with_email"
        case status
        case role
        case invitedAt = "invited_at"
        case acceptedAt = "accepted_at"
        case babyName = "baby_name"
        case ownerName = "owner_name"
        case babyAvatarUrl = "baby_avatar_url"
    }
}
```

- [ ] **Step 6: Create MeasurementLog.swift**

```swift
import Foundation

struct MeasurementLog: Identifiable, Codable, Equatable {
    let id: String
    let babyId: String
    let date: String  // YYYY-MM-DD
    var weightKg: Double?
    var heightCm: Double?
    var headCm: Double?
    var notes: String?
    let createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id
        case babyId = "baby_id"
        case date
        case weightKg = "weight_kg"
        case heightCm = "height_cm"
        case headCm = "head_cm"
        case notes
        case createdAt = "created_at"
    }
}
```

- [ ] **Step 7: Verify all models compile**

Run: Cmd+B. Expected: Build succeeds.

- [ ] **Step 8: Commit**

```bash
git add NapNap/NapNap/Models/
git commit -m "feat: add data models (SleepEntry, BabyProfile, UserProfile, BabyShare, MeasurementLog)"
```

---

### Task 1.6: Tab Shell + Placeholder Views

**Files:**
- Create: `NapNap/NapNap/App/MainTabView.swift`
- Modify: `NapNap/NapNap/App/NapNapApp.swift`

- [ ] **Step 1: Create MainTabView.swift**

```swift
import SwiftUI

struct MainTabView: View {
    @State private var selectedTab: Tab = .today

    enum Tab: String {
        case today, history, stats, profile
    }

    var body: some View {
        ZStack(alignment: .bottom) {
            // Content
            Group {
                switch selectedTab {
                case .today:
                    PlaceholderView(title: "Today", icon: "sun.max.fill", color: .wakeColor)
                case .history:
                    PlaceholderView(title: "Sleep Log", icon: "list.bullet", color: .napColor)
                case .stats:
                    PlaceholderView(title: "Stats", icon: "chart.bar.fill", color: .nightColor)
                case .profile:
                    PlaceholderView(title: "Profile", icon: "person.fill", color: .textSecondary)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)

            // Tab bar
            HStack(spacing: 0) {
                tabButton(.today, icon: "sun.max.fill", label: "Today")
                tabButton(.history, icon: "list.bullet", label: "Log")
                // FAB placeholder
                Button(action: {}) {
                    Image(systemName: "plus")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.bgDeep)
                        .frame(width: 56, height: 56)
                        .background(Color.napColor)
                        .clipShape(Circle())
                        .shadow(color: Color.napColor.opacity(0.3), radius: 8, y: 4)
                }
                .offset(y: -12)
                tabButton(.stats, icon: "chart.bar.fill", label: "Stats")
                tabButton(.profile, icon: "person.fill", label: "Profile")
            }
            .padding(.horizontal, Spacing.md)
            .padding(.top, Spacing.sm)
            .padding(.bottom, Spacing.xl)
            .background(
                Color.bgCard
                    .clipShape(RoundedRectangle(cornerRadius: Radius.xl))
                    .shadow(color: .black.opacity(0.3), radius: 16, y: -4)
            )
        }
        .background(Color.bgDeep)
        .ignoresSafeArea(edges: .bottom)
    }

    private func tabButton(_ tab: Tab, icon: String, label: String) -> some View {
        Button(action: { selectedTab = tab }) {
            VStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.system(size: 20))
                Text(label)
                    .font(.label)
            }
            .foregroundColor(selectedTab == tab ? .napColor : .textMuted)
            .frame(maxWidth: .infinity)
        }
    }
}

// Temporary placeholder for tab content
struct PlaceholderView: View {
    let title: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: Spacing.md) {
            Image(systemName: icon)
                .font(.system(size: 48))
                .foregroundColor(color)
            Text(title)
                .font(.displayMedium)
                .foregroundColor(.textPrimary)
            Text("Coming soon")
                .font(.bodyDefault)
                .foregroundColor(.textMuted)
        }
    }
}
```

- [ ] **Step 2: Update NapNapApp.swift**

```swift
import SwiftUI

@main
struct NapNapApp: App {
    var body: some Scene {
        WindowGroup {
            MainTabView()
                .preferredColorScheme(.dark)
        }
    }
}
```

- [ ] **Step 3: Run and verify**

Run: Cmd+R. Expected: Dark app with 4 tab icons + center FAB button. Tapping tabs switches placeholder views. Correct fonts and colors display.

- [ ] **Step 4: Commit**

```bash
git add NapNap/NapNap/App/
git commit -m "feat: add tab navigation shell with placeholder views and FAB"
```

---

## Phase 2: Supabase Service + Auth Flow

### Task 2.1: Supabase Service

**Files:**
- Create: `NapNap/NapNap/Services/SupabaseService.swift`

- [ ] **Step 1: Create SupabaseService.swift**

```swift
import Foundation
import Supabase

final class SupabaseService {
    static let shared = SupabaseService()

    let client: SupabaseClient

    private init() {
        guard let urlString = Bundle.main.infoDictionary?["SUPABASE_URL"] as? String,
              let url = URL(string: urlString),
              let anonKey = Bundle.main.infoDictionary?["SUPABASE_ANON_KEY"] as? String else {
            fatalError("Missing Supabase configuration in Info.plist")
        }

        client = SupabaseClient(
            supabaseURL: url,
            supabaseKey: anonKey
        )
    }
}
```

- [ ] **Step 2: Add Supabase config to Info.plist**

In Xcode, add to Info.plist:
- Key: `SUPABASE_URL` — Value: `$(SUPABASE_URL)`
- Key: `SUPABASE_ANON_KEY` — Value: `$(SUPABASE_ANON_KEY)`

Then create an `.xcconfig` file at `NapNap/Config/Debug.xcconfig`:
```
SUPABASE_URL = https://your-project-id.supabase.co
SUPABASE_ANON_KEY = your-anon-key-here
```

In Xcode → Project → Info → Configurations → Debug → set to `Debug.xcconfig`.

Add to `.gitignore`:
```
NapNap/Config/*.xcconfig
```

Create `NapNap/Config/Debug.xcconfig.example`:
```
SUPABASE_URL = https://your-project-id.supabase.co
SUPABASE_ANON_KEY = your-anon-key-here
```

- [ ] **Step 3: Verify build**

Run: Cmd+B. Expected: Build succeeds. (App will crash on launch without real config values — that's expected.)

- [ ] **Step 4: Commit**

```bash
git add NapNap/NapNap/Services/SupabaseService.swift NapNap/Config/Debug.xcconfig.example NapNap/NapNap/Info.plist .gitignore
git commit -m "feat: add SupabaseService singleton with xcconfig-based credentials"
```

---

### Task 2.2: Auth ViewModel

**Files:**
- Create: `NapNap/NapNap/ViewModels/AuthViewModel.swift`

- [ ] **Step 1: Create AuthViewModel.swift**

```swift
import Foundation
import Supabase
import AuthenticationServices

@Observable
final class AuthViewModel {
    var isAuthenticated = false
    var isLoading = true
    var user: User?
    var errorMessage: String?

    private let supabase = SupabaseService.shared.client

    init() {
        Task { await checkSession() }
    }

    func checkSession() async {
        isLoading = true
        do {
            let session = try await supabase.auth.session
            await MainActor.run {
                self.user = session.user
                self.isAuthenticated = true
                self.isLoading = false
            }
        } catch {
            await MainActor.run {
                self.user = nil
                self.isAuthenticated = false
                self.isLoading = false
            }
        }
    }

    func signUp(email: String, password: String) async {
        errorMessage = nil
        do {
            let response = try await supabase.auth.signUp(email: email, password: password)
            await MainActor.run {
                self.user = response.user
                self.isAuthenticated = true
            }
        } catch {
            await MainActor.run {
                self.errorMessage = error.localizedDescription
            }
        }
    }

    func signIn(email: String, password: String) async {
        errorMessage = nil
        do {
            let session = try await supabase.auth.signIn(email: email, password: password)
            await MainActor.run {
                self.user = session.user
                self.isAuthenticated = true
            }
        } catch {
            await MainActor.run {
                self.errorMessage = error.localizedDescription
            }
        }
    }

    func signInWithGoogle() async {
        errorMessage = nil
        do {
            try await supabase.auth.signInWithOAuth(.google)
            await checkSession()
        } catch {
            await MainActor.run {
                self.errorMessage = error.localizedDescription
            }
        }
    }

    func resetPassword(email: String) async {
        errorMessage = nil
        do {
            try await supabase.auth.resetPasswordForEmail(email)
        } catch {
            await MainActor.run {
                self.errorMessage = error.localizedDescription
            }
        }
    }

    func signOut() async {
        do {
            try await supabase.auth.signOut()
            await MainActor.run {
                self.user = nil
                self.isAuthenticated = false
            }
        } catch {
            await MainActor.run {
                self.errorMessage = error.localizedDescription
            }
        }
    }

    func observeAuthChanges() async {
        for await (event, session) in supabase.auth.authStateChanges {
            await MainActor.run {
                switch event {
                case .signedIn:
                    self.user = session?.user
                    self.isAuthenticated = true
                case .signedOut:
                    self.user = nil
                    self.isAuthenticated = false
                default:
                    break
                }
                self.isLoading = false
            }
        }
    }
}
```

- [ ] **Step 2: Verify build**

Run: Cmd+B. Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add NapNap/NapNap/ViewModels/AuthViewModel.swift
git commit -m "feat: add AuthViewModel with sign up/in/out, Google OAuth, password reset"
```

---

### Task 2.3: Auth Views (Welcome + Login + Sign Up)

**Files:**
- Create: `NapNap/NapNap/Views/Auth/WelcomeView.swift`
- Create: `NapNap/NapNap/Views/Auth/LoginView.swift`
- Create: `NapNap/NapNap/Views/Auth/SignUpView.swift`
- Create: `NapNap/NapNap/Views/Auth/ForgotPasswordView.swift`
- Create: `NapNap/NapNap/Views/Auth/AuthContainerView.swift`

- [ ] **Step 1: Create WelcomeView.swift**

```swift
import SwiftUI

struct WelcomeView: View {
    let onGetStarted: () -> Void
    let onHaveAccount: () -> Void

    var body: some View {
        VStack(spacing: Spacing.xl) {
            Spacer()

            // Logo area
            VStack(spacing: Spacing.md) {
                Image(systemName: "moon.stars.fill")
                    .font(.system(size: 64))
                    .foregroundColor(.napColor)
                Text("NapNap")
                    .font(.displayLarge)
                    .foregroundColor(.textPrimary)
                Text("Sleep tracking that tells you what to do next")
                    .font(.bodyDefault)
                    .foregroundColor(.textSecondary)
                    .multilineTextAlignment(.center)
            }

            Spacer()

            // Actions
            VStack(spacing: Spacing.md) {
                Button("Get started") { onGetStarted() }
                    .buttonStyle(NapButtonStyle())
                    .frame(maxWidth: .infinity)

                Button("I have an account") { onHaveAccount() }
                    .buttonStyle(GhostButtonStyle())
                    .frame(maxWidth: .infinity)
            }
            .padding(.horizontal, Spacing.lg)
            .padding(.bottom, Spacing.xxl)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.bgDeep)
    }
}
```

- [ ] **Step 2: Create LoginView.swift**

```swift
import SwiftUI

struct LoginView: View {
    @Bindable var authVM: AuthViewModel
    let onForgotPassword: () -> Void
    let onSwitchToSignUp: () -> Void
    let onBack: () -> Void

    @State private var email = ""
    @State private var password = ""
    @State private var isSubmitting = false

    var body: some View {
        VStack(spacing: Spacing.lg) {
            // Header
            HStack {
                Button(action: onBack) {
                    Image(systemName: "chevron.left")
                        .foregroundColor(.textSecondary)
                }
                Spacer()
            }
            .padding(.horizontal, Spacing.md)

            Text("Welcome back")
                .font(.displayMedium)
                .foregroundColor(.textPrimary)

            // Form
            VStack(spacing: Spacing.md) {
                TextField("Email", text: $email)
                    .textFieldStyle(NapNapTextFieldStyle())
                    .textContentType(.emailAddress)
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)

                SecureField("Password", text: $password)
                    .textFieldStyle(NapNapTextFieldStyle())
                    .textContentType(.password)

                if let error = authVM.errorMessage {
                    Text(error)
                        .font(.caption)
                        .foregroundColor(.dangerColor)
                }

                Button(action: {
                    isSubmitting = true
                    Task {
                        await authVM.signIn(email: email, password: password)
                        isSubmitting = false
                    }
                }) {
                    if isSubmitting {
                        ProgressView().tint(.bgDeep)
                    } else {
                        Text("Sign in")
                    }
                }
                .buttonStyle(NapButtonStyle())
                .frame(maxWidth: .infinity)
                .disabled(email.isEmpty || password.isEmpty || isSubmitting)
                .opacity(email.isEmpty || password.isEmpty ? 0.5 : 1)

                Button("Forgot password?") { onForgotPassword() }
                    .font(.caption)
                    .foregroundColor(.napColor)
            }
            .padding(.horizontal, Spacing.lg)

            Spacer()

            // Switch to sign up
            HStack(spacing: 4) {
                Text("Don't have an account?")
                    .font(.caption)
                    .foregroundColor(.textMuted)
                Button("Sign up") { onSwitchToSignUp() }
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(.napColor)
            }
            .padding(.bottom, Spacing.lg)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.bgDeep)
    }
}

// MARK: - Text Field Style
struct NapNapTextFieldStyle: TextFieldStyle {
    func _body(configuration: TextField<Self._Label>) -> some View {
        configuration
            .font(.bodyDefault)
            .foregroundColor(.textPrimary)
            .padding(Spacing.md)
            .background(Color.bgCard)
            .clipShape(RoundedRectangle(cornerRadius: Radius.md))
            .overlay(
                RoundedRectangle(cornerRadius: Radius.md)
                    .stroke(Color.glassBorder, lineWidth: 1)
            )
    }
}
```

- [ ] **Step 3: Create SignUpView.swift**

```swift
import SwiftUI

struct SignUpView: View {
    @Bindable var authVM: AuthViewModel
    let onSwitchToLogin: () -> Void
    let onBack: () -> Void

    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var isSubmitting = false

    private var passwordsMatch: Bool { password == confirmPassword }
    private var isValid: Bool {
        !email.isEmpty && password.count >= 6 && passwordsMatch
    }

    var body: some View {
        VStack(spacing: Spacing.lg) {
            HStack {
                Button(action: onBack) {
                    Image(systemName: "chevron.left")
                        .foregroundColor(.textSecondary)
                }
                Spacer()
            }
            .padding(.horizontal, Spacing.md)

            Text("Create account")
                .font(.displayMedium)
                .foregroundColor(.textPrimary)

            VStack(spacing: Spacing.md) {
                TextField("Email", text: $email)
                    .textFieldStyle(NapNapTextFieldStyle())
                    .textContentType(.emailAddress)
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)

                SecureField("Password", text: $password)
                    .textFieldStyle(NapNapTextFieldStyle())
                    .textContentType(.newPassword)

                SecureField("Confirm password", text: $confirmPassword)
                    .textFieldStyle(NapNapTextFieldStyle())
                    .textContentType(.newPassword)

                if !confirmPassword.isEmpty && !passwordsMatch {
                    Text("Passwords don't match")
                        .font(.caption)
                        .foregroundColor(.dangerColor)
                }

                if let error = authVM.errorMessage {
                    Text(error)
                        .font(.caption)
                        .foregroundColor(.dangerColor)
                }

                Button(action: {
                    isSubmitting = true
                    Task {
                        await authVM.signUp(email: email, password: password)
                        isSubmitting = false
                    }
                }) {
                    if isSubmitting {
                        ProgressView().tint(.bgDeep)
                    } else {
                        Text("Create account")
                    }
                }
                .buttonStyle(NapButtonStyle())
                .frame(maxWidth: .infinity)
                .disabled(!isValid || isSubmitting)
                .opacity(!isValid ? 0.5 : 1)
            }
            .padding(.horizontal, Spacing.lg)

            Spacer()

            HStack(spacing: 4) {
                Text("Already have an account?")
                    .font(.caption)
                    .foregroundColor(.textMuted)
                Button("Sign in") { onSwitchToLogin() }
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(.napColor)
            }
            .padding(.bottom, Spacing.lg)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.bgDeep)
    }
}
```

- [ ] **Step 4: Create ForgotPasswordView.swift**

```swift
import SwiftUI

struct ForgotPasswordView: View {
    @Bindable var authVM: AuthViewModel
    let onBack: () -> Void

    @State private var email = ""
    @State private var isSubmitting = false
    @State private var emailSent = false

    var body: some View {
        VStack(spacing: Spacing.lg) {
            HStack {
                Button(action: onBack) {
                    Image(systemName: "chevron.left")
                        .foregroundColor(.textSecondary)
                }
                Spacer()
            }
            .padding(.horizontal, Spacing.md)

            Text("Reset password")
                .font(.displayMedium)
                .foregroundColor(.textPrimary)

            if emailSent {
                VStack(spacing: Spacing.md) {
                    Image(systemName: "envelope.fill")
                        .font(.system(size: 40))
                        .foregroundColor(.napColor)
                    Text("Check your email")
                        .font(.bodyDefault)
                        .foregroundColor(.textPrimary)
                    Text("We've sent a password reset link to \(email)")
                        .font(.caption)
                        .foregroundColor(.textSecondary)
                        .multilineTextAlignment(.center)
                    Button("Back to sign in") { onBack() }
                        .buttonStyle(GhostButtonStyle())
                }
                .padding(.horizontal, Spacing.lg)
            } else {
                VStack(spacing: Spacing.md) {
                    Text("Enter your email and we'll send you a reset link")
                        .font(.bodyDefault)
                        .foregroundColor(.textSecondary)

                    TextField("Email", text: $email)
                        .textFieldStyle(NapNapTextFieldStyle())
                        .textContentType(.emailAddress)
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)

                    if let error = authVM.errorMessage {
                        Text(error)
                            .font(.caption)
                            .foregroundColor(.dangerColor)
                    }

                    Button(action: {
                        isSubmitting = true
                        Task {
                            await authVM.resetPassword(email: email)
                            isSubmitting = false
                            if authVM.errorMessage == nil { emailSent = true }
                        }
                    }) {
                        if isSubmitting {
                            ProgressView().tint(.bgDeep)
                        } else {
                            Text("Send reset link")
                        }
                    }
                    .buttonStyle(NapButtonStyle())
                    .frame(maxWidth: .infinity)
                    .disabled(email.isEmpty || isSubmitting)
                    .opacity(email.isEmpty ? 0.5 : 1)
                }
                .padding(.horizontal, Spacing.lg)
            }

            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.bgDeep)
    }
}
```

- [ ] **Step 5: Create AuthContainerView.swift**

```swift
import SwiftUI

struct AuthContainerView: View {
    @Bindable var authVM: AuthViewModel

    enum AuthScreen {
        case welcome
        case login
        case signUp
        case forgotPassword
    }

    @State private var currentScreen: AuthScreen = .welcome

    var body: some View {
        Group {
            switch currentScreen {
            case .welcome:
                WelcomeView(
                    onGetStarted: { currentScreen = .signUp },
                    onHaveAccount: { currentScreen = .login }
                )
            case .login:
                LoginView(
                    authVM: authVM,
                    onForgotPassword: { currentScreen = .forgotPassword },
                    onSwitchToSignUp: { currentScreen = .signUp },
                    onBack: { currentScreen = .welcome }
                )
            case .signUp:
                SignUpView(
                    authVM: authVM,
                    onSwitchToLogin: { currentScreen = .login },
                    onBack: { currentScreen = .welcome }
                )
            case .forgotPassword:
                ForgotPasswordView(
                    authVM: authVM,
                    onBack: { currentScreen = .login }
                )
            }
        }
        .animation(.easeInOut(duration: 0.3), value: currentScreen)
    }
}
```

- [ ] **Step 6: Wire auth into NapNapApp.swift**

Update `NapNapApp.swift`:

```swift
import SwiftUI

@main
struct NapNapApp: App {
    @State private var authVM = AuthViewModel()

    var body: some Scene {
        WindowGroup {
            Group {
                if authVM.isLoading {
                    LoadingView()
                } else if authVM.isAuthenticated {
                    MainTabView()
                } else {
                    AuthContainerView(authVM: authVM)
                }
            }
            .preferredColorScheme(.dark)
            .task { await authVM.observeAuthChanges() }
        }
    }
}

// Temporary loading view
struct LoadingView: View {
    var body: some View {
        ZStack {
            Color.bgDeep.ignoresSafeArea()
            VStack(spacing: Spacing.md) {
                Image(systemName: "moon.fill")
                    .font(.system(size: 48))
                    .foregroundColor(.nightColor)
                ProgressView()
                    .tint(.textMuted)
            }
        }
    }
}
```

- [ ] **Step 7: Run and verify auth flow**

Run: Cmd+R. Expected:
1. Loading screen with moon appears briefly
2. Welcome view shows (not authenticated)
3. Tapping "I have an account" goes to login
4. Tapping "Get started" goes to sign up
5. Back buttons work

- [ ] **Step 8: Commit**

```bash
git add NapNap/NapNap/Views/Auth/ NapNap/NapNap/App/NapNapApp.swift
git commit -m "feat: add auth flow (welcome, login, sign up, forgot password)"
```

---

## Phase 3: Today View + Sleep Logging (Core Loop)

### Task 3.1: Sleep ViewModel

**Files:**
- Create: `NapNap/NapNap/ViewModels/SleepViewModel.swift`
- Create: `NapNap/NapNap/Extensions/Date+Helpers.swift`

- [ ] **Step 1: Create Date+Helpers.swift**

```swift
import Foundation

extension Date {
    /// Format as "HH:mm"
    var timeString: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm"
        return formatter.string(from: self)
    }

    /// Format as "yyyy-MM-dd"
    var dateString: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: self)
    }

    /// Minutes since another date
    func minutesSince(_ other: Date) -> Int {
        Int(timeIntervalSince(other) / 60)
    }

    /// Start of day in local timezone
    var startOfDay: Date {
        Calendar.current.startOfDay(for: self)
    }

    /// Whether this date is today
    var isToday: Bool {
        Calendar.current.isDateInToday(self)
    }

    /// Format duration from minutes: "1h 23m" or "45m"
    static func formatDuration(minutes: Int) -> String {
        let hours = minutes / 60
        let mins = minutes % 60
        if hours > 0 {
            return mins > 0 ? "\(hours)h \(mins)m" : "\(hours)h"
        }
        return "\(mins)m"
    }

    /// Format relative time: "5m ago", "1h 20m ago", "Yesterday", etc.
    func relativeString() -> String {
        let minutes = Date().minutesSince(self)
        if minutes < 1 { return "Just now" }
        if minutes < 60 { return "\(minutes)m ago" }
        let hours = minutes / 60
        let remainingMins = minutes % 60
        if hours < 24 {
            return remainingMins > 0 ? "\(hours)h \(remainingMins)m ago" : "\(hours)h ago"
        }
        return "Yesterday"
    }
}
```

- [ ] **Step 2: Create SleepViewModel.swift**

```swift
import Foundation
import Supabase

@Observable
final class SleepViewModel {
    var entries: [SleepEntry] = []
    var isLoading = false
    var error: String?

    private let supabase = SupabaseService.shared.client

    /// Currently active sleep entry (no end time)
    var activeSleep: SleepEntry? {
        entries.first { $0.isActive }
    }

    /// Most recent completed entry
    var lastCompletedSleep: SleepEntry? {
        entries.first { !$0.isActive }
    }

    /// Minutes awake since last completed entry
    var awakeMinutes: Int? {
        guard let last = lastCompletedSleep, let endTime = last.endTime else { return nil }
        return Date().minutesSince(endTime)
    }

    /// Entries for a specific date
    func entriesForDate(_ dateString: String) -> [SleepEntry] {
        entries.filter { $0.date == dateString }
    }

    /// Today's entries
    var todayEntries: [SleepEntry] {
        entriesForDate(Date().dateString)
    }

    // MARK: - CRUD

    func fetchEntries() async {
        isLoading = true
        error = nil
        do {
            let userId = try await supabase.auth.session.user.id.uuidString

            // Fetch entries
            let dbEntries: [SleepEntry] = try await supabase
                .from("sleep_entries")
                .select()
                .eq("user_id", value: userId)
                .order("start_time", ascending: false)
                .execute()
                .value

            // Fetch all pauses for these entries
            let entryIds = dbEntries.map { $0.id }
            if !entryIds.isEmpty {
                let pauses: [SleepPause] = try await supabase
                    .from("sleep_pauses")
                    .select()
                    .in("sleep_entry_id", values: entryIds)
                    .execute()
                    .value

                // Merge pauses into entries
                let pausesByEntry = Dictionary(grouping: pauses, by: { $0.sleepEntryId })
                var mergedEntries = dbEntries
                for i in mergedEntries.indices {
                    mergedEntries[i].pauses = pausesByEntry[mergedEntries[i].id] ?? []
                }
                await MainActor.run { self.entries = mergedEntries }
            } else {
                await MainActor.run { self.entries = dbEntries }
            }
        } catch {
            await MainActor.run { self.error = error.localizedDescription }
        }
        await MainActor.run { self.isLoading = false }
    }

    func addEntry(startTime: Date, endTime: Date?, type: SleepType, notes: String? = nil) async {
        error = nil
        do {
            let userId = try await supabase.auth.session.user.id.uuidString

            struct InsertData: Encodable {
                let user_id: String
                let start_time: Date
                let end_time: Date?
                let type: String
                let notes: String?
            }

            let data = InsertData(
                user_id: userId,
                start_time: startTime,
                end_time: endTime,
                type: type.rawValue,
                notes: notes
            )

            try await supabase
                .from("sleep_entries")
                .insert(data)
                .execute()

            await fetchEntries()
        } catch {
            await MainActor.run { self.error = error.localizedDescription }
        }
    }

    func endSleep(entryId: String, at time: Date = Date()) async {
        error = nil
        do {
            struct UpdateData: Encodable {
                let end_time: Date
            }

            try await supabase
                .from("sleep_entries")
                .update(UpdateData(end_time: time))
                .eq("id", value: entryId)
                .execute()

            await fetchEntries()
        } catch {
            await MainActor.run { self.error = error.localizedDescription }
        }
    }

    func deleteEntry(entryId: String) async {
        error = nil
        do {
            try await supabase
                .from("sleep_entries")
                .delete()
                .eq("id", value: entryId)
                .execute()

            await fetchEntries()
        } catch {
            await MainActor.run { self.error = error.localizedDescription }
        }
    }
}
```

- [ ] **Step 3: Verify build**

Run: Cmd+B. Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add NapNap/NapNap/ViewModels/SleepViewModel.swift NapNap/NapNap/Extensions/Date+Helpers.swift
git commit -m "feat: add SleepViewModel with CRUD operations and Date helpers"
```

---

### Task 3.2: Today View (Basic)

**Files:**
- Create: `NapNap/NapNap/Views/Today/TodayView.swift`
- Create: `NapNap/NapNap/Views/Today/HeroCardView.swift`
- Create: `NapNap/NapNap/Views/Today/TimelineCardView.swift`

- [ ] **Step 1: Create TimelineCardView.swift**

```swift
import SwiftUI

struct TimelineCardView: View {
    let entry: SleepEntry
    let onTap: () -> Void

    private var typeColor: Color {
        entry.type == .nap ? .napColor : .nightColor
    }

    private var typeIcon: String {
        entry.type == .nap ? "cloud.fill" : "moon.fill"
    }

    private var typeLabel: String {
        entry.type == .nap ? "Nap" : "Night sleep"
    }

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: Spacing.md) {
                // Type indicator
                Circle()
                    .fill(typeColor.opacity(0.2))
                    .frame(width: 40, height: 40)
                    .overlay(
                        Image(systemName: typeIcon)
                            .font(.system(size: 16))
                            .foregroundColor(typeColor)
                    )

                // Info
                VStack(alignment: .leading, spacing: 2) {
                    Text(typeLabel)
                        .font(.bodyDefault)
                        .foregroundColor(.textPrimary)
                    Text("\(entry.startTime.timeString) – \(entry.endTime?.timeString ?? "...")")
                        .font(.caption)
                        .foregroundColor(.textMuted)
                }

                Spacer()

                // Duration
                if entry.isActive {
                    Text("Sleeping...")
                        .font(.caption)
                        .foregroundColor(typeColor)
                } else {
                    Text(Date.formatDuration(minutes: entry.netSleepMinutes))
                        .font(.bodyDefault)
                        .fontWeight(.semibold)
                        .foregroundColor(typeColor)
                }
            }
            .padding(Spacing.md)
            .cardStyle()
        }
        .buttonStyle(.plain)
    }
}
```

- [ ] **Step 2: Create HeroCardView.swift**

```swift
import SwiftUI

struct HeroCardView: View {
    let activeSleep: SleepEntry?
    let awakeMinutes: Int?
    let onStopSleep: () -> Void

    @State private var now = Date()
    private let timer = Timer.publish(every: 60, on: .main, in: .common).autoconnect()

    var body: some View {
        VStack(spacing: Spacing.md) {
            if let active = activeSleep {
                // Active sleep state
                VStack(spacing: Spacing.sm) {
                    Image(systemName: active.type == .nap ? "cloud.fill" : "moon.fill")
                        .font(.system(size: 32))
                        .foregroundColor(active.type == .nap ? .napColor : .nightColor)

                    Text(active.type == .nap ? "Napping" : "Sleeping")
                        .font(.displaySmall)
                        .foregroundColor(.textPrimary)

                    Text(Date.formatDuration(minutes: now.minutesSince(active.startTime)))
                        .font(.displayLarge)
                        .foregroundColor(active.type == .nap ? .napColor : .nightColor)
                        .fontDesign(.monospaced)

                    Text("Started at \(active.startTime.timeString)")
                        .font(.caption)
                        .foregroundColor(.textMuted)
                }

                Button("Stop", action: onStopSleep)
                    .buttonStyle(active.type == .nap ? NapButtonStyle() : NightButtonStyle())

            } else if let awake = awakeMinutes {
                // Awake state
                VStack(spacing: Spacing.sm) {
                    Image(systemName: "sun.max.fill")
                        .font(.system(size: 32))
                        .foregroundColor(.wakeColor)

                    Text("Awake")
                        .font(.displaySmall)
                        .foregroundColor(.textPrimary)

                    Text(Date.formatDuration(minutes: awake))
                        .font(.displayLarge)
                        .foregroundColor(.wakeColor)
                        .fontDesign(.monospaced)
                }
            } else {
                // Empty state
                VStack(spacing: Spacing.sm) {
                    Image(systemName: "sun.max.fill")
                        .font(.system(size: 32))
                        .foregroundColor(.wakeColor)

                    Text("Good morning!")
                        .font(.displaySmall)
                        .foregroundColor(.textPrimary)

                    Text("Tap + to start tracking")
                        .font(.bodyDefault)
                        .foregroundColor(.textMuted)
                }
            }
        }
        .padding(Spacing.xl)
        .frame(maxWidth: .infinity)
        .background(Color.bgCard)
        .clipShape(RoundedRectangle(cornerRadius: Radius.xl))
        .onReceive(timer) { _ in now = Date() }
    }
}
```

- [ ] **Step 3: Create TodayView.swift**

```swift
import SwiftUI

struct TodayView: View {
    @Bindable var sleepVM: SleepViewModel
    let onEditEntry: (SleepEntry) -> Void
    let onStopSleep: () -> Void

    @State private var now = Date()
    private let timer = Timer.publish(every: 60, on: .main, in: .common).autoconnect()

    var body: some View {
        ScrollView {
            VStack(spacing: Spacing.lg) {
                // Hero card
                HeroCardView(
                    activeSleep: sleepVM.activeSleep,
                    awakeMinutes: sleepVM.awakeMinutes,
                    onStopSleep: onStopSleep
                )

                // Timeline
                if !sleepVM.todayEntries.isEmpty {
                    VStack(alignment: .leading, spacing: Spacing.sm) {
                        Text("Today")
                            .font(.displaySmall)
                            .foregroundColor(.textPrimary)
                            .padding(.horizontal, Spacing.sm)

                        ForEach(sleepVM.todayEntries) { entry in
                            TimelineCardView(entry: entry) {
                                onEditEntry(entry)
                            }
                        }
                    }
                }
            }
            .padding(Spacing.md)
            .padding(.bottom, 100) // Tab bar clearance
        }
        .refreshable { await sleepVM.fetchEntries() }
        .onReceive(timer) { _ in now = Date() }
    }
}
```

- [ ] **Step 4: Commit**

```bash
git add NapNap/NapNap/Views/Today/
git commit -m "feat: add TodayView with hero card and timeline"
```

---

### Task 3.3: Quick Action Sheet

**Files:**
- Create: `NapNap/NapNap/Views/Shared/QuickActionSheet.swift`

- [ ] **Step 1: Create QuickActionSheet.swift**

```swift
import SwiftUI

struct QuickActionSheet: View {
    let hasActiveSleep: Bool
    let hasNightEntry: Bool
    let onWakeUp: () -> Void
    let onNap: () -> Void
    let onBedtime: () -> Void
    let onNightWaking: () -> Void
    let onEndSleep: () -> Void

    var body: some View {
        VStack(spacing: Spacing.lg) {
            // Drag handle
            RoundedRectangle(cornerRadius: 2)
                .fill(Color.textMuted.opacity(0.3))
                .frame(width: 36, height: 4)
                .padding(.top, Spacing.sm)

            if hasActiveSleep {
                // Single wake-up button when sleep is active
                actionButton(
                    icon: "sun.max.fill",
                    label: "Wake Up",
                    color: .wakeColor,
                    action: onEndSleep
                )
            } else {
                // 3-column grid
                HStack(spacing: Spacing.md) {
                    actionButton(icon: "sun.max.fill", label: "Wake Up", color: .wakeColor, action: onWakeUp)
                    actionButton(icon: "cloud.fill", label: "Nap", color: .napColor, action: onNap)
                    actionButton(icon: "moon.fill", label: "Bedtime", color: .nightColor, action: onBedtime)
                }

                // Night waking row (only if bedtime exists)
                if hasNightEntry {
                    actionButton(
                        icon: "cloud.bolt.fill",
                        label: "Night waking",
                        color: .wakeColor,
                        action: onNightWaking
                    )
                }
            }
        }
        .padding(.horizontal, Spacing.lg)
        .padding(.bottom, Spacing.xxl)
        .frame(maxWidth: .infinity)
        .background(Color.bgCard)
        .clipShape(
            RoundedRectangle(cornerRadius: Radius.xl)
        )
    }

    private func actionButton(icon: String, label: String, color: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(spacing: Spacing.sm) {
                Circle()
                    .fill(color.opacity(0.15))
                    .frame(width: 56, height: 56)
                    .overlay(
                        Image(systemName: icon)
                            .font(.system(size: 24))
                            .foregroundColor(color)
                    )
                Text(label)
                    .font(.caption)
                    .foregroundColor(.textSecondary)
            }
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(.plain)
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add NapNap/NapNap/Views/Shared/QuickActionSheet.swift
git commit -m "feat: add QuickActionSheet with action grid"
```

---

### Task 3.4: Wire Core Loop into MainTabView

**Files:**
- Modify: `NapNap/NapNap/App/MainTabView.swift`
- Modify: `NapNap/NapNap/App/NapNapApp.swift`

- [ ] **Step 1: Update MainTabView to use real TodayView**

Replace the `MainTabView` content with real view wiring:

```swift
import SwiftUI

struct MainTabView: View {
    @State var sleepVM = SleepViewModel()
    @State private var selectedTab: Tab = .today
    @State private var showActionSheet = false
    @State private var editingEntry: SleepEntry?

    enum Tab: String {
        case today, history, stats, profile
    }

    var body: some View {
        ZStack(alignment: .bottom) {
            // Content
            Group {
                switch selectedTab {
                case .today:
                    TodayView(
                        sleepVM: sleepVM,
                        onEditEntry: { entry in editingEntry = entry },
                        onStopSleep: { handleStopSleep() }
                    )
                case .history:
                    PlaceholderView(title: "Sleep Log", icon: "list.bullet", color: .napColor)
                case .stats:
                    PlaceholderView(title: "Stats", icon: "chart.bar.fill", color: .nightColor)
                case .profile:
                    PlaceholderView(title: "Profile", icon: "person.fill", color: .textSecondary)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)

            // Tab bar
            HStack(spacing: 0) {
                tabButton(.today, icon: "sun.max.fill", label: "Today")
                tabButton(.history, icon: "list.bullet", label: "Log")
                Button(action: { showActionSheet = true }) {
                    Image(systemName: "plus")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.bgDeep)
                        .frame(width: 56, height: 56)
                        .background(Color.napColor)
                        .clipShape(Circle())
                        .shadow(color: Color.napColor.opacity(0.3), radius: 8, y: 4)
                }
                .offset(y: -12)
                tabButton(.stats, icon: "chart.bar.fill", label: "Stats")
                tabButton(.profile, icon: "person.fill", label: "Profile")
            }
            .padding(.horizontal, Spacing.md)
            .padding(.top, Spacing.sm)
            .padding(.bottom, Spacing.xl)
            .background(
                Color.bgCard
                    .clipShape(RoundedRectangle(cornerRadius: Radius.xl))
                    .shadow(color: .black.opacity(0.3), radius: 16, y: -4)
            )
        }
        .background(Color.bgDeep)
        .ignoresSafeArea(edges: .bottom)
        .sheet(isPresented: $showActionSheet) {
            QuickActionSheet(
                hasActiveSleep: sleepVM.activeSleep != nil,
                hasNightEntry: sleepVM.todayEntries.contains { $0.type == .night },
                onWakeUp: { showActionSheet = false },
                onNap: {
                    showActionSheet = false
                    Task { await sleepVM.addEntry(startTime: Date(), endTime: nil, type: .nap) }
                },
                onBedtime: {
                    showActionSheet = false
                    Task { await sleepVM.addEntry(startTime: Date(), endTime: nil, type: .night) }
                },
                onNightWaking: { showActionSheet = false },
                onEndSleep: {
                    showActionSheet = false
                    handleStopSleep()
                }
            )
            .presentationDetents([.medium])
            .presentationDragIndicator(.hidden)
            .presentationBackground(Color.bgCard)
        }
        .task { await sleepVM.fetchEntries() }
    }

    private func handleStopSleep() {
        guard let active = sleepVM.activeSleep else { return }
        Task { await sleepVM.endSleep(entryId: active.id) }
    }

    private func tabButton(_ tab: Tab, icon: String, label: String) -> some View {
        Button(action: { selectedTab = tab }) {
            VStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.system(size: 20))
                Text(label)
                    .font(.label)
            }
            .foregroundColor(selectedTab == tab ? .napColor : .textMuted)
            .frame(maxWidth: .infinity)
        }
    }
}
```

- [ ] **Step 2: Run and verify core loop**

Run: Cmd+R (with real Supabase credentials in Debug.xcconfig).
Expected:
1. App loads, shows Today view
2. Tapping FAB (+) opens action sheet
3. Tapping "Nap" starts a nap → hero card shows "Napping" with timer
4. Tapping "Stop" on hero card ends the nap → timeline shows completed entry
5. Pull-to-refresh reloads entries

- [ ] **Step 3: Commit**

```bash
git add NapNap/NapNap/App/MainTabView.swift
git commit -m "feat: wire core sleep loop (start nap → timer → stop → timeline)"
```

---

## Phase 4–12: Remaining Phases

Due to the scale of this project, the remaining phases follow the same pattern. Each is a self-contained milestone:

### Phase 4: Sleep Log + Day Navigator
- **Task 4.1:** `SleepLogView` — `List` with `ForEach`, `.swipeActions` for edit/delete
- **Task 4.2:** `DayNavigatorView` — horizontal week strip with `ScrollView(.horizontal)`, dot indicators for days with entries
- **Task 4.3:** `DailySummaryView` — aggregate stats card (total nap/night, net sleep, wakings)
- **Task 4.4:** Wire into History tab in `MainTabView`

### Phase 5: Sleep Entry Sheet (Full)
- **Task 5.1:** `SleepEntrySheet` — full form with time pickers, type selection, validation
- **Task 5.2:** Pause management — add/edit/delete pauses within sheet
- **Task 5.3:** Qualitative tags — onset chips, sleep method chips, wake mood, notes
- **Task 5.4:** Validation — cross-midnight, max duration, collision detection
- **Task 5.5:** Wire edit flow from timeline cards and swipe actions

### Phase 6: Prediction Engine
- **Task 6.1:** Port `SLEEP_DEVELOPMENT_MAP` — all 10 age ranges with configs
- **Task 6.2:** Port `getSleepConfigForAge`, `getRecommendedSchedule`, `getAgeReferenceData`
- **Task 6.3:** Port `calculateSuggestedNapTimeWithMetadata` — weighted blending, calibration
- **Task 6.4:** Port `simulateDay` + `calculateAllNapWindows` — full day simulation
- **Task 6.5:** Port `calculateDynamicBedtime` — sleep debt + wake excess adjustment
- **Task 6.6:** Port `extractWakeWindowsFromEntries` — historical wake window extraction
- **Task 6.7:** Integrate predictions into `TodayView` — ghost cards, bedtime display, confidence
- **Task 6.8:** Unit tests for prediction engine (port existing `dateUtils.test.ts`)

### Phase 7: Stats + Reports
- **Task 7.1:** `StatsView` — section chips, date range picker, Swift Charts bar/area charts
- **Task 7.2:** Sleep summary cards — total, average, distribution
- **Task 7.3:** Nap/Night section charts — section-specific visualizations
- **Task 7.4:** Growth charts — weight/height area charts with adaptive Y-axis
- **Task 7.5:** `SleepReportView` — narrative 30-day report with icon bullets
- **Task 7.6:** Port `reportData.ts` (getReportData, tip pool)

### Phase 8: Profile + Baby Management
- **Task 8.1:** `ProfileViewModel` — baby CRUD, avatar upload, locale sync
- **Task 8.2:** `ProfileMenuView` — greeting, nav list, pending invite dot
- **Task 8.3:** `MyBabiesView` — baby cards, invite cards, add-baby ghost card
- **Task 8.4:** `BabyDetailView` — edit form with `NavigationStack` push
- **Task 8.5:** `BabyAvatarPicker` — `PhotosPicker` + image compression
- **Task 8.6:** `ShareAccessView` + `ShareViewModel` — invite/manage/revoke
- **Task 8.7:** `MeasuresView` + `MeasureLogSheet` + `GrowthViewModel`
- **Task 8.8:** `AccountSettingsView` — language picker, sign out, delete account
- **Task 8.9:** `SupportView` + subviews (About, FAQs, Contact, Privacy, Terms)
- **Task 8.10:** Onboarding flow — `OnboardingView` (6-step: welcome → baby name → DOB → your name → role → account)

### Phase 9: Live Activities + Dynamic Island
- **Task 9.1:** Create Widget Extension target — `NapNapLive`
- **Task 9.2:** Configure App Group — `group.com.napnap.shared`
- **Task 9.3:** `NapActivityAttributes` — data model for Live Activity
- **Task 9.4:** `NapLiveActivity` — lock screen layout (timer + Stop + Pause buttons)
- **Task 9.5:** `NapDynamicIsland` — compact (dot + time) + expanded (name + timer + Stop)
- **Task 9.6:** `LiveActivityService` — start/update/stop activities
- **Task 9.7:** App Group read/write — shared state between app + extension
- **Task 9.8:** Wire into sleep start/stop flow — start activity on nap, end on stop
- **Task 9.9:** Handle "stopped from Live Activity" — App Group observer, sync to Supabase on next launch

### Phase 10: Push Notifications
- **Task 10.1:** `NotificationService` — request permission, schedule/cancel
- **Task 10.2:** Schedule nap reminders — 10 min before predicted nap window
- **Task 10.3:** Schedule bedtime reminder — 15 min before predicted bedtime
- **Task 10.4:** Actionable buttons — "Start Nap" / "Snooze 15m" categories
- **Task 10.5:** Handle notification actions — deep link to quick action sheet
- **Task 10.6:** Reschedule on sleep events — update notifications when entries change

### Phase 11: Home Screen Widgets
- **Task 11.1:** Create Widget Extension target — `NapNapWidgets`
- **Task 11.2:** `WidgetDataProvider` — read from App Group, timeline generation
- **Task 11.3:** `SmallWidget` — next nap time + "in X min" countdown
- **Task 11.4:** `MediumWidget` — next nap + bedtime + daily total
- **Task 11.5:** Widget deep links — tap opens specific app view
- **Task 11.6:** Trigger widget refresh from main app on sleep events

### Phase 12: Haptics + Polish + Localization
- **Task 12.1:** Haptic feedback service — feedback generators for each action type
- **Task 12.2:** Wire haptics — start/stop/delete/scroll actions
- **Task 12.3:** `SkyBackgroundView` — SwiftUI `Canvas` with stars/sun/clouds animation
- **Task 12.4:** `ThemeManager` — circadian color switching (night/morning/afternoon)
- **Task 12.5:** Localization — populate String Catalog with en/es/ca translations
- **Task 12.6:** App icon + launch screen
- **Task 12.7:** Final QA — test all flows on real device, fix edge cases
- **Task 12.8:** App Store preparation — screenshots, description, metadata
