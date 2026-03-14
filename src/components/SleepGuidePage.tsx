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
