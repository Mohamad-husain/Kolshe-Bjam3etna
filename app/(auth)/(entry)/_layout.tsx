import { router, Slot, useSegments } from 'expo-router';

import { AuthLayout, type AuthTab } from '@/components/auth/auth-layout';

function resolveAuthTab(segment?: string): AuthTab {
  return segment === 'register' ? 'register' : 'login';
}

export default function AuthEntryLayout() {
  const segments = useSegments();
  const activeTab = resolveAuthTab(segments[segments.length - 1]);

  return (
    <AuthLayout
      activeTab={activeTab}
      onTabChange={(tab) => {
        router.replace(tab === 'login' ? '/(auth)/(entry)/login' : '/(auth)/(entry)/register');
      }}
    >
      <Slot />
    </AuthLayout>
  );
}
