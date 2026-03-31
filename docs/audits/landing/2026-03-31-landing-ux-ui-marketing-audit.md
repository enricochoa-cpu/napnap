# Landing Page -- UX/UI & Marketing Horizontal Audit

- **Date**: 2026-03-31
- **Area**: Landing page (React + Tailwind, Vite SPA)
- **Persona**: First-time parent (25-38), sleep-deprived, searching "baby sleep tracker" on mobile. Skeptical. Needs to feel "these people get it" within 5 seconds.
- **User goal**: Understand what NapNap does, feel trust, convert to sign-up
- **Competitors benchmarked**: Huckleberry, Taking Cara Babies, Linear (design quality reference)

---

## Changes since last audit (2026-03-20)

### Fixed since last audit

| Previous ID | Issue | Resolution |
|---|---|---|
| U-05 | Two conflicting conversion paths (waitlist vs live app) | Confirmed still fixed. Email capture reframed as "Stay in the loop" / "Join"; all CTAs say "Get started" / "Create your free sleep plan" |
| U-07 | Testimonials have no avatars, all female Catalan names | Confirmed still fixed. 6 testimonials with initials avatars, mix of male/female/grandparent (Mireia, Andreu, Laura, David, Cristina, Pepi) |
| U-08 | Nav CTA says "Log in" while hero targets new users | Confirmed still fixed. Desktop CTA says "Get started" |
| U-11 | Mid-page CTA is visually flat | **Fixed.** Now wrapped in a `rounded-3xl` card with gradient background (`color-mix` of nap + night at 6%) and border. Clear visual stop point. (`LandingPage.tsx:546-547`) |
| U-12 | No founder/team/human element | Confirmed still fixed. "Built by parents in Barcelona" section present (`LandingPage.tsx:731-738`) |
| U-15 | Age range section adds minimal value | Confirmed still fixed. Replaced with 17 clickable sleep guide age cards (`LandingPage.tsx:624-654`) |
| U-16 | Sleep Guides listed under "Legal" in footer | Confirmed still fixed. Sleep guides under "Product" column (`LandingFooter.tsx:14`) |
| U-17 | FAQ answers are plain text | **Fixed.** FAQ answers now use `dangerouslySetInnerHTML` with `<strong>` tags in the i18n strings (e.g. `en.json:831` wraps "sleep tracker for babies (0-18 months)" in `<strong>`). (`LandingPage.tsx:682`) |
| U-18 | Reassurance badges too subtle (text-xs, glass-bg) | **Fixed.** Bumped to `text-sm`, added tinted background with `color-mix(in srgb, var(--nap-color) 8%, transparent)`, border, and checkmark icon. (`LandingPage.tsx:393-401`) |
| U-19 | Footer language picker duplicates nav chips | Confirmed still fixed. Globe dropdown component used everywhere |
| U-21 | No `prefers-reduced-motion` handling | **Fixed.** Global `@media (prefers-reduced-motion: reduce)` rule in `index.css:1566-1584` disables all animations, transitions, and ambient elements (stars, clouds, loaders) |
| U-22 | `<html lang>` hardcoded | Confirmed still fixed. `changeLocale()` updates `document.documentElement.lang` (`LandingLanguagePicker.tsx:44`) |

### Remains from last audit

| Previous ID | Status | Notes |
|---|---|---|
| U-02 | **OPEN** | Hero videos still present. 8 MP4 files in `/public/media/`. `CyclingVideo` and `HeroVideos` components still in `LandingPage.tsx:103-164`. Auto-download on mobile with no lazy loading. |
| U-04 | **OPEN** | No above-the-fold product visibility. App screenshots are still 3 screens of scrolling below the hero. Videos show lifestyle clips (train, park, sleeping), not the product. |
| U-06 | **OPEN** | No press logos, app store ratings, download counts, or third-party validation anywhere on the page. |
| U-09 | **OPEN** | "How it works" steps are still text-only cards with no screenshots or illustrations (`LandingPage.tsx:458-487`). |
| U-10 | **OPEN** | Product screenshots still `w-[200px]` on mobile (`LandingPage.tsx:499, 513, 527`). Too small to read. |
| U-13 | **OPEN** | Section spacing is more varied now (mt-20, mt-16, mt-10, mt-12) but still somewhat monotonous. |
| U-14 | **OPEN** | Mobile wordmark still disappears on scroll past 80px (`LandingPage.tsx:64, 220-231`). Only burger visible. |
| U-20 | **Partially fixed** | Device frame background changed from `#050816` to `#2D2F3E` with subtle gradient (`index.css:1298-1300`). Still dark, but less jarring against morning theme. |

---

## 1. Scenario & flow

6 flows audited end-to-end via code inspection:

1. **First impression** -- Hero, navigation, above-the-fold content
2. **Learn & evaluate** -- Social proof, how-it-works, product showcase, features
3. **Convert** -- Primary CTAs, email capture, sign-up flow
4. **Navigate** -- Nav bar, language picker, footer links
5. **Sleep guides** -- Guide hub, individual guide pages
6. **Legal pages** -- Terms, Privacy, Contact

---

## 2. Step-by-step walkthrough

### Flow 1 -- First impression

**Step 1 -- Navigation bar (mobile)**

- **REMAINS (U-14)**: Mobile wordmark disappears on scroll. Only the burger button stays. User loses all brand context.
- **Good**: Burger button transitions from glass-transparent to solid (`landing-mobile-menu-btn--solid`) on scroll. Accessible: has `aria-label` and `aria-expanded`.
- **Good**: Mobile fullscreen menu has clear hierarchy, language picker in "stack" variant, and prominent CTA.

**Step 2 -- Navigation bar (desktop)**

- **Good**: Glass pill nav with fit-content width, transitions to solid on scroll. Clean, polished.
- **Good**: "Get started" CTA is primary button, well-positioned.
- **New observation**: Nav links ("How it works", "The app", "FAQ") use `pressable` class but have no visible hover/focus text color change beyond the class default. Minor.

**Step 3 -- Hero section**

- **REMAINS (U-02, U-04)**: Three lifestyle videos still auto-play. Performance and relevance issues unchanged.
- **Good**: Hero copy is excellent. H1 ("Stop guessing naps. / Move with your baby's rhythm.") is clear and compelling.
- **Good**: CTA placement improved -- "Create your free sleep plan" button sits above the description, creating a faster conversion path.
- **Good**: Reassurance badges (now `text-sm` with tinted bg) are more visible and effective.

### Flow 2 -- Learn & evaluate

**Step 4 -- Social proof / Testimonials**

- **Good**: 6 testimonials in 2-column grid with initials avatars, color-coded. Good gender diversity.
- **REMAINS (U-06)**: No press logos, ratings, or aggregate stats. Biggest credibility gap.
- **New issue (N-01)**: Testimonials section has no `id` attribute, making it unreachable from nav/footer links. The "What parents are saying" heading uses `<p>` instead of `<h2>`, breaking heading hierarchy after the hero.

**Step 5 -- How it works**

- **REMAINS (U-09)**: Text-only cards. No visuals to differentiate from any other app.
- **Good**: Step numbers use glow-color backgrounds (nap/night/wake). Copy is clear.

**Step 6 -- Product showcase**

- **REMAINS (U-10)**: Screenshots `w-[200px]` on mobile. Functional but too small.
- **Good**: Device frames updated to `#2D2F3E` with gradient -- less jarring than before.
- **Good**: Alt text on images is descriptive and useful for SEO (`LandingPage.tsx:504, 519, 534`).
- **Good**: Images use `loading="lazy"`.

**Step 7 -- Mid-page CTA**

- **Fixed**: Now has gradient card treatment with border. Visual stop point works.

**Step 8 -- What you get (features)**

- **Same**: 4 feature cards with icon tokens. Still generic but copy is benefit-oriented.
- **Good**: Section uses `bg-[var(--bg-mid)]` band, creating visual rhythm.

**Step 9 -- Sleep guides grid**

- **Good**: 17 clickable age cards with nap count, linking to individual guide pages. Great SEO and content value.
- **New issue (N-02)**: Cards are `grid-cols-4` on mobile, making each card very narrow (~80px). The `text-[9px]` nap count text is extremely small and hard to read. On a 375px-wide phone with 24px padding, each card is about 75px wide.

**Step 10 -- FAQ**

- **Good**: `dangerouslySetInnerHTML` now renders `<strong>` tags in answers. Improved readability.
- **Good**: Smooth grid-rows animation with `prefers-reduced-motion` handled globally.
- **Good**: Proper ARIA -- `aria-expanded` on buttons, `aria-labelledby` on section.

**Step 11 -- Email capture**

- **Good**: Clean card layout, clear messaging ("Stay in the loop", "No spam, no drip campaigns").
- **Good**: Keyboard submit (Enter key) supported (`LandingPage.tsx:708`).
- **New issue (N-03)**: Error handling is fire-and-forget -- the `try/catch` block on `waitlist-notify` silently swallows errors (`LandingPage.tsx:242-244`). User always sees success even if the Edge Function fails. Since this is explicitly by design (comment says "non-critical"), this is P2.

### Flow 3 -- Convert

**Step 12 -- CTA audit**

- **Good**: Consistent CTA text throughout:
  - Hero: "Create your free sleep plan" (primary) + "See how it works" (link)
  - Mid-page: "Create your free sleep plan"
  - Nav: "Get started" (shorter for nav context)
  - Mobile menu: "Start free"
  - All localized in en/es/ca
- **Good**: All CTAs route to `/app` via `handleLoginClick`.

### Flow 4 -- Navigate

**Step 13 -- Footer**

- **Good**: Clean 3-column grid (brand + tagline, Product links, Legal links). Language picker in brand column.
- **Good**: Product links use scroll-to-section when on landing page, regular `href` otherwise.
- **New issue (N-04)**: Footer "Product" scroll links and "Legal" page links are `<button>` and `<a>` respectively, but the `<button>` elements have no explicit role or `cursor-pointer` styling -- relies on browser defaults. Minor inconsistency.

**Step 14 -- Language picker**

- **Good**: Globe dropdown is clean, accessible (`aria-expanded`, `aria-haspopup="listbox"`, `role="option"`, `aria-selected`).
- **Good**: Closes on outside click and Escape key.
- **New issue (N-05)**: Stacked variant in mobile menu uses `bg-white/20` and `bg-white/[0.06]` (`LandingLanguagePicker.tsx:92-93`). This is on the dark mobile menu background (`#0B0B0B` to `#1B1A3D` gradient), so it works visually -- but violates the project rule of never using `white/` (documented in `.context/reference/lessons.md` and MEMORY.md). Should use `var(--glass-bg)` for consistency, even though the mobile menu is always dark.

### Flow 5 -- Sleep guides

**Step 15 -- Sleep guide hub (`SleepGuideHub.tsx`)**

- **Good**: Well-structured with age group sections (Newborn, Infant, Toddler). Clear heading hierarchy.
- **Good**: SEO meta tags set dynamically (`setMeta`, `setCanonical`, Twitter cards).
- **Good**: Correct scroll container pattern (`overflow-x-hidden overflow-y-auto` with `height: 100dvh`).
- **Good**: Regression badges on relevant age cards (wake-color accent).
- **New issue (N-06)**: The CTA at the bottom ("Track your baby's sleep with NapNap -- Start free") uses a hardcoded `<a href="/app">` styled as a button, but it is not a `<button>`. Consistent with other landing CTAs, but the style is inline rather than using the `btn btn-primary` class pattern used elsewhere.

**Step 16 -- Individual sleep guide page (`SleepGuidePage.tsx`)**

- **Good**: Rich content -- "At a glance" stats, regression callouts, sample schedule, prose sections, tips.
- **Good**: JSON-LD structured data (Article + BreadcrumbList). Excellent for SEO.
- **Good**: Prev/next navigation between age guides.
- **Good**: Dynamic CTA with age label ("Track your X-month-old's sleep").
- **New issue (N-07)**: `datePublished` and `dateModified` in JSON-LD are hardcoded to `'2026-03-14'` (`SleepGuidePage.tsx:62`). These will become stale and should ideally be derived from the content data or updated on each deploy.

### Flow 6 -- Legal pages

**Step 17 -- Contact page (`LandingContactPage.tsx`)**

- **Good**: Clear layout with subject/message fields and mailto-based send button. Copy email fallback.
- **Good**: SEO meta tags set dynamically.
- **New issue (N-08)**: Contact page uses `min-h-[100dvh]` without the scroll container pattern (`height: '100dvh'` + `overflow-y-auto`). On mobile browsers with dynamic toolbar, content may not be scrollable if it exceeds the viewport. Terms and Privacy pages use the correct pattern, Contact does not. (`LandingContactPage.tsx:64`)
- **New issue (N-09)**: Contact page applies `theme-morning` as a CSS class on the outer div (`className="theme-morning"`) while also adding it to `document.documentElement` in the useEffect. Other pages (Terms, Privacy) only use the useEffect approach. Inconsistency.

**Step 18 -- Terms page (`LandingTermsPage.tsx`)**

- **Good**: Dynamic SEO meta. Correct scroll container pattern.
- **Good**: Clean card layout per section. Back-to-NapNap breadcrumb.

**Step 19 -- Privacy page (`LandingPrivacyPage.tsx`)**

- **Good**: Same quality as Terms. Includes "Last updated" date from constants.
- **Good**: Dynamic SEO meta with canonical URL.

---

## 3. Findings

### 3.1 Frictions

- **Hero videos obscure the product** (U-02, U-04 still open). Users can't tell what NapNap looks like until they scroll 3 screens. This remains the single biggest conversion issue.
- **No third-party validation** (U-06 still open). No press logos, app ratings, or aggregate numbers. Biggest credibility gap after testimonials.
- **Product screenshots too small on mobile** (U-10 still open). 200px wide in horizontal scroll -- users can't read the UI.
- **Mobile wordmark disappears on scroll** (U-14 still open). Brand context lost on the most critical device form factor.

### 3.2 Inconsistencies

| Area | What differs | Expected uniform behavior |
|---|---|---|
| Scroll container pattern | Contact page uses `min-h-[100dvh]` only; Terms/Privacy use `height: 100dvh` + `overflow-y-auto` | All pages should use the fixed-height scroll container pattern (lessons.md S6.8) |
| Theme application | Contact page sets `theme-morning` as both CSS class on div AND via useEffect on `<html>`; other pages only use useEffect | Single approach |
| `white/` usage | Mobile menu language picker uses `bg-white/20`, `bg-white/[0.06]` | Should use `var(--glass-bg)` tokens per project rules |
| Heading hierarchy | Testimonials heading is `<p>`, not `<h2>` | Should be `<h2>` for document outline |
| CTA button patterns | Sleep guide hub/page CTAs use inline `<a>` with custom styling; landing page CTAs use `btn btn-primary` class | Consistent button class usage |

### 3.3 Dependencies

- Hero redesign (removing videos) requires product screenshots/mockup -- blocked on assets since 2026-03-20
- "Featured in" section requires press coverage or alternative social proof data (e.g. aggregate stats from Supabase)
- "How it works" illustrations require design assets

### 3.4 Corner cases

- **Email capture always shows success**: If `waitlist-notify` Edge Function fails, user still sees "You're in" confirmation. Acceptable for non-critical feature but could erode trust if user tries multiple times.
- **Sleep guide 404**: If slug is invalid, `SleepGuidePage` renders `null` briefly before `window.location.replace('/sleep-guides')` fires in useEffect. Flash of empty content.
- **FAQ XSS surface**: FAQ answers use `dangerouslySetInnerHTML` (`LandingPage.tsx:682`). Content comes from i18n JSON files (not user input), so risk is minimal, but any future CMS integration would need sanitization.

### 3.5 Entity relationships

- Sleep guide content is defined in `src/data/sleepGuideContentByLanguage.ts` and `src/data/sleepGuideContent.ts`. Guide configs include structured data (stats, schedule, sections, tips) that maps cleanly to the page components.
- Footer product links have a dual rendering path: `<button>` with `scrollToSection` callback when on landing page, `<a>` with `href` when on sub-pages. This is correct but requires the `onScrollToSection` prop to be passed.

---

## 4. Improvements

### 4.1 P0 -- Must fix

| ID | Issue | Location | Fix | Impact | Effort |
|---|---|---|---|---|---|
| U-02 | Hero videos are 15-30MB, auto-download on mobile, no lazy loading | `LandingPage.tsx:40-62, 103-164` (`HERO_VIDEO_SLOTS`, `CyclingVideo`, `HeroVideos`) | Remove `CyclingVideo`, `HeroVideos` components and `HERO_VIDEO_SLOTS`. Replace with a single static hero image (app screenshot in device frame, WebP, <200KB). Delete 8 MP4 files from `/public/media/`. | Critical -- performance, bounce rate | Medium |
| U-04 | No above-the-fold product visibility | `LandingPage.tsx:406-408` (hero right column) | Replace hero video column with app screenshot in device frame showing the Today view. Use `napnap-today-new.png` already available in `/public/media/`. | Critical -- conversion | Medium |

### 4.2 P1 -- Important

| ID | Issue | Location | Fix | Impact | Effort |
|---|---|---|---|---|---|
| U-06 | No press logos, app ratings, or third-party validation | Missing section | Add a "Trusted by X families" counter or "Featured in" logo strip below testimonials. If no press yet, pull aggregate nap count from Supabase or use trust badges ("Built in Barcelona", "GDPR compliant"). | High | Medium |
| U-10 | Product screenshots too small on mobile (200px) | `LandingPage.tsx:499, 513, 527` | Increase to `w-[280px]` or use full-width swipeable cards on mobile. | Medium | Low |
| U-14 | Mobile wordmark disappears on scroll | `LandingPage.tsx:258-268` | Keep a compact "NN" text mark or small wordmark visible alongside the burger at all times. | Medium | Low |
| N-01 | Testimonials heading is `<p>` not `<h2>`, breaking heading hierarchy | `LandingPage.tsx:416-418` | Change `<p className="text-center text-xs...">` to `<h2 className="text-center text-xs...">` for proper document outline and SEO. | Medium | Low |
| N-08 | Contact page missing scroll container pattern | `LandingContactPage.tsx:64` | Add `overflow-y-auto overflow-x-hidden` classes and `style={{ height: '100dvh' }}` to outer div, matching Terms/Privacy pages. | Medium | Low |
| U-09 | "How it works" steps have no visuals | `LandingPage.tsx:458-487` | Add a small app screenshot or illustration to each step card. Could reuse existing screenshots from `/public/media/`. | Medium | Medium |

### 4.3 P2 -- Nice to have

| ID | Issue | Location | Fix | Impact | Effort |
|---|---|---|---|---|---|
| N-02 | Sleep guide age cards too small on mobile (grid-cols-4) | `LandingPage.tsx:631` | Change to `grid-cols-3` on mobile or `grid-cols-3 sm:grid-cols-4 md:grid-cols-6` for better readability of the 9px nap count text. | Low | Low |
| N-05 | `white/` used in mobile menu language picker | `LandingLanguagePicker.tsx:92-93` | Replace `bg-white/20` with `bg-[var(--glass-bg)]` or similar token. Low visual impact since menu is always dark, but violates project conventions. | Low | Low |
| N-07 | JSON-LD `datePublished`/`dateModified` hardcoded to 2026-03-14 | `SleepGuidePage.tsx:62` | Derive from guide content data or a build timestamp. | Low | Low |
| N-09 | Contact page applies `theme-morning` twice (class + useEffect) | `LandingContactPage.tsx:64, 19-23` | Remove `theme-morning` from className, rely on useEffect only (consistent with other pages). | Low | Low |
| N-04 | Footer product links (buttons) lack explicit cursor styling | `LandingFooter.tsx:43-50` | Add `cursor-pointer` class to footer scroll-to-section buttons. | Low | Low |
| U-13 | Section spacing could have more visual rhythm | `LandingPage.tsx` various `mt-*` classes | Vary spacing more deliberately: tighter between related sections (how-it-works to showcase: mt-8), more before conversion points (mt-24 before mid-CTA). | Low | Low |

---

## Completed items summary (cumulative)

| ID | Issue | Resolution | Fixed in |
|---|---|---|---|
| U-01 | Nav pill overflows on 768-1024px | Globe icon + dropdown | 2026-03-20 |
| U-03 | "Trusted by dozens" undermines credibility | Changed to "What parents are saying" | 2026-03-20 |
| U-05 | Two conflicting conversion paths | Aligned to "Get started" / "Join" | 2026-03-20 |
| U-07 | Testimonials lack avatars, all female | Initials avatars + gender diversity | 2026-03-20 |
| U-08 | Nav CTA says "Log in" | Changed to "Get started" | 2026-03-20 |
| U-11 | Mid-page CTA visually flat | Gradient card with border | 2026-03-31 confirmed |
| U-12 | No founder/team element | "Built by parents in Barcelona" | 2026-03-20 |
| U-15 | Age range section minimal value | Replaced with sleep guides grid | 2026-03-20 |
| U-16 | Sleep Guides under "Legal" in footer | Moved to "Product" | 2026-03-20 |
| U-17 | FAQ answers plain text | `<strong>` tags via dangerouslySetInnerHTML | 2026-03-31 confirmed |
| U-18 | Reassurance badges too subtle | text-sm + tinted bg + checkmark | 2026-03-31 confirmed |
| U-19 | Footer language picker duplicates nav | Globe dropdown globally | 2026-03-20 |
| U-20 | Device frame dark bezels | Lightened to #2D2F3E with gradient | Partial |
| U-21 | No prefers-reduced-motion | Global CSS rule added | 2026-03-31 confirmed |
| U-22 | `<html lang>` hardcoded | Updates on language change | 2026-03-20 |

---

## Task groups

### Task Group A -- Hero & First Impression Overhaul (U-02, U-04, U-14)
**Depends on**: App screenshot assets (already available: `napnap-today-new.png` in `/public/media/`)
**Files**: `LandingPage.tsx`, `/public/media/`

1. Remove `CyclingVideo`, `HeroVideos` components and `HERO_VIDEO_SLOTS` data from `LandingPage.tsx`
2. Create a hero image component using `napnap-today-new.png` in a device frame (reuse `.device-frame` CSS class)
3. Replace hero right column (`LandingPage.tsx:406-408`) with the static hero image
4. Keep compact logo visible on mobile scroll (add small "NapNap" next to burger, always visible)
5. Delete 8 MP4 files from `/public/media/` to save ~15-30MB

### Task Group B -- Credibility & Social Proof (U-06, N-01)
**Depends on**: Decision on what social proof to use (stats, badges, or press)
**Files**: `LandingPage.tsx`, `en.json`, `es.json`, `ca.json`

1. Change testimonials heading from `<p>` to `<h2>` (keep same styling)
2. Add aggregate stat or trust badges section below testimonials (e.g. "GDPR compliant", "Built in Barcelona", "Free forever plan")
3. If Supabase data available, add "X naps tracked" counter

### Task Group C -- Content Polish (U-09, U-10, N-02)
**Depends on**: Task Group A (hero sets visual tone)
**Files**: `LandingPage.tsx`

1. Add small screenshots to "How it works" step cards (reuse existing assets)
2. Increase mobile product showcase width from `w-[200px]` to `w-[280px]`
3. Adjust sleep guides grid from `grid-cols-4` to `grid-cols-3` on mobile

### Task Group D -- Technical Fixes (N-05, N-07, N-08, N-09)
**Depends on**: None
**Files**: `LandingContactPage.tsx`, `LandingLanguagePicker.tsx`, `SleepGuidePage.tsx`

1. Fix Contact page scroll container (add `overflow-y-auto overflow-x-hidden` + `height: 100dvh`)
2. Remove duplicate `theme-morning` class from Contact page div
3. Replace `white/` tokens in language picker stacked variant
4. Make JSON-LD dates dynamic in SleepGuidePage

### Execution order

```
Task Group D (independent tech fixes, no dependencies)

Task Group A (hero overhaul -- biggest visual + performance win)
     |
     +--> Task Group C (polish, depends on A for visual coherence)

Task Group B (credibility -- can run parallel to A, depends on data decision)
```

---

## 5. Debrief

### Key remaining problems

1. **The page still does not show the product above the fold.** This was the #1 issue in the previous audit and remains unchanged. The hero is occupied by 8 lifestyle video files (~15-30MB) that auto-download on mobile. The app's Today view screenshot (`napnap-today-new.png`) exists in `/public/media/` and could be used immediately as a hero image -- no new assets needed.

2. **No third-party validation.** Press logos, app ratings, or aggregate stats are still absent. This is the second-biggest credibility gap. The testimonials are better (diverse, with avatars), but text-only social proof is the weakest form.

3. **Product screenshots are too small on mobile.** At 200px in a horizontal scroll, users cannot read the app UI. The product showcase section -- which should be the most compelling part of the page -- is functionally invisible on mobile.

4. **Contact page has a scroll container bug.** It does not follow the fixed-height scroll container pattern that Terms and Privacy pages use, which can cause content to be unscrollable on mobile browsers with dynamic toolbars.

### Key recommendations

1. **Use the existing Today view screenshot as the hero image.** `napnap-today-new.png` is already in `/public/media/`. Wrap it in a `.device-frame` div, place it in the hero right column, and delete the 8 MP4 files. This is the single highest-ROI change -- fixes performance, above-the-fold visibility, and first impression in one move.

2. **Fix the Contact page scroll container.** One-line fix that prevents a real usability bug on mobile.

3. **Add aggregate stats or trust badges.** Even "GDPR compliant" + "Free forever" + "Built by parents" as a small badge strip would improve credibility perception significantly.

4. **Increase mobile screenshot width to 280px.** Small CSS change with meaningful impact on the product showcase section's effectiveness.

### Risk if nothing changes

- **Performance**: 15-30MB of hero video auto-downloading will cause measurably high bounce rates on mobile, especially on cellular connections. This has been open since the previous audit (2026-03-20).
- **First impression**: Without an above-the-fold product screenshot, visitors still cannot tell what NapNap looks like until they scroll significantly. The Today view is genuinely compelling but remains buried.
- **Contact page**: Content may be clipped or unscrollable on mobile browsers with dynamic toolbars (Safari, Chrome on iOS/Android).

---

## 6. Marketing & positioning notes

### What continues to work well

- **Copy quality remains excellent.** "Stop guessing naps." "The quiet voice at 3am." "Questions, calmly answered." "No drip campaigns." Premium-grade brand writing.
- **Emotional safety messaging is pitch-perfect.** Reassurance badges (now more visible) directly address parental anxiety.
- **Sleep guides are a strong SEO asset.** 17 age-specific guide pages with JSON-LD structured data, breadcrumbs, and canonical URLs. Well-executed content marketing.
- **i18n coverage is complete.** All 3 locales (en/es/ca) have full landing, sleep guides, and legal page translations.
- **Technical SEO is solid.** `index.html` has proper OG tags, Twitter cards, canonical URL, and JSON-LD SoftwareApplication schema. Sub-pages set meta dynamically.

### What is still missing for "real company" perception

1. **Social proof hierarchy**: Numbers > logos > testimonials > nothing. Still at "testimonials only."
2. **Authority signals**: No pediatrician endorsements, no scientific backing mentions.
3. **Founder presence**: "Built by parents" section has no photo or name. A face builds trust faster than prose.
4. **Specificity in feature claims**: "NapNap adapts" is still vague. "Predictions update every 30 seconds as your baby sleeps" is concrete and credible.
5. **No app store presence**: No links to App Store/Google Play (even if it's a PWA). Users expect download badges on a mobile app landing page.
