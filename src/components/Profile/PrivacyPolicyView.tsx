import { useTranslation } from 'react-i18next';
import { PRIVACY_POLICY_SECTIONS } from '../../constants/privacyPolicy';
import { PRIVACY_POLICY_LAST_UPDATED } from '../../constants/legal';
import { SubViewHeader } from './SubViewHeader';

interface PrivacyPolicyViewProps {
  onBack: () => void;
}

export function PrivacyPolicyView({ onBack }: PrivacyPolicyViewProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 pb-12">
      <SubViewHeader
        title={t('privacy.viewTitle')}
        subtitle={t('privacy.viewSubtitle')}
        onBack={onBack}
      />

      <div className="space-y-6">
        {PRIVACY_POLICY_SECTIONS.map((section) => (
          <div key={section.title} className="card p-5">
            <h3 className="text-sm font-display font-semibold text-[var(--text-primary)] mb-2">
              {section.title}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {section.body}
            </p>
          </div>
        ))}
      </div>

      <p className="text-xs text-[var(--text-muted)] text-center">
        {t('privacy.lastUpdated')}: {PRIVACY_POLICY_LAST_UPDATED}
      </p>
    </div>
  );
}
