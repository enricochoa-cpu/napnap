# Baby Sleep Tracker — Onboarding plan

Short, Napper-inspired onboarding (UX/UI only). Persistence and schema are out of scope for this phase. Reference: [n-boarding.md](n-boarding.md) (Napper analysis); we do something **similar, not the same** — shorter path, our tone and design tokens.

---

## Flow

1. **Entry** — Single choice: "Get started" (onboarding) or "I have an account" (login).
2. **Welcome** — Merged intro: Hi there + short "why we ask" (one screen). Next.
3. **Baby name** — What's your baby's name? (one screen). Next.
4. **Baby DOB** — When was your baby born? (date picker, one screen). Next.
5. **Your name** — Caregiver name only. Next.
6. **Your relationship** — Mum / Dad / Other. Next.
7. **Account** — Create account or sign in (logo, short info, Continue with Google, Continue with email). On success, user enters app; onboarding payload will be attached to account in a later phase.

Layout: Napper-style (question at top, Next at bottom). Fixed viewport (no scroll) on all entry/onboarding/auth screens. Circadian theme (morning/afternoon/night) applied from AuthGuard.

---

## Screens (copy direction)

| Step   | Screen           | Copy direction                                        | Fields (UI only)                    |
|--------|------------------|--------------------------------------------------------|-------------------------------------|
| 0      | Entry            | Two CTAs; app name/tagline                             | None                                |
| 1      | Welcome (merged) | Hi there + "A few quick details… No fuss."             | None                                |
| 2      | Baby name        | What's your baby's name?                               | Name                                |
| 3      | Baby DOB         | When was your baby born? (subtext: for sleep suggestions) | DOB (ISO date string)            |
| 4      | Your name        | What's your name?                                      | Name                                |
| 5      | Your relationship| You're their… (Mum / Dad / Other)                      | relationship (dad/mum/other)       |
| 6      | Account          | Logo, short info, Continue with Google, Continue with email | Consent + auth method          |

---

## What we did (2026-02-12)

- **Entry choice:** "Get started" / "I have an account" (AuthGuard shows first).
- **OnboardingFlow:** 6 steps (Welcome → Baby name → Baby DOB → Your name → Your relationship → Account). Napper-style layout, progress dots, Back/Next; fixed viewport, no scroll.
- **Safe-area padding:** `.safe-pad-top` / `.safe-pad-bottom` in `index.css` so content isn’t flush with browser URL bar or nav.
- **Circadian theme** on entry/onboarding (useApplyCircadianTheme in AuthGuard).
- **Next validation:** Next disabled until required field(s) completed (baby name, baby DOB, your name). Baby DOB default = empty so user must pick a date.
- **Account screen:** Logo + short info, Continue with Google, Continue with email; aligned with Napper.

## What’s left

- **Supabase:** Schema for onboarding payload (or reuse existing `profiles` / baby tables); write baby + user profile on first login from draft.
- **Persistence:** Optional localStorage draft so progress survives refresh; "has completed onboarding" flag so returning users skip entry/onboarding and go straight to login.
- **Resume:** If user closes before account step, resume from last step when they return (requires persisted draft).

## Out of scope (this phase)

- Extra steps: acquisition, goals, education carousel, baby photo, confirmation, age range, first-born, other parent.
- See plan file (e.g. Potential improvements) for full backlog.
