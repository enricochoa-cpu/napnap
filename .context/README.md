# .context — Project Memory

Persistent memory system for AI-assisted development. **Always consult these before making changes.**

## Structure

| Folder | Purpose |
|--------|---------|
| `core/` | Project DNA — philosophy, stack, requirements (rarely changes) |
| `guidelines/` | How to build — coding rules, design system, brand |
| `reference/` | Deep-dive docs — app flow, lessons learned, feature research |
| `operational/` | Living docs — progress, backlog |
| `logs/` | Session history — daily changelogs (append-only) |

## Quick reference

| Task | Read first |
|------|------------|
| Any change | `core/MEMORY.md`, `guidelines/rules.md` |
| UI/UX changes | `core/prd.md` → `guidelines/design_system.md` |
| Bug fix | `reference/lessons.md` |
| New feature | `core/prd.md` → `reference/app_flow.md` |
| Prediction system | `reference/lessons.md` §1 |
| Supabase changes | `reference/lessons.md` §3–4 |
| Styling | `guidelines/design_system.md` (never hardcode hex) |

## Protocols

- **Auto-Log**: End of session → create/append `logs/YYYY-MM-DD.md`
- **Auto-Update**: DNA change → update `core/MEMORY.md`
- **Golden Rule**: If it's not in `.context/`, it doesn't exist
