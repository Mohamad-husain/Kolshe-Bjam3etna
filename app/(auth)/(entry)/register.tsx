import { router } from 'expo-router';

import RegisterForm from '@/components/auth/register-form';
import { useAuth } from '@/contexts/auth-context';

export default function RegisterRoute() {
  const { signIn } = useAuth();

  return (
    <RegisterForm
      onSuccess={(user) => {
        const nextRoute = user.isProfileCompleted ? '/(tabs)/home' : '/(auth)/select-university';

        signIn(user);
        router.replace(nextRoute);
      }}
    />
  );
}
