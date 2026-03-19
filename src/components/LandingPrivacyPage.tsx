import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PRIVACY_POLICY_SECTIONS, PRIVACY_POLICY_SUPPORT_EMAIL } from '../constants/privacyPolicy';
import { PRIVACY_POLICY_LAST_UPDATED } from '../constants/legal';
import { setMeta, setCanonical } from '../utils/seo';
import { LandingFooter } from './LandingFooter';

export function LandingPrivacyPage() {
  const { t } = useTranslation();

  useEffect(() => {
    const root = document.documentElement;
    const prev = Array.from(root.classList);
    if (!root.classList.contains('theme-morning')) root.classList.add('theme-morning');
    return () => { root.className = prev.join(' '); };
  }, []);

  useEffect(() => {
    document.title = `${t('privacy.viewTitle')} — NapNap`;
    setMeta('description', t('privacy.metaDescription'));
    setMeta('og:title', `${t('privacy.viewTitle')} — NapNap`, true);
    setMeta('og:description', t('privacy.ogDescription'), true);
    setMeta('og:type', 'website', true);
    setMeta('og:url', 'https://napnap.app/privacy', true);
    setCanonical('https://napnap.app/privacy');
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

        <h1 className="text-display-md text-[var(--text-primary)] mb-2">{t('privacy.viewTitle')}</h1>
        <p className="text-sm text-[var(--text-muted)] mb-8">{t('privacy.viewSubtitle')}</p>

        <div className="space-y-6">
          {PRIVACY_POLICY_SECTIONS.map((section) => (
            <div key={section.titleKey} className="card p-5">
              <h2 className="text-sm font-display font-semibold text-[var(--text-primary)] mb-2">
                {t(section.titleKey)}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {t(section.bodyKey, { email: PRIVACY_POLICY_SUPPORT_EMAIL })}
              </p>
            </div>
          ))}
        </div>

        <p className="text-xs text-[var(--text-muted)] text-center mt-8">
          {t('privacy.lastUpdated')}: {PRIVACY_POLICY_LAST_UPDATED}
        </p>
      </div>
      <LandingFooter />
    </div>
  );
}
