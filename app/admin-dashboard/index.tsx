import { Redirect } from 'expo-router';

import { AdminDashboardAccessState } from '@/components/admin/admin-dashboard/AdminDashboardAccessState';
import { AdminDashboardScreen } from '@/components/admin/admin-dashboard/AdminDashboardScreen';
import { useAuth } from '@/contexts/auth-context';
import { adminAccessText } from '@/lib/admin/admin-copy';

export default function AdminDashboardRoute() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/(auth)" />;
  }

  if (!user.isProfileCompleted) {
    return <Redirect href="/(auth)/select-university" />;
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
