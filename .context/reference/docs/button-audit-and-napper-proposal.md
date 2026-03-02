# Button Audit & Napper-Style Proposal

## 1. Napper button styles (from Figma)

| Type | Description | Visual |
|------|-------------|--------|
| **Primary** | Main CTA (e.g. "Create a new baby profile", "Let's go!", "Next") | **Gradient**: lighter lavender/purple at top → deeper purple at bottom. Text: **white** (or in some screens, dark for contrast on the light part of gradient). Pill shape, full width. |
| **Secondary** | Alternative main action (e.g. "I have an invite") | **Solid dark** purple/grey background, **thin light purple border**, **white text**. Same pill shape. |
| **Skip** | Optional / bypass (e.g. "Skip for now") | Same as secondary: dark purple + **glowing light purple border**, white text. Clearly lower emphasis than primary. |
| **Off / Unselected** | Option cards (e.g. "How did you find us?" choices, goal cards) | Dark purple-blue card background, **grey text**; no border or subtle. Selected state would be different (e.g. border or fill). |
| **Tertiary / Link** | "Already have an account? Sign In" | **Text only**, no button box; white, smaller. |

---

## 2. Our current button inventory

### CSS classes (`src/index.css`)

| Class | Current style | Role today |
|-------|----------------|------------|
| `.btn` | Base: pill, 56px min-height, font-display 600 | Shared base |
| `.btn-nap` | Solid sage `--nap-color`, dark text, shadow | Accent primary (auth, save) |
| `.btn-night` | Solid periwinkle `--night-color`, white text, shadow | Primary in onboarding/entry |
| `.btn-wake` | Solid parchment `--wake-color`, dark text | Wake-up emphasis (not used in forms) |
| `.btn-ghost` | Transparent + white 0.1 border, `--text-secondary` | Secondary / cancel |
| `.btn-danger` | Solid `--danger-color`, white | Destructive (e.g. overwrite) |
| `.nav-action-btn` | Solid `#4F46E5`, white, 52px circle | Center nav FAB (add sleep) |

### Where each is used

| Class | Components / screens |
|-------|------------------------|
| **btn-nap** | LoginForm (Sign in), SignUpForm (Create account), ForgotPasswordForm (Send link), ShareAccess (Send invite, Confirm role), AccountSettingsView (Save) |
| **btn-night** | EntryChoice (Get started), OnboardingFlow (Next / Continue / selected option), SignUpForm (Sign in after account) |
| **btn-ghost** | EntryChoice (I have an account), OnboardingFlow (Back, unselected option), ForgotPasswordForm (Back, Cancel), ConfirmationModal (Cancel), AccountSettingsView (Cancel), ActivityCollisionModal (Cancel), MissingBedtimeModal (Start new day) |
| **btn-danger** | ActivityCollisionModal (Overwrite) |
| **Custom (no .btn)** | ConfirmationModal (Cancel = bg-soft, Confirm = inline style), MissingBedtimeModal (Log bedtime = night-color; Start new day = ghost), QuickActionSheet (Wake/Nap/Bedtime = accent cards), GoogleSignInButton (custom dark), nav-action-btn (FAB) |

---

## 3. Use-case mapping: Primary, Secondary, Skip, Off

| Use case | Napper style | Our current | Proposed class / treatment |
|----------|--------------|-------------|-----------------------------|
| **Primary CTA** (Get started, Next, Create account, Sign in, Save, Log bedtime, Confirm) | Gradient purple + white (or dark) text | btn-night (white on solid) or btn-nap (dark on sage) | **.btn-primary** — gradient (light purple → dark purple), **dark text** for contrast on light part of gradient (or white if gradient stays dark). One token for “main action” everywhere. |
| **Secondary** (I have an account, Back, Cancel, unselected choice) | Dark solid + light border + white text | btn-ghost (transparent + border + grey text) | **.btn-secondary** — dark purple/grey solid + thin light purple border + **white text**. Replaces current ghost for these cases. |
| **Skip** (Skip for now, Start new day) | Same as secondary but semantically “skip” | btn-ghost | Can reuse **.btn-secondary** or add **.btn-skip** with same style (or slightly more muted) so we can semantics for analytics. |
| **Off / Unselected** (e.g. relationship options in onboarding) | Dark card, grey text | btn-ghost + border when unselected | Keep **.btn-ghost** for “unselected option” state, but optionally align border color with Napper’s light purple. |
| **Destructive** (Overwrite, Delete) | — | btn-danger | Keep **.btn-danger**; no Napper equivalent needed. |
| **Tertiary / link** (Already have an account? Sign in) | Text only, white | btn-ghost full width | **.btn-link** or plain `<button>` with underline/ghost text style; no pill background. |

---

## 4. Proposed implementation (summary)

1. **Add new tokens in `index.css` (night theme)**  
   - `--btn-primary-bg`: gradient from light purple to dark purple.  
   - `--btn-primary-text`: dark (e.g. `#1A1B2E`) or white depending on gradient.  
   - `--btn-secondary-bg`: solid dark purple/grey.  
   - `--btn-secondary-border`: light purple.  
   - `--btn-secondary-text`: white.

2. **New classes (or rename)**  
   - **.btn-primary**: gradient background, dark (or white) text. Use for: Get started, Next, Create account, Sign in, Save, Log bedtime, ConfirmationModal confirm, ShareAccess confirm.  
   - **.btn-secondary**: dark solid + border + white text. Use for: I have an account, Back, Cancel, Skip for now / Start new day.  
   - **.btn-skip**: Same as secondary (or a variant) for “Skip for now” / “Start new day” so copy and semantics are clear.  
   - **.btn-ghost**: Keep for unselected options; optionally align border to `--btn-secondary-border`.  
   - **.btn-danger**: Unchanged.  
   - **.btn-link**: Optional; text-only for “Already have an account? Sign in”.

3. **Component changes**  
   - **EntryChoice**: “Get started” → btn-primary, “I have an account” → btn-secondary.  
   - **OnboardingFlow**: “Next” / “Continue” / selected option → btn-primary; “Back” / unselected → btn-secondary or btn-ghost.  
   - **Auth (Login, SignUp, ForgotPassword)**: Primary submit → btn-primary; “Back” / “Cancel” → btn-secondary.  
   - **ConfirmationModal**: Confirm → btn-primary, Cancel → btn-secondary.  
   - **MissingBedtimeModal**: Log bedtime → btn-primary, Start new day → btn-secondary (or btn-skip).  
   - **AccountSettingsView**: Save → btn-primary, Cancel → btn-secondary.  
   - **ShareAccess**: Send invite / Confirm → btn-primary.  
   - **ActivityCollisionModal**: Keep Overwrite as btn-danger; Cancel → btn-secondary.  
   - **QuickActionSheet**: Keep current accent cards (Wake/Nap/Bedtime); they are not standard form buttons.  
   - **nav-action-btn**: Can stay as is or use primary gradient for consistency.

4. **Morning/afternoon themes**  
   - Define `--btn-primary-bg` / `--btn-secondary-*` for light mode (e.g. solid indigo primary, grey secondary) so buttons stay readable and on-brand.

5. **Optional**  
   - Add a “selected” state for option lists (e.g. relationship) to match Napper’s “on” state (e.g. light border or filled pill).

---

## 5. File reference

- **Button CSS**: `src/index.css` (lines ~462–548, nav-action-btn ~723–748).  
- **Components**: See grep results for `btn `, `btn-nap`, `btn-night`, `btn-ghost`, `btn-danger` in `src/components`.

This gives a single primary and secondary style aligned with Napper, clear Skip/Off semantics, and a path to implement step by step (tokens → classes → replace usage).

---

## 6. Where to check each button (verification checklist)

**Night theme (default or set device time to 19:00–05:59):**

| # | Button | Where to see it | What to check |
|---|--------|------------------|----------------|
| 1 | **Primary** (gradient, dark text) | **Entry** → “Get started” | Gradient light purple → dark purple; dark text. |
| 2 | **Secondary** (dark fill, light border, white text) | **Entry** → “I have an account” | Dark purple/grey fill, thin light purple border, white text. |
| 3 | **Primary** | **Onboarding** → “Next” / “Continue” (any step) | Same gradient + dark text. |
| 4 | **Secondary** | **Onboarding** → “Back” (baby name, DOB, your name, relationship) | Same as #2. |
| 5 | **Primary** (selected) / **Ghost** (unselected) | **Onboarding** → “Your relationship” step: Dad / Mum / Other | Selected option = primary gradient; unselected = ghost + border. |
| 6 | **Primary** | **Login** → “Sign in” (email/password) | Gradient + dark text. |
| 7 | **Primary** | **Sign up** → “Create account” | Same. |
| 8 | **Secondary** | **Sign up** → “Back to Sign in” (after email sent) | Dark fill + border + white text. |
| 9 | **Secondary** | **Sign up** → “Already have an account? Sign in” (link style in copy; optional .btn-link) | N/A — currently inline link. |
| 10 | **Primary** | **Sign up** → Privacy modal “Close” | Gradient. |
| 11 | **Primary** | **Forgot password** → “Send reset link” | Gradient. |
| 12 | **Secondary** | **Forgot password** → “Back” / “Cancel” | Dark fill + border. |
| 13 | **Primary** | **Missing bedtime modal** → “Log bedtime” | Gradient. |
| 14 | **Skip** | **Missing bedtime modal** → “Start new day” | Same look as secondary (dark fill + border). |
| 15 | **Primary** | **Profile → Account settings** → “Save” (after editing name) | Gradient. |
| 16 | **Secondary** | **Profile → Account settings** → “Cancel” | Dark fill + border. |
| 17 | **Primary** | **Profile → Share access** → “Send invite” / “Confirm” | Gradient. |
| 18 | **Secondary** | **Activity collision modal** → “Cancel” | Dark fill + border. |
| 19 | **Danger** | **Activity collision modal** → “Overwrite” | Red; unchanged. |
| 20 | **Primary** / **Danger** | **Confirmation modals** (e.g. delete sleep entry, delete baby) | Confirm = primary (or danger for delete). Cancel = secondary. |
| 21 | **Nav FAB** (center +) | Bottom nav bar | Same gradient as primary; dark icon (night). |

**Morning theme (set device time to 06:00–11:59, or force `.theme-morning` on `<html>`):**

| # | Button | Where to see it | What to check |
|---|--------|------------------|----------------|
| 22 | **Primary** | Same screens as #1, #3, #6, #7, etc. | Gradient indigo, **white** text; readable on light background. |
| 23 | **Secondary** | Same as #2, #4, #8, etc. | **White** fill, indigo border, **dark** text. |
| 24 | **Skip** | Missing bedtime → “Start new day” | Same as secondary (white fill, dark text). |
| 25 | **Nav FAB** | Bottom nav | Gradient indigo, white icon. |

**Afternoon theme (12:00–18:59):** Same as morning (#22–25).

**Quick scan:** Entry screen (primary + secondary) → Onboarding (Next, Back, relationship options) → Login / Sign up / Forgot password → Profile (Account settings Save/Cancel, Share invite) → Modals (Missing bedtime, Activity collision, Confirmation) → Nav FAB. Then switch to morning/afternoon and re-check primary (white text) and secondary (light bg, dark text).
