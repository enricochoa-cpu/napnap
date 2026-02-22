# Essential Gaps — Pending Only

**Purpose:** What’s still missing for the product. Done items live in `.context/progress.txt` and `.context/logs/`. Resolved bugs and patterns live in `.context/lessons.md`.

**Last updated:** 2026-02-20

---

## 1. Profiles table semantics (current)

**Clarification:** The `profiles` table is **one row per user** (`id` = `auth.users.id`), not one row per baby. The name is misleading: each row holds both **user-level** and **baby-level** data.

| Stored in `profiles` | Meaning |
|----------------------|--------|
| `user_name`, `user_role`, `locale` | **User** preferences (app language is per user, not per baby). |
| `baby_name`, `baby_date_of_birth`, `baby_gender`, etc. | The **owner’s primary baby** (exactly one set of baby fields per row). |

**Implication:** Today, **one user = one “own” baby** in the DB. A second child (e.g. sibling) cannot be stored as a second “own” baby — there is no second row or second set of baby columns. Sharing (`baby_shares`) is for “see another person’s baby,” not “my second baby.”

**Documentation:** Table and column comments were added in `supabase/migrations/20260220000000_add_profiles_locale.sql`. When adding a proper multi-baby model, `profiles` should hold only user data and a separate `babies` table should hold one row per baby per owner (see §3 below).

---

## 2. Onboarding — Returning users

| Gap | UI | Backend |
|-----|----|---------|
| “Has completed onboarding” flag | No | Stored flag (e.g. in `profiles` or auth metadata) so **returning users** skip Entry choice and go straight to Login. AuthGuard currently always shows Entry choice when not authenticated. |
| Optional: persist draft across refresh | No | Optional: localStorage (or similar) so refresh doesn’t lose onboarding progress (sessionStorage is tab-scoped). |

**Summary:** First-login profile write is done. Still missing: “completed onboarding” so returning users see Login instead of Entry choice; optionally persist draft across refresh.

---

## 3. Supabase base schema (reproducibility)

| Gap | Notes |
|-----|--------|
| Initial schema migration | Only `multi_user_sharing.sql` (and later migrations) are in repo. `profiles` and `sleep_entries` are assumed in Supabase but not created by any migration. Add an **initial migration** that creates `profiles` and `sleep_entries` (and their RLS) so the project is self-contained and reproducible. |

---

## 4. Multi-baby (2+ babies per account, e.g. siblings)

**Current state:** UI has “Add your baby”, active-baby switch, and scoped Today/History/Stats. Backend is still **1 user = 1 profile row = 1 own baby** (see §1). Sleep entries are tied to `user_id`; there is no `baby_id`.

| Gap | UI | Backend |
|-----|----|---------|
| Add second (or more) baby | Partial (card + sheet exist; createProfile only works for first baby) | New schema: `babies` table + `profiles` user-only; `sleep_entries` and `baby_shares` reference `baby_id`. |
| Switch active baby | Done | — |
| Scope entries/filters per baby | Done | — |

**To do — Database**

1. **New `babies` table:** `id` (PK), `owner_id` (FK → auth.users), `name`, `date_of_birth`, `gender`, `weight`, `height`, `avatar_url`, `created_at`. One user can have many rows.
2. **`profiles`:** Keep for **user-only** data (`user_name`, `user_role`, `locale`); one row per user. Remove or migrate baby columns into `babies` (with backward-compat migration if needed).
3. **`sleep_entries`:** Add `baby_id` (FK → babies.id). Migrate existing: set `baby_id` from current user’s single baby (or equivalent) where possible.
4. **`baby_shares`:** Reference `baby_id` (babies.id) instead of `baby_owner_id` (profiles.id). Update RLS and app.
5. **App:** useBabyProfile, useSleepEntries, createProfile/updateProfile/deleteProfile, and all RLS updated for `babies` table and new FKs.

**Summary:** Implement the database changes first, then align app code. See lessons.md §3.1 (update both owner and shared queries when adding columns) and §3.2 (upsert for profile row) when touching profiles.

---

## 5. Invitation emails in production

| Gap | Notes |
|-----|--------|
| Resend domain verification | Operational: verify your own domain in Resend so invitation emails don’t use `onboarding@resend.dev`. |

---

## Quick reference (pending only)

| Item | UI | Backend |
|------|----|---------|
| “Has completed onboarding” (skip to login) | Missing | Missing |
| Optional: onboarding draft across refresh | Missing | Optional |
| Base Supabase schema (profiles, sleep_entries) | N/A | Not in repo |
| Multi-baby (add 2+ own babies, e.g. siblings) | Partial | Schema + app |
| Invitation emails production | N/A | Resend domain |

---

## Suggested order of work

1. **“Has completed onboarding”** — Flag + AuthGuard so returning users go straight to Login.
2. **Supabase base schema** — Initial migration for `profiles` and `sleep_entries` (and RLS).
3. **Multi-baby** — Only if required for launch: schema change first (babies table, profiles user-only), then app alignment.
4. **Production emails** — Resend domain verification when sending real invitation emails.
