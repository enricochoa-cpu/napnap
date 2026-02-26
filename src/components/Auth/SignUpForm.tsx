import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthDivider } from './AuthDivider';
import { GoogleSignInButton } from './GoogleSignInButton';

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
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

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

    if (!agreedToPrivacy) {
      setError(t('auth.agreePrivacyRequired'));
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
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--nap-color)]/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-[var(--nap-color)]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </div>
          <h1 className="text-display-lg text-[var(--text-primary)]">{t('auth.createAccount')}</h1>
          <p className="text-[var(--text-muted)] font-display mt-2">{t('auth.createAccountSubtitle')}</p>
        </div>

        {/* Form Card: Google + Continue with email (Napper-style: logo, short info, then actions) */}
        <div className="card p-6 w-full max-w-sm mx-auto">
          {/* Privacy consent: separate block with clear gap above Google button so it doesn't overlap */}
          <div className="mb-5">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreedToPrivacy}
                onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                disabled={loading}
                className="mt-1 w-4 h-4 rounded border-[var(--text-muted)] bg-[var(--bg-soft)] text-[var(--nap-color)] focus:ring-[var(--nap-color)]"
                aria-describedby="privacy-desc"
              />
              <span id="privacy-desc" className="text-sm text-[var(--text-secondary)] font-display">
                {t('auth.agreePrivacy')}{' '}
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

          <GoogleSignInButton onSignIn={onGoogleSignIn} disabled={!agreedToPrivacy} />

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

            <button
              type="submit"
              disabled={loading || !agreedToPrivacy}
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
