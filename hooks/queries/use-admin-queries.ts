import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import { getAuthToken } from '@/services/http-client';
import { getAdminClubs, getAdminClubSummary } from '@/services/admin/admin-clubs-api';
import { getAdminDashboardSummary } from '@/services/admin/admin-dashboard-api';
import { getAdminNews } from '@/services/admin/admin-news-api';
import { getAdminOffers } from '@/services/admin/admin-offers-api';
import {
  getAdminAvailableRoles,
  getAdminRoles,
  getAdminRolesSummary,
  getAdminRoleScopes,
} from '@/services/admin/admin-roles-api';
import { getAdminUsers } from '@/services/admin/admin-users-api';

export function useAdminDashboardQuery() {
  return useQuery({
    queryKey: queryKeys.admin.dashboard,
    queryFn: getAdminDashboardSummary,
    staleTime: 60 * 1000,
    enabled: Boolean(getAuthToken()),
  });
}

export function useAdminUsersQuery() {
  return useQuery({
    queryKey: queryKeys.admin.users,
    queryFn: getAdminUsers,
    enabled: Boolean(getAuthToken()),
  });
}

export function useAdminNewsQuery() {
  return useQuery({
    queryKey: queryKeys.admin.news,
    queryFn: getAdminNews,
    refetchOnWindowFocus: false,
    enabled: Boolean(getAuthToken()),
  });
}

export function useAdminRolesQuery() {
  return useQuery({
    queryKey: queryKeys.admin.roles,
    queryFn: getAdminRoles,
    enabled: Boolean(getAuthToken()),
  });
}

export function useAdminRoleSummaryQuery() {
  return useQuery({
    queryKey: queryKeys.admin.roleSummary,
    queryFn: getAdminRolesSummary,
    enabled: Boolean(getAuthToken()),
  });
}

export function useAdminRoleOptionsQuery() {
  return useQuery({
    queryKey: queryKeys.admin.roleOptions,
    queryFn: getAdminAvailableRoles,
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(getAuthToken()),
  });
}

export function useAdminRoleScopesQuery() {
  return useQuery({
    queryKey: queryKeys.admin.roleScopes,
    queryFn: getAdminRoleScopes,
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(getAuthToken()),
  });
}

export function useAdminOffersQuery() {
  return useQuery({
    queryKey: queryKeys.admin.offers,
    queryFn: getAdminOffers,
    enabled: Boolean(getAuthToken()),
  });
}

export function useAdminClubsQuery() {
  return useQuery({
    queryKey: queryKeys.admin.clubs,
    queryFn: getAdminClubs,
    enabled: Boolean(getAuthToken()),
  });
}

export function useAdminClubSummaryQuery() {
  return useQuery({
    queryKey: queryKeys.admin.clubSummary,
    queryFn: getAdminClubSummary,
    enabled: Boolean(getAuthToken()),
  });
}
