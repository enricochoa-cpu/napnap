import { useTranslation } from 'react-i18next';
import { SubViewHeader } from './SubViewHeader';
import type { ProfileView } from './ProfileMenu';

interface AboutViewProps {
  onBack: () => void;
  onNavigate: (view: ProfileView) => void;
}

const InfoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

export function AboutView({ onBack, onNavigate }: AboutViewProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <SubViewHeader title={t('about.title')} subtitle={t('about.subtitle')} onBack={onBack} />

      {/* App info card: name + version */}
      <div
        className="rounded-3xl backdrop-blur-xl p-6 flex items-center gap-4"
        style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}
      >
        <div className="w-12 h-12 rounded-2xl bg-[var(--nap-color)]/20 flex items-center justify-center flex-shrink-0 text-[var(--nap-color)]">
          <InfoIcon />
        </div>
        <div className="min-w-0">
          <p className="font-display font-semibold text-[var(--text-primary)] text-lg">
            {t('about.appName')}
          </p>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {t('about.version')} {__APP_VERSION__}
          </p>
        </div>
      </div>

      {/* Legal links */}
      <div className="space-y-2">
        <p className="text-xs font-display font-semibold text-[var(--text-muted)] uppercase tracking-wider px-1">
          {t('about.legal')}
        </p>
        <button
          type="button"
          onClick={() => onNavigate('terms')}
          className="w-full text-left rounded-2xl p-4 flex items-center justify-between gap-3 transition-colors bg-[var(--bg-card)] border border-[var(--glass-border)] hover:bg-[var(--bg-soft)] text-[var(--text-primary)]"
        >
          <span className="font-display font-medium">{t('about.termsOfService')}</span>
          <span className="text-[var(--text-muted)]">›</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigate('privacy')}
          className="w-full text-left rounded-2xl p-4 flex items-center justify-between gap-3 transition-colors bg-[var(--bg-card)] border border-[var(--glass-border)] hover:bg-[var(--bg-soft)] text-[var(--text-primary)]"
        >
          <span className="font-display font-medium">{t('about.privacyPolicy')}</span>
          <span className="text-[var(--text-muted)]">›</span>
        </button>
      </div>
    </div>
  );
}
