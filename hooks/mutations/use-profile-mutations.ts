import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import {
  acceptOffer,
  rejectOffer,
  type IncomingOffer,
} from '@/services/profile-api';

type OfferMutationContext = {
  previousIncomingOffers?: IncomingOffer[];
};

function removeIncomingOfferFromCache(
  queryClient: ReturnType<typeof useQueryClient>,
  offerId: number,
) {
  queryClient.setQueryData<IncomingOffer[]>(
    queryKeys.profile.incomingOffers,
    (current = []) => current.filter((offer) => offer.id !== offerId),
  );
}

export function useAcceptOfferMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (offerId: number) => acceptOffer(offerId),
    onMutate: async (offerId): Promise<OfferMutationContext> => {
      await queryClient.cancelQueries({ queryKey: queryKeys.profile.incomingOffers });
      const previousIncomingOffers = queryClient.getQueryData<IncomingOffer[]>(
        queryKeys.profile.incomingOffers,
      );

      removeIncomingOfferFromCache(queryClient, offerId);

      return { previousIncomingOffers };
    },
    onError: (_error, _offerId, context) => {
      if (context?.previousIncomingOffers) {
        queryClient.setQueryData(
          queryKeys.profile.incomingOffers,
          context.previousIncomingOffers,
        );
      }
    },
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
    onMutate: async (offerId): Promise<OfferMutationContext> => {
      await queryClient.cancelQueries({ queryKey: queryKeys.profile.incomingOffers });
      const previousIncomingOffers = queryClient.getQueryData<IncomingOffer[]>(
        queryKeys.profile.incomingOffers,
      );

      removeIncomingOfferFromCache(queryClient, offerId);

      return { previousIncomingOffers };
    },
    onError: (_error, _offerId, context) => {
      if (context?.previousIncomingOffers) {
        queryClient.setQueryData(
          queryKeys.profile.incomingOffers,
          context.previousIncomingOffers,
        );
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.profile.incomingOffers }),
        queryClient.invalidateQueries({ queryKey: queryKeys.profile.outgoingOffers }),
      ]);
    },
  });
}
