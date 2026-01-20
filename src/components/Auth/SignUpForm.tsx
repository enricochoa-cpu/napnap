import { useState } from 'react';

interface SignUpFormProps {
  onSubmit: (email: string, password: string) => Promise<{ message: string } | null>;
  onSwitchToLogin: () => void;
}

export function SignUpForm({ onSubmit, onSwitchToLogin }: SignUpFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
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
      <div className="min-h-screen bg-[var(--bg-deep)] flex flex-col items-center justify-center px-4">
        <div className="card p-8 w-full max-w-sm text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--success-color)]/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-[var(--success-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-display-sm text-[var(--text-primary)] mb-2">Check your email</h2>
          <p className="text-[var(--text-secondary)] font-display mb-6">
            We sent a confirmation link to <strong>{email}</strong>
          </p>
          <button
            onClick={onSwitchToLogin}
            className="btn btn-ghost w-full"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] flex flex-col items-center justify-center px-4">
      {/* Logo/Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--nap-color)]/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-[var(--nap-color)]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </div>
        <h1 className="text-display-lg text-[var(--text-primary)]">Create account</h1>
        <p className="text-[var(--text-muted)] font-display mt-2">Start tracking your baby's sleep</p>
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
            <p className="text-xs text-[var(--text-muted)] mt-1">At least 6 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="input"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-nap w-full"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[var(--text-muted)] text-sm font-display">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-[var(--nap-color)] font-medium hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
