import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import { getAccountProfile, getUniversities } from '@/services/auth-api';

export function useProfileQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.auth.profile,
    queryFn: getAccountProfile,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUniversitiesQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.auth.universities,
    queryFn: getUniversities,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
