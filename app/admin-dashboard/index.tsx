import { router } from 'expo-router';
import { useEffect } from 'react';

import { AdminDashboardAccessState } from '@/components/admin/admin-dashboard/AdminDashboardAccessState';
import { AdminDashboardScreen } from '@/components/admin/admin-dashboard/AdminDashboardScreen';
import { useAuth } from '@/contexts/auth-context';
import { adminAccessText } from '@/lib/admin/admin-copy';

export default function AdminDashboardRoute() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.navigate('/(auth)');
      return;
    }

    if (!user.isProfileCompleted) {
      router.navigate('/(auth)/select-university');
    }
  }, [user]);

  if (!user || !user.isProfileCompleted) {
    return null;
  }

  if (!user.canAccessAdmin) {
    return (
      <AdminDashboardAccessState
        title={adminAccessText.accessOnlyTitle}
        message={adminAccessText.accessOnlyMessage}
      />
    );
  }

  return <AdminDashboardScreen />;
}
