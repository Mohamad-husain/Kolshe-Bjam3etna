import { useMemo, useState } from 'react';

import type { AdminContextValue } from '@/contexts/admin/admin-context-types';
import { normalizeOfferFormInput } from '@/lib/admin/admin-dashboard-form-utils';
import type { AdminOfferItem, AdminOfferType, AdminOfferUpsertInput } from '@/types/admin';

type UseAdminDashboardOffersParams = Pick<
  AdminContextValue,
  'loading' | 'offers' | 'saveOffer'
>;

export function useAdminDashboardOffers({
  loading,
  offers,
  saveOffer,
}: UseAdminDashboardOffersParams) {
  const [offerFilter, setOfferFilter] = useState<'all' | AdminOfferType>('all');
  const [editingOffer, setEditingOffer] = useState<AdminOfferItem | null>(null);
  const [offerEditorVisible, setOfferEditorVisible] = useState(false);
  const [deletingOffer, setDeletingOffer] = useState<AdminOfferItem | null>(null);
  const offersLoading = loading.offers && offers.length === 0;
  const filteredOffers = useMemo(
    () => offers.filter((item) => (offerFilter === 'all' ? true : item.type === offerFilter)),
    [offerFilter, offers],
  );

  const openOfferEditor = (item?: AdminOfferItem | null) => {
    setEditingOffer(item ?? null);
    setOfferEditorVisible(true);
  };

  const closeOfferEditor = () => {
    setEditingOffer(null);
    setOfferEditorVisible(false);
  };

  const submitOfferForm = async (values: AdminOfferUpsertInput) => {
    await saveOffer(editingOffer, normalizeOfferFormInput(values));
    setEditingOffer(null);
    setOfferEditorVisible(false);
  };

  return {
    offersLoading,
    offerFilter,
    setOfferFilter,
    filteredOffers,
    editingOffer,
    offerEditorVisible,
    deletingOffer,
    setDeletingOffer,
    openOfferEditor,
    closeOfferEditor,
    submitOfferForm,
  };
}
