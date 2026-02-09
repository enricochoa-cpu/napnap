import { SubViewHeader } from './SubViewHeader';

interface ContactViewProps {
  onBack: () => void;
}

const EmailIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

export function ContactView({ onBack }: ContactViewProps) {
  return (
    <div className="space-y-6">
      <SubViewHeader title="Contact us" subtitle="Any questions? We're here to help" onBack={onBack} />

      {/* Contact Content - Placeholder */}
      <div className="card p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--wake-color)]/20 flex items-center justify-center text-[var(--wake-color)]">
          <EmailIcon />
        </div>
        <h3 className="text-lg font-display font-semibold text-[var(--text-primary)] mb-2">
          Get in touch
        </h3>
        <p className="text-[var(--text-muted)] text-sm mb-6">
          We'd love to hear from you! Whether you have a question, feedback, or just want to say hi.
        </p>
        <a
          href="mailto:support@babysleeptracker.app"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--wake-color)] text-[var(--bg-deep)] font-display font-semibold transition-transform active:scale-[0.98]"
        >
          <EmailIcon />
          <span>Send us an email</span>
        </a>
      </div>
    </div>
  );
}
