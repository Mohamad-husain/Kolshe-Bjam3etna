import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import { registerEvent, type RegisterEventInput } from '@/services/events-api';

export function useRegisterEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RegisterEventInput) => registerEvent(input),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.explore.events }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.explore.eventDetails(variables.eventId),
        }),
      ]);
    },
  });
}
