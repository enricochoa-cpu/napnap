import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TERMS_SECTION_KEYS } from '../../constants/termsOfService';
import { AuthDivider } from './AuthDivider';
import { GoogleSignInButton } from './GoogleSignInButton';
import { Logo } from '../Logo';

const PRIVACY_SECTION_KEYS = ['whatWeCollect', 'howWeUse', 'accountDeletion', 'contact'] as const;

interface SignUpFormProps {
  onSubmit: (email: string, password: string) => Promise<{ message: string } | null>;
  onGoogleSignIn: () => Promise<{ message: string } | null>;
  onSwitchToLogin: () => void;
}

export function SignUpForm({ onSubmit, onGoogleSignIn, onSwitchToLogin }: SignUpFormProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [agreedToTermsAndPrivacy, setAgreedToTermsAndPrivacy] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t('auth.passwordsNoMatch'));
      return;
    }

    if (password.length < 6) {
      setError(t('auth.passwordMinLength'));
      return;
    }

    if (!agreedToTermsAndPrivacy) {
      setError(t('auth.agreeTermsAndPrivacyRequired'));
      return;
    }

    setLoading(true);

    const result = await onSubmit(email, password);

    if (result) {
      setError(result.message);
    } else {
      setSuccess(true);
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="h-screen max-h-dvh overflow-hidden bg-[var(--bg-deep)] flex flex-col items-center justify-center px-4 safe-pad-top safe-pad-bottom">
        <div className="card p-8 w-full max-w-sm text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--success-color)]/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-[var(--success-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-display-sm text-[var(--text-primary)] mb-2">{t('auth.checkEmail')}</h2>
          <p className="text-[var(--text-secondary)] font-display mb-6">
            {t('auth.confirmationSent')} <strong>{email}</strong>
          </p>
          <button
            onClick={onSwitchToLogin}
            className="btn btn-secondary w-full"
          >
            {t('auth.backToSignIn')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen max-h-dvh overflow-hidden bg-[var(--bg-deep)] flex flex-col">
      {/* Scroll only on account screen so Create Account button is reachable on short viewports (e.g. mobile browser) */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 safe-pad-top">
        {/* Logo + short info (Napper-style: clear top section) */}
        <div className="text-center pt-2 pb-6">
          <div className="mx-auto mb-4 flex justify-center">
            <Logo size={64} />
          </div>
          <h1 className="text-display-lg text-[var(--text-primary)]">{t('auth.createAccount')}</h1>
          <p className="text-[var(--text-muted)] font-display mt-2">{t('auth.createAccountSubtitle')}</p>
        </div>

        {/* Form Card: Google + Continue with email (Napper-style: logo, short info, then actions) */}
        <div className="card p-6 w-full max-w-sm mx-auto">
          <GoogleSignInButton onSignIn={onGoogleSignIn} disabled={!agreedToTermsAndPrivacy} />

          <AuthDivider />

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-[var(--danger-color)]/10 border border-[var(--danger-color)]/20">
                <p className="text-[var(--danger-color)] text-sm font-display">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
                {t('auth.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={t('auth.emailPlaceholder')}
                className="input"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
                {t('auth.password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder={t('auth.passwordPlaceholder')}
                className="input"
                disabled={loading}
              />
              <p className="text-xs text-[var(--text-muted)] mt-1">{t('auth.atLeast6')}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
                {t('auth.confirmPassword')}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder={t('auth.passwordPlaceholder')}
                className="input"
                disabled={loading}
              />
            </div>

            {/* Consent directly above CTA: market-standard placement so agreement is tied to the action */}
            <div className="pt-1">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreedToTermsAndPrivacy}
                  onChange={(e) => setAgreedToTermsAndPrivacy(e.target.checked)}
                  disabled={loading}
                  className="mt-1 w-4 h-4 rounded border-[var(--text-muted)] bg-[var(--bg-soft)] text-[var(--nap-color)] focus:ring-[var(--nap-color)]"
                  aria-describedby="consent-desc"
                />
                <span id="consent-desc" className="text-sm text-[var(--text-secondary)] font-display">
                  {t('auth.agreeTermsAndPrivacy')}{' '}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-[var(--nap-color)] font-medium underline underline-offset-2"
                  >
                    {t('auth.termsOfService')}
                  </button>
                  {' '}{t('auth.and')}{' '}
                  <button
                    type="button"
                    onClick={() => setShowPrivacyModal(true)}
                    className="text-[var(--nap-color)] font-medium underline underline-offset-2"
                  >
                    {t('auth.privacyPolicy')}
                  </button>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !agreedToTermsAndPrivacy}
              className="btn btn-primary w-full min-h-[56px]"
            >
              {loading ? t('auth.creatingAccount') : t('auth.createAccountButton')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[var(--text-muted)] text-sm font-display">
              {t('auth.alreadyHaveAccount')}{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-[var(--nap-color)] font-medium hover:underline"
              >
                {t('auth.signIn')}
              </button>
            </p>
          </div>
        </div>

        <div className="safe-pad-bottom min-h-[2rem]" />
      </div>

      {/* Terms of Service modal for sign-up consent */}
      {showTermsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="terms-modal-title"
        >
          <div className="bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-2xl shadow-xl max-h-[85vh] w-full max-w-md flex flex-col overflow-hidden">
            <div className="p-4 border-b border-[var(--text-muted)]/20 flex items-center justify-between flex-shrink-0">
              <h2 id="terms-modal-title" className="text-lg font-display font-semibold text-[var(--text-primary)]">
                {t('auth.termsModalTitle')}
              </h2>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)]"
                aria-label={t('auth.closeAria')}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-4">
              {TERMS_SECTION_KEYS.map((key) => (
                <div key={key}>
                  <h3 className="text-sm font-display font-semibold text-[var(--text-primary)] mb-1">
                    {t(`terms.${key}`)}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{t(`terms.${key}Body`)}</p>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-[var(--text-muted)]/20 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="btn btn-primary w-full min-h-[48px]"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy modal for sign-up consent */}
      {showPrivacyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="privacy-modal-title"
        >
          <div className="bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-2xl shadow-xl max-h-[85vh] w-full max-w-md flex flex-col overflow-hidden">
            <div className="p-4 border-b border-[var(--text-muted)]/20 flex items-center justify-between flex-shrink-0">
              <h2 id="privacy-modal-title" className="text-lg font-display font-semibold text-[var(--text-primary)]">
                {t('auth.privacyModalTitle')}
              </h2>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)]"
                aria-label={t('auth.closeAria')}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-4">
              {PRIVACY_SECTION_KEYS.map((key) => (
                <div key={key}>
                  <h3 className="text-sm font-display font-semibold text-[var(--text-primary)] mb-1">
                    {t(`privacy.${key}`)}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{t(`privacy.${key}Body`)}</p>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-[var(--text-muted)]/20 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="btn btn-primary w-full min-h-[48px]"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
