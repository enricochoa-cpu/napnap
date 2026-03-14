// src/components/SleepGuideHub.tsx
import { useEffect } from 'react';
import { SLEEP_GUIDE_CONFIGS } from '../data/sleepGuideContent';
import type { SleepGuideConfig } from '../data/sleepGuideContent';
import { setMeta, setCanonical } from '../utils/seo';
import { LandingFooter } from './LandingFooter';

const NEWBORN_GUIDES = SLEEP_GUIDE_CONFIGS.filter(c => c.ageMonths < 3);
const INFANT_GUIDES = SLEEP_GUIDE_CONFIGS.filter(c => c.ageMonths >= 3 && c.ageMonths <= 12);
const TODDLER_GUIDES = SLEEP_GUIDE_CONFIGS.filter(c => c.ageMonths > 12);

function AgeCard({ config }: { config: SleepGuideConfig }) {
  return (
    <a
      href={`/sleep-guides/${config.slug}`}
      className="card p-4 text-center hover:scale-[1.02] transition-transform block"
    >
      <div className="text-lg font-display font-bold text-[var(--nap-color)]">
        {config.displayLabel ?? `${config.ageMonths} mo`}
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

export function SleepGuideHub() {
  useEffect(() => {
    const root = document.documentElement;
    const prev = Array.from(root.classList);
    if (!root.classList.contains('theme-morning')) root.classList.add('theme-morning');
    return () => { root.className = prev.join(' '); };
  }, []);

  useEffect(() => {
    document.title = 'Baby Sleep Schedules by Age — NapNap';
    setMeta('description', 'Age-specific sleep schedules from newborn to 2 years. Wake windows, nap times, bedtime, and tips for every stage.');
    setMeta('og:title', 'Baby Sleep Schedules by Age — NapNap', true);
    setMeta('og:description', 'Age-specific sleep schedules from newborn to 2 years.', true);
    setMeta('og:type', 'website', true);
    setMeta('og:url', 'https://napnap.app/sleep-guides', true);
    setMeta('twitter:card', 'summary');
    setMeta('twitter:title', 'Baby Sleep Schedules by Age — NapNap');
    setMeta('twitter:description', 'Age-specific sleep schedules from newborn to 2 years. Wake windows, nap times, bedtime, and tips for every stage.');
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

        <section className="mb-10">
          <h2 className="text-sm font-display font-bold mb-4" style={{ color: 'var(--night-color)' }}>Newborn (0–3 months)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {NEWBORN_GUIDES.map((config) => (<AgeCard key={config.slug} config={config} />))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-display font-bold mb-4 text-[var(--nap-color)]">Infant (3–12 months)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {INFANT_GUIDES.map((config) => (<AgeCard key={config.slug} config={config} />))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-display font-bold mb-4" style={{ color: 'var(--wake-color)' }}>Toddler (13–24 months)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {TODDLER_GUIDES.map((config) => (<AgeCard key={config.slug} config={config} />))}
          </div>
        </section>

        <div className="text-center mb-8">
          <a href="/app" className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-[var(--nap-color)] text-[var(--bg-deep)] font-display font-semibold transition-transform active:scale-[0.98]">
            Track your baby's sleep with NapNap — Start free
          </a>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
