import { useTranslation } from 'react-i18next';
import { TERMS_SECTION_KEYS } from '../../constants/termsOfService';
import { SubViewHeader } from './SubViewHeader';

interface TermsOfServiceViewProps {
  onBack: () => void;
}

export function TermsOfServiceView({ onBack }: TermsOfServiceViewProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 pb-12">
      <SubViewHeader
        title={t('terms.viewTitle')}
        subtitle={t('terms.viewSubtitle')}
        onBack={onBack}
      />

      <div className="space-y-6">
        {TERMS_SECTION_KEYS.map((key) => (
          <div key={key} className="card p-5">
            <h3 className="text-sm font-display font-semibold text-[var(--text-primary)] mb-2">
              {t(`terms.${key}`)}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {t(`terms.${key}Body`)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
