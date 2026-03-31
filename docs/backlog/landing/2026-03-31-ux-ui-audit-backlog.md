# Landing Page — UX/UI Audit Backlog (2026-03-31)

Source: [2026-03-31 Landing Audit](../../audits/landing/2026-03-31-landing-ux-ui-marketing-audit.md)

---

## P0 — Must fix

### U-02 — Hero videos are 15-30MB, auto-download on mobile

- **Effort**: Medium
- **Impact**: Critical
- **Open since**: 2026-03-20
- **Location**: `LandingPage.tsx:40-62` (`HERO_VIDEO_SLOTS`), `LandingPage.tsx:103-164` (`CyclingVideo`, `HeroVideos`)
- **Problem**: 8 MP4 files loaded into 3 `<video>` elements with `autoPlay`. ~15-30MB auto-downloading on mobile with no lazy loading. Severe performance impact, especially on cellular. Will cause high bounce rates.
- **Fix**: Remove `CyclingVideo`, `HeroVideos` components and `HERO_VIDEO_SLOTS`. Replace with a single static hero image (app screenshot in device frame, WebP, <200KB). Use existing `napnap-today-new.png` from `/public/media/`. Delete 8 MP4 files.
- **Notes**: Tied to U-04. Best implemented together as a single hero redesign.

### U-04 — No above-the-fold product visibility

- **Effort**: Medium
- **Impact**: Critical
- **Open since**: 2026-03-20
- **Location**: `LandingPage.tsx:406-408` (hero right column)
- **Problem**: Users can't see what NapNap looks like until 3 screens of scrolling (hero + testimonials + how-it-works). Hero shows lifestyle videos (train, park, sleeping) — not the product. The Today view is the most compelling screen but it's buried.
- **Fix**: Replace hero video column with `napnap-today-new.png` (already exists in `/public/media/`) in a `.device-frame` container. This is the single highest-ROI change — fixes performance, first impression, and conversion in one move.

---

## P1 — Important

### U-06 — No press logos, ratings, or third-party validation

- **Effort**: Medium
- **Impact**: High
- **Open since**: 2026-03-20
- **Location**: Missing section (should be below testimonials)
- **Problem**: No press logos, app store ratings, download counts, or any third-party validation. Testimonials are text-only (weakest form of social proof). Competitors show NYTimes, TechCrunch logos. Biggest credibility gap.
- **Fix**: Add "Trusted by X families" counter or "Featured in" logo strip below testimonials. Minimum viable: trust badges ("GDPR compliant", "Free forever", "Built in Barcelona"). Needs i18n in en/es/ca.
- **Notes**: Depends on what social proof data is available.

### U-09 — "How it works" steps have no visuals

- **Effort**: Medium
- **Impact**: Medium
- **Open since**: 2026-03-20
- **Location**: `LandingPage.tsx:458-487`
- **Problem**: Text-only cards with step numbers. Generic — could describe any app. Competitors show screenshots or illustrations per step.
- **Fix**: Add a small app screenshot or illustration to each step card. Reuse existing screenshots from `/public/media/` (profile form, QuickActionSheet, Today view).
- **Notes**: Depends on hero overhaul (U-02/U-04) for visual coherence.

### U-10 — Product screenshots too small on mobile (200px)

- **Effort**: Low
- **Impact**: Medium
- **Open since**: 2026-03-20
- **Location**: `LandingPage.tsx:499, 513, 527`
- **Problem**: Showcase screenshots are `w-[200px]` in horizontal scroll. Too small to read the app UI on mobile. The most compelling section is functionally invisible.
- **Fix**: Increase to `w-[280px]` or use full-width swipeable cards on mobile.

### U-14 — Mobile wordmark disappears on scroll

- **Effort**: Low
- **Impact**: Medium
- **Open since**: 2026-03-20
- **Location**: `LandingPage.tsx:258-268`
- **Problem**: Wordmark fades at 80px scroll, leaving only the burger. User loses all brand context. Competitors keep compact logo visible always.
- **Fix**: Keep a compact "NapNap" text mark or "NN" symbol visible alongside the burger at all times.

---

## P2 — Nice to have

### U-13 — Section spacing could have more visual rhythm

- **Effort**: Low
- **Impact**: Low
- **Open since**: 2026-03-20
- **Location**: `LandingPage.tsx` (various `mt-*` classes)
- **Problem**: Spacing is more varied now but still somewhat monotonous. No deliberate peaks/valleys.
- **Fix**: Tighter between related sections (how-it-works → showcase: `mt-8`), more breathing room before CTAs (`mt-24`).
