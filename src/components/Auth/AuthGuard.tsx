import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useApplyCircadianTheme } from '../../hooks/useCircadianTheme';
import { getFromStorage, STORAGE_KEYS } from '../../utils/storage';
import { EntryChoice } from '../Onboarding';
import { OnboardingFlow } from '../Onboarding';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
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
  const { isAuthenticated, loading, signIn, signUp, resetPassword, signInWithGoogle } = useAuth();
  // Returning users (completed onboarding on this device) skip Entry choice and go straight to Login
  const [entryChoice, setEntryChoice] = useState<EntryChoiceState>(() =>
    getFromStorage(STORAGE_KEYS.ONBOARDING_COMPLETED, false) ? 'account' : null
  );
  const [authView, setAuthView] = useState<AuthView>('login');

  // Show loading screen while checking auth status
  if (loading) {
    return <LoadingScreen message="Loading..." />;
  }

  // User is authenticated, show the app
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Not authenticated: show entry choice first (I'm new vs I have an account)
  if (entryChoice === null) {
    return (
      <EntryChoice
        onNew={() => setEntryChoice('new')}
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
      />
    );
  }

  // User chose "I have an account" — show auth screens as before
  switch (authView) {
    case 'signup':
      return (
        <SignUpForm
          onSubmit={signUp}
          onGoogleSignIn={signInWithGoogle}
          onSwitchToLogin={() => setAuthView('login')}
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
        />
      );
  }
}
