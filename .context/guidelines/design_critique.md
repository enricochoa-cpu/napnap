**Last updated: 2026-06-17**

# Design Critique & Decision Guidelines

> How to critique and propose design work — mockups, flows, UX, audits, prototypes. Apply to any design / UX / product-design task in this repo.
>
> Two principles, one spine: **separate confidence from polish, surface assumptions, tie everything to outcomes, and end on a next test.**

---

## 1. Critique in outcomes-aligned language

- Separate **fidelity** (how polished it looks) from **quality** (how well it achieves goals). A high-fidelity AI/Figma artifact is a starting point to mine for what works (hierarchy, flow) — not a conclusion. Push back to low-fidelity iteration when the structure is wrong (not for a near-final production tweak).
- Judge work as **successful / unsuccessful relative to specific user, business, and technical goals**, and say why — not "good"/"bad".
- **If those goals aren't stated, name the goals you're assuming (or ask) before judging** — "successful" is meaningless without them.
- Ground claims in evidence (research, constraints, accessibility, hierarchy, copy clarity, interaction patterns); flag heuristic vs. measured fact, and don't invent research.
- Replace "I like it / it's good" with concrete, actionable statements plus a specific next iteration or test.
- Lead with the highest-impact structural issues before detail-level ones.
- Humble, collaborative tone: critique the work, not the person.
- The point is the goals-and-evidence reasoning, **not** banning the words "good/bad" — don't let it become vocabulary theater.

---

## 2. Reason probabilistically on uncertain decisions

**Gate it:** apply the full protocol when a design decision is genuinely **uncertain, AI/model-mediated, or high-stakes**. For routine micro-decisions, skip the ceremony — forcing bet-framing onto "should this button be primary?" is the failure mode to avoid.

When triggered:
- **Restate the problem in probabilistic terms.** Frame options as bets with rough success likelihoods, not right/wrong. Optimize for likelihood, not certainty.
- **Make assumptions explicit.** For each strong recommendation, state (a) the assumption, (b) rough confidence, (c) what would change it.
- **Treat AI outputs as probabilistic signals, not truths** — surface alternative explanations, edge cases, "what else might be true?"
- **Data is a compass, not a map** — when citing data/user patterns, name possible bias, missing context, and how it could skew the outcome.
- **Offer 2–3 options** with pros, cons, and "when this is more / less likely to work."
- **Think experimentally** — propose small, cheap experiments and human-in-the-loop checkpoints that *reduce* uncertainty (not just confirm the favored idea). Define what AI suggests vs. what the human reviews/decides, and how feedback improves the system.
- **Communicate uncertainty** with ranges, confidence levels, trade-offs, and "here's how this could fail" over false precision.
- **Flag deterministic UI over a probabilistic system** — call out at least one place the interface hides model uncertainty, and how to surface or handle it.
- **Favor resilience and long-term trust over short-term conversion** — second-order effects, behavior when models drift or confidence drops.

---

*Source: adapted from two product-design prompts (2026-06), gated and de-jargonned for daily use. Surfaced via the "Design Rules" section in this repo's `CLAUDE.md`.*
