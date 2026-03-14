import { useEffect } from 'react';
import { PRIVACY_POLICY_SECTIONS } from '../constants/privacyPolicy';
import { PRIVACY_POLICY_LAST_UPDATED } from '../constants/legal';

export function LandingPrivacyPage() {
  useEffect(() => {
    const root = document.documentElement;
    const prev = Array.from(root.classList);
    if (!root.classList.contains('theme-morning')) root.classList.add('theme-morning');
    return () => { root.className = prev.join(' '); };
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

        <h1 className="text-display-md text-[var(--text-primary)] mb-2">Privacy Policy</h1>
        <p className="text-sm text-[var(--text-muted)] mb-8">How we handle your data</p>

        <div className="space-y-6">
          {PRIVACY_POLICY_SECTIONS.map((section) => (
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

        <p className="text-xs text-[var(--text-muted)] text-center mt-8">
          Last updated: {PRIVACY_POLICY_LAST_UPDATED}
        </p>
      </div>
    </div>
  );
}
