import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import {
  createServiceRequest,
  type CreateServiceRequestInput,
} from '@/services/service-requests-api';

export function useCreateServiceRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateServiceRequestInput) => createServiceRequest(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.explore.services }),
        queryClient.invalidateQueries({ queryKey: queryKeys.profile.myServices }),
      ]);
    },
  });
}
