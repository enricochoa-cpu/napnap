# Registration Flow Improvements (U-70, U-71, U-72)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the registration flow feel safe, understood, and connected to the brand by fixing three UX issues.

**Architecture:** Three independent changes to three files. U-70 replaces the T&C checkbox with passive consent in SignUpForm. U-71 routes the "Sign up" link from LoginForm through OnboardingFlow instead of directly to SignUpForm. U-72 adds a subtitle to onboarding Step 4.

**Tech Stack:** React, TypeScript, i18next, Tailwind CSS

---

## File Map

| File | Change | Task |
|------|--------|------|
| `src/components/Auth/SignUpForm.tsx` | Remove checkbox, add passive consent text, enable Google button | Task 1 |
| `src/components/Auth/AuthGuard.tsx` | Route signup to onboarding instead of standalone SignUpForm | Task 2 |
| `src/components/Onboarding/OnboardingFlow.tsx` | Add subtitle to Step 4 | Task 3 |
| `src/locales/en.json` | Add new i18n keys | Tasks 1, 3 |
| `src/locales/es.json` | Add new i18n keys | Tasks 1, 3 |
| `src/locales/ca.json` | Add new i18n keys | Tasks 1, 3 |

---

### Task 1: Replace T&C checkbox with passive consent (U-70)

**Files:**
- Modify: `src/components/Auth/SignUpForm.tsx`
- Modify: `src/locales/en.json`
- Modify: `src/locales/es.json`
- Modify: `src/locales/ca.json`

- [ ] **Step 1: Add i18n keys for passive consent text**

In `src/locales/en.json`, inside the `"auth"` section, add after the `"agreeTermsAndPrivacyRequired"` line:

```json
"byCreatingAccount": "By creating an account, you agree to our",
```

In `src/locales/es.json`, same location:

```json
"byCreatingAccount": "Al crear una cuenta, aceptas nuestros",
```

In `src/locales/ca.json`, same location:

```json
"byCreatingAccount": "En crear un compte, acceptes els nostres",
```

- [ ] **Step 2: Remove checkbox state and validation from SignUpForm**

In `src/components/Auth/SignUpForm.tsx`:

1. **Remove** the state variable on line 24:
```typescript
// DELETE this line:
const [agreedToTermsAndPrivacy, setAgreedToTermsAndPrivacy] = useState(false);
```

2. **Remove** the consent validation check in `handleSubmit` (lines 42-45):
```typescript
// DELETE these lines:
if (!agreedToTermsAndPrivacy) {
  setError(t('auth.agreeTermsAndPrivacyRequired'));
  return;
}
```

3. **Remove** `disabled={!agreedToTermsAndPrivacy}` from the Google button on line 99. Change:
```tsx
<GoogleSignInButton onSignIn={onGoogleSignIn} disabled={!agreedToTermsAndPrivacy} />
```
to:
```tsx
<GoogleSignInButton onSignIn={onGoogleSignIn} />
```

4. **Change** the "Create Account" button disabled condition on line 190. Change:
```tsx
disabled={loading || !agreedToTermsAndPrivacy}
```
to:
```tsx
disabled={loading || !email || password.length < 6 || password !== confirmPassword}
```

- [ ] **Step 3: Replace checkbox UI with passive consent text**

In `src/components/Auth/SignUpForm.tsx`, replace the entire checkbox block (lines 156-186):

```tsx
{/* Consent directly above CTA: market-standard placement so agreement is tied to the action */}
<div className="pt-1">
  <label className="flex items-start gap-3 cursor-pointer group">
    <input
      type="checkbox"
      checked={agreedToTermsAndPrivacy}
      onChange={(e) => setAgreedToTermsAndPrivacy(e.target.checked)}
      disabled={loading}
      className="mt-1 w-4 h-4 rounded border-[var(--text-muted)] bg-[var(--bg-soft)] text-[var(--nap-color)] focus:ring-[var(--nap-color)]"
      aria-describedby="consent-desc"
    />
    <span id="consent-desc" className="text-sm text-[var(--text-secondary)] font-display">
      {t('auth.agreeTermsAndPrivacy')}{' '}
      <button
        type="button"
        onClick={() => setShowTermsModal(true)}
        className="text-[var(--nap-color)] font-medium underline underline-offset-2"
      >
        {t('auth.termsOfService')}
      </button>
      {' '}{t('auth.and')}{' '}
      <button
        type="button"
        onClick={() => setShowPrivacyModal(true)}
        className="text-[var(--nap-color)] font-medium underline underline-offset-2"
      >
        {t('auth.privacyPolicy')}
      </button>
    </span>
  </label>
</div>
```

with this passive consent text:

```tsx
{/* Passive consent: industry standard — action = agreement */}
<p className="text-xs text-[var(--text-muted)] font-display text-center pt-1">
  {t('auth.byCreatingAccount')}{' '}
  <button
    type="button"
    onClick={() => setShowTermsModal(true)}
    className="text-[var(--nap-color)] underline underline-offset-2"
  >
    {t('auth.termsOfService')}
  </button>
  {' '}{t('auth.and')}{' '}
  <button
    type="button"
    onClick={() => setShowPrivacyModal(true)}
    className="text-[var(--nap-color)] underline underline-offset-2"
  >
    {t('auth.privacyPolicy')}
  </button>
</p>
```

- [ ] **Step 4: Verify in browser**

Run: `npm run dev`

1. Navigate to `http://localhost:5173/app`
2. Click "Get started" → go through onboarding to Step 6 (Create Account)
3. Verify: Google button is **enabled** (not greyed out)
4. Verify: Passive consent text appears below the form: "By creating an account, you agree to our Terms of Service and Privacy Policy"
5. Verify: Clicking "Terms of Service" / "Privacy Policy" still opens modals
6. Verify: "Create Account" button enables when email + password (6+ chars) + confirm match

- [ ] **Step 5: Commit**

```bash
git add src/components/Auth/SignUpForm.tsx src/locales/en.json src/locales/es.json src/locales/ca.json
git commit -m "fix: replace T&C checkbox with passive consent on signup (U-70)"
```

---

### Task 2: Route "Sign up" from login to onboarding (U-71)

**Files:**
- Modify: `src/components/Auth/AuthGuard.tsx`

- [ ] **Step 1: Redirect signup to onboarding in AuthGuard**

In `src/components/Auth/AuthGuard.tsx`, replace the `switch (authView)` block (lines 65-93):

```tsx
// User chose "I have an account" — show auth screens as before
switch (authView) {
  case 'signup':
    return (
      <SignUpForm
        onSubmit={signUp}
        onGoogleSignIn={signInWithGoogle}
        onSwitchToLogin={() => setAuthView('login')}
      />
    );

  case 'forgot-password':
    return (
      <ForgotPasswordForm
        onSubmit={resetPassword}
        onBack={() => setAuthView('login')}
      />
    );

  case 'login':
  default:
    return (
      <LoginForm
        onSubmit={signIn}
        onGoogleSignIn={signInWithGoogle}
        onSwitchToSignUp={() => setAuthView('signup')}
        onForgotPassword={() => setAuthView('forgot-password')}
      />
    );
}
```

with:

```tsx
// User chose "I have an account" — show auth screens
switch (authView) {
  case 'signup':
    // Route new signups through full onboarding so baby profile data is collected
    return (
      <OnboardingFlow
        signUp={signUp}
        signIn={signIn}
        signInWithGoogle={signInWithGoogle}
        resetPassword={resetPassword}
        onBackFromWelcome={() => {
          setAuthView('login');
          // Stay in 'account' flow so back goes to login, not entry choice
        }}
      />
    );

  case 'forgot-password':
    return (
      <ForgotPasswordForm
        onSubmit={resetPassword}
        onBack={() => setAuthView('login')}
      />
    );

  case 'login':
  default:
    return (
      <LoginForm
        onSubmit={signIn}
        onGoogleSignIn={signInWithGoogle}
        onSwitchToSignUp={() => setAuthView('signup')}
        onForgotPassword={() => setAuthView('forgot-password')}
      />
    );
}
```

The key difference: `case 'signup'` now renders `OnboardingFlow` instead of `SignUpForm`. The `onBackFromWelcome` callback returns to login (not entry choice) since the user came from the login screen.

- [ ] **Step 2: Verify in browser**

1. Navigate to `http://localhost:5173/app`
2. Click "I have an account" → Login screen
3. Click "Don't have an account? Sign up"
4. Verify: lands on OnboardingFlow Step 1 (Welcome / "Hi there"), **not** the Create Account form
5. Verify: pressing Back on Welcome returns to Login screen
6. Complete onboarding steps → verify Create Account form appears at Step 6
7. Verify: the original "Get started" path still works as before

- [ ] **Step 3: Commit**

```bash
git add src/components/Auth/AuthGuard.tsx
git commit -m "fix: route signup from login through onboarding flow (U-71)"
```

---

### Task 3: Add subtitle to onboarding Step 4 (U-72)

**Files:**
- Modify: `src/components/Onboarding/OnboardingFlow.tsx`
- Modify: `src/locales/en.json`
- Modify: `src/locales/es.json`
- Modify: `src/locales/ca.json`

- [ ] **Step 1: Add i18n key**

In `src/locales/en.json`, inside the `"onboarding"` section, add after `"yourNameQuestion"`:

```json
"yourNameWhy": "So we know how to greet you in the app.",
```

In `src/locales/es.json`, same location:

```json
"yourNameWhy": "Para saber cómo saludarte en la app.",
```

In `src/locales/ca.json`, same location:

```json
"yourNameWhy": "Per saber com saludar-te a l'app.",
```

- [ ] **Step 2: Add subtitle to Step 4 in OnboardingFlow**

In `src/components/Onboarding/OnboardingFlow.tsx`, in the "Your name" step (line 297-330), add a `<p>` tag after the `<h2>` heading. Change:

```tsx
{/* Your name */}
{step === STEP_YOUR_NAME && (
  <div className="flex flex-col flex-1 w-full max-w-sm mx-auto">
    <h2 className="text-display-md text-[var(--text-primary)] font-display pt-2 text-center">
      {t('onboarding.yourNameQuestion')}
    </h2>
    <div className="flex-1 flex flex-col justify-center py-6">
```

to:

```tsx
{/* Your name */}
{step === STEP_YOUR_NAME && (
  <div className="flex flex-col flex-1 w-full max-w-sm mx-auto">
    <h2 className="text-display-md text-[var(--text-primary)] font-display pt-2 text-center">
      {t('onboarding.yourNameQuestion')}
    </h2>
    <p className="text-[var(--text-secondary)] text-sm font-display mt-2 text-center">
      {t('onboarding.yourNameWhy')}
    </p>
    <div className="flex-1 flex flex-col justify-center py-6">
```

This matches the exact same pattern used in Steps 2 and 3 (baby name and DOB subtitles).

- [ ] **Step 3: Verify in browser**

1. Navigate to `http://localhost:5173/app`
2. Click "Get started" → Next → enter baby name → Next → set DOB → Next
3. Verify: Step 4 now shows "What's your name?" with subtitle "So we know how to greet you in the app." below it
4. Verify: subtitle styling matches Steps 2 and 3

- [ ] **Step 4: Commit**

```bash
git add src/components/Onboarding/OnboardingFlow.tsx src/locales/en.json src/locales/es.json src/locales/ca.json
git commit -m "fix: add subtitle to onboarding step 4 for warmth (U-72)"
```

---

## Final verification

- [ ] Run `npm run build` — ensure no TypeScript errors
- [ ] Run `npm run lint` — ensure no lint warnings
