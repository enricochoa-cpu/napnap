# Context cleanup — what to delete, rewrite, or reorder

**Purpose:** Single place for decisions on redundant or misplaced docs.

**Applied (2026-02-13):** Sleep report PRD moved to `.context/docs/`; delete-account plan deleted; empty-states plan merged into lessons (8.2) and deleted; onboarding files renamed and references updated. Migrations unchanged (do not delete).

---

## Do NOT delete: Supabase migrations

| File | Reason |
|------|--------|
| `supabase/migrations/20260213000000_anonymized_tables_for_delete_account.sql` | Applied migration; part of DB history. |
| `supabase/migrations/20260213120000_profiles_delete_policy.sql` | Same. |
| `supabase/migrations/20260213140000_allow_authenticated_insert_anonymized.sql` | Same. |
| `supabase/migrations/20260213150000_fix_anonymized_rls_insert.sql` | Same. |
| `supabase/migrations/20260213160000_allow_authenticated_select_anonymized_baby.sql` | Same. |
| `supabase/migrations/multi_user_sharing.sql` | Same. |

**Rule:** Never remove migration files that have been applied. Deleting them breaks migration history and reproducibility.

---

## Delete (done work lives in progress + logs)

| File | Reason |
|------|--------|
| `.context/plans/delete-account-with-anonymization.md` | Status: IMPLEMENTED (2026-02-13). Implementation is in code, `.context/progress.txt`, `.context/logs/2026-02-13.md`, and `.context/lessons.md` §4.1, 4.2, 5.2, 5.3. Plan is redundant. |

---

## Archive or merge, then delete

| File | Action | Reason |
|------|--------|--------|
| `.context/plans/empty-states-and-wake-up-ux.md` | If the modal fix (today-or-tomorrow for `hasMorningWakeUp`) and any `addEntry`-failure UX are already in code/lessons: **merge** any missing lesson into `.context/lessons.md`, then **delete** this file. Otherwise **archive** (e.g. `.context/archive/`) so plans stay for active work only. | Analysis/recommendations; some may be implemented. Reduces duplicate “why we did X” docs. |

---

## Reorder: move PRD out of “plans” (it’s already at .context root)

| Current location | New location | Reason |
|------------------|--------------|--------|
| `.context/sleep-report-prd.md` | `.context/docs/sleep-report-prd.md` | PRD is a product spec, not an implementation plan. `.context/docs/` already has `TODAY_VIEW_PREDICTION_SYSTEM.md`; grouping PRDs and technical docs there keeps `.context/` root for live references (MEMORY, progress, ESSENTIAL-GAPS, prd, etc.) and avoids “sleep report PRD inside plans” confusion. |

**Note:** `sleep-report-prd.md` is currently at `.context/` root, not inside `plans/`. Moving it to `.context/docs/` is the reorder that “makes no sense to have SLEEP-REPORT-PRD inside plans” — i.e. keep PRDs in docs, not mixed with plans.

---

## Rename (typos + clarity)

| Current name | New name | Reason |
|--------------|----------|--------|
| `product-research/onboarding/n-boarding.md` | `product-research/onboarding/napper-onboarding-reference.md` | Fix typo “n-boarding”; name reflects content (Napper reference). |
| `product-research/onboarding/ONBOARDING-PLAN.md` | `product-research/onboarding/onboarding-plan.md` | Fix typo “ONBOARDING”; lowercase matches common repo style. |

**After rename:** Update references in `CLAUDE.md`, `.context/prd.md`, and the cross-link inside the renamed onboarding file.

---

## Optional rewrites (no delete)

| File | Suggestion |
|------|------------|
| `product-research/onboarding/onboarding-plan.md` (after rename) | In “What’s left”, point to `.context/ESSENTIAL-GAPS.md` for pending onboarding items (has completed onboarding, optional draft persist) so one source of truth. |
| `.context/plans/` | After deleting the two plans above, if the folder is empty, remove `.context/plans/` or add a short `README.md`: “Plans are one-off implementation docs; completed work is in progress.txt and logs.” |

---

## Suggested order of application

1. **Do not delete** any migration files.
2. **Move** `.context/sleep-report-prd.md` → `.context/docs/sleep-report-prd.md`.
3. **Delete** `.context/plans/delete-account-with-anonymization.md`.
4. **Merge or archive** `.context/plans/empty-states-and-wake-up-ux.md` (merge into lessons if not already, then delete; or move to `.context/archive/`).
5. **Rename** onboarding files and update references (CLAUDE, prd, internal link).
6. Optionally **rewrite** “What’s left” in onboarding-plan to reference ESSENTIAL-GAPS; optionally add plans/ README or remove empty folder.
