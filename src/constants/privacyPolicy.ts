import { SUPPORT_EMAIL } from './legal';

/**
 * Single source of truth for NapNap privacy policy content.
 * Used in PrivacyPolicyView (Support) and in sign-up consent modal.
 */
export const PRIVACY_POLICY_SECTIONS = [
  {
    title: 'Data controller',
    body: `The data controller for your personal data is the operator of NapNap (the person responsible for running the app). For data protection requests, privacy questions, or to exercise your GDPR rights (access, rectification, erasure, restriction, portability, objection), contact us at ${SUPPORT_EMAIL}.`,
  },
  {
    title: 'What we collect',
    body: "We collect the information you give us when you use NapNap: your email and account details, your baby's profile (name, date of birth, optional weight and height), and the sleep data you log (nap and night sleep times).",
  },
  {
    title: 'How we use it',
    body: 'We use this data to run the app, show you sleep predictions and history, and improve our product. We do not sell your data.',
  },
  {
    title: 'Cookies and similar technologies',
    body:
      "NapNap uses only the minimum cookies and similar technologies needed to run the app securely. When you sign in, our backend provider Supabase stores authentication information in your browser so you can stay logged in and we can protect your account. If you choose to sign in with Google, Google may use its own cookies to authenticate you, under Google's own privacy policy. We do not use advertising cookies, marketing pixels, or analytics tools that track you across other apps or websites.",
  },
  {
    title: 'Retention',
    body: 'We keep your account and sleep data for as long as your account is active. After you delete your account, we remove all personal data. The only data we may retain is anonymized sleep and growth-related statistics (e.g. sleep durations, age ranges)—no names, no identifiers, no profile pictures or other information that could identify you or your child. We keep this solely to improve NapNap and for research (e.g. understanding sleep patterns); it cannot be linked back to you.',
  },
  {
    title: 'Account deletion',
    body: 'When you delete your account we permanently remove your email, your name(s), profile pictures (photos), and all other data linked to your account. We do not keep anything that identifies you or your baby. The only data we may retain is anonymized sleep and growth data—such as sleep durations and age-based statistics—with no names or identifiers, so we can improve our product and conduct research (e.g. on sleep patterns). We do not keep profile pictures or any other personal or identifiable information after deletion.',
  },
  {
    title: 'Data about minors',
    body:
      "NapNap is designed to be used by adults (parents or legal guardians). By providing your baby's data in the app, you confirm that you are the parent or legal guardian and have authority to provide that data on their behalf, in line with applicable EU data protection laws.",
  },
  {
    title: 'Contact',
    body: `For questions about your data or this policy, use the Contact option in Support or email ${SUPPORT_EMAIL}.`,
  },
];
