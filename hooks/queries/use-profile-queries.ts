import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import {
  getIncomingOffers,
  getMyProductAds,
  getMyServiceRequests,
  getMySwapAds,
  getOutgoingOffers,
} from '@/services/profile-api';

export function useMyServiceRequestsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.profile.myServices,
    queryFn: getMyServiceRequests,
    enabled,
  });
}

export function useMyProductAdsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.profile.myAds,
    queryFn: getMyProductAds,
    enabled,
  });
}

export function useMySwapAdsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.profile.mySwaps,
    queryFn: getMySwapAds,
    enabled,
  });
}

export function useIncomingOffersQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.profile.incomingOffers,
    queryFn: getIncomingOffers,
    enabled,
  });
}

export function useOutgoingOffersQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.profile.outgoingOffers,
    queryFn: getOutgoingOffers,
    enabled,
  });
}
