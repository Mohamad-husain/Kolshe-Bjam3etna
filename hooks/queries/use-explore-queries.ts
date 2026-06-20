import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import { getEventDetails, getEvents } from '@/services/events-api';
import { getProductAdDetails, getProductAds } from '@/services/marketplace-api';
import { getPartnerOfferDetails, getPartnerOffers } from '@/services/partner-offers-api';
import { getServiceRequestDetails, getServiceRequests } from '@/services/service-requests-api';
import { getSwapAds } from '@/services/swap-api';

export function useServicesQuery() {
  return useQuery({
    queryKey: queryKeys.explore.services,
    queryFn: getServiceRequests,
  });
}

export function useServiceDetailsQuery(id?: string) {
  return useQuery({
    queryKey: queryKeys.explore.serviceDetails(id ?? ''),
    queryFn: () => getServiceRequestDetails(id ?? ''),
    enabled: Boolean(id),
  });
}

export function useMarketplaceQuery() {
  return useQuery({
    queryKey: queryKeys.explore.products,
    queryFn: getProductAds,
  });
}

export function useProductAdDetailsQuery(id?: string) {
  return useQuery({
    queryKey: queryKeys.explore.productDetails(id ?? ''),
    queryFn: () => getProductAdDetails(id ?? ''),
    enabled: Boolean(id),
  });
}

export function usePartnerOffersQuery() {
  return useQuery({
    queryKey: queryKeys.explore.partnerOffers,
    queryFn: getPartnerOffers,
  });
}

export function usePartnerOfferDetailsQuery(id?: string) {
  return useQuery({
    queryKey: queryKeys.explore.partnerOfferDetails(id ?? ''),
    queryFn: () => getPartnerOfferDetails(id ?? ''),
    enabled: Boolean(id),
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

export function useEventDetailsQuery(id?: string) {
  return useQuery({
    queryKey: queryKeys.explore.eventDetails(id ?? ''),
    queryFn: () => getEventDetails(id ?? ''),
    enabled: Boolean(id),
  });
}
