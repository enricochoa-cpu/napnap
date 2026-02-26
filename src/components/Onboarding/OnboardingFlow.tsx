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
  /** Called when user taps back on the "Hi there" screen to return to entry choice */
  onBackFromWelcome?: () => void;
}

const defaultDraft = (): OnboardingDraft => ({
  babyName: '',
  babyDob: formatDate(new Date()), // Default to today; user can change
  userName: '',
  relationship: 'mum',
});

export function OnboardingFlow({ signUp, signIn, signInWithGoogle, resetPassword, onBackFromWelcome }: OnboardingFlowProps) {
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

  const handleBack = () => (step === STEP_WELCOME ? onBackFromWelcome?.() : goBack());

  // Napper-style: question at top, content in middle, Next at bottom. Safe-area padding so content isn't flush with browser chrome.
  return (
    <div className="h-screen max-h-dvh overflow-hidden bg-[var(--bg-deep)] flex flex-col px-4 safe-pad-top">
      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          onClick={handleBack}
          className="w-11 h-11 -ml-1 rounded-2xl flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors min-w-[44px] min-h-[44px]"
          aria-label={t('common.back')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="flex-1" />
      </div>
      {progressDots}

      {/* Welcome: title, intro, benefit cards, Next (same width as Next on following screens) */}
      {step === STEP_WELCOME && (
        <div className="flex flex-col flex-1 w-full max-w-sm mx-auto">
          <h2 className="text-display-md text-[var(--text-primary)] font-display pt-2 text-center">
            {t('onboarding.hiThere')}
          </h2>
          <p className="text-[var(--text-secondary)] text-sm font-display mt-3 text-center">
            {t('onboarding.intro')}
          </p>
          <div className="mt-6 space-y-3">
            <div className="card p-4 flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-[var(--nap-color)]/20 flex items-center justify-center" aria-hidden>
                <svg className="w-6 h-6 text-[var(--nap-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="font-display font-semibold text-[var(--text-primary)]">{t('onboarding.welcomeCard1Title')}</p>
                <p className="text-sm text-[var(--text-secondary)] mt-0.5">{t('onboarding.welcomeCard1Subtitle')}</p>
              </div>
            </div>
            <div className="card p-4 flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-[var(--nap-color)]/20 flex items-center justify-center" aria-hidden>
                <svg className="w-6 h-6 text-[var(--nap-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="font-display font-semibold text-[var(--text-primary)]">{t('onboarding.welcomeCard2Title')}</p>
                <p className="text-sm text-[var(--text-secondary)] mt-0.5">{t('onboarding.welcomeCard2Subtitle')}</p>
              </div>
            </div>
            <div className="card p-4 flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-[var(--nap-color)]/20 flex items-center justify-center" aria-hidden>
                <svg className="w-6 h-6 text-[var(--nap-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="font-display font-semibold text-[var(--text-primary)]">{t('onboarding.welcomeCard3Title')}</p>
                <p className="text-sm text-[var(--text-secondary)] mt-0.5">{t('onboarding.welcomeCard3Subtitle')}</p>
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-4" />
          <div className="flex gap-3 mt-auto safe-pad-bottom">
            <div className="flex-1" />
            <button
              type="button"
              onClick={goNext}
              className="btn btn-primary flex-1 min-h-[56px] shrink-0"
            >
              {t('common.next')}
            </button>
            <div className="flex-1" />
          </div>
        </div>
      )}

      {/* Baby name */}
      {step === STEP_BABY_NAME && (
        <div className="flex flex-col flex-1 w-full max-w-sm mx-auto">
          <h2 className="text-display-md text-[var(--text-primary)] font-display pt-2 text-center">
            {t('onboarding.babyNameQuestion')}
          </h2>
          <p className="text-[var(--text-secondary)] text-sm font-display mt-2 text-center">
            {t('onboarding.babyNameWhy')}
          </p>
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
              className="btn btn-secondary flex-1 min-h-[56px]"
            >
              {t('common.back')}
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!canProceed}
              className="btn btn-primary flex-1 min-h-[56px]"
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
          <p className="text-[var(--text-secondary)] text-sm font-display mt-2 text-center">
            {t('onboarding.babyDobWhy')}
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
              className="btn btn-secondary flex-1 min-h-[56px]"
            >
              {t('common.back')}
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!canProceed}
              className="btn btn-primary flex-1 min-h-[56px]"
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
              className="btn btn-secondary flex-1 min-h-[56px]"
            >
              {t('common.back')}
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!canProceed}
              className="btn btn-primary flex-1 min-h-[56px]"
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
                  draft.relationship === opt.value ? 'btn-primary' : 'btn-ghost border border-[var(--night-color)]'
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
              className="btn btn-secondary flex-1 min-h-[56px]"
            >
              {t('common.back')}
            </button>
            <button
              type="button"
              onClick={goNext}
              className="btn btn-primary flex-1 min-h-[56px]"
            >
              {t('common.next')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
