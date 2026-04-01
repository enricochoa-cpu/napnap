import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { STORAGE_KEYS, setToStorage } from '../utils/storage';

type LandingLocale = 'en' | 'es' | 'ca';

const LOCALES: Array<{ value: LandingLocale; label: string }> = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'ca', label: 'Català' },
];

function getActiveLocale(): LandingLocale {
  const lang = i18n.language?.split('-')[0];
  if (lang === 'es' || lang === 'ca' || lang === 'en') return lang;
  return 'en';
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function changeLocale(value: LandingLocale) {
  i18n.changeLanguage(value);
  setToStorage(STORAGE_KEYS.LOCALE, value);
  document.documentElement.lang = value;
}

/**
 * Compact globe dropdown for nav/footer, stacked buttons for mobile menu.
 */
export function LandingLanguagePicker({ variant, dropUp }: { variant?: 'compact' | 'stack'; dropUp?: boolean }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLocale = getActiveLocale();

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  // ── Stacked variant for mobile menu ──
  if (variant === 'stack') {
    return (
      <div className="flex flex-col gap-2 w-full" role="group" aria-label={t('landing.languagePicker.ariaLabel')}>
        {LOCALES.map(({ value, label }) => {
          const isActive = value === activeLocale;
          return (
            <button
              key={value}
              type="button"
              onClick={() => changeLocale(value)}
              aria-pressed={isActive}
              className={`flex-1 min-w-0 py-3 min-h-[48px] flex items-center justify-center rounded-xl font-display font-medium transition-all ${
                isActive
                  ? 'bg-[var(--glass-bg)] text-[var(--text-primary)]'
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    );
  }

  // ── Compact dropdown (default) — nav & footer ──
  const activeLabel = LOCALES.find((l) => l.value === activeLocale)?.label ?? 'EN';

  return (
    <div ref={containerRef} className="relative" aria-label={t('landing.languagePicker.ariaLabel')}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-sm font-display font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nap-color)]"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <GlobeIcon />
        <span className={dropUp ? '' : 'hidden md:inline'}>{activeLabel}</span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t('landing.languagePicker.ariaLabel')}
          className={`absolute min-w-[140px] rounded-xl border border-[var(--glass-border)] bg-[var(--bg-card,#fff)] shadow-lg overflow-hidden z-50 ${
            dropUp ? 'left-0 bottom-full mb-2' : 'right-0 top-full mt-2'
          }`}
          style={{
            background: 'var(--glass-nav-bg, rgba(255,255,255,0.95))',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {LOCALES.map(({ value, label }) => {
            const isActive = value === activeLocale;
            return (
              <button
                key={value}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => {
                  changeLocale(value);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm font-display transition-colors ${
                  isActive
                    ? 'text-[var(--nap-color)] font-semibold bg-[var(--nap-color)]/[0.08]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg,rgba(0,0,0,0.04))]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
