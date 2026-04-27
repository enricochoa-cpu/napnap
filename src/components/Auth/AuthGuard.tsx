import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useApplyCircadianTheme } from '../../hooks/useCircadianTheme';
import { getFromStorage, removeOnboardingDraft, STORAGE_KEYS } from '../../utils/storage';
import { EntryChoice } from '../Onboarding';
import { OnboardingFlow } from '../Onboarding';
import { LoginForm } from './LoginForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { LoadingScreen } from '../LoadingScreen';

type AuthView = 'login' | 'signup' | 'forgot-password';
/** User has not chosen yet: show entry. After choice, we show either onboarding or auth. */
type EntryChoiceState = null | 'new' | 'account';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  useApplyCircadianTheme(); // Apply morning/afternoon/night theme even when showing entry or onboarding
  const { t } = useTranslation();
  const { isAuthenticated, loading, signIn, signUp, resetPassword, signInWithGoogle } = useAuth();
  // Returning users (completed onboarding on this device) skip Entry choice and go straight to Login
  const [entryChoice, setEntryChoice] = useState<EntryChoiceState>(() =>
    getFromStorage(STORAGE_KEYS.ONBOARDING_COMPLETED, false) ? 'account' : null
  );
  const [authView, setAuthView] = useState<AuthView>('login');

  // Show loading screen while checking auth status
  if (loading) {
    return <LoadingScreen message={t('common.loading')} />;
  }

  // User is authenticated, show the app
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Not authenticated: show entry choice first (I'm new vs I have an account)
  if (entryChoice === null) {
    return (
      <EntryChoice
        onNew={() => {
          // Fresh "Get started" → wipe any stale draft so onboarding restarts at step 1.
          // Mid-flow refreshes still restore progress because they don't pass through here.
          removeOnboardingDraft();
          setEntryChoice('new');
        }}
        onHaveAccount={() => setEntryChoice('account')}
      />
    );
  }

  // User chose "I'm new" — show onboarding; last step is account (SignUp/Login/ForgotPassword)
  if (entryChoice === 'new') {
    return (
      <OnboardingFlow
        signUp={signUp}
        signIn={signIn}
        signInWithGoogle={signInWithGoogle}
        resetPassword={resetPassword}
        onBackFromWelcome={() => setEntryChoice(null)}
      />
    );
  }

  // User chose "I have an account" — show auth screens
  switch (authView) {
    case 'signup':
      // Route new signups through full onboarding so baby profile data is collected
      return (
        <OnboardingFlow
          signUp={signUp}
          signIn={signIn}
          signInWithGoogle={signInWithGoogle}
          resetPassword={resetPassword}
          onBackFromWelcome={() => {
            setAuthView('login');
            // Stay in 'account' flow so back goes to login, not entry choice
          }}
        />
      );

    case 'forgot-password':
      return (
        <ForgotPasswordForm
          onSubmit={resetPassword}
          onBack={() => setAuthView('login')}
        />
      );

    case 'login':
    default:
      return (
        <LoginForm
          onSubmit={signIn}
          onGoogleSignIn={signInWithGoogle}
          onSwitchToSignUp={() => setAuthView('signup')}
          onForgotPassword={() => setAuthView('forgot-password')}
          onBack={() => setEntryChoice(null)}
        />
      );
  }
}
