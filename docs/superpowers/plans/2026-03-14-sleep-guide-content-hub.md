# Sleep Guide Content Hub — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 10-page SEO content hub with age-specific sleep schedule guides (3–12 months) and an index page, using the morning theme and NapNap's brand voice.

**Architecture:** Data-driven — a single `SleepGuideConfig` array in `src/data/sleepGuideContent.ts` powers both the hub grid and individual guide pages. Two new components (`SleepGuideHub`, `SleepGuidePage`) render from this data. A shared `LandingFooter` is extracted from `LandingPage.tsx` for reuse.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Vitest, CSS custom properties (design system tokens)

**Spec:** `docs/superpowers/specs/2026-03-14-sleep-guide-content-hub-design.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/utils/seo.ts` | Create | Shared SEO helpers: `setMeta`, `setCanonical`, `setJsonLd` |
| `src/components/LandingFooter.tsx` | Create | Shared footer extracted from LandingPage |
| `src/components/LandingPage.tsx` | Modify | Replace inline footer with `<LandingFooter />` |
| `src/components/LandingPrivacyPage.tsx` | Modify | Add `<LandingFooter />` |
| `src/components/LandingTermsPage.tsx` | Modify | Add `<LandingFooter />` |
| `src/components/LandingContactPage.tsx` | Modify | Add `<LandingFooter />` |
| `src/data/sleepGuideContent.ts` | Create | `SleepGuideConfig` type + all 10 age configs |
| `src/data/sleepGuideContent.test.ts` | Create | Data integrity tests |
| `src/components/SleepGuidePage.tsx` | Create | Individual guide page renderer |
| `src/components/SleepGuideHub.tsx` | Create | Hub/index page with age card grid |
| `src/main.tsx` | Modify | Add `/sleep-guides` and `/sleep-guides/:slug` routes |
| `public/sitemap.xml` | Modify | Add 11 new URLs |

**Domain:** All sitemap and OG URLs use `https://napnap.app/` (matching the existing sitemap).

---

## Chunk 1: Shared Utilities + Footer Extraction

### Task 0: Create shared SEO utility

**Files:**
- Create: `src/utils/seo.ts`

- [ ] **Step 1: Create the SEO helper file**

```typescript
// src/utils/seo.ts

/** Set or create a <meta> tag by name or property attribute. */
export function setMeta(name: string, content: string, property?: boolean): void {
  const attr = property ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

/** Set or create a <link rel="canonical"> tag. */
export function setCanonical(url: string): void {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = url;
}

/** Set or create a JSON-LD <script> tag. Use `key` to target a specific script. */
export function setJsonLd(data: Record<string, unknown>, key = 'default'): HTMLScriptElement {
  const selector = `script[data-ld-key="${key}"]`;
  let script = document.querySelector(selector) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-ld-key', key);
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
  return script;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/seo.ts
git commit -m "feat: add shared SEO utility helpers (setMeta, setCanonical, setJsonLd)"
```

### Task 1: Extract LandingFooter component

**Files:**
- Create: `src/components/LandingFooter.tsx`
- Modify: `src/components/LandingPage.tsx:698-736`

- [ ] **Step 1: Create the shared footer component**

Create `src/components/LandingFooter.tsx`. The footer on the landing page has a "Product" column with `scrollToSection` buttons — these only work on the landing page. The shared footer should accept an optional `onProductLink` prop; when absent, Product links become plain `<a href="/#section">` links (works from any page).

```tsx
// src/components/LandingFooter.tsx
interface LandingFooterProps {
  onScrollToSection?: (id: string) => void;
}

export function LandingFooter({ onScrollToSection }: LandingFooterProps) {
  const productLinks = [
    { id: 'how-it-works', label: 'How it works' },
    { id: 'product-showcase', label: 'The app' },
    { id: 'faq', label: 'FAQ' },
  ];

  return (
    <footer className="border-t border-[var(--glass-border)] py-10 mt-8">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr_0.8fr] gap-8">
          {/* Brand column */}
          <div className="space-y-3">
            <p className="text-display-sm text-[var(--text-primary)]">NapNap</p>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              The quiet voice at 3am that tells you what comes next.
            </p>
          </div>

          {/* Product + Legal columns */}
          <div className="grid grid-cols-2 md:contents gap-8">
            <div className="space-y-3">
              <p className="text-[10px] tracking-[0.15em] uppercase text-[var(--nap-color)] font-display">Product</p>
              <nav className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                {productLinks.map(({ id, label }) =>
                  onScrollToSection ? (
                    <button key={id} type="button" className="text-left hover:text-[var(--text-secondary)] transition-colors" onClick={() => onScrollToSection(id)}>{label}</button>
                  ) : (
                    <a key={id} href={`/#${id}`} className="hover:text-[var(--text-secondary)] transition-colors">{label}</a>
                  )
                )}
              </nav>
            </div>
            <div className="space-y-3">
              <p className="text-[10px] tracking-[0.15em] uppercase text-[var(--nap-color)] font-display">Legal</p>
              <nav className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                <a href="/sleep-guides" className="hover:text-[var(--text-secondary)] transition-colors">Sleep Guides</a>
                <a href="/privacy" className="hover:text-[var(--text-secondary)] transition-colors">Privacy</a>
                <a href="/terms" className="hover:text-[var(--text-secondary)] transition-colors">Terms</a>
                <a href="/contact" className="hover:text-[var(--text-secondary)] transition-colors">Contact</a>
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-4 border-t border-[var(--glass-border)] text-center text-xs text-[var(--text-muted)]">
          &copy; 2026 NapNap. Made with care in Barcelona.
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Replace inline footer in LandingPage.tsx**

In `src/components/LandingPage.tsx`, replace lines 698–736 (the `{/* ── Footer ── */}` section through `</footer>`) with:

```tsx
<LandingFooter onScrollToSection={scrollToSection} />
```

Add the import at the top:
```tsx
import { LandingFooter } from './LandingFooter';
```

- [ ] **Step 3: Add footer to Privacy, Terms, and Contact pages**

For each of `LandingPrivacyPage.tsx`, `LandingTermsPage.tsx`, `LandingContactPage.tsx`:
- Add `import { LandingFooter } from './LandingFooter';`
- Add `<LandingFooter />` before the closing `</div>` of the outermost container

- [ ] **Step 4: Verify in browser**

Run: `npm run dev`

Check:
1. Landing page (`/`) — footer renders identically, Product links scroll correctly
2. `/privacy` — footer appears, Product links go to `/#how-it-works` etc.
3. `/terms` — same
4. `/contact` — same

- [ ] **Step 5: Commit**

```bash
git add src/components/LandingFooter.tsx src/components/LandingPage.tsx src/components/LandingPrivacyPage.tsx src/components/LandingTermsPage.tsx src/components/LandingContactPage.tsx
git commit -m "refactor: extract shared LandingFooter component

Reuse footer across landing, privacy, terms, and contact pages.
Product links use scrollToSection on landing page, href fallback elsewhere."
```

---

## Chunk 2: Sleep Guide Content Data

### Task 2: Create the SleepGuideConfig type and data file

**Files:**
- Create: `src/data/sleepGuideContent.ts`

- [ ] **Step 1: Create `src/data/` directory and the content file with types**

```typescript
// src/data/sleepGuideContent.ts

export interface SleepGuideStats {
  napsPerDay: string;
  wakeWindow: string;
  bedtime: string;
  nightSleep: string;
  totalDaySleep: string;
  totalSleep: string;
}

export interface SleepGuideScheduleItem {
  time: string;
  label: string;
  type: 'wake' | 'nap' | 'bedtime';
}

export interface SleepGuideSection {
  heading: string;
  content: string; // Paragraphs separated by \n\n
}

export interface SleepGuideTip {
  title: string;
  description: string;
}

export interface SleepGuideRegression {
  name: string;
  description: string;
}

export interface SleepGuideConfig {
  slug: string;
  ageMonths: number;
  title: string;
  subtitle: string;
  metaDescription: string;
  stats: SleepGuideStats;
  sampleSchedule: SleepGuideScheduleItem[];
  sections: SleepGuideSection[];
  tips: SleepGuideTip[];
  regression?: SleepGuideRegression;
}
```

- [ ] **Step 2: Add the first guide config (6-month-old) as the reference template**

Add below the types in the same file. This serves as the reference for all other age configs. Content should be unique, warm, NapNap-brand-voice prose (800–1200 words total across all sections).

```typescript
export const SLEEP_GUIDE_CONFIGS: SleepGuideConfig[] = [
  {
    slug: '6-month-old',
    ageMonths: 6,
    title: '6 Month Old Sleep Schedule',
    subtitle: 'Wake windows, nap times, and bedtime for your 6-month-old',
    metaDescription: '6-month-old sleep schedule with wake windows, nap times, and bedtime. Learn what to expect and get a sample daily routine.',
    stats: {
      napsPerDay: '3',
      wakeWindow: '2–2.5h',
      bedtime: '18:30–19:30',
      nightSleep: '11–12h',
      totalDaySleep: '3–3.5h',
      totalSleep: '14–15h',
    },
    sampleSchedule: [
      { time: '6:30', label: 'Wake up', type: 'wake' },
      { time: '8:30', label: 'Nap 1 (1–1.5 hours)', type: 'nap' },
      { time: '11:30', label: 'Nap 2 (1–1.5 hours)', type: 'nap' },
      { time: '15:00', label: 'Nap 3 (30 min catnap)', type: 'nap' },
      { time: '19:00', label: 'Bedtime', type: 'bedtime' },
    ],
    sections: [
      {
        heading: 'What to expect at 6 months',
        content: 'At six months, your baby is settling into a solid 3-nap routine...',
        // Full unique prose goes here — 2-3 paragraphs
      },
      {
        heading: 'Understanding wake windows',
        content: 'A wake window is the time your baby stays awake between sleeps...',
        // Full unique prose — 1-2 paragraphs
      },
    ],
    tips: [
      {
        title: 'Fighting the third nap',
        description: 'Your baby may be getting ready to drop to 2 naps. Look for consistent refusal over 1–2 weeks before making the switch.',
      },
      {
        title: 'Early morning wakes',
        description: 'If your baby is waking before 6am, bedtime might be too late. Try shifting it 15 minutes earlier.',
      },
      {
        title: 'Short naps',
        description: '30-minute naps are developmentally normal at this age. Most babies consolidate naps between 5 and 7 months.',
      },
    ],
  },
  // ... remaining 9 configs added in Step 3
];

/** Lookup a guide config by slug. Returns undefined if not found. */
export function getGuideBySlug(slug: string): SleepGuideConfig | undefined {
  return SLEEP_GUIDE_CONFIGS.find((g) => g.slug === slug);
}

/** All valid slugs, ordered by age. */
export const GUIDE_SLUGS = SLEEP_GUIDE_CONFIGS.map((g) => g.slug);
```

- [ ] **Step 3: Add remaining 9 guide configs (3, 4, 5, 7, 8, 9, 10, 11, 12 months)**

Add all remaining configs to the `SLEEP_GUIDE_CONFIGS` array, ordered by `ageMonths`. Each config needs:
- `stats` derived from `SLEEP_DEVELOPMENT_MAP` bracket for that month (see mapping table in spec)
- `sampleSchedule` computed from wake windows + default wake time
- `sections` with unique prose (2 sections: "What to expect" + "Understanding wake windows")
- `tips` with 3–4 age-specific bullet points
- `regression` object for months 4, 8, 12

Reference the `SLEEP_DEVELOPMENT_MAP` brackets (each bracket's range is exclusive upper bound — e.g. `minMonths: 3, maxMonths: 4` covers month 3 only):

| Guide | Bracket (minMonths–maxMonths) | Key data |
|-------|-------------------------------|----------|
| 3 mo | 3–4 | targetNaps: 4, wake first: 75m, mid: 90m |
| 4 mo | 4–5 | targetNaps: 3, regression: 4-month |
| 5 mo | 5–6 | targetNaps: 3, wake first: 105m, mid: 120m |
| 6 mo | 6–7 | targetNaps: 3, wake first: 120m, mid: 135m |
| 7 mo | 7–8 | targetNaps: 3, wake first: 120m, mid: 150m |
| 8 mo | 8–9 | targetNaps: 2, regression: 8-month |
| 9 mo | 9–10 | targetNaps: 2, wake first: 150m, mid: 180m |
| 10 mo | 10–12 | targetNaps: 2, wake first: 165m, mid: 195m |
| 11 mo | 10–12 | Same bracket as 10 mo (unique prose, same stats) |
| 12 mo | 12–15 | targetNaps: 2, regression: 12-month (manually set — the 10-12 bracket has the regression flag but `getSleepConfigForAge` returns 12-15 for a 12-month-old) |

Content tone: warm, reassuring, non-judgmental. See spec § Content Tone and `guidelines/brand_guidelines.md`.

- [ ] **Step 4: Commit data file**

```bash
git add src/data/sleepGuideContent.ts
git commit -m "feat: add sleep guide content data for 10 age groups (3-12 months)"
```

### Task 3: Write data integrity tests

**Files:**
- Create: `src/data/sleepGuideContent.test.ts`

- [ ] **Step 1: Write the test file**

```typescript
// src/data/sleepGuideContent.test.ts
import { describe, it, expect } from 'vitest';
import { SLEEP_GUIDE_CONFIGS, getGuideBySlug, GUIDE_SLUGS } from './sleepGuideContent';

describe('sleepGuideContent', () => {
  it('has exactly 10 guide configs', () => {
    expect(SLEEP_GUIDE_CONFIGS).toHaveLength(10);
  });

  it('covers months 3 through 12', () => {
    const months = SLEEP_GUIDE_CONFIGS.map((g) => g.ageMonths);
    expect(months).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it('has unique slugs', () => {
    const slugs = SLEEP_GUIDE_CONFIGS.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('slugs follow the pattern N-month-old', () => {
    for (const config of SLEEP_GUIDE_CONFIGS) {
      expect(config.slug).toBe(`${config.ageMonths}-month-old`);
    }
  });

  it('each config has required content sections', () => {
    for (const config of SLEEP_GUIDE_CONFIGS) {
      expect(config.sections.length).toBeGreaterThanOrEqual(2);
      expect(config.tips.length).toBeGreaterThanOrEqual(3);
      expect(config.sampleSchedule.length).toBeGreaterThanOrEqual(3);
      expect(config.metaDescription.length).toBeGreaterThan(50);
    }
  });

  it('regression is set for months 4, 8, and 12 only', () => {
    const withRegression = SLEEP_GUIDE_CONFIGS.filter((g) => g.regression);
    const regressionMonths = withRegression.map((g) => g.ageMonths);
    expect(regressionMonths).toEqual([4, 8, 12]);
  });

  it('getGuideBySlug returns correct config', () => {
    const guide = getGuideBySlug('6-month-old');
    expect(guide?.ageMonths).toBe(6);
  });

  it('getGuideBySlug returns undefined for unknown slug', () => {
    expect(getGuideBySlug('99-month-old')).toBeUndefined();
  });

  it('GUIDE_SLUGS matches config order', () => {
    expect(GUIDE_SLUGS).toEqual(SLEEP_GUIDE_CONFIGS.map((g) => g.slug));
  });

  it('sample schedules start with wake and end with bedtime', () => {
    for (const config of SLEEP_GUIDE_CONFIGS) {
      expect(config.sampleSchedule[0].type).toBe('wake');
      expect(config.sampleSchedule[config.sampleSchedule.length - 1].type).toBe('bedtime');
    }
  });
});
```

- [ ] **Step 2: Run tests**

Run: `npx vitest run src/data/sleepGuideContent.test.ts`
Expected: All tests pass

- [ ] **Step 3: Commit tests**

```bash
git add src/data/sleepGuideContent.test.ts
git commit -m "test: add data integrity tests for sleep guide content"
```

---

## Chunk 3: SleepGuidePage Component

### Task 4: Build the individual guide page component

**Files:**
- Create: `src/components/SleepGuidePage.tsx`

The component renders a single sleep guide from its `SleepGuideConfig`. It handles:
- Morning theme activation (useEffect on documentElement)
- Dynamic document title + meta tags (useEffect)
- JSON-LD structured data
- OG + Twitter meta tags
- Breadcrumb navigation
- At-a-glance stats card
- Prose sections (split `\n\n` into `<p>` tags)
- Sample schedule card (color-coded by type)
- Tips list
- Regression callout (if present)
- Prev/next age navigation
- CTA button
- Shared footer

- [ ] **Step 1: Create the component file**

```tsx
// src/components/SleepGuidePage.tsx
import { useEffect } from 'react';
import { getGuideBySlug, GUIDE_SLUGS } from '../data/sleepGuideContent';
import type { SleepGuideScheduleItem } from '../data/sleepGuideContent';
import { setMeta, setCanonical, setJsonLd } from '../utils/seo';
import { LandingFooter } from './LandingFooter';

interface SleepGuidePageProps {
  slug: string;
}

const TYPE_COLORS: Record<SleepGuideScheduleItem['type'], string> = {
  wake: 'var(--wake-color)',
  nap: 'var(--nap-color)',
  bedtime: 'var(--night-color)',
};

export function SleepGuidePage({ slug }: SleepGuidePageProps) {
  const guide = getGuideBySlug(slug);

  // Redirect to hub if slug not found
  useEffect(() => {
    if (!guide) {
      window.location.replace('/sleep-guides');
    }
  }, [guide]);

  // Morning theme
  useEffect(() => {
    const root = document.documentElement;
    const prev = Array.from(root.classList);
    if (!root.classList.contains('theme-morning')) root.classList.add('theme-morning');
    return () => { root.className = prev.join(' '); };
  }, []);

  // Dynamic meta + canonical + JSON-LD
  useEffect(() => {
    if (!guide) return;
    document.title = `${guide.title} — NapNap`;

    setMeta('description', guide.metaDescription);
    setMeta('og:title', `${guide.title} — NapNap`, true);
    setMeta('og:description', guide.metaDescription, true);
    setMeta('og:type', 'article', true);
    setMeta('og:url', `https://napnap.app/sleep-guides/${guide.slug}`, true);
    setMeta('twitter:card', 'summary');
    setMeta('twitter:title', `${guide.title} — NapNap`);
    setMeta('twitter:description', guide.metaDescription);
    setCanonical(`https://napnap.app/sleep-guides/${guide.slug}`);

    const script = setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: guide.title,
      description: guide.metaDescription,
      datePublished: '2026-03-14',
      dateModified: '2026-03-14',
      author: { '@type': 'Organization', name: 'NapNap' },
      publisher: { '@type': 'Organization', name: 'NapNap' },
    }, 'sleep-guide');

    return () => {
      document.title = 'NapNap — Baby Sleep Tracker';
      script.remove();
    };
  }, [guide]);

  if (!guide) return null;

  // Prev/next navigation
  const currentIndex = GUIDE_SLUGS.indexOf(guide.slug);
  const prevSlug = currentIndex > 0 ? GUIDE_SLUGS[currentIndex - 1] : null;
  const nextSlug = currentIndex < GUIDE_SLUGS.length - 1 ? GUIDE_SLUGS[currentIndex + 1] : null;
  const prevAge = prevSlug ? prevSlug.replace('-month-old', '') : null;
  const nextAge = nextSlug ? nextSlug.replace('-month-old', '') : null;

  // Spec ordering: sections[0] (What to expect), then schedule, then sections[1+] (wake windows), then tips
  const firstSection = guide.sections[0];
  const remainingSections = guide.sections.slice(1);

  return (
    <div className="theme-morning min-h-screen bg-[var(--bg-deep)]">
      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <a href="/sleep-guides" className="inline-flex items-center gap-1 text-sm text-[var(--nap-color)] hover:text-[var(--text-primary)] transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Sleep Guides
          </a>
        </nav>

        <article>
          <h1 className="text-display-md text-[var(--text-primary)] mb-2">{guide.title}</h1>
          <p className="text-sm text-[var(--text-muted)] mb-8">{guide.subtitle}</p>

          {/* At a glance */}
          <div className="card p-5 mb-8">
            <h2 className="text-sm font-display font-semibold text-[var(--text-primary)] mb-4">At a glance</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div><span className="font-semibold text-[var(--nap-color)]">Naps:</span> {guide.stats.napsPerDay}/day</div>
              <div><span className="font-semibold text-[var(--nap-color)]">Wake window:</span> {guide.stats.wakeWindow}</div>
              <div><span className="font-semibold" style={{ color: 'var(--night-color)' }}>Bedtime:</span> {guide.stats.bedtime}</div>
              <div><span className="font-semibold" style={{ color: 'var(--wake-color)' }}>Night sleep:</span> {guide.stats.nightSleep}</div>
              <div><span className="font-semibold text-[var(--nap-color)]">Day sleep:</span> {guide.stats.totalDaySleep}</div>
              <div><span className="font-semibold text-[var(--nap-color)]">Total sleep:</span> {guide.stats.totalSleep}</div>
            </div>
          </div>

          {/* Regression callout (if present) */}
          {guide.regression && (
            <div className="card p-5 mb-8 border-l-4" style={{ borderLeftColor: 'var(--wake-color)' }}>
              <h2 className="text-sm font-display font-semibold" style={{ color: 'var(--wake-color)' }}>{guide.regression.name}</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">{guide.regression.description}</p>
            </div>
          )}

          {/* Prose section 1: "What to expect" */}
          {firstSection && (
            <section className="mb-8">
              <h2 className="text-lg font-display font-bold text-[var(--text-primary)] mb-3">{firstSection.heading}</h2>
              {firstSection.content.split('\n\n').map((para, j) => (
                <p key={j} className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">{para}</p>
              ))}
            </section>
          )}

          {/* Sample schedule (between prose sections per spec) */}
          <div className="card p-5 mb-8">
            <h2 className="text-sm font-display font-semibold text-[var(--text-primary)] mb-4">Sample schedule</h2>
            <div className="flex flex-col gap-2">
              {guide.sampleSchedule.map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="font-semibold w-14" style={{ color: TYPE_COLORS[item.type] }}>{item.time}</span>
                  <span className="text-[var(--text-secondary)]">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Remaining prose sections: "Understanding wake windows", etc. */}
          {remainingSections.map((section, i) => (
            <section key={i} className="mb-8">
              <h2 className="text-lg font-display font-bold text-[var(--text-primary)] mb-3">{section.heading}</h2>
              {section.content.split('\n\n').map((para, j) => (
                <p key={j} className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">{para}</p>
              ))}
            </section>
          ))}

          {/* Tips / Signs to watch for */}
          <section className="mb-8">
            <h2 className="text-lg font-display font-bold text-[var(--text-primary)] mb-3">Signs to watch for</h2>
            <ul className="space-y-3">
              {guide.tips.map((tip, i) => (
                <li key={i} className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  <strong className="text-[var(--text-primary)]">{tip.title}</strong> — {tip.description}
                </li>
              ))}
            </ul>
          </section>

          {/* Prev/Next navigation */}
          <nav aria-label="Age navigation" className="flex justify-between items-center py-4 border-t border-[var(--glass-border)] mb-8">
            {prevSlug ? (
              <a href={`/sleep-guides/${prevSlug}`} className="text-sm text-[var(--nap-color)] hover:text-[var(--text-primary)] transition-colors">
                ← {prevAge} Month Old
              </a>
            ) : <span />}
            {nextSlug ? (
              <a href={`/sleep-guides/${nextSlug}`} className="text-sm text-[var(--nap-color)] hover:text-[var(--text-primary)] transition-colors">
                {nextAge} Month Old →
              </a>
            ) : <span />}
          </nav>

          {/* CTA */}
          <div className="text-center mb-8">
            <a
              href="/app"
              className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-[var(--nap-color)] text-[var(--bg-deep)] font-display font-semibold transition-transform active:scale-[0.98]"
            >
              Track your {guide.ageMonths}-month-old's sleep with NapNap
            </a>
            <p className="text-xs text-[var(--text-muted)] mt-2">Free to start · No sleep training required</p>
          </div>
        </article>
      </main>

      <LandingFooter />
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser**

Navigate to `http://localhost:5173/sleep-guides/6-month-old` and check:
1. Morning theme applied
2. Breadcrumb links back to `/sleep-guides`
3. At-a-glance card renders with correct color coding
4. Prose sections render with paragraph splits
5. Sample schedule is color-coded
6. Prev/next links work (5 Month Old ← → 7 Month Old)
7. CTA links to `/app`
8. Footer renders
9. Page title updates to "6 Month Old Sleep Schedule — NapNap"
10. View page source — JSON-LD script tag present

- [ ] **Step 3: Test unknown slug redirect**

Navigate to `http://localhost:5173/sleep-guides/99-month-old`
Expected: Redirects to `/sleep-guides`

- [ ] **Step 4: Commit**

```bash
git add src/components/SleepGuidePage.tsx
git commit -m "feat: add SleepGuidePage component for individual sleep guides"
```

---

## Chunk 4: SleepGuideHub Component + Routing + Sitemap

### Task 5: Build the hub page component

**Files:**
- Create: `src/components/SleepGuideHub.tsx`

- [ ] **Step 1: Create the hub component**

```tsx
// src/components/SleepGuideHub.tsx
import { useEffect } from 'react';
import { SLEEP_GUIDE_CONFIGS } from '../data/sleepGuideContent';
import type { SleepGuideConfig } from '../data/sleepGuideContent';
import { setMeta, setCanonical } from '../utils/seo';
import { LandingFooter } from './LandingFooter';

// Placeholder data for Batch 2 sections
const NEWBORN_PLACEHOLDERS = ['Week 1', 'Week 2', '1 month', '2 months'];
const TODDLER_PLACEHOLDERS = ['13 months', '18 months', '2 years'];

function AgeCard({ config }: { config: SleepGuideConfig }) {
  return (
    <a
      href={`/sleep-guides/${config.slug}`}
      className="card p-4 text-center hover:scale-[1.02] transition-transform block"
    >
      <div className="text-lg font-display font-bold text-[var(--nap-color)]">
        {config.ageMonths} mo
      </div>
      <div className="text-[10px] text-[var(--text-muted)] mt-1">
        {config.stats.napsPerDay} naps · {config.stats.wakeWindow}
      </div>
      {config.regression && (
        <div className="text-[9px] font-semibold mt-1" style={{ color: 'var(--wake-color)' }}>
          ⚡ Regression
        </div>
      )}
    </a>
  );
}

function PlaceholderCard({ label }: { label: string }) {
  return (
    <div className="card p-4 text-center opacity-50 border-dashed">
      <div className="text-xs text-[var(--text-muted)]">{label}</div>
      <div className="text-[9px] text-[var(--text-muted)] mt-1">Coming soon</div>
    </div>
  );
}

export function SleepGuideHub() {
  // Morning theme
  useEffect(() => {
    const root = document.documentElement;
    const prev = Array.from(root.classList);
    if (!root.classList.contains('theme-morning')) root.classList.add('theme-morning');
    return () => { root.className = prev.join(' '); };
  }, []);

  // Meta tags + canonical
  useEffect(() => {
    document.title = 'Baby Sleep Schedules by Age — NapNap';
    setMeta('description', 'Age-specific sleep schedules from 3 to 12 months. Wake windows, nap times, bedtime, and tips for every stage.');
    setMeta('og:title', 'Baby Sleep Schedules by Age — NapNap', true);
    setMeta('og:description', 'Age-specific sleep schedules from 3 to 12 months.', true);
    setMeta('og:url', 'https://napnap.app/sleep-guides', true);
    setCanonical('https://napnap.app/sleep-guides');

    return () => { document.title = 'NapNap — Baby Sleep Tracker'; };
  }, []);

  return (
    <div className="theme-morning min-h-screen bg-[var(--bg-deep)]">
      <main className="max-w-2xl mx-auto px-6 py-12">
        <a href="/" className="inline-flex items-center gap-1 text-sm text-[var(--nap-color)] hover:text-[var(--text-primary)] transition-colors mb-8">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          Back to NapNap
        </a>

        <h1 className="text-display-md text-[var(--text-primary)] mb-2">Your Baby's Sleep Schedule</h1>
        <p className="text-sm text-[var(--text-muted)] mb-10">Age-specific guides with wake windows, nap times, and bedtime</p>

        {/* Newborn section */}
        <section className="mb-10">
          <h2 className="text-sm font-display font-bold mb-4" style={{ color: 'var(--night-color)' }}>
            Newborn (0–3 months)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {NEWBORN_PLACEHOLDERS.map((label) => (
              <PlaceholderCard key={label} label={label} />
            ))}
          </div>
        </section>

        {/* Infant section */}
        <section className="mb-10">
          <h2 className="text-sm font-display font-bold mb-4 text-[var(--nap-color)]">
            Infant (3–12 months)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {SLEEP_GUIDE_CONFIGS.map((config) => (
              <AgeCard key={config.slug} config={config} />
            ))}
          </div>
        </section>

        {/* Toddler section */}
        <section className="mb-10">
          <h2 className="text-sm font-display font-bold mb-4" style={{ color: 'var(--wake-color)' }}>
            Toddler (13–24 months)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {TODDLER_PLACEHOLDERS.map((label) => (
              <PlaceholderCard key={label} label={label} />
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center mb-8">
          <a
            href="/app"
            className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-[var(--nap-color)] text-[var(--bg-deep)] font-display font-semibold transition-transform active:scale-[0.98]"
          >
            Track your baby's sleep with NapNap — Start free
          </a>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
```

- [ ] **Step 2: Commit hub component**

```bash
git add src/components/SleepGuideHub.tsx
git commit -m "feat: add SleepGuideHub component with age card grid"
```

### Task 6: Add routing for sleep guide pages

**Files:**
- Modify: `src/main.tsx`

- [ ] **Step 1: Update main.tsx with new routes**

Add imports:
```tsx
import { SleepGuideHub } from './components/SleepGuideHub';
import { SleepGuidePage } from './components/SleepGuidePage';
```

Update the `LANDING_ROUTES` record to include `/sleep-guides`:
```tsx
const LANDING_ROUTES: Record<string, React.JSX.Element> = {
  '/privacy': <LandingPrivacyPage />,
  '/terms': <LandingTermsPage />,
  '/contact': <LandingContactPage />,
  '/sleep-guides': <SleepGuideHub />,
};
```

Replace the `page` assignment to handle dynamic `/sleep-guides/:slug` routes:
```tsx
let page: React.JSX.Element;

if (pathname.startsWith('/app')) {
  page = (
    <NavHiddenWhenModalProvider>
      <AuthGuard>
        <App />
      </AuthGuard>
    </NavHiddenWhenModalProvider>
  );
} else if (pathname.startsWith('/sleep-guides/')) {
  const slug = pathname.replace('/sleep-guides/', '');
  page = <SleepGuidePage slug={slug} />;
} else {
  page = LANDING_ROUTES[pathname] ?? <LandingPage />;
}
```

- [ ] **Step 2: Verify routing**

Run: `npm run dev`

Test these URLs:
1. `/sleep-guides` → Hub page renders
2. `/sleep-guides/6-month-old` → Guide page renders
3. `/sleep-guides/3-month-old` → Guide page, no prev link
4. `/sleep-guides/12-month-old` → Guide page, no next link
5. `/sleep-guides/bogus` → Redirects to `/sleep-guides`
6. `/` → Landing page still works
7. `/privacy` → Privacy page still works

- [ ] **Step 3: Commit routing changes**

```bash
git add src/main.tsx
git commit -m "feat: add routing for sleep guide hub and individual guide pages"
```

### Task 7: Update sitemap

**Files:**
- Modify: `public/sitemap.xml`

- [ ] **Step 1: Add 11 new URLs to sitemap**

Add after the existing `/contact` entry:

```xml
  <url>
    <loc>https://napnap.app/sleep-guides</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://napnap.app/sleep-guides/3-month-old</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://napnap.app/sleep-guides/4-month-old</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://napnap.app/sleep-guides/5-month-old</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://napnap.app/sleep-guides/6-month-old</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://napnap.app/sleep-guides/7-month-old</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://napnap.app/sleep-guides/8-month-old</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://napnap.app/sleep-guides/9-month-old</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://napnap.app/sleep-guides/10-month-old</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://napnap.app/sleep-guides/11-month-old</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://napnap.app/sleep-guides/12-month-old</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
```

- [ ] **Step 2: Run build to verify no errors**

Run: `npm run build`
Expected: Build succeeds with no TypeScript errors

- [ ] **Step 3: Run all tests**

Run: `npx vitest run`
Expected: All tests pass (including the new data integrity tests)

- [ ] **Step 4: Commit sitemap and final verification**

```bash
git add public/sitemap.xml
git commit -m "feat: add sleep guide URLs to sitemap"
```
