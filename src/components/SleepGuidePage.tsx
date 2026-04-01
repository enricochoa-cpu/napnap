// src/components/SleepGuidePage.tsx
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getSleepGuideConfigsForCurrentLanguage } from '../data/sleepGuideContentByLanguage';
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
  const { t } = useTranslation();

  const sleepGuides = getSleepGuideConfigsForCurrentLanguage();
  const guide = sleepGuides.find((g) => g.slug === slug);

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
      url: `https://napnap.app/sleep-guides/${guide.slug}`,
      datePublished: '2026-03-14',
      dateModified: '2026-03-31',
      author: { '@type': 'Organization', name: 'NapNap' },
      publisher: { '@type': 'Organization', name: 'NapNap' },
    }, 'sleep-guide');

    const breadcrumbScript = setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: t('sleepGuides.page.breadcrumbLink'), item: 'https://napnap.app/sleep-guides' },
        { '@type': 'ListItem', position: 2, name: guide.title, item: `https://napnap.app/sleep-guides/${guide.slug}` },
      ],
    }, 'breadcrumb');

    return () => {
      document.title = 'NapNap — Baby Sleep Tracker';
      script.remove();
      breadcrumbScript.remove();
    };
  }, [guide, t]);

  if (!guide) return null;

  // Prev/next navigation
  const currentIndex = sleepGuides.findIndex((g) => g.slug === guide.slug);
  const prevGuide = currentIndex > 0 ? sleepGuides[currentIndex - 1] : null;
  const nextGuide =
    currentIndex >= 0 && currentIndex < sleepGuides.length - 1 ? sleepGuides[currentIndex + 1] : null;

  // Spec ordering: sections[0] (What to expect), then schedule, then sections[1+] (wake windows), then tips
  const firstSection = guide.sections[0];
  const remainingSections = guide.sections.slice(1);

  return (
    <div className="theme-morning bg-[var(--bg-deep)] overflow-x-hidden overflow-y-auto" style={{ height: '100dvh' }}>
      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav aria-label={t('sleepGuides.page.breadcrumbAriaLabel')} className="mb-8">
          <a href="/sleep-guides" className="inline-flex items-center gap-1 text-sm text-[var(--nap-color)] hover:text-[var(--text-primary)] transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            {t('sleepGuides.page.breadcrumbLink')}
          </a>
        </nav>

        <article>
          <h1 className="text-display-md text-[var(--text-primary)] mb-2">{guide.title}</h1>
          <p className="text-sm text-[var(--text-muted)] mb-8">{guide.subtitle}</p>

          {/* At a glance */}
          <div className="card p-5 mb-8">
            <h2 className="text-sm font-display font-semibold text-[var(--text-primary)] mb-4">
              {t('sleepGuides.page.atAGlance.title')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="font-semibold text-[var(--nap-color)]">{t('sleepGuides.page.atAGlance.naps')}:</span>{' '}
                {guide.stats.napsPerDay}/day
              </div>
              <div>
                <span className="font-semibold text-[var(--nap-color)]">{t('sleepGuides.page.atAGlance.wakeWindow')}:</span>{' '}
                {guide.stats.wakeWindow}
              </div>
              <div>
                <span className="font-semibold" style={{ color: 'var(--night-color)' }}>{t('sleepGuides.page.atAGlance.bedtime')}:</span>{' '}
                {guide.stats.bedtime}
              </div>
              <div>
                <span className="font-semibold" style={{ color: 'var(--wake-color)' }}>{t('sleepGuides.page.atAGlance.nightSleep')}:</span>{' '}
                {guide.stats.nightSleep}
              </div>
              <div>
                <span className="font-semibold text-[var(--nap-color)]">{t('sleepGuides.page.atAGlance.daySleep')}:</span>{' '}
                {guide.stats.totalDaySleep}
              </div>
              <div>
                <span className="font-semibold text-[var(--nap-color)]">{t('sleepGuides.page.atAGlance.totalSleep')}:</span>{' '}
                {guide.stats.totalSleep}
              </div>
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
            <h2 className="text-sm font-display font-semibold text-[var(--text-primary)] mb-4">
              {t('sleepGuides.page.sampleSchedule')}
            </h2>
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
            <h2 className="text-lg font-display font-bold text-[var(--text-primary)] mb-3">
              {t('sleepGuides.page.tipsTitle')}
            </h2>
            <ul className="space-y-3">
              {guide.tips.map((tip, i) => (
                <li key={i} className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  <strong className="text-[var(--text-primary)]">{tip.title}</strong> — {tip.description}
                </li>
              ))}
            </ul>
          </section>

          {/* Prev/Next navigation */}
        <nav aria-label={t('sleepGuides.page.ageNavigationAriaLabel')} className="flex justify-between items-center py-4 border-t border-[var(--glass-border)] mb-8">
            {prevGuide ? (
              <a href={`/sleep-guides/${prevGuide.slug}`} className="text-sm text-[var(--nap-color)] hover:text-[var(--text-primary)] transition-colors">
                ← {prevGuide.title}
              </a>
            ) : <span />}
            {nextGuide ? (
              <a href={`/sleep-guides/${nextGuide.slug}`} className="text-sm text-[var(--nap-color)] hover:text-[var(--text-primary)] transition-colors">
                {nextGuide.title} →
              </a>
            ) : <span />}
          </nav>

          {/* CTA */}
          <div className="text-center mb-8">
            <a
              href="/app"
              className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-[var(--nap-color)] text-[var(--bg-deep)] font-display font-semibold transition-transform active:scale-[0.98]"
            >
              {t('sleepGuides.page.cta', { ageLabel: guide.ageLabel ?? `${guide.ageMonths}-month-old` })}
            </a>
            <p className="text-xs text-[var(--text-muted)] mt-2">{t('sleepGuides.page.ctaSubtitle')}</p>
          </div>
        </article>
      </main>

      <LandingFooter />
    </div>
  );
}
