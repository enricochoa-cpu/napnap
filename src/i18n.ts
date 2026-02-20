/**
 * i18n bootstrap: initializes i18next with en/es, reads initial language from
 * localStorage so preference persists; useBabyProfile will override with
 * profile.locale when the user is logged in.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { STORAGE_KEYS } from './utils/storage';
import en from './locales/en.json';
import es from './locales/es.json';

const savedLocale = typeof window !== 'undefined'
  ? (localStorage.getItem(STORAGE_KEYS.LOCALE) as 'en' | 'es' | null) || 'en'
  : 'en';

// Only allow supported locales
const initialLanguage = savedLocale === 'es' ? 'es' : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, es: { translation: es } },
    lng: initialLanguage,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;
