# Landing Page — UX/UI & Marketing Horizontal Audit

- **Date**: 2026-03-20
- **Area**: Landing page (React + Tailwind, Vite SPA)
- **Persona**: First-time parent (25–38), sleep-deprived, searching "baby sleep tracker" on mobile or desktop. Skeptical of yet-another-app. Needs to feel "these people get it" within 5 seconds.
- **User goal**: Understand what NapNap does, feel trust, convert to sign-up or waitlist
- **Competitors benchmarked**: Huckleberry, Taking Cara Babies, Linear (design quality reference)

---

## 1. Scenario & flow

4 flows audited end-to-end via code inspection:

1. **First impression** — User lands on homepage, scans hero, decides if this is credible
2. **Learn & evaluate** — User scrolls through social proof, how-it-works, product showcase, features
3. **Convert** — User clicks primary CTA or joins waitlist
4. **Navigate** — User uses nav, changes language, visits footer links

---

## 2. Step-by-step walkthrough

### Flow 1 — First impression

**Step 1 – Navigation bar (desktop)**

- `LandingPage.tsx:262-296`: The desktop nav is a `glass-nav-landing` pill with logo, 3 nav links, language picker, and login button all in one row.
- **Problem — Nav overflows on medium screens (768–1024px)**: The pill contains ~7 elements with `gap-6` and `gap-4`. The language picker renders 3 separate chip buttons (`LandingLanguagePicker.tsx:41-48`), each `px-3 py-2 min-h-[40px]`. At 768–900px viewport, the nav items + 3 language chips + login button exceed the pill width, causing the layout to break (chips wrap or overflow). This is exactly what the user's screenshot shows.
- **Problem — Language picker is 3 chips**: This is UX-unusual. Every professional site (Huckleberry, Linear, Stripe) uses a dropdown or a single toggle. Three fat chips inside a nav pill is visually heavy, takes ~120px of horizontal space, and confuses the hierarchy — the language chips compete with the login CTA for attention.
- Fix: Replace the 3-chip language picker with a compact globe icon + dropdown (or a single `<select>` styled as a pill). Saves ~80px and matches user expectations.

**Step 2 – Navigation bar (mobile)**

- `LandingPage.tsx:250-259`: Mobile shows only the wordmark (left) + burger button (right). The wordmark fades on scroll (`hideMobileWordmark`).
- **Good**: Burger button has glass pill styling, proper `aria-expanded`, 56px touch target. Mobile menu is fullscreen dark overlay with clear hierarchy.
- **Problem — No logo/brand mark on scroll**: Once the wordmark fades at 80px scroll, only the burger remains. User loses brand context. Competitors keep a compact logo visible at all times.
- Fix: Keep a small "NN" symbol or compact wordmark always visible next to the burger.

**Step 3 – Hero section**

- `LandingPage.tsx:354-399`: 2-column grid on desktop (text left, videos right), stacked on mobile.
- **Problem — Hero videos feel decorative, not purposeful**: Three small videos (118–148px wide) absolutely positioned in a container create a "Pinterest mood board" effect. They don't show the actual product. The videos are lifestyle clips (train, park, sleeping) — they look like stock footage. Competitors show the actual app in action or real parents using it.
- **Problem — Videos are heavy and auto-play**: 8 MP4 files loaded into 3 `<video>` elements with `autoPlay`. On mobile, this is ~15–30MB of video downloading on first load. No `preload="none"` or intersection observer. Performance impact is severe for mobile users on cellular.
- **Problem — Hero headline hierarchy is weak**: The tagline "Rhythmic baby sleep companion" (`hero-secondary`, 1.0625rem, weight 600) sits above the H1. It's a small, letterspaced line that reads more like a subtitle than a hook. The H1 itself ("Stop guessing naps. / Move with your baby's rhythm.") is good copy but lands below the fold on mobile because the tagline + videos push it down.
- Fix: Replace lifestyle videos with a single hero image or animated app mockup showing the actual product. Move tagline below H1 as a supporting line. Reduce above-the-fold weight.

**Step 4 – Reassurance badges**

- `LandingPage.tsx:376-392`: Three pill badges ("No sleep training method", "No scores or grades", "Free to start") with check icons.
- **Good**: These address the top 3 objections from user research. Smart placement near CTA.
- **Problem — Too subtle**: `text-xs` with `glass-bg` makes them nearly invisible on the light morning theme. They don't pop enough to counter anxiety.
- Fix: Slightly increase size (text-sm), add a subtle tinted background per badge.

### Flow 2 — Learn & evaluate

**Step 5 – Social proof / Testimonials**

- `LandingPage.tsx:402-421`: 6 testimonials in a 2-column grid inside a `bg-[var(--bg-mid)]` band.
- **Problem — "Trusted by dozens of families"**: This heading actively undermines credibility. "Dozens" signals tiny scale. Huckleberry says "5 million families." Even if NapNap is early-stage, "dozens" is worse than saying nothing. It's an anti-social-proof signal.
- **Problem — No faces, no photos**: All testimonials are text-only with first name + context. Without photos (even stock), they feel fabricated. Every competitor uses avatars or real photos.
- **Problem — No press logos or app store ratings**: Huckleberry shows NYTimes, TechCrunch, Time logos. NapNap has zero third-party validation. This is the single biggest credibility gap.
- **Problem — All testimonial authors are female, all Catalan names**: Mireia, Rosa, Eva, Marta, Cristina, Pepi. This feels like they were written by one person (they were). Diversity in names, genders, and contexts would help.
- Fix: (1) Change heading to "What parents are saying" — neutral, no number. (2) Add avatar placeholders (initials or illustrations). (3) Add a "Featured in" section with logos (even if just ProductHunt, BetaList, or local press). (4) Diversify author profiles.

**Step 6 – How it works**

- `LandingPage.tsx:424-460`: 3-step cards with numbered circles.
- **Good**: Clean layout, clear 1-2-3 flow, good copy.
- **Problem — No visuals**: Each step is just text in a card. Competitors show screenshots, illustrations, or micro-animations for each step. The cards feel generic — they could describe any app.
- Fix: Add a small illustration or app screenshot per step (e.g., step 1: baby profile form, step 2: one-tap logging, step 3: today view).

**Step 7 – Product showcase**

- `LandingPage.tsx:463-515`: 3 app screenshots in device frames, horizontal scroll on mobile, 3-col grid on desktop.
- **Good**: Device frames look polished (dark phone bezels with notch). Screenshots show real app.
- **Problem — Screenshots are tiny on mobile**: `w-[200px]` in horizontal scroll means each screenshot is too small to read. Users can't actually see what the app looks like.
- **Problem — Dark device frames on light page**: The device frames use `#050816` background, which creates a jarring contrast against the light morning theme. Competitors use lighter frames or floating screenshots.
- Fix: Make screenshots larger on mobile (w-[260px] or full-width with swipe). Consider lighter device frames or drop shadows that blend with the morning theme.

**Step 8 – Mid-page CTA**

- `LandingPage.tsx:518-530`: Simple centered CTA with heading + description + button.
- **Good**: Well-placed conversion checkpoint after social proof and product demo.
- **Problem — Visually flat**: No background, no card, no visual separator. It blends into the surrounding whitespace and gets scrolled past.
- Fix: Add a subtle gradient band or card treatment to make it a visual "stop point."

**Step 9 – What you get (features)**

- `LandingPage.tsx:533-591`: 4 feature cards in 2x2 grid with icon tokens.
- **Good**: Icons use design system glow colors. Copy is clear and benefit-oriented.
- **Problem — Section feels like filler**: 4 generic feature cards is the most overused landing page pattern. The cards don't differentiate NapNap from any other baby app. No screenshots, no demos, no "aha moment."
- Fix: Show each feature in context — e.g., a mini screenshot or animation demonstrating multi-caregiver sharing, or the 30-day report output.

**Step 10 – Age range section**

- `LandingPage.tsx:594-607`: H2 + description + 4 tag badges.
- **Problem — Lowest-value section on the page**: 4 tags saying "Newborn, 3-6 months, 6-12 months, 12-18 months" adds almost no information. It takes up vertical space without contributing to conversion. This is the kind of detail that belongs in a FAQ answer or feature description, not a standalone section.
- Fix: Remove as standalone section. Integrate age range info into the hero subtitle or FAQ.

**Step 11 – FAQ**

- `LandingPage.tsx:610-641`: Accordion with 6 questions in a single card.
- **Good**: Grid-rows animation is smooth. Questions are relevant. Copy tone is excellent ("Questions, calmly answered").
- **Problem — FAQ answers are plain text with no formatting**: Long answers like the wake window explanation would benefit from bold keywords or bullet points.
- Fix: Minor — add `<strong>` to key terms in FAQ answers.

### Flow 3 — Convert

**Step 12 – Email capture / Waitlist**

- `LandingPage.tsx:644-680`: Card with email input + submit button.
- **Good**: Copy is excellent ("Not ready yet? That's fine." / "No drip campaigns."). Addresses signup anxiety.
- **Problem — Waitlist feels like a dead end**: The page has TWO conversion paths — "Create your free sleep plan" (goes to /app) and "Notify me" (waitlist). It's unclear why both exist. If the app is live, why is there a waitlist? If it's not live, why does the CTA say "Create your free sleep plan"? This creates cognitive dissonance.
- Fix: Pick one primary conversion. If the app is live, remove the waitlist or reframe it as "Get sleep tips by email." If in beta, make the CTA reflect that ("Join the beta").

### Flow 4 — Navigate

**Step 13 – Footer**

- `LandingFooter.tsx:17-83`: 3-column grid (brand + tagline, product links, legal links) + copyright.
- **Good**: Clean structure. Includes language picker (duplicated from nav — expected).
- **Problem — Footer language picker is also 3 chips**: Same issue as nav. In the footer it's less egregious but still visually heavy.
- **Problem — "Sleep Guides" is under "Legal" column**: Sleep guides are content, not legal documents. Misleading categorization.
- Fix: Move sleep guides to "Product" column or create a "Resources" column.

**Step 14 – Overall page structure**

- **Problem — No above-the-fold product screenshot**: The most critical element for a product landing page — showing what you're selling — is hidden behind lifestyle videos. Users have to scroll past the hero + testimonials + how-it-works to see the actual app (product showcase section). That's ~3 screens of scrolling.
- **Problem — No numbers/metrics anywhere**: No "X families", no "Y naps tracked", no response time, no accuracy stat. The page is pure prose. Numbers build trust faster than words.
- **Problem — No founder story / team section**: The user said they want people to feel "some people have done that." There's no human behind NapNap on this page. Competitors show team photos, founder stories, or "Built by parents" sections.
- **Problem — `space-y-16` creates uniform rhythm**: Every section has the same 64px gap. This creates a monotonous scroll with no visual peaks or valleys. Professional landing pages alternate between tight content and spacious breathing room.

---

## 3. Findings

### 3.1 Frictions

- Hero videos obscure the product — users can't tell what NapNap actually looks like until they scroll 3 screens
- "Trusted by dozens of families" actively damages credibility
- Language picker (3 chips in navbar) breaks layout on medium screens and wastes prime nav real estate
- Two conflicting conversion paths (live app CTA vs waitlist) create confusion
- No social proof beyond text testimonials (no logos, ratings, download counts, press)
- Videos auto-download ~15-30MB on mobile without lazy loading
- Sleep Guides categorized under "Legal" in footer

### 3.2 Inconsistencies

| Area | What differs | Expected uniform behavior |
|---|---|---|
| Language picker | 3 chips in nav, 3 chips in mobile menu, 3 chips in footer | Single consistent compact selector everywhere |
| CTA messaging | "Create your free sleep plan" (hero) vs "Start free" (mobile menu) vs "Log in" (desktop nav) | Consistent primary CTA label |
| Device frames | Dark (#050816) frames on light morning theme | Frames should match page theme |
| Section backgrounds | Testimonials and features have `bg-mid` bands; other sections float on sky | Consistent visual rhythm |
| Nav CTA | Desktop says "Log in" (returning user language) but hero says "Create your free sleep plan" (new user) | Nav should also target new users: "Get started" or "Start free" |

### 3.3 Dependencies

- Language picker redesign affects nav, mobile menu, and footer (3 components)
- Hero redesign (removing videos) unblocks performance improvements
- Testimonial section overhaul should happen before adding press/credibility section

### 3.4 Mobile-web parity gaps

Not applicable — this is a web-only product. However, mobile-web experience is significantly weaker than desktop due to:
- Hero videos consuming viewport without showing product
- Product screenshots too small to read in horizontal scroll
- Nav pill overflow on tablet-sized screens

---

## 4. Improvements

### 4.1 P0 — Must fix

| ID | Issue | Location | Fix | Impact | Effort |
|---|---|---|---|---|---|
| U-01 | Nav pill overflows on 768–1024px viewports — language chips + nav + CTA exceed width | `LandingPage.tsx:262-296`, `LandingLanguagePicker.tsx` | Replace 3-chip language picker with compact globe dropdown (icon + native `<select>` or custom dropdown). Saves ~80px. | Critical | Medium |
| U-02 | Hero videos are 15-30MB, auto-download on mobile, no lazy loading | `LandingPage.tsx:36-58`, `CyclingVideo` component | Remove hero videos entirely. Replace with a single high-quality hero image showing the app in a device frame (phone mockup). Use WebP, `fetchpriority="high"`, and keep under 200KB. | Critical | Medium |
| U-03 | "Trusted by dozens of families" undermines credibility | `en.json:721` (+ es.json, ca.json) | Change to "What parents are saying" — neutral, no number claim. | Critical | Low |
| U-04 | No above-the-fold product visibility — user can't see what NapNap looks like until 3 screens of scrolling | `LandingPage.tsx:354-399` | Replace lifestyle videos with an app screenshot in a device frame as the hero visual. Show the Today view — it's the most compelling screen. | Critical | Medium |
| U-05 | Two conflicting conversion paths (live app vs waitlist) create confusion | `LandingPage.tsx:644-680` | Decide: if app is live, remove waitlist or reframe as "Get sleep tips." If beta, change hero CTA to "Join the beta." One clear path. | High | Low |

### 4.2 P1 — Important

| ID | Issue | Location | Fix | Impact | Effort |
|---|---|---|---|---|---|
| U-06 | No press logos, app ratings, or third-party validation anywhere on page | N/A (missing section) | Add a "Featured in" logo strip below testimonials. Even ProductHunt, BetaList, or "Built in Barcelona" badge. If no press yet, add aggregate stats ("X naps tracked") or a trust badge. | High | Medium |
| U-07 | Testimonials have no avatars/photos — feel fabricated | `LandingPage.tsx:410-420` | Add avatar circles with initials (or illustrated faces). Diversify names across genders and cultures. | High | Low |
| U-08 | Nav CTA says "Log in" (returning user) while hero targets new users | `en.json:699` | Change nav CTA to "Get started" or "Start free" — matches hero intent and targets the primary persona (new visitor). | High | Low |
| U-09 | "How it works" steps have no visuals — generic text-only cards | `LandingPage.tsx:431-459` | Add a small app screenshot or illustration to each step card (profile form, tap-to-log, today view). | Medium | Medium |
| U-10 | Product screenshots too small on mobile (200px in scroll) | `LandingPage.tsx:472` | Increase to `w-[280px]` or use full-width cards with swipe navigation. | Medium | Low |
| U-11 | Mid-page CTA is visually flat — blends into whitespace | `LandingPage.tsx:518-530` | Wrap in a gradient band or card with subtle accent background to create a visual "stop point." | Medium | Low |
| U-12 | No founder/team/human element — page feels faceless | N/A (missing section) | Add a brief "Built by parents in Barcelona" blurb with a photo or illustration near the footer. Even one sentence + a face builds massive trust. | High | Low |
| U-13 | Monotonous `space-y-16` rhythm — no visual peaks/valleys | `LandingPage.tsx:351` | Vary spacing: tighter between related sections (how-it-works → showcase), more breathing room before CTA blocks. Use alternating band/no-band pattern. | Medium | Medium |
| U-14 | Mobile wordmark disappears on scroll — no brand presence | `LandingPage.tsx:250-259` | Keep a compact logo/symbol visible alongside the burger button at all times. | Medium | Low |

### 4.3 P2 — Nice to have

| ID | Issue | Location | Fix | Impact | Effort |
|---|---|---|---|---|---|
| U-15 | Age range section adds minimal value as standalone block | `LandingPage.tsx:594-607` | Remove section. Integrate age info into hero subtitle ("For babies 0–18 months") and FAQ. | Low | Low |
| U-16 | Sleep Guides listed under "Legal" in footer | `LandingFooter.tsx:59` | Move to "Product" column or create "Resources" column. | Low | Low |
| U-17 | FAQ answers are plain text — no bold keywords | `en.json:824-836` | Add `<strong>` to key terms (wake window, age-based, one tap). | Low | Low |
| U-18 | Reassurance badges too subtle (text-xs, glass-bg) | `LandingPage.tsx:384` | Bump to text-sm, add light tinted background per badge for better morning-theme visibility. | Low | Low |
| U-19 | Footer language picker duplicates nav chips pattern | `LandingFooter.tsx:26` | Will be fixed when U-01 redesigns `LandingLanguagePicker` globally. | Low | Low |
| U-20 | Device frame dark bezels (#050816) clash with light morning theme | `index.css:1294-1304` | Lighten frame to soft gray or use a shadow-only "floating" frame style. | Low | Medium |
| U-21 | No `prefers-reduced-motion` handling for hero videos or FAQ animations | `LandingPage.tsx`, `index.css` | Add `@media (prefers-reduced-motion: reduce)` to disable autoplay and grid-rows animation (WCAG SC 2.3.3). | Medium | Low |
| U-22 | `<html lang="en">` is hardcoded — doesn't update when user switches to es/ca | `index.html:2` | Update `document.documentElement.lang` in the language change handler. (WCAG SC 3.1.1) | Medium | Low |

---

### Task Groups

### Task Group A — Hero & First Impression Overhaul (U-02, U-04, U-14)
**Depends on**: nothing
**Files**: `LandingPage.tsx`, `/public/media/` (new hero image)

1. Remove `CyclingVideo`, `HeroVideos` components and `HERO_VIDEO_SLOTS` data
2. Create/source a single hero image: app screenshot in a clean device frame on a soft gradient background (WebP, <200KB)
3. Replace hero right column with the static hero image (responsive sizing)
4. Keep compact logo visible on mobile scroll (add small wordmark/symbol next to burger)
5. Delete unused video files from `/public/media/` to reduce bundle

### Task Group B — Language Picker Redesign (U-01, U-19)
**Depends on**: nothing
**Files**: `LandingLanguagePicker.tsx`, `LandingPage.tsx`, `LandingFooter.tsx`

1. Redesign `LandingLanguagePicker` as a compact dropdown: globe icon button that opens a popover/dropdown with 3 language options
2. On desktop nav: globe icon only (~40px wide vs current ~120px)
3. On mobile menu: keep the stacked variant (existing `variant="stack"`) since space isn't constrained
4. In footer: use same compact dropdown as nav
5. Test at 768px, 900px, 1024px viewports to confirm nav no longer overflows

### Task Group C — Credibility & Social Proof (U-03, U-06, U-07, U-12)
**Depends on**: nothing
**Files**: `LandingPage.tsx`, `en.json`, `es.json`, `ca.json`

1. Change testimonial heading to "What parents are saying" (all 3 locales)
2. Add avatar circles to testimonials (initials + colored backgrounds using design system glow tokens)
3. Diversify testimonial author names and contexts (add 1-2 male names, vary contexts)
4. Add a "Built by parents in Barcelona" mini-section above the footer (photo/illustration + one line of copy)
5. If available: add a logo strip section ("Featured in" or "As seen on") between testimonials and how-it-works

### Task Group D — CTA & Conversion Clarity (U-05, U-08)
**Depends on**: nothing
**Files**: `LandingPage.tsx`, `en.json`, `es.json`, `ca.json`

1. Change nav "Log in" to "Get started" / "Start free" (matches hero intent)
2. Decide on waitlist vs live app messaging — align all CTAs to one path
3. If keeping waitlist: reframe as "Get sleep tips by email" (value-first framing)
4. Ensure mobile menu CTA matches desktop CTA label

### Task Group E — Content & Visual Polish (U-09, U-10, U-11, U-13, U-15, U-16, U-18)
**Depends on**: Task Group A (hero image sets visual tone for rest of page)
**Files**: `LandingPage.tsx`, `LandingFooter.tsx`, `en.json`, `es.json`, `ca.json`

1. Add small screenshots/illustrations to "How it works" step cards
2. Increase mobile product showcase card width to 280px
3. Wrap mid-page CTA in a subtle gradient card
4. Remove standalone age range section; integrate age info into hero or FAQ
5. Move Sleep Guides from "Legal" to "Product" in footer
6. Bump reassurance badge size to text-sm
7. Vary section spacing for visual rhythm (reduce space-y between related sections, increase before CTAs)

### Task Group F — Accessibility & Performance (U-20, U-21, U-22)
**Depends on**: Task Group A (video removal is the biggest perf win)
**Files**: `index.css`, `index.html`, `LandingLanguagePicker.tsx`

1. Add `prefers-reduced-motion` media query to disable FAQ animation
2. Update `document.documentElement.lang` on language change
3. Lighten device frame backgrounds for morning theme compatibility
4. Add `loading="lazy"` to any below-fold images (already present on showcase, verify others)

---

### Execution order

```
Task Group A ── start immediately (biggest visual + performance win)
Task Group B ── start immediately (fixes the broken nav)
Task Group C ── start immediately (credibility is the #1 marketing gap)
Task Group D ── start immediately (quick copy changes)
     │
     └──► Task Group E (depends on A for visual coherence)
              │
              └──► Task Group F (polish pass)
```

**Minimum viable improvement**: Task Groups A + B + C + D. These four groups fix the broken nav, replace the purposeless videos with a product hero, repair the credibility gap, and clarify the conversion path. They address every P0 and most P1 issues. Combined effort is ~1-2 sessions of focused work.

---

## 5. Debrief

### Key problems

- **The page doesn't show the product above the fold.** The hero is occupied by lifestyle videos that could belong to any baby brand. A first-time visitor has to scroll past 3 full screens before seeing what NapNap actually looks like. This is the single biggest conversion killer — the app's Today view is genuinely compelling, but it's buried.

- **Zero credibility infrastructure.** No press logos, no download counts, no user numbers, no team faces, no app store rating. The testimonials say "trusted by dozens" — which is worse than silence. For a parent about to trust an app with their baby's sleep, this is a dealbreaker. Huckleberry leads with "5 million families" and NYTimes/TechCrunch logos. NapNap needs even a modest version of this.

- **The language picker breaks the nav.** Three fat chips inside a nav pill is an unusual pattern that wastes horizontal space and causes layout overflow on tablet viewports. This is a straightforward UI bug with a straightforward fix (dropdown).

- **Unclear conversion intent.** The page simultaneously says "Create your free sleep plan" (the app is live, go use it) and "Not ready yet? Leave your email" (it's coming soon, join the waitlist). This dual messaging confuses the visitor about what stage the product is in.

### Highest-impact improvements

- **Replace hero videos with a product screenshot** (U-02 + U-04) — This single change transforms the page from "generic baby brand" to "here's what you'll actually use." It also eliminates the biggest performance problem (15-30MB of auto-loading video). Estimated impact: significant improvement in both bounce rate and conversion.

- **Fix the credibility stack** (U-03 + U-06 + U-07 + U-12) — Changing the testimonial heading, adding avatars, and inserting a "Built by parents" section with a human face would meaningfully shift perception from "side project" to "real product." This is the gap between "cutre" and "some people have done that."

### Risk if nothing changes

- **Conversion**: Users who search "baby sleep tracker" will land, see lifestyle videos instead of a product, read "trusted by dozens," and bounce to Huckleberry within 5 seconds. The page is doing anti-marketing.
- **Performance**: 15-30MB of hero video auto-downloading will cause measurably high bounce rates on mobile, especially in Spain/EU markets where cellular speeds vary.
- **Brand perception**: The page currently communicates "weekend project" rather than "product built by people who understand exhausted parents." The copy quality is excellent — it's the visual execution and credibility infrastructure that undercut it.

---

## 6. Marketing & positioning notes (beyond UX/UI)

### What's working well
- **Copy quality is genuinely excellent.** "Stop guessing naps." "The quiet voice at 3am." "Questions, calmly answered." "No drip campaigns." This is premium-grade brand writing that most competitors can't match.
- **Emotional safety messaging is pitch-perfect.** "No sleep training method, no scores or grades" directly addresses the #1 parental anxiety about baby apps.
- **The product itself is the best marketing asset.** The Today view screenshot is more compelling than any video or illustration. Show it bigger, sooner, everywhere.

### What's missing for "real company" perception
1. **Social proof hierarchy**: Numbers > logos > testimonials > nothing. NapNap has only the weakest tier.
2. **Authority signals**: No "recommended by pediatricians", no expert endorsements, no scientific backing mentions.
3. **Founder presence**: One photo + "Hi, I'm [name], a parent in Barcelona who built this because..." would do more for trust than any design change.
4. **Content depth**: The sleep guides exist but aren't surfaced on the landing page. A "Learn" section linking to guides would signal domain expertise.
5. **Specificity**: "NapNap adapts" is vague. "Predictions update every 30 seconds as your baby sleeps" is concrete and credible.
