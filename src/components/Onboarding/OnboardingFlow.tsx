/**
 * Multi-step onboarding: Welcome → Baby name → Baby DOB → Your name → Your relationship → Account.
 * Napper-style layout: question at top, Next at bottom. No scroll (fixed viewport).
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { formatDate, validateDateOfBirth, getDateOfBirthInputBounds } from '../../utils/dateUtils';
import { getOnboardingDraft, setOnboardingDraft } from '../../utils/storage';
import { ForgotPasswordForm } from '../Auth/ForgotPasswordForm';
import { LoginForm } from '../Auth/LoginForm';
import { SignUpForm } from '../Auth/SignUpForm';
import { BackButton } from '../common/BackButton';
import {
  Step1Illustration,
  Step2Illustration,
  Step3Illustration,
  Step4Illustration,
  Step5Illustration,
} from '../illustrations/AuthIllustrations';

const STEP_SPRING = { type: 'spring', stiffness: 300, damping: 30 } as const;

const stepVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 24, scale: 0.98 }),
  center: { opacity: 1, x: 0, scale: 1 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -24, scale: 0.98 }),
};

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

// Restore persisted draft + step on mount so a refresh during onboarding doesn't lose progress (U-61).
const loadInitialState = (): { draft: OnboardingDraft; step: number } => {
  const fallback = { draft: defaultDraft(), step: STEP_WELCOME };
  const raw = getOnboardingDraft();
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as Partial<OnboardingDraft & { step: number }>;
    if (typeof parsed !== 'object' || parsed === null) return fallback;
    const restoredStep =
      typeof parsed.step === 'number' && parsed.step >= STEP_WELCOME && parsed.step <= STEP_ACCOUNT
        ? parsed.step
        : STEP_WELCOME;
    const validRelationship: OnboardingRelationship =
      parsed.relationship === 'dad' || parsed.relationship === 'mum' || parsed.relationship === 'other'
        ? parsed.relationship
        : 'mum';
    return {
      draft: {
        babyName: typeof parsed.babyName === 'string' ? parsed.babyName : '',
        babyDob: typeof parsed.babyDob === 'string' && parsed.babyDob ? parsed.babyDob : formatDate(new Date()),
        userName: typeof parsed.userName === 'string' ? parsed.userName : '',
        relationship: validRelationship,
      },
      step: restoredStep,
    };
  } catch {
    return fallback;
  }
};

export function OnboardingFlow({ signUp, signIn, signInWithGoogle, resetPassword, onBackFromWelcome }: OnboardingFlowProps) {
  const { t } = useTranslation();
  const [{ draft: initialDraft, step: initialStep }] = useState(loadInitialState);
  const [step, setStep] = useState(initialStep);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [draft, setDraft] = useState<OnboardingDraft>(initialDraft);
  const [accountView, setAccountView] = useState<'signup' | 'login' | 'forgot-password'>('signup');

  // Persist draft + current step on every change so a refresh restores progress (and OAuth redirect can apply the draft on the Account step).
  useEffect(() => {
    setOnboardingDraft(JSON.stringify({ ...draft, step }));
  }, [step, draft]);

  const goNext = () => {
    if (step < STEP_ACCOUNT) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  };

  const goBack = () => {
    if (step > STEP_WELCOME) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  };

  const handleBack = () => (step === STEP_WELCOME ? onBackFromWelcome?.() : goBack());

  const progressPct = ((step + 1) / TOTAL_STEPS) * 100;
  const stepperRow = (
    <div className="flex items-center gap-3 mb-6 pt-2">
      <BackButton onClick={handleBack} />
      <div
        className="flex-1 min-w-0"
        aria-label={t('onboarding.stepOf', { current: step + 1, total: TOTAL_STEPS })}
      >
        <p className="text-[10px] tracking-[0.12em] uppercase text-[var(--text-muted)] font-display mb-1.5">
          {t('onboarding.stepOf', { current: step + 1, total: TOTAL_STEPS })}
        </p>
        <div className="h-1 rounded-full bg-[var(--text-muted)]/20 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-[var(--nap-color)]"
            initial={false}
            animate={{ width: `${progressPct}%` }}
            transition={STEP_SPRING}
          />
        </div>
      </div>
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
            babyName={draft.babyName}
          />
        ) : (
          <LoginForm
            onSubmit={signIn}
            onGoogleSignIn={signInWithGoogle}
            onSwitchToSignUp={() => setAccountView('signup')}
            onForgotPassword={() => setAccountView('forgot-password')}
            onBack={() => setAccountView('signup')}
          />
        )}
      </div>
    );
  }

  const dobValidation = validateDateOfBirth(draft.babyDob);
  // Next is enabled only when the current step's required input is complete (no advancing with empty or invalid DOB)
  const canProceed =
    step === STEP_WELCOME ||
    (step === STEP_BABY_NAME && draft.babyName.trim().length > 0) ||
    (step === STEP_BABY_DOB && draft.babyDob.trim().length > 0 && dobValidation.valid) ||
    (step === STEP_YOUR_NAME && draft.userName.trim().length > 0) ||
    step === STEP_YOUR_RELATIONSHIP;

  // Napper-style: question at top, content in middle, Next at bottom. Safe-area padding so content isn't flush with browser chrome.
  return (
    <div className="h-screen max-h-dvh overflow-hidden bg-[var(--bg-deep)] flex flex-col px-4 safe-pad-top">
      {stepperRow}

      <AnimatePresence mode="wait" custom={direction} initial={false}>
      {/* Welcome: title, intro, benefit cards, Next (same width as Next on following screens) */}
      {step === STEP_WELCOME && (
        <motion.div
          key="welcome"
          custom={direction}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={STEP_SPRING}
          className="flex flex-col flex-1 w-full"
        >
          <div className="mx-auto mt-2 w-[160px] h-[112px]" aria-hidden="true">
            <Step1Illustration />
          </div>
          <h2 className="text-display-md text-[var(--text-primary)] font-display mt-4 text-center">
            {t('onboarding.hiThere')}
          </h2>
          <p className="text-[var(--text-secondary)] text-sm font-display mt-3 text-center">
            {t('onboarding.intro')}
          </p>
          <div className="w-full max-w-sm mx-auto">
            <div className="mt-6 space-y-3">
              <div className="card p-4 flex items-start gap-3">
                <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-[var(--nap-color)]" aria-hidden />
                <div className="min-w-0">
                  <p className="font-display font-semibold text-[var(--text-primary)]">{t('onboarding.welcomeCard1Title')}</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-0.5">{t('onboarding.welcomeCard1Subtitle')}</p>
                </div>
              </div>
              <div className="card p-4 flex items-start gap-3">
                <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-[var(--night-color)]" aria-hidden />
                <div className="min-w-0">
                  <p className="font-display font-semibold text-[var(--text-primary)]">{t('onboarding.welcomeCard2Title')}</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-0.5">{t('onboarding.welcomeCard2Subtitle')}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-4" />
          <div className="flex gap-3 mt-auto safe-pad-bottom w-full max-w-sm mx-auto">
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
        </motion.div>
      )}

      {/* Baby name */}
      {step === STEP_BABY_NAME && (
        <motion.div
          key="baby-name"
          custom={direction}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={STEP_SPRING}
          className="flex flex-col flex-1 w-full"
        >
          <div className="mx-auto mt-2 w-[200px] h-[140px]" aria-hidden="true">
            <Step2Illustration />
          </div>
          <h2 className="text-display-md text-[var(--text-primary)] font-display mt-4 text-center">
            {t('onboarding.babyNameQuestion')}
          </h2>
          <p className="text-[var(--text-secondary)] text-sm font-display mt-2 text-center">
            {t('onboarding.babyNameWhy')}
          </p>
          <div className="w-full max-w-sm mx-auto">
            <div className="flex-1 flex flex-col justify-center py-6">
              <label htmlFor="onboarding-baby-name" className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
                {t('babyEdit.babyName')}
              </label>
              <input
                id="onboarding-baby-name"
                type="text"
                value={draft.babyName}
                onChange={(e) => setDraft((d) => ({ ...d, babyName: e.target.value }))}
                placeholder={t('onboarding.namePlaceholder')}
                className="input"
                autoComplete="off"
              />
            </div>
          </div>
          <div className="flex mt-auto safe-pad-bottom w-full max-w-sm mx-auto">
            <button
              type="button"
              onClick={goNext}
              disabled={!canProceed}
              className="btn btn-primary w-full min-h-[56px]"
            >
              {t('common.next')}
            </button>
          </div>
        </motion.div>
      )}

      {/* Baby DOB */}
      {step === STEP_BABY_DOB && (
        <motion.div
          key="baby-dob"
          custom={direction}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={STEP_SPRING}
          className="flex flex-col flex-1 w-full"
        >
          <div className="mx-auto mt-2 w-[200px] h-[140px]" aria-hidden="true">
            <Step3Illustration />
          </div>
          <h2 className="text-display-md text-[var(--text-primary)] font-display mt-4 text-center">
            {draft.babyName.trim()
              ? t('onboarding.babyDobQuestionPersonalised', { name: draft.babyName.trim() })
              : t('onboarding.babyDobQuestion')}
          </h2>
          <p className="text-[var(--text-secondary)] text-sm font-display mt-2 text-center">
            {t('onboarding.babyDobWhy')}
          </p>
          <div className="w-full max-w-sm mx-auto">
            <div className="flex-1 flex flex-col justify-center py-6">
              <label htmlFor="onboarding-baby-dob" className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
                {t('babyEdit.dateOfBirth')}
              </label>
              <input
                id="onboarding-baby-dob"
                type="date"
                value={draft.babyDob}
                onChange={(e) => setDraft((d) => ({ ...d, babyDob: e.target.value }))}
                min={getDateOfBirthInputBounds().min}
                max={getDateOfBirthInputBounds().max}
                className="input"
                aria-invalid={draft.babyDob.trim() !== '' && !dobValidation.valid}
                aria-describedby={draft.babyDob.trim() !== '' && dobValidation.errorKey ? 'onboarding-dob-error' : undefined}
              />
              {draft.babyDob.trim() !== '' && dobValidation.errorKey && (
                <p id="onboarding-dob-error" className="text-xs text-[var(--danger-color)] mt-2 text-center" role="alert">
                  {dobValidation.errorKey === 'babyEdit.dobFuture'
                    ? t('babyEdit.dobFuture')
                    : dobValidation.errorKey === 'babyEdit.dobTooOld'
                      ? t('babyEdit.dobTooOld')
                      : t('babyEdit.dobInvalid')}
                </p>
              )}
            </div>
          </div>
          <div className="flex mt-auto safe-pad-bottom w-full max-w-sm mx-auto">
            <button
              type="button"
              onClick={goNext}
              disabled={!canProceed}
              className="btn btn-primary w-full min-h-[56px]"
            >
              {t('common.next')}
            </button>
          </div>
        </motion.div>
      )}

      {/* Your name */}
      {step === STEP_YOUR_NAME && (
        <motion.div
          key="your-name"
          custom={direction}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={STEP_SPRING}
          className="flex flex-col flex-1 w-full"
        >
          <div className="mx-auto mt-2 w-[200px] h-[140px]" aria-hidden="true">
            <Step4Illustration />
          </div>
          <h2 className="text-display-md text-[var(--text-primary)] font-display mt-4 text-center">
            {t('onboarding.yourNameQuestion')}
          </h2>
          <p className="text-[var(--text-secondary)] text-sm font-display mt-2 text-center">
            {t('onboarding.yourNameWhy')}
          </p>
          <div className="w-full max-w-sm mx-auto">
            <div className="flex-1 flex flex-col justify-center py-6">
              <label htmlFor="onboarding-your-name" className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
                {t('profile.yourName')}
              </label>
              <input
                id="onboarding-your-name"
                type="text"
                value={draft.userName}
                onChange={(e) => setDraft((d) => ({ ...d, userName: e.target.value }))}
                placeholder={t('onboarding.namePlaceholder')}
                className="input"
                autoComplete="name"
              />
            </div>
          </div>
          <div className="flex mt-auto safe-pad-bottom w-full max-w-sm mx-auto">
            <button
              type="button"
              onClick={goNext}
              disabled={!canProceed}
              className="btn btn-primary w-full min-h-[56px]"
            >
              {t('common.next')}
            </button>
          </div>
        </motion.div>
      )}

      {/* Your relationship */}
      {step === STEP_YOUR_RELATIONSHIP && (
        <motion.div
          key="your-relationship"
          custom={direction}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={STEP_SPRING}
          className="flex flex-col flex-1 w-full"
        >
          <div className="mx-auto mt-2 w-[200px] h-[140px]" aria-hidden="true">
            <Step5Illustration />
          </div>
          <h2 className="text-display-md text-[var(--text-primary)] font-display mt-4 text-center">
            {t('onboarding.yourRelationshipQuestion')}
          </h2>
          <p className="text-[var(--text-secondary)] text-sm font-display mt-2 text-center">
            {t('onboarding.yourRelationshipWhy')}
          </p>
          <div className="w-full max-w-sm mx-auto">
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
          </div>
          <div className="flex mt-auto safe-pad-bottom w-full max-w-sm mx-auto">
            <button
              type="button"
              onClick={goNext}
              className="btn btn-primary w-full min-h-[56px]"
            >
              {t('common.next')}
            </button>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
