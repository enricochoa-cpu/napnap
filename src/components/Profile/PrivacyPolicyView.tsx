import { SubViewHeader } from './SubViewHeader';

interface PrivacyPolicyViewProps {
  onBack: () => void;
}

const POLICY_SECTIONS = [
  {
    title: 'What we collect',
    body: 'We collect the information you give us when you use NapNap: your email and account details, your baby’s profile (name, date of birth, optional weight and height), and the sleep data you log (nap and night sleep times).',
  },
  {
    title: 'How we use it',
    body: 'We use this data to run the app, show you sleep predictions and history, and improve our product. We do not sell your data.',
  },
  {
    title: 'Account deletion',
    body: 'When you delete your account we remove your email, name(s), photos, and all data linked to your account. We may keep anonymized sleep and growth data (no names or identifiers) for product improvement and research; this data cannot be linked back to you.',
  },
  {
    title: 'Contact',
    body: 'For questions about your data or this policy, use the Contact option in Support.',
  },
];

export function PrivacyPolicyView({ onBack }: PrivacyPolicyViewProps) {
  return (
    <div className="space-y-6 pb-12">
      <SubViewHeader
        title="Privacy policy"
        subtitle="How we use and protect your data"
        onBack={onBack}
      />

      <div className="space-y-6">
        {POLICY_SECTIONS.map((section) => (
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
