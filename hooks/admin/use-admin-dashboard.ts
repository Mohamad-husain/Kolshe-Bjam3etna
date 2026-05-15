import { useMemo } from 'react';

import { useAdmin, useAdminClubSummary, useAdminRoleSummary } from '@/contexts/admin-context';
import { adminSections, getRoleOption } from '@/lib/admin/admin-config';
import type { AdminRoleValue } from '@/types/admin';

import { useAdminDashboardClubs } from './use-admin-dashboard-clubs';
import { useAdminDashboardNews } from './use-admin-dashboard-news';
import { useAdminDashboardOffers } from './use-admin-dashboard-offers';
import { useAdminDashboardRoles } from './use-admin-dashboard-roles';
import { useAdminDashboardUsers } from './use-admin-dashboard-users';

export function useAdminDashboard() {
  const admin = useAdmin();
  const roleSummary = useAdminRoleSummary();
  const clubSummary = useAdminClubSummary();
  const usersDashboard = useAdminDashboardUsers(admin);
  const newsDashboard = useAdminDashboardNews(admin);
  const rolesDashboard = useAdminDashboardRoles(admin);
  const offersDashboard = useAdminDashboardOffers(admin);
  const clubsDashboard = useAdminDashboardClubs(admin);
  const getRoleOptionByValue = (role: AdminRoleValue) =>
    admin.roleOptions.find((option) => option.value === role) ?? getRoleOption(role);
  const visibleSections = useMemo(
    () => adminSections.filter((section) => admin.allowedSections.includes(section.key)),
    [admin.allowedSections],
  );
  const resolvedActiveSection = admin.allowedSections.includes(admin.activeSection)
    ? admin.activeSection
    : admin.allowedSections[0] ?? 'overview';

  return {
    ...admin,
    roleSummary,
    clubSummary,
    visibleSections,
    resolvedActiveSection,
    getRoleOptionByValue,
    ...usersDashboard,
    ...newsDashboard,
    ...rolesDashboard,
    ...offersDashboard,
    ...clubsDashboard,
  };
}

export type AdminDashboard = ReturnType<typeof useAdminDashboard>;
