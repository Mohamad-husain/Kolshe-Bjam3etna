import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import { createSwapAd, type CreateSwapAdInput } from '@/services/swap-api';

export function useCreateSwapAdMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSwapAdInput) => createSwapAd(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.explore.swaps }),
        queryClient.invalidateQueries({ queryKey: queryKeys.profile.mySwaps }),
      ]);
    },
  });
}
