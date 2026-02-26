/**
 * Terms of Service — section keys for in-app ToS view.
 * Content is in locales (en.json / es.json) under terms.* for i18n.
 */
export const TERMS_SECTION_KEYS = [
  'intro',
  'operator',
  'notMedicalAdvice',
  'acceptableUse',
  'accountAndTermination',
  'limitationOfLiability',
  'changesToTerms',
  'contact',
  'governingLaw',
] as const;

export type TermsSectionKey = (typeof TERMS_SECTION_KEYS)[number];
