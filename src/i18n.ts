/**
 * i18n bootstrap: initializes i18next with en/es/ca, reads initial language from
 * localStorage so preference persists; useBabyProfile will override with
 * profile.locale when the user is logged in.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { STORAGE_KEYS } from './utils/storage';
import en from './locales/en.json';
import es from './locales/es.json';
import ca from './locales/ca.json';

const SUPPORTED_LOCALES = ['en', 'es', 'ca'] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const savedLocale = typeof window !== 'undefined'
  ? (() => {
      const raw = localStorage.getItem(STORAGE_KEYS.LOCALE);
      if (!raw) return null;

      // `setToStorage()` JSON-stringifies values, so stored locale might look like `"es"`.
      // We accept both raw (`es`) and JSON-stringified (`"es"`) formats.
      try {
        const parsed = JSON.parse(raw);
        return typeof parsed === 'string' ? (parsed as SupportedLocale) : null;
      } catch {
        return raw as SupportedLocale;
      }
    })()
  : null;

const initialLanguage: SupportedLocale = savedLocale && SUPPORTED_LOCALES.includes(savedLocale)
  ? savedLocale
  : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, es: { translation: es }, ca: { translation: ca } },
    lng: initialLanguage,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;
