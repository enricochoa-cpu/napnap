# Essential Gaps — Priority List

**Purpose:** Key issues not yet covered that are essential for the user to work. For each item: what we have (UI / backend) and what’s missing.

**Last updated:** 2026-02-13 (from progress.txt + codebase + Supabase review).

---

## Supabase — What We Have

| Asset | Status | Notes |
|-------|--------|--------|
| **profiles** table | Assumed in Supabase | Not created by any migration in repo. Referenced by `multi_user_sharing.sql` (RLS) and all profile hooks. Likely created manually or via dashboard. Columns used in code: `id`, `baby_name`, `baby_date_of_birth`, `baby_gender`, `baby_weight`, `baby_height`, `baby_avatar_url`, `user_name`, `user_role`, `created_at`. |
| **sleep_entries** table | Assumed in Supabase | Same as above. Columns: `id`, `user_id`, `start_time`, `end_time`, `type`, `notes`, `created_at`. |
| **baby_shares** table + RLS | In repo | `supabase/migrations/multi_user_sharing.sql` creates table, indexes, RLS (owners + shared read/caregiver write), and `link_my_pending_invitations()`. |
| **link_my_pending_invitations()** | In repo | Called from `useBabyShares.fetchPendingInvitations()` so pending invites get linked to user on first fetch after login. |
| **Storage bucket** | Referenced in code | `baby-avatars` used in `useBabyProfile.uploadBabyAvatar`. Must exist in Supabase Storage with appropriate policies. |
| **Edge Function** | In repo | `send-invitation-email` (Resend API). Needs `RESEND_API_KEY` and `APP_URL` as secrets. |
| **Auth** | Supabase Auth | Email/password + Google OAuth. No “delete user” flow in app. |

**Recommendation:** Add an **initial schema migration** to the repo that creates `profiles` and `sleep_entries` (and any RLS for them), so the project is self-contained and reproducible. Right now only the sharing migration is versioned; base tables are not.

---

## Priority 1 — Onboarding end-to-end (critical for new users)

**What we have**

- **UI:** Full onboarding flow (Entry choice → Welcome → Baby name → DOB → Your name → Relationship → Account). Napper-style layout, Next disabled until step complete, circadian theme.
- **Backend:** None for onboarding. `OnboardingFlow` keeps draft in React state only. On the Account step it only calls `signUp` / `signIn` / `signInWithGoogle` with email/password — **the draft (baby name, DOB, your name, relationship) is never sent anywhere**. After sign-up, user lands in the app with no profile (no baby), so Today/History/Stats are empty and “Add your baby” is the only path.

**What we’re missing**

| Gap | UI | Backend |
|-----|----|---------|
| Persist onboarding draft | No | Optional localStorage (or similar) so refresh doesn’t lose progress. |
| Write baby + user profile on first login | No | After first auth (sign-up or Google), call `createProfile` (or equivalent) with onboarding payload. Requires passing draft from OnboardingFlow into a post-auth step (or reading from stored draft). |
| “Has completed onboarding” flag | No | Some stored flag (e.g. in `profiles` or auth metadata) so **returning users** skip Entry choice and go straight to Login. AuthGuard currently always shows Entry choice when not authenticated. |

**Summary:** UI done; backend missing (persist draft, write profile on first login, “completed onboarding” so returning users go to login).

---

## Priority 2 — Delete account [IMPLEMENTED 2026-02-13]

**What we have**

- **UI:** AccountSettingsView has “Delete account” link and a confirmation modal. The confirm button is disabled with “Not yet available” and explanatory copy.
- **Backend:** No Supabase auth delete, no cascade design (profiles, sleep_entries, baby_shares, storage).

**What we’re missing**

| Gap | UI | Backend |
|-----|----|---------|
| Actually delete account | Done (flow exists, button disabled) | Supabase: delete or anonymize user data (profiles, sleep_entries, baby_shares, storage), then call Auth admin API to delete the user (or use a secure Edge Function). Design cascade/order to avoid RLS/constraint issues. |

**Summary:** UI done; backend missing (cascade delete + auth user deletion).

### Delete account — what we miss (from Supabase MCP)

Checked via MCP: your project already has the right **database** setup for cascade; the only blocker is **Storage** and the missing **Auth admin** call.

| Layer | Status | Detail |
|-------|--------|--------|
| **DB FKs** | OK | All public FKs to `auth.users` / `profiles` use **ON DELETE CASCADE**: `profiles.id` → auth.users, `sleep_entries.user_id` → auth.users, `baby_shares.baby_owner_id` → profiles, `baby_shares.shared_with_user_id` → auth.users. Deleting the auth user will cascade: profiles, sleep_entries, and related baby_shares rows are removed automatically. |
| **Storage** | Blocker | Supabase does **not** allow deleting an auth user if they own any Storage objects. Your `baby-avatars` bucket has objects with `owner_id` = user UUID. You must remove (or reassign) those objects **before** calling Auth admin delete. |
| **Storage RLS** | OK | Policy "Users can delete own files" already allows DELETE on `storage.objects` where `bucket_id = 'baby-avatars'` and the path's first folder is `auth.uid()`. So the **client** can delete the user's own avatar files before calling delete-account. |
| **Auth admin** | Missing | The anon key cannot delete users. You need an Edge Function with **service role** that calls `supabase.auth.admin.deleteUser(uid)` after verifying the JWT belongs to that `uid` (never expose service role in the client). |

**Concrete steps to implement**

1. **Client (AccountSettingsView)**  
   - On confirm "Delete account": list objects in `baby-avatars` with prefix `{userId}/`, delete each (existing Storage RLS), then call new Edge Function `delete-account` with `Authorization: Bearer <session.access_token>`.  
   - On 200: sign out, redirect to entry/login. On error: show a safe message.

2. **Edge Function `delete-account`** (new, verify_jwt: true)  
   - Get user id from validated JWT.  
   - Call `createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).auth.admin.deleteUser(user.id)`.  
   - Return 200 or 4xx/5xx. DB cascade handles profiles, sleep_entries, baby_shares.

3. **UI**  
   - Re-enable the confirm button and wire it to: storage cleanup → Edge Function → sign out.

**Order:** Client deletes storage objects → Client calls Edge Function → Function calls auth.admin.deleteUser → DB cascade runs → Client signs out.

---

## Priority 3 — Multi-baby (2+ babies per account)

**What we have**

- **UI:** “Add your baby” ghost card in MyBabiesView; BabyEditSheet used for “add” flow. Gallery and profile structure suggest multiple babies. **Active-baby selection:** user can choose which baby's data is shown (Today/History/Stats) via the circle on each card in My babies; choice persisted in localStorage.
- **Backend:** One profile row per user (`profiles.id = user.id`). `createProfile` inserts a single row with `id: user.id`; it only works when the user has no profile yet. Sleep entries are tied to `user_id` (profile id = baby id). Sharing is per "baby owner" (one profile = one baby). **Database is not ready for 1 user + 2+ own babies.**

**What we’re missing**

| Gap | UI | Backend |
|-----|----|---------|
| Add second (or more) baby | Partial (card + sheet exist; createProfile only works for “first” baby) | New schema: e.g. `babies` table (baby_id, user_id, name, dob, …) with sleep_entries referencing baby_id, or multiple profile rows per user. RLS and sharing (baby_shares) must be aligned. |
| Switch active baby | Done | Active baby persisted (localStorage); Today/History/Stats scoped to selected baby. |
| Scope entries/filters per baby | Done | useSleepEntries(babyId) and UI use activeBabyId. |

**To do — Database change for 1 user + 2+ own babies**

1. **New `babies` table:** `id` (PK), `owner_id` (FK → auth.users), `name`, `date_of_birth`, `gender`, `weight`, `height`, `avatar_url`, `created_at`. One user can have many rows.
2. **`profiles`:** Keep for user-only data (e.g. `user_name`, `user_role`); one row per user. Optionally move baby columns out or leave for backward compatibility during migration.
3. **`sleep_entries`:** Add `baby_id` (FK → babies.id) and use it for "which baby this log belongs to". Migrate existing: set `baby_id` from current `user_id` (profile id) where that profile exists.
4. **`baby_shares`:** Reference `baby_id` (babies.id) instead of `baby_owner_id` (profiles.id). Update RLS and app to use baby_id.
5. **App:** useBabyProfile, useSleepEntries, createProfile/updateProfile/deleteProfile, and all RLS policies updated for babies table and new FKs.

**Summary:** UI has "Add baby" + active-baby switch; backend schema still 1 user = 1 profile = 1 own baby. To support multiple own babies, implement the database changes above first, then align app code.


---

## Priority 4 — Invitation emails in production

**What we have**

- **UI:** Share flow (invite by email, role, etc.).
- **Backend:** Edge Function `send-invitation-email` (Resend), `baby_shares` table, RLS, `link_my_pending_invitations()`.

**What we’re missing**

| Gap | UI | Backend |
|-----|----|---------|
| Resend domain verification (production) | N/A | Operational: verify your own domain in Resend so invitation emails don’t use `onboarding@resend.dev`. |

**Summary:** Backend/ops only (domain verification for production emails).

---

## Quick reference matrix

| Item | UI | Backend | Notes |
|------|----|---------|--------|
| Onboarding persistence + first-login profile write | Done | Done | 2026-02-13: draft in sessionStorage on Account step; App applies draft and createProfile after sign-up. |
| “Has completed onboarding” (skip to login) | Missing | Missing | Returning users always see Entry choice. |
| Delete account | Done | Done | Implemented 2026-02-13 (anonymize + Edge Function + client). |
| Multi-baby (add/switch/scope) | Done (switch + scope) | Missing | Schema: need `babies` table, sleep_entries.baby_id, baby_shares.baby_id; then app alignment. See Priority 3 "To do". |
| Invitation emails production | N/A | Ops (Resend domain) | Verify domain for production. |
| Base Supabase schema (profiles, sleep_entries) | N/A | Not in repo | Add initial migration for reproducibility. |

---

## Suggested order of work

1. ~~**Onboarding backend (persist + first-login profile)**~~ — Implemented 2026-02-13. Remaining: add "has completed onboarding" and skip Entry choice for returning users.

2. **Supabase base schema** — Add initial migration that creates `profiles` and `sleep_entries` (and their RLS) so the repo fully describes the DB.
3. ~~**Delete account**~~ — Implemented (anonymized tables, Edge Function delete-account, client flow).
4. **Multi-baby** — Only if required for launch; then schema change first, then UI (switch baby, scoped entries).
5. **Production emails** — Resend domain verification when you’re ready to send real invitation emails.
