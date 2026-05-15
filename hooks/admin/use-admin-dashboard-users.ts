import { useDeferredValue, useMemo, useState } from 'react';

import type { AdminContextValue } from '@/contexts/admin/admin-context-types';
import { normalizeUserFormInput } from '@/lib/admin/admin-dashboard-form-utils';
import type { AdminUser, AdminUserUpsertInput } from '@/types/admin';

type UseAdminDashboardUsersParams = Pick<AdminContextValue, 'loading' | 'saveUser' | 'users'>;

export function useAdminDashboardUsers({
  loading,
  saveUser,
  users,
}: UseAdminDashboardUsersParams) {
  const [userSearch, setUserSearch] = useState('');
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const deferredUserSearch = useDeferredValue(userSearch);
  const usersLoading = loading.users && users.length === 0;
  const filteredUsers = useMemo(
    () =>
      users.filter((item) => {
        const query = deferredUserSearch.trim().toLowerCase();

        if (!query) {
          return true;
        }

        return [item.fullName, item.email, item.universityName].some((value) =>
          value.toLowerCase().includes(query),
        );
      }),
    [deferredUserSearch, users],
  );

  const openUserEditor = (user: AdminUser) => {
    setEditingUser(user);
  };

  const closeUserEditor = () => {
    setEditingUser(null);
  };

  const submitUserForm = async (values: AdminUserUpsertInput) => {
    if (!editingUser) {
      return;
    }

    await saveUser(editingUser.id, normalizeUserFormInput(values));
    setEditingUser(null);
  };

  return {
    usersLoading,
    userSearch,
    setUserSearch,
    filteredUsers,
    editingUser,
    setEditingUser,
    deletingUser,
    setDeletingUser,
    openUserEditor,
    closeUserEditor,
    submitUserForm,
  };
}
