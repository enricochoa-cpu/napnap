import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { LoadingScreen } from '../LoadingScreen';

type AuthView = 'login' | 'signup' | 'forgot-password';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, loading, signIn, signUp, resetPassword } = useAuth();
  const [authView, setAuthView] = useState<AuthView>('login');

  // Show loading screen while checking auth status
  if (loading) {
    return <LoadingScreen message="Loading..." />;
  }

  // User is authenticated, show the app
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // User is not authenticated, show auth screens
  switch (authView) {
    case 'signup':
      return (
        <SignUpForm
          onSubmit={signUp}
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
          onSwitchToSignUp={() => setAuthView('signup')}
          onForgotPassword={() => setAuthView('forgot-password')}
        />
      );
  }
}
