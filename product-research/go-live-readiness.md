# Go-Live Readiness: NapNap Baby Sleep Tracker

This document lists what is missing and what is already in place to take the app public. Answer every **Questions for you** section; those answers will drive implementation (legal text, security settings, deployment, and branding).

---

## 1. Summary

- **In place:** Privacy Policy (content + in-app view + sign-up consent), **Terms of Service (in-app view + sign-up consent)**, account deletion with anonymization, contact/support email (**getnapnap@gmail.com**), RLS on main tables, env-based config, Sentry only in production. **Privacy Policy** now includes data controller, retention, last updated, minors wording.
- **Missing or incomplete:** Full Privacy Policy alignment (Sentry/cookies section), Supabase security fixes, production OAuth and deployment setup, public branding (title/meta).
- Use the **Checklist** at the end to track status and your answers.

---

## 2. Legal and public information (highest priority)

### 2.1 Terms of Service (ToS)

- **Status:** **Done.** ToS added in-app (Profile → Support → Terms of Service) and in sign-up consent (“I agree to the Terms of Service and Privacy Policy” with links to both). Content includes: operator (individual, no company), not medical advice, acceptable use, account/termination, limitation of liability, contact, governing law (EU-friendly).
- **Needed:** ~~A short Terms of Service…~~ Implemented.

**Questions for you:**

- **Q1.** Do you have a legal entity (company name, country) that will appear as the operator of the app? If yes, what is the exact name and country?  
  **Answer:** No. I do not have a company. You can run a free app in the EU without a company; the operator is you as a natural person (data controller). The ToS and Privacy Policy refer to “the operator” and use the support email for contact.
- **Q2.** Where should the ToS live: (a) in-app only (new view, like Privacy), (b) external URL (e.g. your website), or (c) both?  
  **Answer:** (a) In-app only. Implemented: Profile → Support → Terms of Service.
- **Q3.** Do you want a “not medical advice” / “informational only” disclaimer in the ToS?  
  **Answer:** Yes. Included; aligned with BabyNaps, Napper, and Huckleberry.

### 2.2 Privacy Policy — legal alignment

- **Status:** **Updated.** Policy now has: data controller (operator, contact getnapnap@gmail.com), retention wording (account/sleep while active; anonymized data retained indefinitely for product improvement), last updated date, and data about minors (parent/guardian authority). Contact/support email set to **getnapnap@gmail.com** everywhere (Contact view, support form, policy).
- **Needed:** Optional: add Sentry/cookies section (see §5.1).

**Questions for you:**

- **Q4.** Who is the data controller?  
  **Answer:** No company. The data controller is the operator of NapNap (the person running the app). Contact: getnapnap@gmail.com.
- **Q5.** What is the support or legal contact email for data requests and privacy questions?  
  **Answer:** **getnapnap@gmail.com**. Used in Contact screen, support form, Privacy Policy, and ToS.
- **Q6.** Exact retention wording: how long do you keep (a) account and sleep data while the account is active, (b) anonymized data after account deletion?  
  **Answer:** (a) We keep account and sleep data for as long as the account is active. (b) Anonymized data: retained **indefinitely for product improvement** (and research); cannot be linked back to you.

---

## 3. Security (Supabase)

### 3.1 Leaked password protection

- **Status:** **N/A (nice to have).** Feature requires Supabase Pro plan; not enabled on free tier.
- **Needed:** None for go-live. If you upgrade to Pro later: Auth → Providers → Email → "Prevent the use of leaked passwords".

**How to enable (exact path, Pro plan only):**

1. Open your [Supabase Dashboard](https://supabase.com/dashboard) and select your project.
2. In the left sidebar go to **Authentication** (person icon).
3. Open **Providers** (or **Auth** → **Providers**).
4. Click **Email**.
5. In the **Email** provider settings you’ll see **Password strength** options. Enable **"Prevent the use of leaked passwords"** (HaveIBeenPwned check).
6. Optionally set minimum length and required character types, then save.

*Note: Leaked password protection is available on the **Pro plan** and above. If you don’t see the option, your project may be on the free tier; check Project Settings → Billing.*

**Questions for you:**

- Q11. **Answer:** Nice to have; not available on current plan (Pro only). Enable if we upgrade to Pro.

### 3.2 Function search_path

- **Status:** **Fixed.** Migration `20260226000000_function_search_path.sql` sets `search_path = public` on `link_my_pending_invitations` (the only such function in this repo). If your DB also has `link_pending_invitations`, run in SQL Editor: `ALTER FUNCTION public.link_pending_invitations() SET search_path = public;`
- **Needed:** ~~New migration…~~ Done.

**Questions for you:**

- Q12. No choice needed; fix is standard. Migration applied.

### 3.3 RLS on anonymized tables

- **Status:** **Fixed.** Only the delete-account Edge Function (service role) can insert. Client INSERT/SELECT policies removed; single-baby delete no longer writes to anonymized tables (only full account delete anonymizes via Edge Function).
- **Needed:** ~~Either (a)…~~ Done. Market standard: only backend writes to anonymized/analytics tables. If you keep “any authenticated can insert,” document why (e.g. “intentional for future self-service export”).

**Questions for you:**

- Q13. Should only the delete-account Edge Function be able to insert into anonymized_* tables? **Answer:** Yes. Implemented: RLS allows only service role; client-side anonymization removed from single-baby delete.

---

## 4. Deployment and OAuth

### 4.1 Production URL and env

- **Status:** Edge Function `send-invitation-email` uses `APP_URL` (fallback localhost). OAuth redirects must include production URL.
- **Needed:** ~~Deploy frontend to a stable production URL. Set Supabase Edge Function secret `APP_URL` to that URL. Add the same URL to Google Cloud Console and Supabase Auth redirect URLs.~~ **Done:** Frontend deployed to `https://napnap.vercel.app`, `APP_URL` and Supabase/Vercel env vars set and working.

**Questions for you:**

- **Q14.** What is (or will be) the production URL?  
  **Answer:** **https://napnap.vercel.app/** — Vercel’s free `*.vercel.app` URL is stable and fine for production; no custom domain or extra cost required.
- **Q15.** Where will you host the frontend?  
  **Answer:** **Vercel** (https://napnap.vercel.app/). Tech stack doc doesn’t name the host; deployment is Vercel.

**What you still need to do (env):**

1. In Supabase Dashboard → **Project Settings** → **Edge Functions** → **Secrets**, set `APP_URL` = `https://napnap.vercel.app` (no trailing slash is fine; the Edge Function uses it as base for links).
2. In Vercel: ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in the project’s Environment Variables so the production build has the correct Supabase client config.

### 4.2 OAuth redirect URLs

- **Status:** Configured and tested. Google sign-in from `https://napnap.vercel.app/` returns to the app without OAuth errors.
- **Needed:** Add production URL in **Google Cloud Console** (OAuth client) and in **Supabase** (Auth → URL Configuration). Follow the steps below.

**How to configure (step-by-step):**

**A. Google Cloud Console**

1. Open [Google Cloud Console](https://console.cloud.google.com/) and select the project that has your OAuth client (the one used for "Continue with Google").
2. Go to **APIs & Services** → **Credentials**.
3. Click your **OAuth 2.0 Client ID** (type: Web application).
4. Under **Authorized redirect URIs**, add exactly:  
   `https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`  
   Replace `<YOUR_SUPABASE_PROJECT_REF>` with your Supabase project ref (from `VITE_SUPABASE_URL`: e.g. if the URL is `https://abcdefghij.supabase.co`, the ref is `abcdefghij`).
5. Click **Save**. Keep any existing redirect URI you use for local dev (same pattern; Supabase uses one callback URL; "where to send the user after login" is set in Supabase).

**B. Supabase Dashboard**

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Go to **Authentication** → **URL Configuration**.
3. Set **Site URL** to: `https://napnap.vercel.app`
4. Under **Redirect URLs**, add (if not already present):  
   `https://napnap.vercel.app`  
   `https://napnap.vercel.app/`  
   Keep `http://localhost:5173` (and `http://localhost:5173/` if you use it) for local development.
5. Save. After this, Google sign-in from production will redirect back to https://napnap.vercel.app.

**Questions for you:**

- **Q16.** Same as Q14; no extra question. Production URL = https://napnap.vercel.app/

---

## 5. Privacy and data

### 5.1 Third-party tools and cookies

- **Status:** Sentry is used with `sendDefaultPii: true` ([src/main.tsx](src/main.tsx)). Privacy Policy has a new “Cookies and similar technologies” section describing essential Supabase auth storage and optional Google sign-in cookies; Sentry/error reporting is still not described explicitly.
- **Needed:** Add a short “Error reporting” paragraph to the Privacy Policy explaining that Sentry is used for stability, what it may collect, and that you don’t sell data. Optionally set `sendDefaultPii: false` if you prefer not to send PII to Sentry; policy must match that choice.

**Questions for you:**

- Q7. Keep `sendDefaultPii: true` (easier debugging) or set to `false` (stricter privacy)? Policy must reflect the choice.  
  **Answer:** Not decided yet. For now, keep the current Sentry configuration and revisit when you work on the dedicated “Error reporting” section.
- Q8. Do you plan to add analytics or marketing cookies later? If yes, we’ll need a cookie/consent banner and policy update; if no, we only document Sentry.  
  **Answer:** No. The app is for a close community and you don’t plan to add analytics or marketing cookies. If this ever changes, you will add a consent banner and update the Privacy Policy.

### 5.2 Data about minors

- **Status:** **Done.** Privacy Policy now says that NapNap is designed to be used by adults (parents or legal guardians), and that by providing baby data in the app the user confirms they are the parent or legal guardian and have authority to provide that data, in line with EU data protection laws.
- **Needed:** ~~One sentence…~~ Implemented with EU-friendly wording.

**Questions for you:**

- Q9. Any specific jurisdiction you care about (e.g. EU, UK, US states)? This may affect wording (e.g. “parental responsibility” vs “guardian”). *(Wording used is EU/EEA-friendly: parent or legal guardian.)*

### 5.3 Cookie / consent banner

- **Status:** No banner. For now you only use essential Supabase auth storage and optional Google sign-in cookies, with no analytics or marketing cookies.
- **Needed (optional):** Keep relying on Privacy Policy disclosure only. If you later add analytics or marketing cookies, you will add a consent banner for EU/EEA users and update the policy accordingly.

**Questions for you:**

- Q10. Do you want a simple “We use error reporting (see Privacy Policy)” notice on first visit, or is policy disclosure enough for now?

---

## 6. Branding and discovery (lowest priority)

### 6.1 index.html

- **Status:** **Done.** `<title>` now uses the product name and tagline, and `meta description` is set.
- **Needed:** ~~Set `<title>` to product name + short tagline. Optionally add `<meta name="description" content="...">` for sharing and search.~~ Implemented in `index.html` as:  
  - `<title>NapNap – Baby sleep, simplified</title>`  
  - `<meta name="description" content="NapNap is a gentle baby sleep tracker that predicts naps and bedtimes, so exhausted parents can stop guessing and follow a calm, science-inspired plan.">`

**Questions for you:**

- **Q17.** Exact public app name: “NapNap” or something else (e.g. “NapNap – Baby Sleep Tracker”)?  
  **Answer:** **NapNap.** In the page title we use “NapNap – Baby sleep, simplified”.
- **Q18.** One-sentence meta description for social/search (e.g. “Calm, simple baby sleep tracking for 0–18 months.”)?  
  **Answer:** “NapNap is a gentle baby sleep tracker that predicts naps and bedtimes, so exhausted parents can stop guessing and follow a calm, science-inspired plan.”

---

## 7. Checklist

Use this table to track status and your answers (ordered by priority: 1 = highest). Fill the “Notes / Answer” column as you answer the questions above.

| Priority | Area | Item | Status | Notes / Answer |
|----------|------|------|--------|----------------|
| 1 (highest) | Legal | Terms of Service | **Done** | In-app view + sign-up consent; operator = individual, not medical advice. |
| 1 | Legal | Privacy: data controller, retention, last updated | **Done** | Controller = operator; retention as in §2.2; last updated in view. |
| 1 | Legal | Sign-up consent (ToS + Privacy) | **Done** | “I agree to the Terms of Service and Privacy Policy” with links to both. |
| 2 | Security | Leaked password protection | N/A (Pro only) | Nice to have; enable if upgrade to Pro. |
| 2 | Security | Function search_path | **Done** | Migration 20260226000000 applied. |
| 2 | Security | RLS anonymized tables | **Done** | Service role only; migration 20260226000001. |
| 3 | Deployment | Production URL, APP_URL | **Done** | Deployed to https://napnap.vercel.app (Vercel); APP_URL + Supabase/Vercel env configured. |
| 3 | Deployment | OAuth redirect URLs | **Done** | Configured in Google Cloud Console + Supabase; Google sign-in from https://napnap.vercel.app/ tested. |
| 4 | Privacy | Policy: Sentry / cookies | Partially done | Cookies/essential storage covered; Sentry/error reporting still to document. |
| 4 | Privacy | Policy: minors / guardian | **Done** | Sentence added. |
| 4 | Privacy | Cookie/consent notice | Optional | Q10 |
| 5 (lowest) | Branding | index.html title + meta | **Done** | Title set to “NapNap – Baby sleep, simplified”; meta description added. |

---

## 8. Next steps (after you answer)

1. **Legal:** ~~Add ToS…~~ Done. Optional: add Sentry/cookies to Privacy Policy (Q7–Q8).
2. **Security:** ~~Leaked password~~ N/A (Pro only, nice to have); ~~function search_path~~ Done; ~~RLS anonymized tables~~ Done.
3. **Deployment:** ~~Set production URL, APP_URL, and OAuth redirects (Google + Supabase).~~ Done.
4. **Privacy:** Add policy section for Sentry/cookies (Q7–Q8); optional consent notice (Q10).
5. **Branding:** Update index.html title and meta description (Q17–Q18).
6. **Optional:** Add simple cookie/error-reporting notice (Q10).
