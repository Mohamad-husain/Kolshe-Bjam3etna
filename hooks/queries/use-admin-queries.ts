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
} from '@/services/admin/admin-roles-api';
import { getAdminUsers } from '@/services/admin/admin-users-api';

type AdminQueryOptions = {
  enabled?: boolean;
};

function isAdminQueryEnabled(enabled = true) {
  return Boolean(getAuthToken()) && enabled;
}

export function useAdminDashboardQuery({ enabled = true }: AdminQueryOptions = {}) {
  return useQuery({
    queryKey: queryKeys.admin.dashboard,
    queryFn: getAdminDashboardSummary,
    staleTime: 60 * 1000,
    enabled: isAdminQueryEnabled(enabled),
  });
}

export function useAdminUsersQuery({ enabled = true }: AdminQueryOptions = {}) {
  return useQuery({
    queryKey: queryKeys.admin.users,
    queryFn: getAdminUsers,
    enabled: isAdminQueryEnabled(enabled),
  });
}

export function useAdminNewsQuery({ enabled = true }: AdminQueryOptions = {}) {
  return useQuery({
    queryKey: queryKeys.admin.news,
    queryFn: getAdminNews,
    refetchOnWindowFocus: false,
    enabled: isAdminQueryEnabled(enabled),
  });
}

export function useAdminRolesQuery({ enabled = true }: AdminQueryOptions = {}) {
  return useQuery({
    queryKey: queryKeys.admin.roles,
    queryFn: getAdminRoles,
    enabled: isAdminQueryEnabled(enabled),
  });
}

export function useAdminRoleOptionsQuery({ enabled = true }: AdminQueryOptions = {}) {
  return useQuery({
    queryKey: queryKeys.admin.roleOptions,
    queryFn: getAdminAvailableRoles,
    staleTime: 5 * 60 * 1000,
    enabled: isAdminQueryEnabled(enabled),
  });
}

export function useAdminOffersQuery({ enabled = true }: AdminQueryOptions = {}) {
  return useQuery({
    queryKey: queryKeys.admin.offers,
    queryFn: getAdminOffers,
    enabled: isAdminQueryEnabled(enabled),
  });
}

export function useAdminClubsQuery({ enabled = true }: AdminQueryOptions = {}) {
  return useQuery({
    queryKey: queryKeys.admin.clubs,
    queryFn: getAdminClubs,
    enabled: isAdminQueryEnabled(enabled),
  });
}

export function useAdminClubSummaryQuery({ enabled = true }: AdminQueryOptions = {}) {
  return useQuery({
    queryKey: queryKeys.admin.clubSummary,
    queryFn: getAdminClubSummary,
    enabled: isAdminQueryEnabled(enabled),
  });
}
