# Landing Page — UX/UI & Marketing Horizontal Audit

- **Date**: 2026-03-20
- **Area**: Landing page (React + Tailwind, Vite SPA)
- **Persona**: First-time parent (25–38), sleep-deprived, searching "baby sleep tracker" on mobile or desktop. Skeptical of yet-another-app. Needs to feel "these people get it" within 5 seconds.
- **User goal**: Understand what NapNap does, feel trust, convert to sign-up
- **Competitors benchmarked**: Huckleberry, Taking Cara Babies, Linear (design quality reference)

---

## 1. Scenario & flow

4 flows audited end-to-end via code inspection:

1. **First impression** — User lands on homepage, scans hero, decides if this is credible
2. **Learn & evaluate** — User scrolls through social proof, how-it-works, product showcase, features
3. **Convert** — User clicks primary CTA or joins email list
4. **Navigate** — User uses nav, changes language, visits footer links

---

## 2. Step-by-step walkthrough

### Flow 1 — First impression

**Step 1 – Navigation bar (mobile)**

- **Problem — No logo/brand mark on scroll**: Once the wordmark fades at 80px scroll, only the burger remains. User loses brand context. Competitors keep a compact logo visible at all times.
- Fix: Keep a small "NN" symbol or compact wordmark always visible next to the burger.

**Step 2 – Hero section**

- **Problem — Hero videos feel decorative, not purposeful**: Three small videos (118–148px wide) absolutely positioned in a container create a "Pinterest mood board" effect. They don't show the actual product. The videos are lifestyle clips (train, park, sleeping) — they look like stock footage. Competitors show the actual app in action or real parents using it.
- **Problem — Videos are heavy and auto-play**: 8 MP4 files loaded into 3 `<video>` elements with `autoPlay`. On mobile, this is ~15–30MB of video downloading on first load. No `preload="none"` or intersection observer. Performance impact is severe for mobile users on cellular.
- **Problem — Hero headline hierarchy is weak**: The tagline "Rhythmic baby sleep companion" (`hero-secondary`, 1.0625rem, weight 600) sits above the H1. It's a small, letterspaced line that reads more like a subtitle than a hook. The H1 itself ("Stop guessing naps. / Move with your baby's rhythm.") is good copy but lands below the fold on mobile because the tagline + videos push it down.
- Fix: Replace lifestyle videos with a single hero image or animated app mockup showing the actual product. Move tagline below H1 as a supporting line. Reduce above-the-fold weight.

**Step 3 – Reassurance badges**

- **Good**: These address the top 3 objections from user research. Smart placement near CTA.
- **Problem — Too subtle**: `text-xs` with `glass-bg` makes them nearly invisible on the light morning theme. They don't pop enough to counter anxiety.
- Fix: Slightly increase size (text-sm), add a subtle tinted background per badge.

### Flow 2 — Learn & evaluate

**Step 4 – Social proof / Testimonials**

- **Problem — No press logos or app store ratings**: Huckleberry shows NYTimes, TechCrunch, Time logos. NapNap has zero third-party validation. This is the single biggest credibility gap.
- Fix: Add a "Featured in" section with logos (even if just ProductHunt, BetaList, or local press).

**Step 5 – How it works**

- **Good**: Clean layout, clear 1-2-3 flow, good copy.
- **Problem — No visuals**: Each step is just text in a card. Competitors show screenshots, illustrations, or micro-animations for each step. The cards feel generic — they could describe any app.
- Fix: Add a small illustration or app screenshot per step (e.g., step 1: baby profile form, step 2: one-tap logging, step 3: today view).

**Step 6 – Product showcase**

- **Good**: Device frames look polished (dark phone bezels with notch). Screenshots show real app.
- **Problem — Screenshots are tiny on mobile**: `w-[200px]` in horizontal scroll means each screenshot is too small to read. Users can't actually see what the app looks like.
- **Problem — Dark device frames on light page**: The device frames use `#050816` background, which creates a jarring contrast against the light morning theme. Competitors use lighter frames or floating screenshots.
- Fix: Make screenshots larger on mobile (w-[260px] or full-width with swipe). Consider lighter device frames or drop shadows that blend with the morning theme.

**Step 7 – Mid-page CTA**

- **Good**: Well-placed conversion checkpoint after social proof and product demo.
- **Problem — Visually flat**: No background, no card, no visual separator. It blends into the surrounding whitespace and gets scrolled past.
- Fix: Add a subtle gradient band or card treatment to make it a visual "stop point."

**Step 8 – What you get (features)**

- **Good**: Icons use design system glow colors. Copy is clear and benefit-oriented.
- **Problem — Section feels like filler**: 4 generic feature cards is the most overused landing page pattern. The cards don't differentiate NapNap from any other baby app. No screenshots, no demos, no "aha moment."
- Fix: Show each feature in context — e.g., a mini screenshot or animation demonstrating multi-caregiver sharing, or the 30-day report output.

**Step 9 – FAQ**

- **Good**: Grid-rows animation is smooth. Questions are relevant. Copy tone is excellent ("Questions, calmly answered").
- **Problem — FAQ answers are plain text with no formatting**: Long answers like the wake window explanation would benefit from bold keywords or bullet points.
- Fix: Minor — add `<strong>` to key terms in FAQ answers.

### Flow 4 — Navigate

**Step 10 – Overall page structure**

- **Problem — No above-the-fold product screenshot**: The most critical element for a product landing page — showing what you're selling — is hidden behind lifestyle videos. Users have to scroll past the hero + testimonials + how-it-works to see the actual app (product showcase section). That's ~3 screens of scrolling.
- **Problem — No numbers/metrics anywhere**: No "X families", no "Y naps tracked", no response time, no accuracy stat. The page is pure prose. Numbers build trust faster than words.
- **Problem — `space-y-16` creates uniform rhythm**: Every section has the same 64px gap. This creates a monotonous scroll with no visual peaks or valleys. Professional landing pages alternate between tight content and spacious breathing room.

---

## 3. Findings

### 3.1 Frictions

- Hero videos obscure the product — users can't tell what NapNap actually looks like until they scroll 3 screens
- No social proof beyond text testimonials (no logos, ratings, download counts, press)
- Videos auto-download ~15-30MB on mobile without lazy loading

### 3.2 Inconsistencies

| Area | What differs | Expected uniform behavior |
|---|---|---|
| Device frames | Dark (#050816) frames on light morning theme | Frames should match page theme |
| Section backgrounds | Testimonials and features have `bg-mid` bands; other sections float on sky | Consistent visual rhythm |

### 3.3 Dependencies

- Hero redesign (removing videos) unblocks performance improvements
- Testimonial avatar images (pending from user) needed to complete credibility fix

---

## 4. Remaining improvements

### 4.1 P0 — Must fix

| ID | Issue | Location | Fix | Impact | Effort |
|---|---|---|---|---|---|
| U-02 | Hero videos are 15-30MB, auto-download on mobile, no lazy loading | `LandingPage.tsx`, `CyclingVideo` component | Remove hero videos entirely. Replace with a single high-quality hero image showing the app in a device frame (phone mockup). Use WebP, `fetchpriority="high"`, and keep under 200KB. | Critical | Medium |
| U-04 | No above-the-fold product visibility — user can't see what NapNap looks like until 3 screens of scrolling | `LandingPage.tsx` hero section | Replace lifestyle videos with an app screenshot in a device frame as the hero visual. Show the Today view — it's the most compelling screen. | Critical | Medium |

### 4.2 P1 — Important

| ID | Issue | Location | Fix | Impact | Effort |
|---|---|---|---|---|---|
| U-06 | No press logos, app ratings, or third-party validation anywhere on page | N/A (missing section) | Add a "Featured in" logo strip below testimonials. Even ProductHunt, BetaList, or "Built in Barcelona" badge. If no press yet, add aggregate stats ("X naps tracked") or a trust badge. | High | Medium |
| U-09 | "How it works" steps have no visuals — generic text-only cards | `LandingPage.tsx` how-it-works section | Add a small app screenshot or illustration to each step card (profile form, tap-to-log, today view). | Medium | Medium |
| U-10 | Product screenshots too small on mobile (200px in scroll) | `LandingPage.tsx` product showcase | Increase to `w-[280px]` or use full-width cards with swipe navigation. | Medium | Low |
| U-11 | Mid-page CTA is visually flat — blends into whitespace | `LandingPage.tsx` mid-CTA section | Wrap in a gradient band or card with subtle accent background to create a visual "stop point." | Medium | Low |
| U-13 | Monotonous `space-y-16` rhythm — no visual peaks/valleys | `LandingPage.tsx:351` | Vary spacing: tighter between related sections (how-it-works → showcase), more breathing room before CTA blocks. Use alternating band/no-band pattern. | Medium | Medium |
| U-14 | Mobile wordmark disappears on scroll — no brand presence | `LandingPage.tsx` mobile header | Keep a compact logo/symbol visible alongside the burger button at all times. | Medium | Low |

### 4.3 P2 — Nice to have

| ID | Issue | Location | Fix | Impact | Effort |
|---|---|---|---|---|---|
| U-17 | FAQ answers are plain text — no bold keywords | `en.json`, `es.json`, `ca.json` FAQ sections | Add `<strong>` to key terms (wake window, age-based, one tap). | Low | Low |
| U-18 | Reassurance badges too subtle (text-xs, glass-bg) | `LandingPage.tsx` reassurance badges | Bump to text-sm, add light tinted background per badge for better morning-theme visibility. | Low | Low |
| U-20 | Device frame dark bezels (#050816) clash with light morning theme | `index.css` `.device-frame` | Lighten frame to soft gray or use a shadow-only "floating" frame style. | Low | Medium |
| U-21 | No `prefers-reduced-motion` handling for hero videos or FAQ animations | `LandingPage.tsx`, `index.css` | Add `@media (prefers-reduced-motion: reduce)` to disable autoplay and grid-rows animation (WCAG SC 2.3.3). | Medium | Low |

---

### Completed items (2026-03-20)

| ID | Issue | Resolution |
|---|---|---|
| U-01 | Nav pill overflows on 768–1024px — 3 language chips | Replaced with globe icon + dropdown (`LandingLanguagePicker.tsx`) |
| U-03 | "Trusted by dozens of families" undermines credibility | Changed to "What parents are saying" (all 3 locales) |
| U-05 | Two conflicting conversion paths (waitlist vs live app) | Reframed email capture as "Stay in the loop" / "Join", aligned all CTAs to "Get started" |
| U-07 | Testimonials have no avatars, all female Catalan names | Added initials avatars with design-system colors, diversified to include dads (Andreu, David) |
| U-08 | Nav CTA says "Log in" while hero targets new users | Changed to "Get started" / "Empezar" / "Comença" |
| U-12 | No founder/team/human element — page feels faceless | Added "Built by parents in Barcelona" section |
| U-15 | Age range section adds minimal value as standalone block | Replaced with functional sleep guides grid (17 clickable age cards) |
| U-16 | Sleep Guides listed under "Legal" in footer | Moved to "Product" column |
| U-19 | Footer language picker duplicates nav chips | Fixed globally with new dropdown component |
| U-22 | `<html lang>` hardcoded, doesn't update on language switch | `document.documentElement.lang` now updated in `changeLocale()` |

---

### Remaining task groups

### Task Group A — Hero & First Impression Overhaul (U-02, U-04, U-14)
**Depends on**: User providing app screenshots
**Files**: `LandingPage.tsx`, `/public/media/` (new hero image)

1. Remove `CyclingVideo`, `HeroVideos` components and `HERO_VIDEO_SLOTS` data
2. Create/source a single hero image: app screenshot in a clean device frame on a soft gradient background (WebP, <200KB)
3. Replace hero right column with the static hero image (responsive sizing)
4. Keep compact logo visible on mobile scroll (add small wordmark/symbol next to burger)
5. Delete unused video files from `/public/media/` to reduce bundle

### Task Group E — Content & Visual Polish (U-09, U-10, U-11, U-13, U-18)
**Depends on**: Task Group A (hero image sets visual tone for rest of page)
**Files**: `LandingPage.tsx`, `en.json`, `es.json`, `ca.json`

1. Add small screenshots/illustrations to "How it works" step cards
2. Increase mobile product showcase card width to 280px
3. Wrap mid-page CTA in a subtle gradient card
4. Bump reassurance badge size to text-sm
5. Vary section spacing for visual rhythm (reduce space-y between related sections, increase before CTAs)

### Task Group F — Accessibility & Performance (U-20, U-21)
**Depends on**: Task Group A (video removal is the biggest perf win)
**Files**: `index.css`, `LandingPage.tsx`

1. Add `prefers-reduced-motion` media query to disable FAQ animation
2. Lighten device frame backgrounds for morning theme compatibility

### Execution order

```
Task Group A ── blocked on user screenshots (biggest visual + performance win)
     │
     └──► Task Group E (depends on A for visual coherence)
              │
              └──► Task Group F (polish pass)
```

---

## 5. Debrief

### Key remaining problems

- **The page doesn't show the product above the fold.** The hero is occupied by lifestyle videos that could belong to any baby brand. A first-time visitor has to scroll past 3 full screens before seeing what NapNap actually looks like. This is the single biggest conversion killer — the app's Today view is genuinely compelling, but it's buried. **Blocked on user providing screenshots.**

- **No third-party validation.** Press logos, app ratings, or aggregate stats ("X naps tracked") are still missing. This is the next biggest credibility gap after the testimonial fixes.

### What was fixed

- Language picker no longer breaks the nav (globe dropdown)
- Testimonials no longer say "dozens" and now have avatars + gender diversity
- CTAs are aligned ("Get started" everywhere, email capture reframed)
- Sleep guides surfaced on landing page (17 age cards replacing empty tags)
- "Built by parents in Barcelona" section adds human presence
- Footer categorization fixed

### Risk if nothing changes

- **Performance**: 15-30MB of hero video auto-downloading will cause measurably high bounce rates on mobile, especially in Spain/EU markets where cellular speeds vary. This is the highest-priority remaining fix.
- **First impression**: Without an above-the-fold product screenshot, visitors still can't tell what NapNap looks like until they scroll significantly.

---

## 6. Marketing & positioning notes (beyond UX/UI)

### What's working well
- **Copy quality is genuinely excellent.** "Stop guessing naps." "The quiet voice at 3am." "Questions, calmly answered." "No drip campaigns." This is premium-grade brand writing that most competitors can't match.
- **Emotional safety messaging is pitch-perfect.** "No sleep training method, no scores or grades" directly addresses the #1 parental anxiety about baby apps.
- **The product itself is the best marketing asset.** The Today view screenshot is more compelling than any video or illustration. Show it bigger, sooner, everywhere.

### What's still missing for "real company" perception
1. **Social proof hierarchy**: Numbers > logos > testimonials > nothing. Testimonials are now better (avatars, diversity), but still no logos or numbers.
2. **Authority signals**: No "recommended by pediatricians", no expert endorsements, no scientific backing mentions.
3. **Founder presence**: "Built by parents" section is in — but a photo + name would do even more for trust.
4. **Specificity**: "NapNap adapts" is vague. "Predictions update every 30 seconds as your baby sleeps" is concrete and credible.
