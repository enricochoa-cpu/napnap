import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { STORAGE_KEYS, setToStorage } from '../utils/storage';

type LandingLocale = 'en' | 'es' | 'ca';

const LOCALES: Array<{ value: LandingLocale; labelKey: string }> = [
  { value: 'en', labelKey: 'profile.english' },
  { value: 'es', labelKey: 'profile.spanish' },
  { value: 'ca', labelKey: 'profile.catalan' },
];

export function LandingLanguagePicker({ variant }: { variant?: 'pill' | 'stack' }) {
  const { t } = useTranslation();

  const activeLocale: LandingLocale = (() => {
    const lang = i18n.language?.split('-')[0];
    if (lang === 'es' || lang === 'ca' || lang === 'en') return lang;
    return 'en';
  })();

  const isStack = variant === 'stack';
  const containerClass = isStack ? 'flex flex-col gap-3 w-full' : 'flex flex-wrap gap-2';

  return (
    <div className={containerClass} role="group" aria-label={t('landing.languagePicker.ariaLabel')}>
      {LOCALES.map(({ value, labelKey }) => {
        const isActive = value === activeLocale;
        const buttonBase = isStack
          ? 'flex-1 min-w-0 py-3 min-h-[48px]'
          : 'px-3 py-2 min-h-[40px] text-sm';
        return (
          <button
            key={value}
            type="button"
            onClick={() => {
              i18n.changeLanguage(value);
              setToStorage(STORAGE_KEYS.LOCALE, value);
            }}
            aria-pressed={isActive}
            className={`${buttonBase} flex items-center justify-center rounded-xl font-display font-medium transition-all ${
              isActive
                ? 'bg-[var(--night-color)] text-white'
                : 'bg-[var(--bg-soft)] text-[var(--text-secondary)]'
            }`}
          >
            {t(labelKey)}
          </button>
        );
      })}
    </div>
  );
}

