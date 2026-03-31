import { LandingLanguagePicker } from './LandingLanguagePicker';
import { useTranslation } from 'react-i18next';

interface LandingFooterProps {
  onScrollToSection?: (id: string) => void;
}

export function LandingFooter({ onScrollToSection }: LandingFooterProps) {
  const { t } = useTranslation();
  const productLinks = [
    { id: 'how-it-works', labelKey: 'landing.footer.product.howItWorks' },
    { id: 'product-showcase', labelKey: 'landing.footer.product.theApp' },
    { id: 'faq', labelKey: 'landing.footer.product.faq' },
    { id: 'sleep-guides', labelKey: 'landing.footer.product.sleepGuides', href: '/sleep-guides' },
  ];

  return (
    <footer className="border-t border-[var(--glass-border)] py-10 mt-8">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr_0.8fr] gap-8">
          {/* Brand column */}
          <div className="space-y-3">
            <p className="text-display-sm text-[var(--text-primary)]">NapNap</p>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              {t('landing.footer.brand.tagline')}
            </p>
            <LandingLanguagePicker />
          </div>

          {/* Product + Legal columns */}
          <div className="grid grid-cols-2 md:contents gap-8">
            <div className="space-y-3">
              <p className="text-[10px] tracking-[0.15em] uppercase text-[var(--nap-color)] font-display">
                {t('landing.footer.product.heading')}
              </p>
              <nav className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                {productLinks.map(({ id, labelKey, href }) =>
                  href ? (
                    <a key={id} href={href} className="hover:text-[var(--text-secondary)] transition-colors">
                      {t(labelKey)}
                    </a>
                  ) : onScrollToSection ? (
                    <button
                      key={id}
                      type="button"
                      className="text-left hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
                      onClick={() => onScrollToSection(id)}
                    >
                      {t(labelKey)}
                    </button>
                  ) : (
                    <a key={id} href={`/#${id}`} className="hover:text-[var(--text-secondary)] transition-colors">
                      {t(labelKey)}
                    </a>
                  )
                )}
              </nav>
            </div>
            <div className="space-y-3">
              <p className="text-[10px] tracking-[0.15em] uppercase text-[var(--nap-color)] font-display">
                {t('landing.footer.legal.heading')}
              </p>
              <nav className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                <a href="/privacy" className="hover:text-[var(--text-secondary)] transition-colors">
                  {t('landing.footer.legal.privacy')}
                </a>
                <a href="/terms" className="hover:text-[var(--text-secondary)] transition-colors">
                  {t('landing.footer.legal.terms')}
                </a>
                <a href="/contact" className="hover:text-[var(--text-secondary)] transition-colors">
                  {t('landing.footer.legal.contact')}
                </a>
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-4 border-t border-[var(--glass-border)] text-center text-xs text-[var(--text-muted)]">
          {t('landing.footer.copyright')}
        </div>
      </div>
    </footer>
  );
}
