import { Redirect, Stack, useSegments } from 'expo-router';

import { useAuth } from '@/contexts/auth-context';

export default function AuthLayout() {
  const { user } = useAuth();
  const segments = useSegments();
  const activeRoute = segments[segments.length - 1];
  const isProfileSetupRoute =
    activeRoute === 'select-university' || activeRoute === 'complete-profile';

  if (user?.isProfileCompleted) {
    return <Redirect href="/(tabs)/home" />;
  }

  if (user && !user.isProfileCompleted && !isProfileSetupRoute) {
    return <Redirect href="/(auth)/select-university" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
