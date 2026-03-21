import { Redirect } from 'expo-router';

import { useAuth } from '@/contexts/auth-context';

export default function IndexScreen() {
  const { user } = useAuth();

  if (user) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/(auth)" />;
}
