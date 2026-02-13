import { PRIVACY_POLICY_SECTIONS } from '../../constants/privacyPolicy';
import { SubViewHeader } from './SubViewHeader';

interface PrivacyPolicyViewProps {
  onBack: () => void;
}

export function PrivacyPolicyView({ onBack }: PrivacyPolicyViewProps) {
  return (
    <div className="space-y-6 pb-12">
      <SubViewHeader
        title="Privacy policy"
        subtitle="How we use and protect your data"
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
    </div>
  );
}
