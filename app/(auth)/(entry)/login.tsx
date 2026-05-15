import { router } from 'expo-router';

import LoginForm from '@/components/auth/login-form';
import { useAuth } from '@/contexts/auth-context';

export default function LoginRoute() {
  const { signIn } = useAuth();

  return (
    <LoginForm
      onForgotPassword={() => {
        router.push('/(auth)/password-recovery');
      }}
      onSuccess={(user) => {
        signIn(user);

        if (user.isProfileCompleted) {
          router.replace('/(tabs)/home');
          return;
        }

        router.navigate('/(auth)/select-university');
      }}
    />
  );
}
