# Baby Sleep Tracker — Onboarding plan

Short, Napper-inspired onboarding (UX/UI only). Persistence and schema are out of scope for this phase. Reference: [n-boarding.md](n-boarding.md) (Napper analysis); we do something **similar, not the same** — shorter path, our tone and design tokens.

---

## Flow

1. **Entry** — Single choice: "Get started" (onboarding) or "I have an account" (login).
2. **Welcome** — Merged intro: Hi there + short "why we ask" (one screen). Next.
3. **Baby** — Baby name (text), date of birth (date picker). Next.
4. **Your name** — Caregiver name only. Next.
5. **Your relationship** — Mum / Dad / Other. Next.
6. **Account** — Create account or sign in (reuse existing Login/SignUp). On success, user enters app; onboarding payload will be attached to account in a later phase.

Layout: Napper-style (question at top, Next at bottom). Fixed viewport (no scroll) on all entry/onboarding/auth screens. Circadian theme (morning/afternoon/night) applied from AuthGuard.

---

## Screens (copy direction)

| Step   | Screen           | Copy direction                                        | Fields (UI only)                    |
|--------|------------------|--------------------------------------------------------|-------------------------------------|
| 0      | Entry            | Two CTAs; app name/tagline                             | None                                |
| 1      | Welcome (merged) | Hi there + "A few quick details… No fuss."             | None                                |
| 2      | Baby             | When was your baby born? Name + DOB                    | Name, DOB (ISO date string)         |
| 3      | Your name        | What's your name?                                      | Name                                |
| 4      | Your relationship| You're their… (Mum / Dad / Other)                      | relationship (dad/mum/other)       |
| 5      | Account          | Create account / Sign in (existing auth components)   | Consent + auth method               |

---

## Out of scope (this phase)

- Persistence: localStorage draft, Supabase schema, writing onboarding data on first login.
- "Has completed onboarding" flag; resume onboarding.
- Extra steps: acquisition, goals, education carousel, baby photo, confirmation, age range, first-born, other parent.
- See plan file (e.g. Potential improvements) for full backlog.
