# Landing Page Phase 1: Social Proof, SEO & Footer

## Purpose

Strengthen the NapNap landing page's trust signals and SEO foundation. The current page has strong copy and design but lacks the social proof depth, SEO infrastructure, and footer completeness that competitors (Napper, Huckleberry, BabyNaps, Nara) all have. This is the highest-impact, lowest-effort improvement available.

## Scope

Four changes to the landing page, all within the existing architecture (no new routes, no SSG, no CMS):

1. Replace testimonial carousel with a 2-column testimonial grid
2. Fix SEO fundamentals (robots.txt, sitemap, OG/meta tags)
3. Replace bare footer with enriched 3-column footer
4. Re-enable the email capture section

## 1. Testimonial Grid

### What changes

Replace the current `SOCIAL_PROOF` carousel (3 quotes, auto-rotating, swipe) with a static 2-column card grid showing all 6 testimonials at once.

### Layout

- **Section wrapper**: Keep `bg-[var(--bg-mid)]` tinted band (same as current carousel) to preserve the page's visual rhythm of alternating sections
- **Header**: "Trusted by dozens of families" in small caps, centered, `var(--nap-color)`
- **Grid**: `grid-cols-1 md:grid-cols-2`, gap-4
- **Each card**: `.card` styling (glass bg, subtle border), padding p-5
  - Quote text: `text-sm text-[var(--text-primary)]`, italic
  - Author line: `text-xs text-[var(--text-muted)]`, below quote with mt-3
- **Mobile**: Single column stack, all 6 visible (no carousel, no hiding)

**Note**: This replaces the 3 existing testimonials (Priya, James, Sofia) entirely with 6 new testimonials using Spanish/Catalan names, as directed by the product owner.

### Data

Replace `SOCIAL_PROOF` array with:

```typescript
const TESTIMONIALS = [
  {
    quote: 'Finally, something that tells me what to do next without judging how I got here.',
    author: 'Mireia',
    context: 'mum of a 4-month-old',
  },
  {
    quote: "I use it at 3am when my brain doesn't work. One tap and it tells me when to try again.",
    author: 'Rosa',
    context: 'mum of twins',
  },
  {
    quote: "No charts, no scores. Just 'next nap around 14:10.' That's all I needed.",
    author: 'Eva',
    context: 'mum of a 7-month-old',
  },
  {
    quote: "My partner logs naps too. We're finally on the same page without texting back and forth.",
    author: 'Marta',
    context: 'mum of a 10-month-old',
  },
  {
    quote: 'It learned my baby\'s rhythm in two days. Now I actually plan my mornings.',
    author: 'Cristina',
    context: 'mum of a 5-month-old',
  },
  {
    quote: 'My daughter shared access with me. I know exactly when the little one needs to nap.',
    author: 'Pepi',
    context: 'grandmother and caregiver',
  },
];
```

### Code to remove

- `activeTestimonial` state
- `testimonialPaused` state
- `touchStartX` ref
- `handleTestimonialSwipe` callback
- Auto-rotate `useEffect` (the 6s interval timer)
- `onMouseEnter`/`onMouseLeave`/`onTouchStart`/`onTouchEnd` handlers on the section
- Dot indicator navigation (`role="tablist"`)
- Absolute-positioned figure elements with opacity transitions
- Decorative open-quote SVG

### Accessibility

- Section keeps `aria-label="What parents say"`
- Each card is a `<figure>` with `<blockquote>` and `<figcaption>`

## 2. SEO Fundamentals

### 2a. robots.txt

Create `public/robots.txt`:

```
User-agent: *
Allow: /
Disallow: /app

Sitemap: https://napnap.app/sitemap.xml
```

Rationale: Allow indexing of the landing page, block the authenticated app.

### 2b. sitemap.xml

Create `public/sitemap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://napnap.app/</loc>
    <lastmod>2026-03-14</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

Only the landing page for now. Will expand when blog/guides routes are added.

**Note on `Disallow: /app`**: Since this is an SPA, the directive only prevents crawlers from following links to `/app`. It won't prevent indexing if a crawler discovers the URL through other means. This is acceptable — the main goal is to signal intent and prevent the app route from appearing in search results via link following.

### 2c. index.html meta tag additions

Add to `<head>`:

```html
<link rel="canonical" href="https://napnap.app/" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="NapNap – Baby Sleep Tracker & Smart Nap Schedule" />
<meta name="twitter:description" content="See the next nap and bedtime at a glance. NapNap turns wake windows into a simple, gentle rhythm for your baby." />
<meta name="twitter:image" content="https://napnap.app/media/napnap-og-image.jpg" />
```

### 2d. OG image placeholder

The current `index.html` references `napnap-og-image.jpg` but the file does not exist. Create a simple placeholder image or note it as a manual task (needs design tool). For now, we can reference one of the existing app screenshots as the OG image to unblock social sharing:

Change OG image meta to point to an existing asset:
```html
<meta property="og:image" content="https://napnap.app/media/napnap-today-new.png" />
```

Update the Twitter image meta to match.

**Known limitation**: The app screenshot is portrait-oriented and will be cropped by social platforms that expect 1200x630 landscape. This is a temporary fix — creating a proper OG image is a follow-up task requiring a design tool.

## 3. Enriched Footer

### What changes

Replace the current minimal footer (tagline + "Start free" button) with a full 3-column footer. The existing "Start free" CTA button is intentionally removed — the warm CTA card (mid-page section "Ready to find your rhythm?") and the email capture section above the footer serve as the final conversion points instead.

### Layout

```
┌─────────────────────────────────────────────────┐
│  NapNap                 PRODUCT        LEGAL    │
│  The quiet voice at     How it works   Privacy  │
│  3am that tells you     The app        Terms    │
│  what comes next.       FAQ            Contact  │
│  [X] [Instagram]                                │
├─────────────────────────────────────────────────┤
│         © 2026 NapNap. Made with care           │
│                in Barcelona.                     │
└─────────────────────────────────────────────────┘
```

- **Desktop**: `grid-cols-[1.2fr_0.8fr_0.8fr]`
- **Mobile**: Stack — brand on top, then product + legal side-by-side, bottom bar below
- **Brand column**: "NapNap" wordmark (`text-display-sm`), tagline (`text-[var(--text-muted)]`), social icon placeholders (X + Instagram SVGs, `text-[var(--text-muted)]` with hover to `text-[var(--text-secondary)]`)
- **Product column**: Header "PRODUCT" in `text-[10px] tracking-[0.15em] uppercase text-[var(--nap-color)]`, links scroll to sections
- **Legal column**: Header "LEGAL" in `text-[10px] tracking-[0.15em] uppercase text-[var(--nap-color)]`, placeholder hrefs (`#`) for Privacy, Terms, Contact
- **Bottom bar**: `border-t border-[var(--glass-border)]`, centered, `text-[var(--text-muted)]` at 12px
- Social links: `href="#"` for now (placeholders until accounts are set up)

### Social icon SVGs

Use simple 20x20 SVGs matching the existing icon style (stroke-based, 2px stroke, round caps):

**X (Twitter):**
```html
<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
</svg>
```

**Instagram:**
```html
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
</svg>
```

### Navigation behavior

- "How it works", "The app", "FAQ" use existing `scrollToSection()` function
- "Privacy", "Terms", "Contact" link to `#` (placeholder — pages don't exist yet)

### Mobile layout detail

- **Mobile**: `grid-cols-1` — brand column on top (full width), then a `grid-cols-2` sub-grid for product + legal side-by-side, bottom bar full width below
- Social icons sit inside the brand column, below tagline, using `flex gap-3`

## 4. Re-enable Email Capture

### What changes

Uncomment the email capture section (find it by the comment marker `"Email capture — temporarily hidden while verifying Edge Function deploy"`). Keep it positioned between the FAQ and the footer.

### Required code changes

1. **Uncomment the supabase import** on line 3: `import { supabase } from '../lib/supabase';`

2. **Uncomment state variables**: `emailValue`, `emailSubmitted`, `emailSending`, `emailError`

3. **Create `handleEmailSubmit`** — this function does not currently exist in the file (it was removed when the section was commented out). The project's Edge Function `waitlist-notify` already exists at `supabase/functions/waitlist-notify/index.ts`. Create:

```typescript
const handleEmailSubmit = async () => {
  if (!emailValue || !/\S+@\S+\.\S+/.test(emailValue)) {
    setEmailError('Please enter a valid email.');
    return;
  }
  setEmailSending(true);
  setEmailError('');
  try {
    await supabase.functions.invoke('waitlist-notify', { body: { email: emailValue } });
  } catch {
    // Silent — non-critical feature, don't break UX if Edge Function is down
  }
  setEmailSending(false);
  setEmailSubmitted(true);
};
```

4. **Uncomment the JSX block** for the email capture section

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/LandingPage.tsx` | Replace testimonials, new footer, uncomment email capture |
| `index.html` | Add canonical, Twitter card meta, fix OG image path |
| `public/robots.txt` | Create new |
| `public/sitemap.xml` | Create new |

## Files NOT to Modify

Everything else. No changes to the app, routing, design system, or any other component.

## Verification

1. `npm run build` — must pass with no type errors
2. `npm run lint` — must pass
3. Start dev server and visually verify:
   - Testimonial grid renders 6 cards, 2 columns on desktop, 1 on mobile
   - "Trusted by dozens of families" header visible
   - Footer shows 3 columns on desktop, stacks on mobile
   - Footer links scroll to correct sections
   - Email capture section is visible and functional (shows success on submit)
   - Social icons render correctly
4. Check `robots.txt` and `sitemap.xml` are served at `/robots.txt` and `/sitemap.xml`
5. Inspect `<head>` for canonical, Twitter card, and fixed OG image meta tags
