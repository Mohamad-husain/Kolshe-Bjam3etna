import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import { getNews } from '@/services/news-api';
import { getPartnerOffers } from '@/services/partner-offers-api';

export function useNewsQuery() {
  return useQuery({
    queryKey: queryKeys.home.news,
    queryFn: getNews,
  });
}

export function usePartnerOffersQuery() {
  return useQuery({
    queryKey: queryKeys.home.partnerOffers,
    queryFn: getPartnerOffers,
  });
}
