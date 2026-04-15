import { router } from 'expo-router';

import RegisterForm from '@/components/auth/register-form';
import { useAuth } from '@/contexts/auth-context';
import type { User } from '@/services/auth-api';

function handleAuthenticatedUser(signIn: (user: User) => void, user: User) {
  signIn(user);
  router.replace(user.isProfileCompleted ? '/(tabs)/home' : '/(auth)/select-university');
}

export default function RegisterRoute() {
  const { signIn } = useAuth();

  return (
    <RegisterForm
      onSuccess={(user) => {
        handleAuthenticatedUser(signIn, user);
      }}
    />
  );
}
