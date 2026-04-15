import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import { queryClient } from '@/lib/query-client';
import type { User } from '@/services/auth-api';

export function useUserQuery() {
  return useQuery<User | null>({
    queryKey: queryKeys.auth.user,
    queryFn: async () => queryClient.getQueryData<User | null>(queryKeys.auth.user) ?? null,
    initialData: () => queryClient.getQueryData<User | null>(queryKeys.auth.user) ?? null,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  });
}
