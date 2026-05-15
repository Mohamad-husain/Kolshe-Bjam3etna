import { useMemo, useState } from 'react';

import type { AdminContextValue } from '@/contexts/admin/admin-context-types';
import { normalizeClubFormInput } from '@/lib/admin/admin-dashboard-form-utils';
import type {
  AdminClubItem,
  AdminClubSubscriptionType,
  AdminClubUpsertInput,
} from '@/types/admin';

type UseAdminDashboardClubsParams = Pick<
  AdminContextValue,
  'clubs' | 'loading' | 'renewClub' | 'saveClub'
>;

export function useAdminDashboardClubs({
  clubs,
  loading,
  renewClub,
  saveClub,
}: UseAdminDashboardClubsParams) {
  const [clubFilter, setClubFilter] = useState<'all' | AdminClubItem['status']>('all');
  const [editingClub, setEditingClub] = useState<AdminClubItem | null>(null);
  const [clubEditorVisible, setClubEditorVisible] = useState(false);
  const [deletingClub, setDeletingClub] = useState<AdminClubItem | null>(null);
  const [renewingClub, setRenewingClub] = useState<AdminClubItem | null>(null);
  const [renewType, setRenewType] = useState<AdminClubSubscriptionType>('yearly');
  const clubsLoading = loading.clubs && clubs.length === 0;
  const filteredClubs = useMemo(
    () => clubs.filter((item) => (clubFilter === 'all' ? true : item.status === clubFilter)),
    [clubFilter, clubs],
  );

  const openClubEditor = (item?: AdminClubItem | null) => {
    setEditingClub(item ?? null);
    setClubEditorVisible(true);
  };

  const closeClubEditor = () => {
    setEditingClub(null);
    setClubEditorVisible(false);
  };

  const submitClubForm = async (values: AdminClubUpsertInput) => {
    await saveClub(editingClub, normalizeClubFormInput(values));
    setEditingClub(null);
    setClubEditorVisible(false);
  };

  const handleRenewClub = async () => {
    if (!renewingClub) {
      return;
    }

    await renewClub(renewingClub, renewType);
    setRenewingClub(null);
  };

  return {
    clubsLoading,
    clubFilter,
    setClubFilter,
    filteredClubs,
    editingClub,
    clubEditorVisible,
    deletingClub,
    setDeletingClub,
    renewingClub,
    setRenewingClub,
    renewType,
    setRenewType,
    openClubEditor,
    closeClubEditor,
    submitClubForm,
    handleRenewClub,
  };
}
