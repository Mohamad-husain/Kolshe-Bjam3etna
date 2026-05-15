import { useMemo, useState } from 'react';

import type { AdminContextValue } from '@/contexts/admin/admin-context-types';
import { normalizeText } from '@/lib/admin/admin-dashboard-form-utils';
import type {
  AdminRoleAssignInput,
  AdminRoleMember,
  AdminRoleUpdateInput,
  AdminRoleValue,
} from '@/types/admin';

type UseAdminDashboardRolesParams = Pick<AdminContextValue, 'loading' | 'roles' | 'saveRole'>;

export function useAdminDashboardRoles({
  loading,
  roles,
  saveRole,
}: UseAdminDashboardRolesParams) {
  const [roleFilter, setRoleFilter] = useState<AdminRoleValue | 'all'>('all');
  const [editingRole, setEditingRole] = useState<AdminRoleMember | null>(null);
  const [roleEditorVisible, setRoleEditorVisible] = useState(false);
  const [deletingRole, setDeletingRole] = useState<AdminRoleMember | null>(null);
  const rolesLoading = loading.roles && roles.length === 0;
  const filteredRoles = useMemo(
    () => roles.filter((item) => (roleFilter === 'all' ? true : item.role === roleFilter)),
    [roleFilter, roles],
  );

  const openRoleEditor = (item?: AdminRoleMember | null) => {
    setEditingRole(item ?? null);
    setRoleEditorVisible(true);
  };

  const closeRoleEditor = () => {
    setEditingRole(null);
    setRoleEditorVisible(false);
  };

  const submitRoleForm = async (values: AdminRoleAssignInput) => {
    if (editingRole) {
      const payload: AdminRoleUpdateInput = {
        email: editingRole.email,
        newRole: values.role,
        scopeId: values.scopeId,
      };
      await saveRole(editingRole, payload);
    } else {
      await saveRole(null, {
        ...values,
        fullName: '',
        email: normalizeText(values.email).toLowerCase(),
      });
    }

    setEditingRole(null);
    setRoleEditorVisible(false);
  };

  return {
    rolesLoading,
    roleFilter,
    setRoleFilter,
    filteredRoles,
    editingRole,
    roleEditorVisible,
    deletingRole,
    setDeletingRole,
    openRoleEditor,
    closeRoleEditor,
    submitRoleForm,
  };
}
