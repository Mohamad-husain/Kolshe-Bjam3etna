import { router } from 'expo-router';

import RegisterForm from '@/components/auth/register-form';
import { useAuth } from '@/contexts/auth-context';

export default function RegisterRoute() {
  const { signIn } = useAuth();

  return (
    <RegisterForm
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
