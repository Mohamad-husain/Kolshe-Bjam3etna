import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import {
  createProductOffer,
  createServiceOffer,
  type CreateProductOfferInput,
  type CreateServiceOfferInput,
} from '@/services/offers-api';

export function useCreateServiceOfferMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateServiceOfferInput) => createServiceOffer(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile.outgoingOffers });
    },
  });
}

export function useCreateProductOfferMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProductOfferInput) => createProductOffer(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile.outgoingOffers });
    },
  });
}
