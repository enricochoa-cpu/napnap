import { SUPPORT_EMAIL } from './legal';

/**
 * Single source of truth for NapNap privacy policy content.
 * Used in PrivacyPolicyView (Support) and in LandingPrivacyPage.
 */
export type PrivacyPolicySection = {
  titleKey: string;
  bodyKey: string;
};

/**
 * Keys map to `privacy.*` namespaces inside `src/locales/{en,es,ca}.json`.
 * The bodies use interpolation `{{email}}` for the support email.
 */
export const PRIVACY_POLICY_SECTIONS: PrivacyPolicySection[] = [
  { titleKey: 'privacy.dataController', bodyKey: 'privacy.dataControllerBody' },
  { titleKey: 'privacy.whatWeCollect', bodyKey: 'privacy.whatWeCollectBody' },
  { titleKey: 'privacy.howWeUse', bodyKey: 'privacy.howWeUseBody' },
  { titleKey: 'privacy.cookiesAndSimilarTechnologies', bodyKey: 'privacy.cookiesAndSimilarTechnologiesBody' },
  { titleKey: 'privacy.retention', bodyKey: 'privacy.retentionBody' },
  { titleKey: 'privacy.accountDeletion', bodyKey: 'privacy.accountDeletionBody' },
  { titleKey: 'privacy.dataAboutMinors', bodyKey: 'privacy.dataAboutMinorsBody' },
  { titleKey: 'privacy.contact', bodyKey: 'privacy.contactBody' },
];

// Kept for backwards compatibility with any external references.
export const PRIVACY_POLICY_SUPPORT_EMAIL = SUPPORT_EMAIL;
