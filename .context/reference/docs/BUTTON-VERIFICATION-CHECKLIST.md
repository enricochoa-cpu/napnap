# Button verification checklist (Napper-style)

After implementing `.btn-primary`, `.btn-secondary`, `.btn-skip`, and theme-aware tokens, use this list to verify each button in **night** and **morning/afternoon**.

---

## Night theme (default or 19:00–05:59)

1. **Entry (landing)** — “Get started” → **Primary** (gradient purple, dark text).
2. **Entry (landing)** — “I have an account” → **Secondary** (dark fill, light purple border, white text).
3. **Onboarding** — “Next” / “Let’s go!” → **Primary**.
4. **Onboarding** — “Back” (any step) → **Secondary**.
5. **Onboarding** — “Your relationship”: selected option → **Primary**; unselected → **Ghost** (border only).
6. **Login** — “Sign in” → **Primary**.
7. **Sign up** — “Create account” → **Primary**.
8. **Sign up** — Privacy modal “Close” → **Primary**.
9. **Sign up** — “Back to Sign in” (after email sent) → **Secondary**.
10. **Forgot password** — “Send reset link” → **Primary**.
11. **Forgot password** — “Back” / “Cancel” → **Secondary**.
12. **Missing bedtime modal** — “Log bedtime” → **Primary**.
13. **Missing bedtime modal** — “Start new day” → **Skip** (same look as secondary).
14. **Profile → Account settings** — “Save” → **Primary**.
15. **Profile → Account settings** — “Cancel” → **Secondary**.
16. **Profile → Share access** — “Send invite” / “Confirm” → **Primary**.
17. **Activity collision modal** — “Cancel” → **Secondary**.
18. **Activity collision modal** — “Overwrite” → **Danger** (red, unchanged).
19. **Confirmation modals** (e.g. delete entry, delete baby) — “Cancel” → **Secondary**; “Delete” / confirm → **Danger** or **Primary** depending on variant.
20. **Bottom nav** — Center “+” FAB → **Primary** gradient (same as primary buttons).

---

## Morning theme (06:00–11:59)

21. **Entry** — “Get started” → **Primary** (gradient indigo, **white** text).
22. **Entry** — “I have an account” → **Secondary** (**white** fill, indigo border, **dark** text).
23. **Onboarding** — “Next” / “Back” → Same primary/secondary as above; readable on light background.
24. **Missing bedtime** — “Start new day” → **Skip** (white fill, dark text).
25. **Bottom nav** — Center “+” FAB → **Primary** gradient, white icon.

---

## Afternoon theme (12:00–18:59)

26. Same as morning (#21–25).

---

## Quick path (minimal check)

- **Night:** Open app → Entry (primary + secondary) → Onboarding one step (Next + Back) → Login (Sign in) → Profile → Account settings (Save + Cancel). Then trigger Missing bedtime modal and Activity collision modal.
- **Morning:** Change system time to 06:00–11:59 (or force `.theme-morning` on `<html>`) → repeat Entry, one onboarding step, Login. Confirm primary has white text and secondary has white background + dark text.
