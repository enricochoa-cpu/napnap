# Napper onboarding flow (reference)

Analysis of Napper's onboarding: screens are named, categorized, and mapped to the data they collect. This flow runs **before login/registration**; see "Strategy: saving data before login" below.

---

## Strategy: saving data before login

**How can we save baby/user/team info before the user has an account?**

1. **Temporary local storage**  
   Store all onboarding inputs in `localStorage` (e.g. via `useLocalStorage` / `src/utils/storage.ts`) as the user moves through the flow. Progress survives app close/refresh.

2. **Account creation after "Build your team"**  
   Once the user finishes family setup (and any education/paywall steps), prompt **Create account / Sign in** (Apple, Google, or email). No account is required to complete the onboarding steps.

3. **Persistence on first login/signup**  
   When the user signs up or logs in:
   - Read the stored onboarding payload from `localStorage`.
   - Create/update **Supabase** records: `BabyProfile`, `UserProfile`, and if applicable `BabyShare` (other parent/caregiver).
   - Link everything to the new or existing `auth.users` id.
   - Clear or mark as "synced" the temporary onboarding data.

**Why this order:**  
Napper uses onboarding as a "trust ritual": value (benefits + education) and personalization (baby + you + team) first, then account creation. Data is "for the login" only in the sense that it is **attached to the account once it exists**; it is not required to create the account.

---

## Categories (high level)

| Category | Purpose |
|----------|--------|
| **Entry & value** | First screens: app purpose, benefits, acquisition, goals. |
| **Education / trust** | Sleep science and "three problems + solution" before or around data collection. |
| **Build your team (family)** | Baby profile → your profile → other caregivers. |
| **Processing & account** | "Crunching data" and then sign up / sign in. |

---

## Screen index (by image file)

| # | Image | Screen name | Category | Info collected |
|---|--------|-------------|----------|----------------|
| 1 | IMG_6850 | Welcome / Entry | Entry & value | — |
| 2 | IMG_6851 | Benefits intro | Entry & value | — |
| 3 | IMG_6852 | How did you find us? | Entry & value | Acquisition channel |
| 4 | IMG_6854 | What are your goals? | Entry & value | Goals (multi-select, optional) |
| 5 | IMG_6855 | Let's build your team! | Build your team | — |
| 6 | IMG_6856 | Baby date of birth | Build your team → Baby | DOB |
| 7 | IMG_6857 | Baby's name | Build your team → Baby | Baby name |
| 8 | IMG_6858 | First-born? | Build your team → Baby/User | Is this your first-born (Yes/No) |
| 9 | IMG_6859 | Baby photo | Build your team → Baby | Baby avatar/photo |
| 10 | IMG_6860 | Baby profile confirmation | Build your team → Baby | Review + optional: gender, nursing, height, weight |
| 11 | IMG_6861 | Your name | Build your team → User | User name |
| 12 | IMG_6862 | Your age range | Build your team → User | Age range (18–24, 25–34, 35–44, 45+) |
| 13 | IMG_6863 | Your relationship to baby | Build your team → User | Mom / Dad / Other |
| 14 | IMG_6864 | Other family members? | Build your team → Group | Yes/No |
| 15 | IMG_6865 | Other member's name | Build your team → Group | Other parent/caregiver name |
| 16 | IMG_6866 | Team celebration | Build your team | — |
| 17 | IMG_6867 | Crunching your data | Processing & account | — |
| 18 | IMG_6868 | Sleep science intro | Education / trust | — |
| 19 | IMG_6869 | Problem #1: Circadian rhythm | Education / trust | — |
| 20 | IMG_6870 / 6871 | Problem #2: Sleep pressure | Education / trust | — |
| 21 | IMG_6872 | Problem #3: Ever-changing needs | Education / trust | — |
| 22 | IMG_6873 | The solution | Education / trust | — |
| 23 | IMG_6874 | Account creation / Sign in | Processing & account | Consent (terms/privacy), auth method |

*Exact order of "Education" vs "Build your team" may differ in the real app; the table reflects the set of steps.*

---

## Screen details

### Entry & value

- **Welcome / Entry (IMG_6850)**  
  First screen: logo, tagline ("The fastest way to a happy sleeping baby"), sleeping cloud.  
  CTAs: "Create a new baby profile", "I have an invite", "Already have an account? Sign in".  
  *Info:* None.

- **Benefits intro (IMG_6851)**  
  "Hi there! Napper is here to help. But how?"  
  Three benefit cards: better mood/mental health, more sleep/energy, more downtime to recharge.  
  CTA: "Let's go!"  
  *Info:* None.

- **How did you find us? (IMG_6852)**  
  Single choice: TikTok, Online forum/parenting group, Recommendation from a friend, App Store search/recommendation, Influencer recommendation, Google search, Instagram/Facebook, Other.  
  CTA: "Next".  
  *Info:* Acquisition channel (marketing/analytics).

- **What are your goals? (IMG_6854)**  
  Multi-select: Fewer night wakings, Avoid overtired baby, Less brain strain, Healthy sleep routine, Sleep through the night, More energy during the day, Faster/easier bedtime, Longer nap, etc.  
  CTA: "Next"; "Skip for now".  
  *Info:* User goals (optional).

---

### Build your team (family)

**Intro**

- **Let's build your team! (IMG_6855)**  
  "We're so happy you're here! Your customized sleep plan will be ready in just a few short moments…"  
  Two mascots (purple + yellow). CTA: "Next".  
  *Info:* None.

**Baby**

- **Baby date of birth (IMG_6856)**  
  "When was your baby born?" Subtitle: "We need this to do sleep calculations."  
  Date picker (e.g. "February 12 2026"), option "My baby is not born yet". CTA: "Next".  
  *Info:* Baby DOB.

- **Baby's name (IMG_6857)**  
  "What's your baby's name?"  
  Text field "Name". CTA: "Next".  
  *Info:* Baby name.

- **First-born? (IMG_6858)**  
  "Is [Baby name] your first-born?" (e.g. "Is Enric your first-born?").  
  Buttons: "Yes", "No". CTA: "Next".  
  *Info:* First-born (boolean). Used for tone and possibly defaults.

- **Baby photo (IMG_6859)**  
  "How about a snap of [Baby name]?"  
  Circular avatar with default illustration + "+" to add photo. CTA: "Next".  
  *Info:* Baby avatar/photo (optional).

- **Baby profile confirmation (IMG_6860)**  
  "Is this correct? More info means better predictions!"  
  Shown: Name, Birthday (editable). Optional add: Gender, Nursing, Height, Weight.  
  CTA: "Next".  
  *Info:* Confirmation + optional gender, nursing, height, weight.

**User (primary caregiver)**

- **Your name (IMG_6861)**  
  "And what's YOUR name?"  
  Text field "Name". CTA: "Next".  
  *Info:* User name.

- **Your age range (IMG_6862)**  
  "Hi [Name]! And how old are you?"  
  Buttons: 18–24, 25–34, 35–44, 45+. CTA: "Next".  
  *Info:* User age range.

- **Your relationship to baby (IMG_6863)**  
  "All right [Name], and who are you to [Baby name]?"  
  Buttons: Mom, Dad, Other. CTA: "Next".  
  *Info:* Relationship/role (maps to `userRole`).

**Group (other caregivers)**

- **Other family members? (IMG_6864)**  
  "Are there any other family members?" "(you can change this later)"  
  Buttons: "Yes", "No". CTA: "Next".  
  *Info:* Whether to add another member (boolean).

- **Other member's name (IMG_6865)**  
  Shown if user chose "Yes" above. "Wonderful! What's their name?"  
  Text field "Name". Three characters (two adults + baby). CTA: "Next".  
  *Info:* Other parent/caregiver name (for invite/sharing later).

- **Team celebration (IMG_6866)**  
  "Omg! What. A. Team!"  
  "And we're your biggest fans! We'll be with you every step of the way…"  
  CTA: "Next".  
  *Info:* None.

---

### Processing & account

- **Crunching your data (IMG_6867)**  
  Loading: "Crunching your data" + spinner/icon.  
  Shown after family setup, before account screen.  
  *Info:* None (good moment to validate/prepare payload for later persistence).

- **Account creation / Sign in (IMG_6874)**  
  Social proof: "1+ million successful families", 5 stars, "30,000+ five star reviews", App Store badges.  
  Checkbox: "I agree to Napper's terms and conditions and privacy policy."  
  CTAs: "Continue with Apple", "Continue with Google", "Continue with email".  
  *Info:* Consent (terms + privacy); chosen auth method. No baby/user/team fields here—those are already in local storage and will be sent after auth.

---

### Education / trust

- **Sleep science intro (IMG_6868)**  
  "Algorithms + sleep research = true".  
  Short copy on baby sleep, physiology, and "three key issues". CTA: "Next".  
  *Info:* None.

- **Problem #1: Circadian rhythm (IMG_6869)**  
  "A circadian rhythm in the making."  
  Circular diagram (noon/midnight, "Sharpest rise in blood pressure").  
  Copy on 8–12 weeks and stabilizing. CTA: "Next".  
  *Info:* None.

- **Problem #2: Sleep pressure (IMG_6870 / 6871)**  
  "Sleep pressure" graph (build-up and release).  
  Toggle "Enric" / "You" (baby vs caregiver context).  
  "Different sleep pressure" + sleep-wake homeostasis copy. CTA: "Next".  
  *Info:* None.

- **Problem #3: Ever-changing needs (IMG_6872)**  
  Bar chart: sleep hours by age (1 week → 2 years).  
  "Ever-changing needs" + copy on sleep leaps. CTA: "Next".  
  *Info:* None.

- **The solution (IMG_6873)**  
  "The solution" + three Napper pillars: natural rhythm, internal battery, grows with your child.  
  CTA: "Next".  
  *Info:* None.

---

## Data mapping to our types

| Napper step | Our type / table | Fields |
|-------------|-------------------|--------|
| Baby DOB, name, photo, confirmation | `BabyProfile` | `dateOfBirth`, `name`, `avatarUrl`, `gender`, `weight`, `height`; nursing could be a separate field or note |
| Your name, age range, relationship | `UserProfile` | `userName`, age range (we may add), `userRole` (dad/mum/other) |
| First-born? | User preference / profile | e.g. `isFirstBorn` or used only for copy/defaults |
| Other family member name | `BabyShare` + invite | Display name; invite uses email later in flow |
| How did you find us? / Goals? | Optional analytics / user preferences | Store in profile or analytics only |

---

## Images

Reference filenames in this folder:  
`IMG_6850.PNG` … `IMG_6874.PNG` (see Screen index table above).

---

## Implementation notes (Baby Sleep Tracker)

We built a **shorter** flow inspired by Napper (see [onboarding-plan.md](onboarding-plan.md)):

- **Entry** → **Welcome (merged)** → **Baby name** → **Baby DOB** → **Your name** → **Your relationship** → **Account**. No acquisition, goals, education carousel, baby photo, first-born, other parent, or team celebration.
- Layout: question at top, Next at bottom; fixed viewport (no scroll); safe-area padding; circadian theme from first screen.
- **Next** is disabled until the current step's required input is complete (name, DOB, your name). Baby DOB defaults to empty so the user must pick a date.
- Data is **in-memory only** in this phase; Supabase schema and persistence on first login are planned next.
