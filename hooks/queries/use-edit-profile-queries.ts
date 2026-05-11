import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import { getAccountProfile, getAuthToken, getUniversities } from '@/services/auth-api';

function isEnabled(enabled = true) {
  return Boolean(getAuthToken()) && enabled;
}

export function useAdminEditProfileQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.auth.profile,
    queryFn: getAccountProfile,
    enabled: isEnabled(enabled),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useAdminEditProfileUniversitiesQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.auth.universities,
    queryFn: getUniversities,
    enabled: isEnabled(enabled),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
