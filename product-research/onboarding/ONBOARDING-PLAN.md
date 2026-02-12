# Baby Sleep Tracker — Onboarding plan

Short, Napper-inspired onboarding (UX/UI only). Persistence and schema are out of scope for this phase. Reference: [n-boarding.md](n-boarding.md) (Napper analysis); we do something **similar, not the same** — shorter path, our tone and design tokens.

---

## Flow

1. **Entry** — Single choice: "I'm new" (start onboarding) or "I have an account" (go to login).
2. **Welcome** — App name, one-line value, calm visual. Next.
3. **Trust** — One short benefit / "why we need a few details". Next.
4. **Baby** — Baby name (text), date of birth (date picker). Next.
5. **You** — Caregiver name (text), relationship to baby (Mum / Dad / Other). Next.
6. **Account** — Create account or sign in (reuse existing Login/SignUp). On success, user enters app; onboarding payload will be attached to account in a later phase.

---

## Screens (copy direction)

| Step   | Screen   | Copy direction                                              | Fields (UI only)                    |
|--------|----------|-------------------------------------------------------------|-------------------------------------|
| 0      | Entry    | Two equal CTAs; optional app name/tagline                   | None                                |
| 1      | Welcome  | App name, one-line value prop, calm visual                  | None                                |
| 2      | Trust    | One short benefit or "why we need a few details"            | None                                |
| 3      | Baby     | Ask baby name and date of birth                            | Name, DOB (ISO date string)         |
| 4      | You      | Ask caregiver name and relationship to baby                | Name, relationship (dad/mum/other)  |
| 5      | Account  | Create account / Sign in (existing auth components)         | Consent + auth method               |

---

## Out of scope (this phase)

- Persistence: localStorage draft, Supabase schema, writing onboarding data on first login.
- "Has completed onboarding" flag; resume onboarding.
- Extra steps: acquisition, goals, education carousel, baby photo, confirmation, age range, first-born, other parent.
- See plan file (e.g. Potential improvements) for full backlog.
