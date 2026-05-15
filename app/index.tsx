import { router } from 'expo-router';
import { useEffect } from 'react';

import { useAuth } from '@/contexts/auth-context';

export default function IndexScreen() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.navigate(user.isProfileCompleted ? '/(tabs)/home' : '/(auth)/select-university');
      return;
    }

    router.navigate('/(auth)');
  }, [user]);

  return null;
}
