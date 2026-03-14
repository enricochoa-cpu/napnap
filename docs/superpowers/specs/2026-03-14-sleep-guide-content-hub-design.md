# Sleep Guide Content Hub — Design Spec

## Overview

Age-specific sleep schedule pages for SEO and parent education. Each page is a long-form article (800–1200 words) covering wake windows, nap counts, sample schedules, and tips for a specific age. A hub page organizes all guides by developmental stage.

**Batch 1 (this spec):** 10 monthly pages (3–12 months) + hub page.
**Batch 2 (future):** Newborn weekly guides (weeks 1–4, months 1–2) + toddler guides (13–24 months).

### Relationship to `SLEEP_DEVELOPMENT_MAP`

The existing `SLEEP_DEVELOPMENT_MAP` in `dateUtils.ts` defines 13 age brackets with ranges (e.g. "5-6 months", "7-8 months"). Guide pages are per-month, so each page maps to the bracket whose range includes that month. Multiple guide pages may share the same bracket's base data, but prose content and tips are unique per page. The mapping:

| Guide page | SLEEP_DEVELOPMENT_MAP bracket |
|-----------|-------------------------------|
| 3 months | 3-4 months |
| 4 months | 3-4 months |
| 5 months | 5-6 months |
| 6 months | 5-6 months |
| 7 months | 7-8 months |
| 8 months | 7-8 months |
| 9 months | 9-10 months |
| 10 months | 9-10 months |
| 11 months | 11-12 months |
| 12 months | 11-12 months |

## Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/sleep-guides` | `SleepGuideHub` | Index page with age cards grouped by stage |
| `/sleep-guides/:slug` | `SleepGuidePage` | Individual guide (e.g. `/sleep-guides/6-month-old`) |

Slugs follow the pattern: `3-month-old`, `4-month-old`, ..., `12-month-old`.

## Hub Page (`/sleep-guides`)

### Structure

1. **Header**: "Your Baby's Sleep Schedule" + subtitle
2. **Three sections** grouped by developmental stage:
   - **Newborn (0–3 months)** — placeholder cards with "Coming soon" (Batch 2)
   - **Infant (3–12 months)** — active cards linking to guide pages
   - **Toddler (13–24 months)** — placeholder cards with "Coming soon" (Batch 2)
3. **CTA**: "Track your baby's sleep with NapNap — Start free"
4. **Footer**: Extract a shared `<LandingFooter />` component from `LandingPage.tsx` and reuse across all landing pages (hub, guide pages, privacy, terms, contact)

### Age Cards (Infant section)

Each card shows:
- Age label (e.g. "6 mo")
- Quick stats: nap count + wake window
- Regression badge (amber) on months with known regressions (4, 8, 12, per `SLEEP_DEVELOPMENT_MAP` regression flags)
- Links to `/sleep-guides/:slug`

Cards are displayed in a responsive grid: 4 columns on desktop, 3 on tablet, 2 on mobile.

### SEO

- Title: "Baby Sleep Schedules by Age — NapNap"
- Meta description: "Age-specific sleep schedules from 3 to 12 months. Wake windows, nap times, bedtime, and tips for every stage."
- Canonical: `https://getnapnap.com/sleep-guides`

## Guide Page (`/sleep-guides/:slug`)

### Content Sections (top to bottom)

1. **Breadcrumb**: ← Sleep Guides / {Age}
2. **Title**: "{Age} Month Old Sleep Schedule"
3. **Subtitle**: "Wake windows, nap times, and bedtime for your {age}-month-old"
4. **At-a-glance card**: 2×3 grid with naps/day, wake window range, bedtime range, night sleep hours, total day sleep, total sleep
5. **Prose: "What to expect at {age} months"** — 2–3 paragraphs on developmental context, what's normal, what changes from the previous month. Unique per age.
6. **Sample schedule card**: Time-based list showing wake-up, each nap (with duration), and bedtime. Color-coded: wake=parchment, naps=sage, bedtime=periwinkle. Computed from wake window data.
7. **Prose: "Understanding wake windows"** — Explains wake windows for this age, first/mid/last window differences. Unique per age.
8. **Prose: "Signs to watch for"** — 3–4 bullet points with bold lead + explanation. Covers nap transitions, regressions, common issues. Unique per age.
9. **Prev/next navigation**: Links to adjacent age guides
10. **CTA**: "Track your {age}-month-old's sleep with NapNap" + "Free to start · No sleep training required"

### SEO (per page)

- Title: "{Age} Month Old Sleep Schedule — NapNap"
- Meta description: "{Age}-month-old sleep schedule with wake windows, nap times, and bedtime. Learn what to expect and get a sample daily routine."
- Canonical: `https://getnapnap.com/sleep-guides/{slug}`
- JSON-LD: Article structured data with `@type: Article`, headline, description, datePublished, dateModified, author (`@type: Organization`, name: "NapNap"), publisher
- Open Graph: `og:title`, `og:description`, `og:type` (article), `og:url`
- Twitter Card: `twitter:card` (summary), `twitter:title`, `twitter:description`

## Data Architecture

### `src/data/sleepGuideContent.ts`

Single data file exporting an array of `SleepGuideConfig` objects:

```typescript
interface SleepGuideConfig {
  slug: string;                    // "6-month-old"
  ageMonths: number;               // 6
  title: string;                   // "6 Month Old Sleep Schedule"
  subtitle: string;                // "Wake windows, nap times, and bedtime..."
  metaDescription: string;         // For <meta> tag
  stats: {
    napsPerDay: string;            // "3"
    wakeWindow: string;            // "2–2.5h"
    bedtime: string;               // "18:30–19:30"
    nightSleep: string;            // "11–12h"
    totalDaySleep: string;         // "3–3.5h"
    totalSleep: string;            // "14–15h"
  };
  sampleSchedule: {
    time: string;                  // "8:30"
    label: string;                 // "Nap 1 (1–1.5 hours)"
    type: 'wake' | 'nap' | 'bedtime';
  }[];
  sections: {
    heading: string;               // "What to expect at 6 months"
    content: string;               // Paragraphs separated by \n\n — component splits and wraps each in <p>
  }[];
  tips: {
    title: string;                 // "Fighting the third nap"
    description: string;           // Explanation
  }[];
  regression?: {
    name: string;                  // "4-month sleep regression"
    description: string;           // Brief explanation
  };
}
```

Data sources:
- `stats` and `sampleSchedule` are derived from `SLEEP_DEVELOPMENT_MAP` in `dateUtils.ts`
- `sections` and `tips` are hand-written per age (unique content for SEO value)
- `regression` pulled from `SLEEP_DEVELOPMENT_MAP` regression flags

### `src/components/SleepGuideHub.tsx`

Single component rendering the hub page. Imports the content array, groups by stage, renders the card grid. Uses morning theme (same pattern as other landing pages).

### `src/components/SleepGuidePage.tsx`

Single component rendering any guide page. Receives the slug from routing, looks up the matching `SleepGuideConfig`, renders all sections. If slug doesn't match any config, redirects to `/sleep-guides` hub page (avoids indexing empty 404 pages).

Handles dynamic `<title>` and `<meta>` tags via `document.title` and meta tag manipulation in `useEffect` (same pattern already used for landing pages).

## Routing Changes (`src/main.tsx`)

Extend `LANDING_ROUTES` pattern:

```typescript
// Static routes
const LANDING_ROUTES: Record<string, React.JSX.Element> = {
  '/privacy': <LandingPrivacyPage />,
  '/terms': <LandingTermsPage />,
  '/contact': <LandingContactPage />,
  '/sleep-guides': <SleepGuideHub />,
};

// Dynamic route matching
if (pathname.startsWith('/sleep-guides/')) {
  const slug = pathname.replace('/sleep-guides/', '');
  page = <SleepGuidePage slug={slug} />;
}
```

## Styling

- Uses morning theme (`theme-morning` on `documentElement`)
- Reuses existing CSS classes: `.card`, `.btn`, design system tokens
- Same max-width container as other landing pages (`max-w-2xl`)
- Guide page uses wider container for readability (`max-w-3xl`)
- Color coding: sage for nap stats, periwinkle for night/bedtime, parchment for wake
- Mobile-first responsive design

## Sitemap Updates

Add 11 new URLs to `public/sitemap.xml`:
- `/sleep-guides` (changefreq: monthly, priority: 0.7)
- `/sleep-guides/3-month-old` through `/sleep-guides/12-month-old` (changefreq: monthly, priority: 0.6)

## Accessibility & Semantic HTML

- Use `<main>`, `<article>`, `<nav>` semantic elements
- Heading hierarchy: `<h1>` for page title, `<h2>` for content sections, `<h3>` for sub-sections
- Breadcrumb uses `<nav aria-label="Breadcrumb">`
- Prev/next navigation uses `<nav aria-label="Age navigation">`
- Color-coded stats include text labels (not color-only communication)
- Hub page cards are links with descriptive text (age + stats visible to screen readers)

## Content Tone

Following NapNap's brand voice:
- Warm, reassuring, non-judgmental ("gentle friend" persona)
- Decision-oriented: "here's what to do" not "here's what you could consider"
- Acknowledges difficulty without anxiety ("this is normal", "you're doing great")
- No sleep training advocacy — method-neutral
- Short paragraphs, scannable structure

## Out of Scope

- Newborn weekly guides (Batch 2)
- Toddler guides (Batch 2)
- CMS or markdown-based content (static data file for now)
- Pre-rendering / SSG (deferred per earlier decision)
- Algorithm enrichment from Huckleberry data (separate backlog item in ESSENTIAL-GAPS.md §7)
- Blog/articles section (Phase 2.2, separate spec)
