/**
 * Single source of truth for NapNap privacy policy content.
 * Used in PrivacyPolicyView (Support) and in sign-up consent modal.
 */
export const PRIVACY_POLICY_SECTIONS = [
  {
    title: 'What we collect',
    body: "We collect the information you give us when you use NapNap: your email and account details, your baby's profile (name, date of birth, optional weight and height), and the sleep data you log (nap and night sleep times).",
  },
  {
    title: 'How we use it',
    body: 'We use this data to run the app, show you sleep predictions and history, and improve our product. We do not sell your data.',
  },
  {
    title: 'Account deletion',
    body: 'When you delete your account we remove your email, name(s), photos, and all data linked to your account. We may keep anonymized sleep and growth data (no names or identifiers) for product improvement and research; this data cannot be linked back to you.',
  },
  {
    title: 'Contact',
    body: 'For questions about your data or this policy, use the Contact option in Support.',
  },
];
