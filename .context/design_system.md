# Design System

Source of truth: `src/index.css` — all tokens are CSS custom properties on `:root`.
No `tailwind.config` file; Tailwind v4 is used via the `@tailwindcss/vite` plugin with default settings.

---

## Circadian Theme System

Three time-based palettes applied as a class on `<html>` by `useApplyCircadianTheme()`:

| Phase | Hours | CSS Class | Mood |
|-------|-------|-----------|------|
| Morning | 06:00–11:59 | `.theme-morning` | Warm, golden, energising |
| Afternoon | 12:00–18:59 | `.theme-afternoon` | Soft, earthy, productive |
| Night | 19:00–05:59 | `.theme-night` / `:root` default | Deep, calming, eye-safe |

All tokens below shift per-theme. Components consume `var(--token)` and never hardcode colour hex values.

---

## Colours

### Backgrounds

| Token | Night | Morning | Afternoon | Role |
|-------|-------|---------|-----------|------|
| `--bg-deep` | `#1A1B2E` | `#FFFBF2` | `#FDF7F2` | Page background |
| `--bg-mid` | `#1F2038` | `#FFF8EB` | `#FAF4EF` | Mid-layer surface |
| `--bg-soft` | `#25263D` | `#FFFFFF` | `#FFFFFF` | Soft surface / inputs |
| `--bg-card` | `#25263D` | `#FFFFFF` | `#FFFFFF` | Card background |
| `--bg-elevated` | `#2D2E4A` | `#FFFFFF` | `#FFFFFF` | Elevated surface / focus |

### Semantic Accent Colours

| Token | Night | Morning / Afternoon | Meaning |
|-------|-------|---------------------|---------|
| `--nap-color` | `#9DBAB7` (matte sage) | `#0D9488` (teal 600) | Daytime naps |
| `--nap-soft` | `#8AABA8` | `#0F766E` | Nap pressed / secondary |
| `--night-color` | `#A5B4FC` (muted periwinkle) | `#6366F1` (indigo 500) | Night sleep |
| `--night-soft` | `#9AA8E8` | `#4F46E5` | Night pressed / secondary |
| `--wake-color` | `#FCD9A3` (warm parchment) | `#D97706` (amber 600) | Wake-up, totals |
| `--wake-soft` | `#E8C893` | `#B45309` | Wake pressed / secondary |
| `--success-color` | `#7cb07e` | `#059669` | Active / positive |
| `--danger-color` | `#c47c7c` | `#DC2626` | Destructive actions |

### Glow Colours (for `box-shadow`)

| Token | Night | Morning / Afternoon |
|-------|-------|---------------------|
| `--nap-glow` | `rgba(157,186,183, 0.15)` | `rgba(13,148,136, 0.15)` |
| `--night-glow` | `rgba(165,180,252, 0.15)` | `rgba(99,102,241, 0.15)` |
| `--wake-glow` | `rgba(252,217,163, 0.15)` | `rgba(217,119,6, 0.25)` |

### Text

| Token | Night | Morning / Afternoon | Usage |
|-------|-------|---------------------|-------|
| `--text-primary` | `#94A3B8` | `#1E293B` | Body text |
| `--text-secondary` | `rgba(148,163,184, 0.75)` | `rgba(30,41,59, 0.7)` | Supporting text |
| `--text-muted` | `rgba(148,163,184, 0.45)` | `rgba(30,41,59, 0.45)` | Labels, hints |
| `--text-on-accent` | `#1A1B2E` | `#FFFFFF` | Text on filled accent buttons |
| `--text-card-title` | `#B8C4D4` | `#1E293B` | Card headings |

### Glass / Overlay

| Token | Night | Morning / Afternoon |
|-------|-------|---------------------|
| `--glass-bg` | `rgba(37,38,61, 0.7)` | `rgba(255,255,255, 0.85)` |
| `--glass-border` | `rgba(255,255,255, 0.06)` | `rgba(0,0,0, 0.06)` |
| `--glass-nav-bg` | `rgba(26,27,46, 0.85)` | `rgba(255,255,255, 0.92)` |

### Sky Gradients

| Theme | Value |
|-------|-------|
| Night | `linear-gradient(180deg, #0D0E1A 0%, #1A1B2E 40%, #25263D 100%)` |
| Morning | `linear-gradient(to bottom, #FFFBF2 0%, #FFFFFF 100%)` |
| Afternoon | `linear-gradient(to bottom, #FDF7F2 0%, #FFFFFF 100%)` |

---

## Typography

### Font Families

| Token | Value | Usage |
|-------|-------|-------|
| `--font-display` | `'Quicksand', sans-serif` | Headings, buttons, display text, stats |
| `--font-body` | `'Nunito', sans-serif` | Body copy, inputs, labels |

Weights loaded: **500** (medium), **600** (semibold), **700** (bold) for both families.

### Body Defaults

| Property | Value |
|----------|-------|
| Font family | `var(--font-body)` |
| Font size | `17px` |
| Font weight | `500` |
| Line height | `1.5` |
| Letter spacing | `-0.02em` |

### Display Scale (CSS classes)

| Class | Font | Size | Weight | Letter Spacing |
|-------|------|------|--------|----------------|
| `.text-display-lg` | Quicksand | `2rem` (32px) | 700 | `-0.02em` |
| `.text-display-md` | Quicksand | `1.5rem` (24px) | 600 | `-0.01em` |
| `.text-display-sm` | Quicksand | `1.125rem` (18px) | 600 | — |
| `.hero-countdown` | Quicksand | `3.5rem` (56px) | 700 | `-0.03em` |
| `.hero-secondary` | Quicksand | `1.0625rem` (17px) | 600 | `0.05em` |
| `.stat-value` | Quicksand | `1.5rem` (24px) | 700 | — |
| `.stat-label` | (inherit) | `0.875rem` (14px) | 500 | — |
| `.tag` | Quicksand | `0.8125rem` (13px) | 600 | — |

---

## Spacing

| Token | Value | Pixels |
|-------|-------|--------|
| `--space-xs` | `0.25rem` | 4px |
| `--space-sm` | `0.5rem` | 8px |
| `--space-md` | `1rem` | 16px |
| `--space-lg` | `1.5rem` | 24px |
| `--space-xl` | `2rem` | 32px |
| `--space-2xl` | `3rem` | 48px |

In practice, Tailwind utility classes (`p-4`, `gap-3`, `mb-6`) are used more often than these tokens. The tokens exist for CSS classes (`.btn`, `.input`, `.sheet-content`).

---

## Border Radii

| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| `--radius-sm` | `0.75rem` | 12px | Small elements |
| `--radius-md` | `1rem` | 16px | Medium elements |
| `--radius-lg` | `1.5rem` | 24px | Large cards |
| `--radius-xl` | `2rem` | 32px | Inputs, prominent cards |
| `--radius-2xl` | `1.75rem` | 28px | — |
| `--radius-3xl` | `2rem` | 32px | Cards (`.card`), sheets, modals |
| `--radius-full` | `9999px` | pill | Buttons, tags, avatars |

**Premium gallery cards** use `rounded-[40px]` via Tailwind (outside the token scale).

---

## Shadows

| Token | Night | Morning / Afternoon |
|-------|-------|---------------------|
| `--shadow-sm` | `0 2px 8px rgba(0,0,0, 0.25)` | `0 4px 12px -2px rgba(0,0,0, 0.06)` |
| `--shadow-md` | `0 4px 16px rgba(0,0,0, 0.3)` | `0 8px 24px -4px rgba(0,0,0, 0.10)` |
| `--shadow-lg` | `0 8px 32px rgba(0,0,0, 0.35)` | `0 20px 40px -10px rgba(0,0,0, 0.12)` |
| `--shadow-card` | `0 4px 16px rgba(0,0,0, 0.3)` | `0 8px 24px -4px rgba(0,0,0, 0.10)` |

### Glow Shadows (active state emphasis)

| Token | Night | Morning / Afternoon |
|-------|-------|---------------------|
| `--shadow-glow-nap` | `0 0 40px rgba(157,186,183, 0.25)` | `0 8px 30px -5px rgba(13,148,136, 0.3)` |
| `--shadow-glow-night` | `0 0 40px rgba(165,180,252, 0.25)` | `0 8px 30px -5px rgba(99,102,241, 0.3)` |
| `--shadow-glow-wake` | `0 0 40px rgba(252,217,163, 0.25)` | `0 8px 30px -5px rgba(217,119,6, 0.35)` |

---

## Transitions & Easings

| Token | Value | Usage |
|-------|-------|-------|
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | CSS keyframe animations |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Button press feedback |
| `--ease-smooth` | `cubic-bezier(0.4, 0, 0.2, 1)` | Shadow, background transitions |
| `--circadian-transition` | `1.5s ease-in-out` | Theme crossfade between circadian phases |

**Bottom sheets (Framer Motion):** Open/close use tween `duration: 0.25, ease: 'easeOut'` — no bounce. Any sheet that shows a drag handle must support drag-to-dismiss (offset > 150px or velocity > 500 to close).

---

## Safe Areas

| Token | Value |
|-------|-------|
| `--safe-top` | `env(safe-area-inset-top, 0px)` |
| `--safe-bottom` | `env(safe-area-inset-bottom, 0px)` |
| `--safe-left` | `env(safe-area-inset-left, 0px)` |
| `--safe-right` | `env(safe-area-inset-right, 0px)` |

---

## Touch Targets

| Element | Min Size | Notes |
|---------|----------|-------|
| `.btn` | `56px` height, `56px` width | Pill-shaped, display font |
| `.touch-target` | `60px × 60px` | Applied to interactive areas |
| `.nav-tab` | `48px` height, `56px` max-width | Bottom nav items |
| `.nav-action-btn` | `52px × 52px` circle | Centre FAB in nav bar |
| `.fab` | `60px × 60px` circle | Legacy floating action button |

---

## Predefined CSS Classes

### Cards

| Class | Style |
|-------|-------|
| `.card` | Solid `--bg-card`, `--radius-3xl`, `--shadow-md`, borderless |
| `.card-glass` | Frosted `--glass-bg`, blur 16px, `--radius-3xl` |
| `.card-nap` | Subtle nap-tinted gradient, `--shadow-md` |
| `.card-night` | Subtle night-tinted gradient, `--shadow-md` |
| `.card-wake` | Subtle wake-tinted gradient, `--shadow-md` |
| `.card-bedtime` | Subtle coral-tinted gradient, `--shadow-md` |
| `.card-nap-solid` | Solid `--nap-color` fill, `--shadow-glow-nap` |
| `.card-night-solid` | Solid `--night-color` fill, `--shadow-glow-night` |
| `.card-ghost` | Transparent, dashed `white/8` border |
| `.card-ghost-nap` | Transparent nap tint, dashed nap border |
| `.card-ghost-night` | Transparent night tint, dashed night border |

### Buttons

| Class | Fill | Text | Shadow |
|-------|------|------|--------|
| `.btn` | (base) | — | — |
| `.btn-nap` | `--nap-color` | `--bg-deep` | nap glow |
| `.btn-night` | `--night-color` | white | night glow |
| `.btn-wake` | `--wake-color` | `--bg-deep` | wake glow |
| `.btn-ghost` | `white/5` | `--text-secondary` | — |
| `.btn-danger` | `--danger-color` | white | danger glow |

All buttons: `active:scale(0.95)`, `--radius-full`, min `56px` touch target.
Premium gallery cards add `active:brightness-[1.12]` for immediate pressed-state feedback alongside scale.

### Week Strip / Calendar (DayNavigator)

| Element | Style |
|---------|-------|
| Selected day circle | `bg-[var(--nap-color)]` + `text-[var(--text-on-accent)]` |
| Selected day letter | `text-[var(--nap-color)]` (NOT `--text-on-accent` — letter is outside the circle) |
| Today (unselected) | `ring-1 ring-[var(--text-muted)]` + `text-[var(--text-primary)]` |
| Entry dot | `w-1 h-1 rounded-full bg-[var(--text-primary)]` (hidden on selected day) |
| Day letter (normal) | `text-[var(--text-muted)]` |
| Day number (normal) | `text-[var(--text-secondary)]` |
| Calendar out-of-month | `opacity-20` |
| "Back to today" button | `bg-[var(--nap-color)]` + `text-[var(--text-on-accent)]` |

### Glass

| Class | Blur | Background |
|-------|------|------------|
| `.glass` | `blur(20px) saturate(180%)` | `--glass-bg` |
| `.glass-heavy` | `blur(24px) saturate(180%)` | `--glass-bg` |
| `.glass-nav` | `blur(24px) saturate(180%)` | `--glass-nav-bg` |

### Tags

| Class | Background | Text |
|-------|------------|------|
| `.tag-nap` | `nap rgba 15%` | `--nap-color` |
| `.tag-night` | `night rgba 15%` | `--night-color` |
| `.tag-active` | `success rgba 15%` | `--success-color` |

### Animations (CSS)

| Class | Effect | Duration | Easing |
|-------|--------|----------|--------|
| `.fade-in` | Fade + 8px slide up | 0.3s | `--ease-out-expo` |
| `.slide-up` | Slide from bottom | 0.4s | `--ease-out-expo` |
| `.slide-up-soft` | Fade + 24px slide up | 0.4s | `--ease-out-expo` |
| `.scale-in` | Scale 0.95→1 + fade | 0.2s | `--ease-out-expo` |
| `.animate-pulse-soft` | Opacity 1→0.6→1 | 2s infinite | ease-in-out |
| `.animate-glow` | Nap glow pulsing | 2s infinite | ease-in-out |
| `.animate-glow-night` | Night glow pulsing | 2s infinite | ease-in-out |

---

## Light Mode Overrides

When `.theme-morning` or `.theme-afternoon` is active:
- Cards gain `border: 1px solid rgba(0,0,0, 0.08)` for definition on white
- Tinted cards (nap, night, wake) gain a matching colour border
- Ghost card dashes become visible (`rgba(45,52,54, 0.15)`)
- Sheet handles lighten to `rgba(45,52,54, 0.15)`
- Modal overlay is lighter: `rgba(45,52,54, 0.5)`
- Scrollbar thumbs switch to dark: `rgba(45,52,54, 0.15)`
- Native inputs use `color-scheme: light` instead of `dark`
- Nav bar uses `--glass-nav-bg` with `--shadow-md`
