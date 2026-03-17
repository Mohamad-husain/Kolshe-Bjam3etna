import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import { getEvents } from '@/services/events-api';
import { getProductAds } from '@/services/marketplace-api';
import { getServiceRequests } from '@/services/service-requests-api';
import { getSwapAds } from '@/services/swap-api';

export function useServicesQuery() {
  return useQuery({
    queryKey: queryKeys.explore.services,
    queryFn: getServiceRequests,
  });
}

export function useMarketplaceQuery() {
  return useQuery({
    queryKey: queryKeys.explore.products,
    queryFn: getProductAds,
  });
}

export function useExchangeQuery() {
  return useQuery({
    queryKey: queryKeys.explore.swaps,
    queryFn: getSwapAds,
  });
}

export function useEventsQuery() {
  return useQuery({
    queryKey: queryKeys.explore.events,
    queryFn: getEvents,
  });
}
