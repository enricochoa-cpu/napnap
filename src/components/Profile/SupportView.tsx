import type { ProfileView } from './ProfileMenu';

interface SupportViewProps {
  onBack: () => void;
  onNavigate: (view: ProfileView) => void;
}

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const HelpIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const MessageIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const HeartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

interface ListRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onClick: () => void;
  iconColorClass: string;
}

function ListRow({ icon, title, subtitle, onClick, iconColorClass }: ListRowProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 px-5 py-4 rounded-3xl bg-white/[0.08] backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:bg-white/[0.12] active:scale-[0.98] transition-all"
    >
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${iconColorClass}`}>
        {icon}
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="font-display font-medium text-[var(--text-primary)] text-[15px]">{title}</p>
        {subtitle && <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex-shrink-0 text-[var(--text-muted)]/50">
        <ChevronRightIcon />
      </div>
    </button>
  );
}

export function SupportView({ onBack, onNavigate }: SupportViewProps) {
  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="w-10 h-10 -ml-1 rounded-2xl flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/10 transition-all"
          aria-label="Go back"
        >
          <BackIcon />
        </button>
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">
            Support
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            We're here to help
          </p>
        </div>
      </div>

      {/* Support Options */}
      <div className="space-y-4">
        <ListRow
          icon={<HelpIcon />}
          title="FAQs"
          subtitle="Common questions answered"
          onClick={() => onNavigate('faqs')}
          iconColorClass="bg-[var(--night-color)]/20 text-[var(--night-color)]"
        />
        <ListRow
          icon={<MessageIcon />}
          title="Contact Us"
          subtitle="Get in touch with our team"
          onClick={() => onNavigate('contact')}
          iconColorClass="bg-[var(--wake-color)]/20 text-[var(--wake-color)]"
        />
      </div>

      {/* Helpful tip card */}
      <div className="rounded-3xl bg-white/[0.06] backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-[var(--nap-color)]/20 flex items-center justify-center flex-shrink-0 text-[var(--nap-color)]">
            <HeartIcon />
          </div>
          <div>
            <p className="font-display font-semibold text-[var(--text-primary)] text-sm mb-1">
              Quick tip
            </p>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Check our FAQs first—most questions are answered there. If you can't find what you're looking for, we're just a message away.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
