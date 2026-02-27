import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GoogleSignInButton } from './GoogleSignInButton';
import { AuthDivider } from './AuthDivider';
import { Logo } from '../Logo';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<{ message: string } | null>;
  onGoogleSignIn: () => Promise<{ message: string } | null>;
  onSwitchToSignUp: () => void;
  onForgotPassword: () => void;
}

export function LoginForm({ onSubmit, onGoogleSignIn, onSwitchToSignUp, onForgotPassword }: LoginFormProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await onSubmit(email, password);

    if (result) {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="h-screen max-h-dvh overflow-hidden bg-[var(--bg-deep)] flex flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto px-4 safe-pad-top">
        {/* Logo + short info (Napper-style) */}
        <div className="text-center pt-2 pb-6">
          <div className="mx-auto mb-4 flex justify-center">
            <Logo size={64} />
          </div>
          <h1 className="text-display-lg text-[var(--text-primary)]">{t('auth.welcomeBack')}</h1>
          <p className="text-[var(--text-muted)] font-display mt-2">{t('auth.signInSubtitle')}</p>
        </div>

        {/* Form Card: Google + email */}
        <div className="card p-6 w-full max-w-sm mx-auto">
          <GoogleSignInButton onSignIn={onGoogleSignIn} />

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
            </div>

            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-[var(--nap-color)] font-display hover:underline"
            >
              {t('auth.forgotPassword')}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full min-h-[56px]"
            >
              {loading ? t('auth.signingIn') : t('auth.signIn')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[var(--text-muted)] text-sm font-display">
              {t('auth.noAccount')}{' '}
              <button
                onClick={onSwitchToSignUp}
                className="text-[var(--nap-color)] font-medium hover:underline"
              >
                {t('auth.signUp')}
              </button>
            </p>
          </div>
        </div>

        <div className="safe-pad-bottom min-h-[2rem]" />
      </div>
    </div>
  );
}
