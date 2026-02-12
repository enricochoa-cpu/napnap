/**
 * Multi-step onboarding: Welcome (merged) → Baby → Your name → Your relationship → Account.
 * Napper-style layout: question at top, Next at bottom. No scroll (fixed viewport).
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

const TOTAL_STEPS = 5; // Welcome, Baby, Your name, Your relationship, Account
const STEP_WELCOME = 0;
const STEP_BABY = 1;
const STEP_YOUR_NAME = 2;
const STEP_YOUR_RELATIONSHIP = 3;
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

  // Step 4: Account — reuse auth forms (no-scroll wrapper)
  if (step === STEP_ACCOUNT) {
    if (accountView === 'forgot-password') {
      return (
        <div className="h-screen max-h-dvh overflow-hidden bg-[var(--bg-deep)]">
          <ForgotPasswordForm
            onSubmit={resetPassword}
            onBack={() => setAccountView('login')}
          />
        </div>
      );
    }
    return (
      <div className="h-screen max-h-dvh overflow-hidden bg-[var(--bg-deep)]">
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
    (step === STEP_YOUR_NAME && draft.userName.trim()) ||
    (step === STEP_YOUR_RELATIONSHIP) ||
    step === STEP_WELCOME;

  // Napper-style: question at top, content in middle, Next at bottom. No scroll.
  return (
    <div className="h-screen max-h-dvh overflow-hidden bg-[var(--bg-deep)] flex flex-col px-4">
      {progressDots}

      {/* Welcome (merged with Trust) */}
      {step === STEP_WELCOME && (
        <div className="flex flex-col flex-1 w-full max-w-sm mx-auto">
          <h2 className="text-display-md text-[var(--text-primary)] font-display pt-4 text-center">
            Hi there
          </h2>
          <p className="text-[var(--text-secondary)] font-display mt-3 text-center">
            A few quick details so we can suggest when your baby should sleep. No fuss.
          </p>
          <div className="flex-1" />
          <button
            type="button"
            onClick={goNext}
            className="btn btn-night w-full min-h-[56px] mt-auto mb-6"
          >
            Next
          </button>
        </div>
      )}

      {/* Baby */}
      {step === STEP_BABY && (
        <div className="flex flex-col flex-1 w-full max-w-sm mx-auto">
          <h2 className="text-display-md text-[var(--text-primary)] font-display pt-4 text-center">
            When was your baby born?
          </h2>
          <p className="text-[var(--text-muted)] text-sm font-display mt-2 text-center">
            We need this for sleep suggestions.
          </p>
          <div className="flex-1 flex flex-col justify-center space-y-4 py-6">
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
          <div className="flex gap-3 mt-auto pb-6">
            <button
              type="button"
              onClick={goBack}
              className="btn btn-ghost flex-1 min-h-[56px] border border-[var(--night-color)]"
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

      {/* Your name */}
      {step === STEP_YOUR_NAME && (
        <div className="flex flex-col flex-1 w-full max-w-sm mx-auto">
          <h2 className="text-display-md text-[var(--text-primary)] font-display pt-4 text-center">
            What’s your name?
          </h2>
          <div className="flex-1 flex flex-col justify-center py-6">
            <input
              type="text"
              value={draft.userName}
              onChange={(e) => setDraft((d) => ({ ...d, userName: e.target.value }))}
              placeholder="Name"
              className="input"
              autoComplete="name"
            />
          </div>
          <div className="flex gap-3 mt-auto pb-6">
            <button
              type="button"
              onClick={goBack}
              className="btn btn-ghost flex-1 min-h-[56px] border border-[var(--night-color)]"
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

      {/* Your relationship */}
      {step === STEP_YOUR_RELATIONSHIP && (
        <div className="flex flex-col flex-1 w-full max-w-sm mx-auto">
          <h2 className="text-display-md text-[var(--text-primary)] font-display pt-4 text-center">
            You’re their…
          </h2>
          <div className="flex-1 flex flex-col justify-center gap-2 py-6">
            {RELATIONSHIP_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDraft((d) => ({ ...d, relationship: opt.value }))}
                className={`btn min-h-[56px] w-full ${
                  draft.relationship === opt.value ? 'btn-night' : 'btn-ghost border border-[var(--night-color)]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex gap-3 mt-auto pb-6">
            <button
              type="button"
              onClick={goBack}
              className="btn btn-ghost flex-1 min-h-[56px] border border-[var(--night-color)]"
            >
              Back
            </button>
            <button
              type="button"
              onClick={goNext}
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
