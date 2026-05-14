import { router, Stack, useSegments } from 'expo-router';
import { useEffect } from 'react';

import { useAuth } from '@/contexts/auth-context';

export default function AuthLayout() {
  const { user } = useAuth();
  const segments = useSegments();
  const activeRoute = segments[segments.length - 1];
  const isProfileSetupRoute =
    activeRoute === 'select-university' || activeRoute === 'complete-profile';

  useEffect(() => {
    if (user?.isProfileCompleted) {
      router.navigate('/(tabs)/home');
      return;
    }

    if (user && !user.isProfileCompleted && !isProfileSetupRoute) {
      router.navigate('/(auth)/select-university');
    }
  }, [isProfileSetupRoute, user]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
