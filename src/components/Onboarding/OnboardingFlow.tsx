/**
 * Multi-step onboarding: Welcome → Trust → Baby → You → Account.
 * State is in-memory only; persistence (e.g. localStorage / Supabase) is out of scope for this phase.
 */

import { useState } from 'react';
import { formatDate } from '../../utils/dateUtils';
import { ForgotPasswordForm } from '../Auth/ForgotPasswordForm';
import { LoginForm } from '../Auth/LoginForm';
import { SignUpForm } from '../Auth/SignUpForm';

export type OnboardingRelationship = 'dad' | 'mum' | 'other';

export interface OnboardingDraft {
  babyName: string;
  babyDob: string;
  userName: string;
  relationship: OnboardingRelationship;
}

const TOTAL_STEPS = 5; // Welcome, Trust, Baby, You, Account
const STEP_WELCOME = 0;
const STEP_TRUST = 1;
const STEP_BABY = 2;
const STEP_YOU = 3;
const STEP_ACCOUNT = 4;

const RELATIONSHIP_OPTIONS: { value: OnboardingRelationship; label: string }[] = [
  { value: 'mum', label: 'Mum' },
  { value: 'dad', label: 'Dad' },
  { value: 'other', label: 'Other' },
];

interface OnboardingFlowProps {
  signUp: (email: string, password: string) => Promise<{ message: string } | null>;
  signIn: (email: string, password: string) => Promise<{ message: string } | null>;
  signInWithGoogle: () => Promise<{ message: string } | null>;
  resetPassword: (email: string) => Promise<{ message: string } | null>;
}

const defaultDraft = (): OnboardingDraft => ({
  babyName: '',
  babyDob: formatDate(new Date()),
  userName: '',
  relationship: 'mum',
});

export function OnboardingFlow({ signUp, signIn, signInWithGoogle, resetPassword }: OnboardingFlowProps) {
  const [step, setStep] = useState(STEP_WELCOME);
  const [draft, setDraft] = useState<OnboardingDraft>(defaultDraft);
  const [accountView, setAccountView] = useState<'signup' | 'login' | 'forgot-password'>('signup');

  const goNext = () => {
    if (step < STEP_ACCOUNT) setStep((s) => s + 1);
  };

  const goBack = () => {
    if (step > STEP_WELCOME) setStep((s) => s - 1);
  };

  const progressDots = (
    <div className="flex justify-center gap-2 mb-6" aria-label={`Step ${step + 1} of ${TOTAL_STEPS}`}>
      {Array.from({ length: TOTAL_STEPS }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all ${
            i <= step ? 'w-6 bg-[var(--night-color)]' : 'w-1.5 bg-[var(--text-muted)]/40'
          }`}
        />
      ))}
    </div>
  );

  // Step 4: Account — reuse auth forms
  if (step === STEP_ACCOUNT) {
    if (accountView === 'forgot-password') {
      return (
        <div className="min-h-screen bg-[var(--bg-deep)]">
          <ForgotPasswordForm
            onSubmit={resetPassword}
            onBack={() => setAccountView('login')}
          />
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-[var(--bg-deep)]">
        {accountView === 'signup' ? (
          <SignUpForm
            onSubmit={signUp}
            onGoogleSignIn={signInWithGoogle}
            onSwitchToLogin={() => setAccountView('login')}
          />
        ) : (
          <LoginForm
            onSubmit={signIn}
            onGoogleSignIn={signInWithGoogle}
            onSwitchToSignUp={() => setAccountView('signup')}
            onForgotPassword={() => setAccountView('forgot-password')}
          />
        )}
      </div>
    );
  }

  const canProceed =
    (step === STEP_BABY && draft.babyName.trim() && draft.babyDob) ||
    (step === STEP_YOU && draft.userName.trim() && draft.relationship) ||
    step === STEP_WELCOME ||
    step === STEP_TRUST;

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] flex flex-col items-center justify-center px-4">
      {progressDots}

      {/* Welcome */}
      {step === STEP_WELCOME && (
        <div className="w-full max-w-sm text-center">
          <h2 className="text-display-md text-[var(--text-primary)] font-display mb-3">
            Hi there
          </h2>
          <p className="text-[var(--text-secondary)] font-display mb-8">
            We’ll help you get clear on when your baby should sleep — in a few short steps.
          </p>
          <button
            type="button"
            onClick={goNext}
            className="btn btn-night w-full min-h-[56px]"
          >
            Next
          </button>
        </div>
      )}

      {/* Trust */}
      {step === STEP_TRUST && (
        <div className="w-full max-w-sm text-center">
          <h2 className="text-display-md text-[var(--text-primary)] font-display mb-3">
            Why we ask a few details
          </h2>
          <p className="text-[var(--text-secondary)] font-display mb-8">
            Your baby’s age and name let us tailor nap and bedtime suggestions. No judgement — just calm, practical guidance.
          </p>
          <button
            type="button"
            onClick={goNext}
            className="btn btn-night w-full min-h-[56px]"
          >
            Next
          </button>
        </div>
      )}

      {/* Baby */}
      {step === STEP_BABY && (
        <div className="w-full max-w-sm">
          <h2 className="text-display-md text-[var(--text-primary)] font-display mb-2 text-center">
            When was your baby born?
          </h2>
          <p className="text-[var(--text-muted)] text-sm font-display mb-6 text-center">
            We need this for sleep suggestions.
          </p>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
                Baby’s name
              </label>
              <input
                type="text"
                value={draft.babyName}
                onChange={(e) => setDraft((d) => ({ ...d, babyName: e.target.value }))}
                placeholder="Name"
                className="input"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
                Date of birth
              </label>
              <input
                type="date"
                value={draft.babyDob}
                onChange={(e) => setDraft((d) => ({ ...d, babyDob: e.target.value }))}
                className="input"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={goBack}
              className="btn btn-ghost flex-1 min-h-[56px]"
            >
              Back
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!canProceed}
              className="btn btn-night flex-1 min-h-[56px]"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* You */}
      {step === STEP_YOU && (
        <div className="w-full max-w-sm">
          <h2 className="text-display-md text-[var(--text-primary)] font-display mb-2 text-center">
            And what’s your name?
          </h2>
          <p className="text-[var(--text-muted)] text-sm font-display mb-6 text-center">
            So we can say hi.
          </p>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
                Your name
              </label>
              <input
                type="text"
                value={draft.userName}
                onChange={(e) => setDraft((d) => ({ ...d, userName: e.target.value }))}
                placeholder="Name"
                className="input"
                autoComplete="name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
                You’re their…
              </label>
              <div className="flex gap-2 flex-wrap">
                {RELATIONSHIP_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, relationship: opt.value }))}
                    className={`btn min-h-[48px] flex-1 min-w-[80px] ${
                      draft.relationship === opt.value ? 'btn-night' : 'btn-ghost'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={goBack}
              className="btn btn-ghost flex-1 min-h-[56px]"
            >
              Back
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!canProceed}
              className="btn btn-night flex-1 min-h-[56px]"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
