import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { setMeta, setCanonical } from '../utils/seo';
import { TERMS_SECTION_KEYS } from '../constants/termsOfService';
import { LandingFooter } from './LandingFooter';

export function LandingTermsPage() {
  const { t } = useTranslation();
  useEffect(() => {
    const root = document.documentElement;
    const prev = Array.from(root.classList);
    if (!root.classList.contains('theme-morning')) root.classList.add('theme-morning');
    return () => { root.className = prev.join(' '); };
  }, []);

  useEffect(() => {
    document.title = `${t('terms.viewTitle')} — NapNap`;
    setMeta('description', t('terms.metaDescription'));
    setMeta('og:title', `${t('terms.viewTitle')} — NapNap`, true);
    setMeta('og:description', t('terms.ogDescription'), true);
    setMeta('og:type', 'website', true);
    setMeta('og:url', 'https://napnap.app/terms', true);
    setCanonical('https://napnap.app/terms');
    return () => { document.title = 'NapNap — Baby Sleep Tracker'; };
  }, [t]);

  return (
    <div className="min-h-screen bg-[var(--bg-deep)]">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <a
          href="/"
          className="inline-flex items-center gap-1 text-sm text-[var(--nap-color)] hover:text-[var(--text-primary)] transition-colors mb-8"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {t('landing.backToNapNap')}
        </a>

        <h1 className="text-display-md text-[var(--text-primary)] mb-2">{t('terms.viewTitle')}</h1>
        <p className="text-sm text-[var(--text-muted)] mb-8">{t('terms.viewSubtitle')}</p>

        <div className="space-y-6">
          {TERMS_SECTION_KEYS.map((key) => (
            <div key={key} className="card p-5">
              <h2 className="text-sm font-display font-semibold text-[var(--text-primary)] mb-2">
                {t(`terms.${key}`)}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {t(`terms.${key}Body`)}
              </p>
            </div>
          ))}
        </div>
      </div>
      <LandingFooter />
    </div>
  );
}
