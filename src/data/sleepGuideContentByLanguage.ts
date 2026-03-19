import i18n from '../i18n';
import type { SleepGuideConfig } from './sleepGuideContent';
import { SLEEP_GUIDE_CONFIGS as SLEEP_GUIDE_CONFIGS_EN } from './sleepGuideContent';
import { SLEEP_GUIDE_CONFIGS as SLEEP_GUIDE_CONFIGS_ES } from './sleepGuideContent.es';
import { SLEEP_GUIDE_CONFIGS as SLEEP_GUIDE_CONFIGS_CA } from './sleepGuideContent.ca';

export type SleepGuideLocale = 'en' | 'es' | 'ca';

const SUPPORTED_LOCALES: SleepGuideLocale[] = ['en', 'es', 'ca'];

function normalizeLocale(input: unknown): SleepGuideLocale {
  const value = typeof input === 'string' ? input : '';
  const lang = value.split('-')[0];
  if (lang === 'es' || lang === 'ca' || lang === 'en') return lang;
  return 'en';
}

export function getSleepGuideLocaleFromI18n(): SleepGuideLocale {
  return normalizeLocale(i18n.language);
}

export function getSleepGuideConfigsForLocale(locale: SleepGuideLocale): SleepGuideConfig[] {
  switch (locale) {
    case 'es':
      return SLEEP_GUIDE_CONFIGS_ES;
    case 'ca':
      return SLEEP_GUIDE_CONFIGS_CA;
    case 'en':
    default:
      return SLEEP_GUIDE_CONFIGS_EN;
  }
}

export function getSleepGuideConfigsForCurrentLanguage(): SleepGuideConfig[] {
  const locale = getSleepGuideLocaleFromI18n();
  return getSleepGuideConfigsForLocale(locale);
}

export function isSupportedSleepGuideLocale(locale: string): locale is SleepGuideLocale {
  return SUPPORTED_LOCALES.includes(normalizeLocale(locale));
}

