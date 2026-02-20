/**
 * Multi-step onboarding: Welcome → Baby name → Baby DOB → Your name → Your relationship → Account.
 * Napper-style layout: question at top, Next at bottom. No scroll (fixed viewport).
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/dateUtils';
import { setOnboardingDraftInSession } from '../../utils/storage';
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

const TOTAL_STEPS = 6; // Welcome, Baby name, Baby DOB, Your name, Your relationship, Account
const STEP_WELCOME = 0;
const STEP_BABY_NAME = 1;
const STEP_BABY_DOB = 2;
const STEP_YOUR_NAME = 3;
const STEP_YOUR_RELATIONSHIP = 4;
const STEP_ACCOUNT = 5;

const RELATIONSHIP_OPTIONS: { value: OnboardingRelationship; labelKey: string }[] = [
  { value: 'mum', labelKey: 'onboarding.relationshipMum' },
  { value: 'dad', labelKey: 'onboarding.relationshipDad' },
  { value: 'other', labelKey: 'onboarding.relationshipOther' },
];

interface OnboardingFlowProps {
  signUp: (email: string, password: string) => Promise<{ message: string } | null>;
  signIn: (email: string, password: string) => Promise<{ message: string } | null>;
  signInWithGoogle: () => Promise<{ message: string } | null>;
  resetPassword: (email: string) => Promise<{ message: string } | null>;
}

const defaultDraft = (): OnboardingDraft => ({
  babyName: '',
  babyDob: formatDate(new Date()), // Default to today; user can change
  userName: '',
  relationship: 'mum',
});

export function OnboardingFlow({ signUp, signIn, signInWithGoogle, resetPassword }: OnboardingFlowProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(STEP_WELCOME);
  const [draft, setDraft] = useState<OnboardingDraft>(defaultDraft);
  const [accountView, setAccountView] = useState<'signup' | 'login' | 'forgot-password'>('signup');

  // Persist draft when on Account step so it can be applied after sign-up (email or Google redirect).
  useEffect(() => {
    if (step === STEP_ACCOUNT) {
      setOnboardingDraftInSession(JSON.stringify(draft));
    }
  }, [step, draft]);

  const goNext = () => {
    if (step < STEP_ACCOUNT) setStep((s) => s + 1);
  };

  const goBack = () => {
    if (step > STEP_WELCOME) setStep((s) => s - 1);
  };

  const progressDots = (
    <div className="flex justify-center gap-2 mb-6" aria-label={t('onboarding.stepOf', { current: step + 1, total: TOTAL_STEPS })}>
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

  // Step 5: Account — reuse auth forms (no-scroll wrapper)
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

  // Next is enabled only when the current step's required input is complete (no advancing with empty name/DOB)
  const canProceed =
    step === STEP_WELCOME ||
    (step === STEP_BABY_NAME && draft.babyName.trim().length > 0) ||
    (step === STEP_BABY_DOB && draft.babyDob.length > 0) ||
    (step === STEP_YOUR_NAME && draft.userName.trim().length > 0) ||
    step === STEP_YOUR_RELATIONSHIP;

  // Napper-style: question at top, content in middle, Next at bottom. Safe-area padding so content isn't flush with browser chrome.
  return (
    <div className="h-screen max-h-dvh overflow-hidden bg-[var(--bg-deep)] flex flex-col px-4 safe-pad-top">
      {progressDots}

      {/* Welcome (merged with Trust) */}
      {step === STEP_WELCOME && (
        <div className="flex flex-col flex-1 w-full max-w-sm mx-auto">
          <h2 className="text-display-md text-[var(--text-primary)] font-display pt-2 text-center">
            {t('onboarding.hiThere')}
          </h2>
          <p className="text-[var(--text-secondary)] font-display mt-3 text-center">
            {t('onboarding.intro')}
          </p>
          <div className="flex-1" />
          <div className="mt-auto safe-pad-bottom">
            <button
              type="button"
              onClick={goNext}
              className="btn btn-night w-full min-h-[56px]"
            >
              {t('common.next')}
            </button>
          </div>
        </div>
      )}

      {/* Baby name */}
      {step === STEP_BABY_NAME && (
        <div className="flex flex-col flex-1 w-full max-w-sm mx-auto">
          <h2 className="text-display-md text-[var(--text-primary)] font-display pt-2 text-center">
            {t('onboarding.babyNameQuestion')}
          </h2>
          <div className="flex-1 flex flex-col justify-center py-6">
            <input
              type="text"
              value={draft.babyName}
              onChange={(e) => setDraft((d) => ({ ...d, babyName: e.target.value }))}
              placeholder={t('onboarding.namePlaceholder')}
              className="input"
              autoComplete="off"
            />
          </div>
          <div className="flex gap-3 mt-auto safe-pad-bottom">
            <button
              type="button"
              onClick={goBack}
              className="btn btn-ghost flex-1 min-h-[56px] border border-[var(--night-color)]"
            >
              {t('common.back')}
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!canProceed}
              className="btn btn-night flex-1 min-h-[56px]"
            >
              {t('common.next')}
            </button>
          </div>
        </div>
      )}

      {/* Baby DOB */}
      {step === STEP_BABY_DOB && (
        <div className="flex flex-col flex-1 w-full max-w-sm mx-auto">
          <h2 className="text-display-md text-[var(--text-primary)] font-display pt-2 text-center">
            {t('onboarding.babyDobQuestion')}
          </h2>
          <p className="text-[var(--text-muted)] text-sm font-display mt-2 text-center">
            {t('onboarding.babyDobHint')}
          </p>
          <div className="flex-1 flex flex-col justify-center py-6">
            <input
              type="date"
              value={draft.babyDob}
              onChange={(e) => setDraft((d) => ({ ...d, babyDob: e.target.value }))}
              className="input"
            />
          </div>
          <div className="flex gap-3 mt-auto safe-pad-bottom">
            <button
              type="button"
              onClick={goBack}
              className="btn btn-ghost flex-1 min-h-[56px] border border-[var(--night-color)]"
            >
              {t('common.back')}
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!canProceed}
              className="btn btn-night flex-1 min-h-[56px]"
            >
              {t('common.next')}
            </button>
          </div>
        </div>
      )}

      {/* Your name */}
      {step === STEP_YOUR_NAME && (
        <div className="flex flex-col flex-1 w-full max-w-sm mx-auto">
          <h2 className="text-display-md text-[var(--text-primary)] font-display pt-2 text-center">
            {t('onboarding.yourNameQuestion')}
          </h2>
          <div className="flex-1 flex flex-col justify-center py-6">
            <input
              type="text"
              value={draft.userName}
              onChange={(e) => setDraft((d) => ({ ...d, userName: e.target.value }))}
              placeholder={t('onboarding.namePlaceholder')}
              className="input"
              autoComplete="name"
            />
          </div>
          <div className="flex gap-3 mt-auto safe-pad-bottom">
            <button
              type="button"
              onClick={goBack}
              className="btn btn-ghost flex-1 min-h-[56px] border border-[var(--night-color)]"
            >
              {t('common.back')}
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!canProceed}
              className="btn btn-night flex-1 min-h-[56px]"
            >
              {t('common.next')}
            </button>
          </div>
        </div>
      )}

      {/* Your relationship */}
      {step === STEP_YOUR_RELATIONSHIP && (
        <div className="flex flex-col flex-1 w-full max-w-sm mx-auto">
          <h2 className="text-display-md text-[var(--text-primary)] font-display pt-2 text-center">
            {t('onboarding.yourRelationshipQuestion')}
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
                {t(opt.labelKey)}
              </button>
            ))}
          </div>
          <div className="flex gap-3 mt-auto safe-pad-bottom">
            <button
              type="button"
              onClick={goBack}
              className="btn btn-ghost flex-1 min-h-[56px] border border-[var(--night-color)]"
            >
              {t('common.back')}
            </button>
            <button
              type="button"
              onClick={goNext}
              className="btn btn-night flex-1 min-h-[56px]"
            >
              {t('common.next')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
