import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/contexts/auth-context';

export default function AuthLayout() {
  const { user } = useAuth();

  if (user?.isProfileCompleted) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
