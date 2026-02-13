# Delete account with data anonymization — implementation plan

## Goal

When a user deletes their account: remove auth user, profile, sleep entries, baby_shares, avatar files, and all PII; keep anonymized baby + sleep data (DOB, gender, weight, height, sleep times/type) in separate tables. Clear disclosure in the UI and optional full privacy policy.

---

## 1. Database: anonymized tables (migration)

- **anonymized_baby_profiles**: id, baby_date_of_birth, baby_gender, baby_weight, baby_height, anonymized_at. No user_id, no names, no avatar.
- **anonymized_sleep_entries**: id, anonymized_baby_id (FK), start_time, end_time, type, created_at. Do not copy notes (PII).
- Migration: create tables, RLS (service-role only or no anon access).

---

## 2. Edge Function: delete-account

- verify_jwt: true. Get user id from JWT.
- Service-role client. Copy profile → anonymized_baby_profiles, sleep_entries → anonymized_sleep_entries, then auth.admin.deleteUser(user.id). Return 200 or 4xx/5xx.
- Client deletes storage objects before calling; function does not touch Storage.

---

## 3. Client: storage cleanup + invoke

- List and delete all objects in `baby-avatars` under `{user.id}/`.
- supabase.functions.invoke('delete-account'). On 200: signOut(), redirect. On error: show message.
- AccountSettingsView: wire confirm button, loading/error state.

---

## 4. UI: modal copy and button

- Modal: update body text; enable confirm button; wire to delete flow; add loading ("Deleting…") and error state.
- See **Section 6** for exact privacy copy and placement.

---

## 5. Order of operations

1. Client deletes storage objects.
2. Client calls delete-account.
3. Edge Function: anonymize → deleteUser (cascade).
4. Client signs out.

---

## 6. Privacy policy text in the UI (best practice)

**Best practice:** Show a **just-in-time notice** where the user acts (the delete-account modal), plus a **findable full policy** (e.g. Profile → Support → Privacy policy) so users can read details anytime.

### 6.1 In the delete-account modal (required)

Show short, clear copy in the modal body so users see it at the moment of confirmation. Suggested text:

**Suggested modal body text:**

- **First line (what we remove):**  
  "We will permanently delete your account, your profile, and all linked data (names, photos, and sleep logs)."
- **Second line (what we keep, anonymized):**  
  "We may keep anonymized sleep and growth data (no names or identifiers) to improve our product and research."
- **Optional third line:**  
  "You will be signed out immediately and will not be able to recover your account."

Layout: keep the modal compact; use two short paragraphs or bullet-like lines so it’s scannable. Use existing `text-[var(--text-muted)]` and `text-sm` for consistency.

### 6.2 Full privacy policy (recommended)

- **Where:** Add a **Privacy policy** entry in the Support flow so it’s easy to find (Profile → Support → Privacy policy). Reuse the same sub-view pattern as FAQs / Contact (new view `PrivacyView` or `PrivacyPolicyView`, navigated from SupportView via a new ListRow "Privacy policy").
- **Content:** One scrollable screen (or markdown-rendered content) that includes at least:
  - What data we collect and why.
  - How we use it (product, research, anonymization).
  - **Account deletion:** When you delete your account we remove your email, name(s), photos, and all data linked to your account. We may retain anonymized sleep and growth data (no identifiers) for product improvement and research; this data cannot be linked back to you.
  - How to contact (e.g. link to Contact or support email).
- **Linking from delete modal (optional):** In the delete modal, add a small link "Privacy policy" that navigates to this view (or opens it in a sheet). If the profile stack is complex, a simple "Read our Privacy policy" link that goes to Support → Privacy is enough; user can back out and return to delete.

### 6.3 Implementation checklist for privacy UI

| Item | Action |
|------|--------|
| Delete modal body | Replace current "Not yet available" copy with the suggested modal text above (two short paragraphs). |
| Support menu | In [SupportView.tsx](src/components/Profile/SupportView.tsx), add a ListRow "Privacy policy" (e.g. subtitle "How we use and protect your data") that navigates to a new view `profileView === 'privacy'`. |
| ProfileSection | Add route/subview for `'privacy'` and render a new `PrivacyPolicyView` (or re-use a generic content view) with the full policy text. Reuse SubViewHeader + scrollable content; optionally load markdown from a file or constant. |
| Optional | In the delete modal, add a text link "Privacy policy" that triggers navigation to the privacy view (or set a state so when modal closes user can be directed there). |

This gives users both **immediate notice at delete** and a **clear place to read the full policy** from the UI, which is the recommended approach.
