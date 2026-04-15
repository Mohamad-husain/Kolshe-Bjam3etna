import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import { getAccountProfile, getUniversities } from '@/services/auth-api';
import { getAuthToken } from '@/services/http-client';

function isAuthQueryEnabled(enabled = true) {
  return Boolean(getAuthToken()) && enabled;
}

export function useProfileQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.auth.profile,
    queryFn: getAccountProfile,
    enabled: isAuthQueryEnabled(enabled),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useUniversitiesQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.auth.universities,
    queryFn: getUniversities,
    enabled: isAuthQueryEnabled(enabled),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
