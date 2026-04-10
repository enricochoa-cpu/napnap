# Registration Flow Improvements — U-70, U-71, U-72

**Date:** 2026-04-10
**Source:** Playwright MCP audit of registration flow
**Backlog:** `docs/backlog/full-app/2026-03-31-ux-ui-audit-backlog.md`

---

## Goal

Make the registration flow feel **safe**, **understood**, and **connected to the brand** by fixing three issues discovered during a Playwright walkthrough of the onboarding and auth screens.

---

## U-70 — Replace T&C checkbox with passive consent

### Problem

Google OAuth button on the signup form is `disabled={!agreedToTermsAndPrivacy}` — it appears greyed out until the user checks a T&C checkbox that's far below, often off-screen. Users perceive it as broken. The login screen has no such gate, creating inconsistency.

### Decision

Replace the checkbox consent with a passive consent statement. This is the industry standard (Google, Spotify, Notion, Linear). The act of clicking "Create Account" or "Continue with Google" constitutes consent.

### Changes

**File:** `src/components/Auth/SignUpForm.tsx`

1. **Remove** the `agreedToTermsAndPrivacy` state variable
2. **Remove** the checkbox UI (the `<div>` with checkbox + label)
3. **Remove** `disabled={!agreedToTermsAndPrivacy}` from the Google OAuth button
4. **Change** "Create Account" button `disabled` condition to: `!email || !password || password.length < 6 || password !== confirmPassword`
5. **Add** passive consent text below the form buttons:
   - Text: "By creating an account, you agree to our [Terms of Service] and [Privacy Policy]"
   - Terms/Privacy open in the existing modal viewers (keep the `showTerms`/`showPrivacy` state and modal components)
   - Style: `text-xs text-center` with muted text colour, links in `--nap-color`

### What stays

- Terms of Service and Privacy Policy full-text modals (already implemented)
- Form validation (email format, password length, password match)
- Success confirmation screen ("Check your email")

---

## U-71 — Route "Sign up" from login to onboarding

### Problem

Clicking "Don't have an account? Sign up" on the login screen goes directly to the `SignUpForm` — bypassing the entire onboarding flow (baby name, DOB, parent name, relationship). The user creates an account with zero baby data and lands in an empty app.

**Path:** Landing → "Get started" → Entry Choice → "I have an account" → Login → "Sign up" → Create Account (no onboarding)

### Decision

Route the "Sign up" link from LoginForm through the OnboardingFlow, same as "Get started" from EntryChoice.

### Changes

**File:** `src/components/Auth/AuthGuard.tsx`

1. In the `entryChoice === 'account'` branch, when `authView` is set to `'signup'` (via `LoginForm`'s `onSwitchToSignUp`), instead of rendering `SignUpForm` directly:
   - Set `entryChoice` to `'new'` (which triggers `OnboardingFlow`)
   - Reset `authView` to `'login'` (cleanup)
2. This means the `case 'signup'` inside the `entryChoice === 'account'` switch becomes unreachable and can be removed

### Flow after fix

```
Login → "Sign up" → OnboardingFlow (Step 1: Welcome)
  → Step 2: Baby name
  → Step 3: Baby DOB
  → Step 4: Parent name
  → Step 5: Relationship
  → Step 6: SignUpForm (with onboarding draft in sessionStorage)
  → Account created → App reads draft → Profile created
```

### What stays

- LoginForm's `onSwitchToSignUp` prop still fires — AuthGuard just handles it differently
- OnboardingFlow's internal login/signup/forgot-password switching at Step 5 still works
- sessionStorage draft persistence still works

---

## U-72 — Add subtitle to onboarding Step 4

### Problem

Step 4 ("What's your name?") has no subtitle or context — just a heading and a bare input with massive whitespace. Every other step has supporting copy explaining why the data is needed. This makes Step 4 feel cold compared to the rest.

### Changes

**File:** `src/components/Onboarding/OnboardingFlow.tsx`

1. Add a `<p>` subtitle below the "What's your name?" heading
2. Copy: "So we know how to greet you in the app."
3. Style: same as Step 2's subtitle (`text-sm text-[var(--text-secondary)] text-center`)

---

## Files touched

| File | U-70 | U-71 | U-72 |
|------|------|------|------|
| `src/components/Auth/SignUpForm.tsx` | Yes | — | — |
| `src/components/Auth/AuthGuard.tsx` | — | Yes | — |
| `src/components/Onboarding/OnboardingFlow.tsx` | — | — | Yes |

No new components. No data model changes. No i18n key additions (copies are in English; i18n can follow in a separate pass).

---

## Out of scope

- Google OAuth investigation (S1 status question — separate from this fix)
- Onboarding step merge (U-81 — separate task)
- Illustrations (U-79 — blocked on asset creation)
- Password strength indicator (U-75 — separate task)
