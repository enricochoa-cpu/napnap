const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

interface SubViewHeaderProps {
  title: string;
  subtitle: string;
  onBack: () => void;
}

export function SubViewHeader({ title, subtitle, onBack }: SubViewHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={onBack}
        className="w-11 h-11 -ml-1 rounded-2xl flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        aria-label="Go back"
      >
        <BackIcon />
      </button>
      <div>
        <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">
          {title}
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
