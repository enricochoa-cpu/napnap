# Essential Gaps — Pending Only

**Purpose:** What’s still missing for the product. Done items live in `.context/progress.txt` and `.context/logs/`.

**Last updated:** 2026-02-13

---

## 1. Onboarding — Returning users

| Gap | UI | Backend |
|-----|----|---------|
| “Has completed onboarding” flag | No | Stored flag (e.g. in `profiles` or auth metadata) so **returning users** skip Entry choice and go straight to Login. AuthGuard currently always shows Entry choice when not authenticated. |
| Optional: persist draft across refresh | No | Optional: localStorage (or similar) so refresh doesn’t lose onboarding progress (sessionStorage is tab-scoped). |

**Summary:** First-login profile write is done. Still missing: “completed onboarding” so returning users see Login instead of Entry choice; optionally persist draft across refresh.

---

## 2. Supabase base schema (reproducibility)

| Gap | Notes |
|-----|--------|
| Initial schema migration | Only `multi_user_sharing.sql` is in repo. `profiles` and `sleep_entries` are assumed in Supabase but not created by any migration. Add an **initial migration** that creates `profiles` and `sleep_entries` (and their RLS) so the project is self-contained and reproducible. |

---

## 3. Multi-baby (2+ babies per account)

**Current state:** UI has “Add your baby”, active-baby switch, and scoped Today/History/Stats. Backend is still 1 user = 1 profile = 1 own baby (one profile row per user, sleep entries tied to `user_id`).

| Gap | UI | Backend |
|-----|----|---------|
| Add second (or more) baby | Partial (card + sheet exist; createProfile only works for first baby) | New schema: e.g. `babies` table (baby_id, user_id, name, dob, …) with sleep_entries referencing baby_id; RLS and baby_shares aligned. |
| Switch active baby | Done | — |
| Scope entries/filters per baby | Done | — |

**To do — Database**

1. **New `babies` table:** `id` (PK), `owner_id` (FK → auth.users), `name`, `date_of_birth`, `gender`, `weight`, `height`, `avatar_url`, `created_at`. One user can have many rows.
2. **`profiles`:** Keep for user-only data (e.g. `user_name`, `user_role`); one row per user. Optionally move baby columns out or leave for backward compatibility during migration.
3. **`sleep_entries`:** Add `baby_id` (FK → babies.id). Migrate existing: set `baby_id` from current `user_id` (profile id) where that profile exists.
4. **`baby_shares`:** Reference `baby_id` (babies.id) instead of `baby_owner_id` (profiles.id). Update RLS and app.
5. **App:** useBabyProfile, useSleepEntries, createProfile/updateProfile/deleteProfile, and all RLS updated for babies table and new FKs.

**Summary:** Implement the database changes first, then align app code.

---

## 4. Invitation emails in production

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
| Multi-baby (add 2+ babies) | Partial | Schema + app |
| Invitation emails production | N/A | Resend domain |

---

## Suggested order of work

1. **“Has completed onboarding”** — Flag + AuthGuard so returning users go straight to Login.
2. **Supabase base schema** — Initial migration for `profiles` and `sleep_entries` (and RLS).
3. **Multi-baby** — Only if required for launch: schema change first, then app alignment.
4. **Production emails** — Resend domain verification when sending real invitation emails.
