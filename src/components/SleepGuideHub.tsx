// src/components/SleepGuideHub.tsx
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getSleepGuideConfigsForCurrentLanguage } from '../data/sleepGuideContentByLanguage';
import type { SleepGuideConfig } from '../data/sleepGuideContent';
import { setMeta, setCanonical } from '../utils/seo';
import { LandingFooter } from './LandingFooter';

function AgeCard({
  config,
  napSingular,
  napPlural,
  regressionLabel,
}: {
  config: SleepGuideConfig;
  napSingular: string;
  napPlural: string;
  regressionLabel: string;
}) {
  return (
    <a
      href={`/sleep-guides/${config.slug}`}
      className="card p-4 text-center hover:scale-[1.02] transition-transform block"
    >
      <div className="text-lg font-display font-bold text-[var(--nap-color)]">
        {config.displayLabel ?? `${config.ageMonths} mo`}
      </div>
      <div className="text-[10px] text-[var(--text-muted)] mt-1">
        {/^\d+$/.test(config.stats.napsPerDay)
          ? `${config.stats.napsPerDay} ${config.stats.napsPerDay === '1' ? napSingular : napPlural}`
          : `${config.stats.napsPerDay} ${napPlural}`} · {config.stats.wakeWindow}
      </div>
      {config.regression && (
        <div className="text-[9px] font-semibold mt-1" style={{ color: 'var(--wake-color)' }}>
          ⚡ {regressionLabel}
        </div>
      )}
    </a>
  );
}

export function SleepGuideHub() {
  const { t } = useTranslation();

  const sleepGuides = getSleepGuideConfigsForCurrentLanguage();
  const newbornGuides = sleepGuides.filter((c) => c.ageMonths < 3);
  const infantGuides = sleepGuides.filter((c) => c.ageMonths >= 3 && c.ageMonths <= 12);
  const toddlerGuides = sleepGuides.filter((c) => c.ageMonths > 12);

  useEffect(() => {
    const root = document.documentElement;
    const prev = Array.from(root.classList);
    if (!root.classList.contains('theme-morning')) root.classList.add('theme-morning');
    return () => { root.className = prev.join(' '); };
  }, []);

  useEffect(() => {
    document.title = t('sleepGuides.hub.pageTitle');
    setMeta('description', t('sleepGuides.hub.metaDescription'));
    setMeta('og:title', t('sleepGuides.hub.pageTitle'), true);
    setMeta('og:description', t('sleepGuides.hub.ogDescription'), true);
    setMeta('og:type', 'website', true);
    setMeta('og:url', 'https://napnap.app/sleep-guides', true);
    setMeta('twitter:card', 'summary');
    setMeta('twitter:title', t('sleepGuides.hub.pageTitle'));
    setMeta('twitter:description', t('sleepGuides.hub.metaDescription'));
    setCanonical('https://napnap.app/sleep-guides');
    return () => { document.title = 'NapNap — Baby Sleep Tracker'; };
  }, [t]);

  return (
    <div className="theme-morning bg-[var(--bg-deep)] overflow-x-hidden overflow-y-auto" style={{ height: '100dvh' }}>
      <main className="max-w-2xl mx-auto px-6 py-12">
        <a
          href="/"
          className="inline-flex items-center gap-1 text-sm text-[var(--nap-color)] hover:text-[var(--text-primary)] transition-colors mb-8"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          {t('landing.backToNapNap')}
        </a>

        <h1 className="text-display-md text-[var(--text-primary)] mb-2">{t('sleepGuides.hub.title')}</h1>
        <p className="text-sm text-[var(--text-muted)] mb-10">{t('sleepGuides.hub.subtitle')}</p>

        <section className="mb-10">
          <h2 className="text-sm font-display font-bold mb-4" style={{ color: 'var(--night-color)' }}>{t('sleepGuides.hub.newbornHeading')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {newbornGuides.map((config) => (
              <AgeCard
                key={config.slug}
                config={config}
                napSingular={t('sleepGuides.hub.napSingular')}
                napPlural={t('sleepGuides.hub.napPlural')}
                regressionLabel={t('sleepGuides.hub.regression')}
              />
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-display font-bold mb-4 text-[var(--nap-color)]">{t('sleepGuides.hub.infantHeading')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {infantGuides.map((config) => (
              <AgeCard
                key={config.slug}
                config={config}
                napSingular={t('sleepGuides.hub.napSingular')}
                napPlural={t('sleepGuides.hub.napPlural')}
                regressionLabel={t('sleepGuides.hub.regression')}
              />
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-display font-bold mb-4" style={{ color: 'var(--wake-color)' }}>{t('sleepGuides.hub.toddlerHeading')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {toddlerGuides.map((config) => (
              <AgeCard
                key={config.slug}
                config={config}
                napSingular={t('sleepGuides.hub.napSingular')}
                napPlural={t('sleepGuides.hub.napPlural')}
                regressionLabel={t('sleepGuides.hub.regression')}
              />
            ))}
          </div>
        </section>

        <div className="text-center mb-8">
          <a href="/app" className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-[var(--nap-color)] text-[var(--bg-deep)] font-display font-semibold transition-transform active:scale-[0.98]">
            {t('sleepGuides.hub.cta')}
          </a>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
