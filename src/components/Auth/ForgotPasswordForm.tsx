import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<{ message: string } | null>;
  onBack: () => void;
}

export function ForgotPasswordForm({ onSubmit, onBack }: ForgotPasswordFormProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await onSubmit(email);

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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-display-sm text-[var(--text-primary)] mb-2">{t('auth.checkEmail')}</h2>
          <p className="text-[var(--text-secondary)] font-display mb-6">
            {t('auth.resetLinkSent')} <strong>{email}</strong>
          </p>
          <button
            onClick={onBack}
            className="btn btn-ghost w-full"
          >
            {t('auth.backToSignIn')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen max-h-dvh overflow-hidden bg-[var(--bg-deep)] flex flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto px-4 safe-pad-top flex flex-col items-center py-8">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--nap-color)]/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-[var(--nap-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-display-lg text-[var(--text-primary)]">{t('auth.resetPassword')}</h1>
          <p className="text-[var(--text-muted)] font-display mt-2">{t('auth.resetPasswordSubtitle')}</p>
        </div>

        {/* Form Card */}
        <div className="card p-6 w-full max-w-sm">
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

            <button
              type="submit"
              disabled={loading}
              className="btn btn-nap w-full"
            >
              {loading ? t('auth.sending') : t('auth.sendResetLink')}
            </button>

            <button
              type="button"
              onClick={onBack}
              className="btn btn-ghost w-full"
            >
              {t('auth.backToSignIn')}
            </button>
          </form>
        </div>

        <div className="safe-pad-bottom min-h-[2rem]" />
      </div>
    </div>
  );
}
