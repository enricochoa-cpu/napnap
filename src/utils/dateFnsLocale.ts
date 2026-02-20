/**
 * Returns the date-fns locale for the current i18n language so that
 * format(date, pattern, { locale }) localizes month/day names (e.g. "February" → "Febrero").
 */
import type { Locale } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { es } from 'date-fns/locale/es';
import i18n from '../i18n';

export function getDateFnsLocale(): Locale {
  return i18n.language === 'es' ? es : enUS;
}
