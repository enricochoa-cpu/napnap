interface LandingFooterProps {
  onScrollToSection?: (id: string) => void;
}

export function LandingFooter({ onScrollToSection }: LandingFooterProps) {
  const productLinks = [
    { id: 'how-it-works', label: 'How it works' },
    { id: 'product-showcase', label: 'The app' },
    { id: 'faq', label: 'FAQ' },
  ];

  return (
    <footer className="border-t border-[var(--glass-border)] py-10 mt-8">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr_0.8fr] gap-8">
          {/* Brand column */}
          <div className="space-y-3">
            <p className="text-display-sm text-[var(--text-primary)]">NapNap</p>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              The quiet voice at 3am that tells you what comes next.
            </p>
          </div>

          {/* Product + Legal columns */}
          <div className="grid grid-cols-2 md:contents gap-8">
            <div className="space-y-3">
              <p className="text-[10px] tracking-[0.15em] uppercase text-[var(--nap-color)] font-display">Product</p>
              <nav className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                {productLinks.map(({ id, label }) =>
                  onScrollToSection ? (
                    <button key={id} type="button" className="text-left hover:text-[var(--text-secondary)] transition-colors" onClick={() => onScrollToSection(id)}>{label}</button>
                  ) : (
                    <a key={id} href={`/#${id}`} className="hover:text-[var(--text-secondary)] transition-colors">{label}</a>
                  )
                )}
              </nav>
            </div>
            <div className="space-y-3">
              <p className="text-[10px] tracking-[0.15em] uppercase text-[var(--nap-color)] font-display">Legal</p>
              <nav className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                <a href="/sleep-guides" className="hover:text-[var(--text-secondary)] transition-colors">Sleep Guides</a>
                <a href="/privacy" className="hover:text-[var(--text-secondary)] transition-colors">Privacy</a>
                <a href="/terms" className="hover:text-[var(--text-secondary)] transition-colors">Terms</a>
                <a href="/contact" className="hover:text-[var(--text-secondary)] transition-colors">Contact</a>
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-4 border-t border-[var(--glass-border)] text-center text-xs text-[var(--text-muted)]">
          &copy; 2026 NapNap. Made with care in Barcelona.
        </div>
      </div>
    </footer>
  );
}
