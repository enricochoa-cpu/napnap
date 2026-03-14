import { useEffect } from 'react';
import { SUPPORT_EMAIL } from '../constants/legal';
import { setMeta, setCanonical } from '../utils/seo';
import { LandingFooter } from './LandingFooter';

const TERMS_SECTIONS = [
  {
    title: 'Introduction',
    body: 'These Terms of Service ("Terms") govern your use of the NapNap baby sleep tracker app ("the App"). By creating an account or using the App, you agree to these Terms. If you do not agree, do not use the App.',
  },
  {
    title: 'Operator',
    body: 'NapNap is operated by an individual (the "operator"). The App is provided free of charge and is not run by a company. For legal and support contact, see the Contact section below.',
  },
  {
    title: 'Not medical or professional advice',
    body: "The App and all content in it (including sleep suggestions, predictions, and any information about infant sleep) are for general information only. They do not constitute medical, health, or professional advice. Always consult a qualified healthcare provider (e.g. your paediatrician) about your baby's sleep or health. Do not delay seeking professional advice or disregard it because of anything in the App.",
  },
  {
    title: 'Acceptable use',
    body: "You agree to use the App only for lawful purposes. You must not use it to harm others, breach any law, infringe rights, distribute malware, or scrape or misuse data. You may not reverse-engineer or attempt to extract the App's source code except where permitted by mandatory law.",
  },
  {
    title: 'Account and termination',
    body: 'You are responsible for keeping your account credentials secure. We may suspend or terminate your access if you breach these Terms. You may delete your account at any time from Account settings. On termination, your right to use the App ends immediately.',
  },
  {
    title: 'Limitation of liability',
    body: 'The App is provided "as is". To the fullest extent permitted by applicable law, the operator is not liable for any indirect, incidental, or consequential damages arising from your use of the App. Liability is limited to the maximum extent permitted in your jurisdiction.',
  },
  {
    title: 'Changes to these Terms',
    body: 'We may update these Terms from time to time. We will post the updated Terms in the App. Your continued use of the App after changes constitutes acceptance of the new Terms. If you do not agree, you must stop using the App.',
  },
  {
    title: 'Contact',
    body: `For questions about these Terms, the App, or data protection, contact us at ${SUPPORT_EMAIL}. We will use this address for support and for data subject requests (e.g. access, deletion) under the GDPR.`,
  },
  {
    title: 'Governing law',
    body: 'These Terms are governed by the laws of the European Union and the laws of the country from which the App is operated, to the extent applicable. If you are in the EEA, your statutory rights under EU/EEA law remain unaffected.',
  },
];

export function LandingTermsPage() {
  useEffect(() => {
    const root = document.documentElement;
    const prev = Array.from(root.classList);
    if (!root.classList.contains('theme-morning')) root.classList.add('theme-morning');
    return () => { root.className = prev.join(' '); };
  }, []);

  useEffect(() => {
    document.title = 'Terms of Service — NapNap';
    setMeta('description', 'Terms of Service for NapNap baby sleep tracker. Rules for using the app, liability, and governing law.');
    setMeta('og:title', 'Terms of Service — NapNap', true);
    setMeta('og:description', 'Terms of Service for NapNap baby sleep tracker.', true);
    setMeta('og:type', 'website', true);
    setMeta('og:url', 'https://napnap.app/terms', true);
    setCanonical('https://napnap.app/terms');
    return () => { document.title = 'NapNap — Baby Sleep Tracker'; };
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-deep)]">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <a
          href="/"
          className="inline-flex items-center gap-1 text-sm text-[var(--nap-color)] hover:text-[var(--text-primary)] transition-colors mb-8"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to NapNap
        </a>

        <h1 className="text-display-md text-[var(--text-primary)] mb-2">Terms of Service</h1>
        <p className="text-sm text-[var(--text-muted)] mb-8">Rules for using NapNap</p>

        <div className="space-y-6">
          {TERMS_SECTIONS.map((section) => (
            <div key={section.title} className="card p-5">
              <h2 className="text-sm font-display font-semibold text-[var(--text-primary)] mb-2">
                {section.title}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </div>
      <LandingFooter />
    </div>
  );
}
