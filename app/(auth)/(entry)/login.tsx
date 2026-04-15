import { router } from 'expo-router';

import LoginForm from '@/components/auth/login-form';
import { useAuth } from '@/contexts/auth-context';
import type { User } from '@/services/auth-api';

function handleAuthenticatedUser(signIn: (user: User) => void, user: User) {
  signIn(user);
  router.replace(user.isProfileCompleted ? '/(tabs)/home' : '/(auth)/select-university');
}

export default function LoginRoute() {
  const { signIn } = useAuth();

  return (
    <LoginForm
      onForgotPassword={() => {
        router.push('/(auth)/password-recovery');
      }}
      onSuccess={(user) => {
        handleAuthenticatedUser(signIn, user);
      }}
    />
  );
}
