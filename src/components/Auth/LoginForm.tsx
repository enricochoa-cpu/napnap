import { useState } from 'react';
import { GoogleSignInButton } from './GoogleSignInButton';
import { AuthDivider } from './AuthDivider';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<{ message: string } | null>;
  onGoogleSignIn: () => Promise<{ message: string } | null>;
  onSwitchToSignUp: () => void;
  onForgotPassword: () => void;
}

export function LoginForm({ onSubmit, onGoogleSignIn, onSwitchToSignUp, onForgotPassword }: LoginFormProps) {
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
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--nap-color)]/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-[var(--nap-color)]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </div>
          <h1 className="text-display-lg text-[var(--text-primary)]">Welcome back</h1>
          <p className="text-[var(--text-muted)] font-display mt-2">Sign in to continue tracking sleep</p>
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
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="input"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="input"
                disabled={loading}
              />
            </div>

            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-[var(--nap-color)] font-display hover:underline"
            >
              Forgot password?
            </button>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-nap w-full min-h-[56px]"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[var(--text-muted)] text-sm font-display">
              Don&apos;t have an account?{' '}
              <button
                onClick={onSwitchToSignUp}
                className="text-[var(--nap-color)] font-medium hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>

        <div className="safe-pad-bottom min-h-[2rem]" />
      </div>
    </div>
  );
}
