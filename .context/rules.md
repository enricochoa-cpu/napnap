# Coding Rules & Standards

> Reglas de comportamiento para Claude al trabajar en este proyecto.

---

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them—don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

---

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

---

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it—don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

---

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

---

## 5. Bug Fixes: Prove It Pattern

**First step: write a test that reproduces the issue.**

Test level hierarchy:
1. **Unit test** — Pure logic bugs, isolated functions
2. **Integration test** — Component interactions, API boundaries
3. **UX spec test** — Full user flows, browser-dependent behavior

For every bug fix:
1. **Reproduce** — Write a test that demonstrates the bug (should fail)
2. **Fix** — Implement the fix
3. **Confirm** — The test now passes

If truly environment-specific, document why a test isn't feasible.

---

## 6. Memory Protocol

**Eres el guardián de la memoria de NapNap.**

### Auto-Log (End of Session)
Al finalizar una sesión de trabajo o hito importante, genera automáticamente:
- `.context/logs/YYYY-MM-DD.md` con cambios técnicos, decisiones de diseño, pendientes

### Auto-Update MEMORY.md
Si una decisión cambia el ADN del proyecto (nueva lógica, nuevo estándar), actualiza inmediatamente `.context/MEMORY.md`.

### Golden Rule
**Si algo no está documentado en `.context/`, no existe.**

---

## Success Indicators

These guidelines are working if:
- Fewer unnecessary changes in diffs
- Fewer rewrites due to overcomplication
- Clarifying questions come before implementation, not after mistakes
