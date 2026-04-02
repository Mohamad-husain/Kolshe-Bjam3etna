import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import { acceptOffer, rejectOffer } from '@/services/profile-api';

export function useAcceptOfferMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (offerId: number) => acceptOffer(offerId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.profile.incomingOffers }),
        queryClient.invalidateQueries({ queryKey: queryKeys.profile.outgoingOffers }),
        queryClient.invalidateQueries({ queryKey: queryKeys.profile.myServices }),
        queryClient.invalidateQueries({ queryKey: queryKeys.profile.myAds }),
        queryClient.invalidateQueries({ queryKey: queryKeys.profile.mySwaps }),
      ]);
    },
  });
}

export function useRejectOfferMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (offerId: number) => rejectOffer(offerId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.profile.incomingOffers }),
        queryClient.invalidateQueries({ queryKey: queryKeys.profile.outgoingOffers }),
      ]);
    },
  });
}
