/**
 * Returns the date-fns locale for the current i18n language so that
 * format(date, pattern, { locale }) localizes month/day names (e.g. "February" → "Febrero").
 */
import type { Locale } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { es } from 'date-fns/locale/es';
import { ca } from 'date-fns/locale/ca';
import i18n from '../i18n';

export function getDateFnsLocale(): Locale {
  const lang = i18n.language?.split('-')[0];
  if (lang === 'es') return es;
  if (lang === 'ca') return ca;
  return enUS;
}
