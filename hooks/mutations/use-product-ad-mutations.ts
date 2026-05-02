import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import { createProductAd, type CreateProductAdInput } from '@/services/marketplace-api';

export function useCreateProductAdMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProductAdInput) => createProductAd(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.explore.products }),
        queryClient.invalidateQueries({ queryKey: queryKeys.profile.myAds }),
      ]);
    },
  });
}
