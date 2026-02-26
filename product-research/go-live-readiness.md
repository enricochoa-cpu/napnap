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

- **Status:** Disabled in Supabase. Advisor recommends enabling HaveIBeenPwned check.
- **Needed:** Enable in Supabase Dashboard: Authentication → Settings → Password Protection (or equivalent). No code change.

**Questions for you:**

- Q11. Confirm you want leaked password protection enabled. (Recommended: yes.)

### 3.2 Function search_path

- **Status:** Two functions have mutable search_path: `link_pending_invitations`, `link_my_pending_invitations`. Security linter warns.
- **Needed:** New migration that sets explicit `search_path` (e.g. `public`) on both functions. See [Supabase linter 0011](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable).

**Questions for you:**

- Q12. No choice needed; fix is standard. Note: apply migration after answering Q11.

### 3.3 RLS on anonymized tables

- **Status:** INSERT policies on `anonymized_baby_profiles` and `anonymized_sleep_entries` allow any authenticated user (WITH CHECK true). Only the delete-account Edge Function should insert in practice.
- **Needed:** Either: (a) restrict INSERT to a dedicated role/service used only by the Edge Function, or (b) remove client-visible INSERT and document that only the backend anonymizes. If you keep “any authenticated can insert,” document why (e.g. “intentional for future self-service export”).

**Questions for you:**

- Q13. Should only the delete-account Edge Function be able to insert into anonymized_* tables? (Recommended: yes; then we tighten RLS or use a service role only.)

---

## 4. Deployment and OAuth

### 4.1 Production URL and env

- **Status:** Edge Function `send-invitation-email` uses `APP_URL` (fallback localhost). OAuth redirects must include production URL.
- **Needed:** Deploy frontend to a stable production URL. Set Supabase Edge Function secret `APP_URL` to that URL. Add the same URL to Google Cloud Console and Supabase Auth redirect URLs.

**Questions for you:**

- Q14. What is (or will be) the production URL? (e.g. https://napnap.app or https://babysleeptracker.app)
- Q15. Where will you host the frontend? (Vercel, Netlify, Cloudflare Pages, etc.) — so we can note any env or redirect quirks.

### 4.2 OAuth redirect URLs

- **Needed:** In Google Cloud Console (OAuth client): add production redirect URI (e.g. `https://<project>.supabase.co/auth/v1/callback` if that’s what Supabase uses). In Supabase Dashboard (Auth → URL Configuration): add production site URL and redirect URLs (e.g. `https://yourdomain.com`, `https://yourdomain.com/`).

**Questions for you:**

- Q16. Same as Q14; no extra question if Q14 is answered.

---

## 5. Privacy and data

### 5.1 Third-party tools and cookies

- **Status:** Sentry is used with `sendDefaultPii: true` ([src/main.tsx](src/main.tsx)). Privacy Policy does not yet mention error reporting or cookies/similar tech.
- **Needed:** Add a short “Cookies and similar technologies” or “Error reporting” section to the Privacy Policy: what Sentry collects, that it’s for stability, and that you don’t sell data. Optionally set `sendDefaultPii: false` if you prefer not to send PII to Sentry.

**Questions for you:**

- Q7. Keep `sendDefaultPii: true` (easier debugging) or set to `false` (stricter privacy)? Policy must reflect the choice.
- Q8. Do you plan to add analytics or marketing cookies later? If yes, we’ll need a cookie/consent banner and policy update; if no, we only document Sentry.

### 5.2 Data about minors

- **Status:** **Done.** One sentence added to Privacy Policy: “By providing your baby’s data in the App, you confirm that you are the parent or legal guardian and have authority to provide that data on their behalf.”
- **Needed:** ~~One sentence…~~ Implemented.

**Questions for you:**

- Q9. Any specific jurisdiction you care about (e.g. EU, UK, US states)? This may affect wording (e.g. “parental responsibility” vs “guardian”). *(Wording used is EU/EEA-friendly: parent or legal guardian.)*

### 5.3 Cookie / consent banner

- **Status:** No banner. For Sentry-only, disclosure in the policy is often enough; strict GDPR may prefer a brief notice.
- **Needed (optional):** A one-time or dismissible line: “We use essential and error-reporting tools to run the app; see Privacy Policy.” Only required if you want extra transparency or target strict jurisdictions.

**Questions for you:**

- Q10. Do you want a simple “We use error reporting (see Privacy Policy)” notice on first visit, or is policy disclosure enough for now?

---

## 6. Branding and discovery (lowest priority)

### 6.1 index.html

- **Status:** `<title>` is “baby-sleep-tracker”. App is branded “NapNap” in UI.
- **Needed:** Set `<title>` to product name + short tagline. Optionally add `<meta name="description" content="...">` for sharing and search.

**Questions for you:**

- Q17. Exact public app name: “NapNap” or something else (e.g. “NapNap – Baby Sleep Tracker”)?
- Q18. One-sentence meta description for social/search (e.g. “Calm, simple baby sleep tracking for 0–18 months.”)?

---

## 7. Checklist

Use this table to track status and your answers (ordered by priority: 1 = highest). Fill the “Notes / Answer” column as you answer the questions above.

| Priority | Area | Item | Status | Notes / Answer |
|----------|------|------|--------|----------------|
| 1 (highest) | Legal | Terms of Service | **Done** | In-app view + sign-up consent; operator = individual, not medical advice. |
| 1 | Legal | Privacy: data controller, retention, last updated | **Done** | Controller = operator; retention as in §2.2; last updated in view. |
| 1 | Legal | Sign-up consent (ToS + Privacy) | **Done** | “I agree to the Terms of Service and Privacy Policy” with links to both. |
| 2 | Security | Leaked password protection | Disabled | Q11 |
| 2 | Security | Function search_path | To fix | Q12 |
| 2 | Security | RLS anonymized tables | To review | Q13 |
| 3 | Deployment | Production URL, APP_URL | Unset | Q14–Q15 |
| 3 | Deployment | OAuth redirect URLs | To add | Q14/Q16 |
| 4 | Privacy | Policy: Sentry / cookies | Missing | Q7–Q8 |
| 4 | Privacy | Policy: minors / guardian | **Done** | Sentence added. |
| 4 | Privacy | Cookie/consent notice | Optional | Q10 |
| 5 (lowest) | Branding | index.html title + meta | Wrong / missing | Q17–Q18 |

---

## 8. Next steps (after you answer)

1. **Legal:** ~~Add ToS…~~ Done. Optional: add Sentry/cookies to Privacy Policy (Q7–Q8).
2. **Security:** Enable leaked password protection; apply migration for function search_path; tighten or document RLS for anonymized tables (per Q13).
3. **Deployment:** Set production URL, APP_URL, and OAuth redirects (Google + Supabase).
4. **Privacy:** Add policy section for Sentry/cookies (Q7–Q8); optional consent notice (Q10).
5. **Branding:** Update index.html title and meta description (Q17–Q18).
6. **Optional:** Add simple cookie/error-reporting notice (Q10).
