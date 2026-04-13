import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import {
  createAdminClub,
  deleteAdminClub,
  renewAdminClub,
  updateAdminClub,
} from '@/services/admin/admin-clubs-api';
import { createAdminNews, deleteAdminNews, updateAdminNews } from '@/services/admin/admin-news-api';
import { createAdminOffer, deleteAdminOffer, updateAdminOffer } from '@/services/admin/admin-offers-api';
import { assignAdminRole, removeAdminRole, updateAdminRole } from '@/services/admin/admin-roles-api';
import {
  blockAdminUser,
  deleteAdminUser,
  unblockAdminUser,
  updateAdminUser,
} from '@/services/admin/admin-users-api';

function useAdminInvalidation() {
  const queryClient = useQueryClient();

  return async (...keys: readonly (readonly unknown[])[]) => {
    await Promise.all(keys.map((key) => queryClient.invalidateQueries({ queryKey: key })));
  };
}

export function useUpdateAdminUserMutation() {
  const invalidate = useAdminInvalidation();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof updateAdminUser>[1] }) =>
      updateAdminUser(id, input),
    onSuccess: () => invalidate(queryKeys.admin.users),
  });
}

export function useDeleteAdminUserMutation() {
  const invalidate = useAdminInvalidation();

  return useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => invalidate(queryKeys.admin.users, queryKeys.admin.dashboard),
  });
}

export function useBlockAdminUserMutation() {
  const invalidate = useAdminInvalidation();

  return useMutation({
    mutationFn: blockAdminUser,
    onSuccess: () => invalidate(queryKeys.admin.users),
  });
}

export function useUnblockAdminUserMutation() {
  const invalidate = useAdminInvalidation();

  return useMutation({
    mutationFn: unblockAdminUser,
    onSuccess: () => invalidate(queryKeys.admin.users),
  });
}

export function useCreateAdminNewsMutation() {
  const invalidate = useAdminInvalidation();

  return useMutation({
    mutationFn: createAdminNews,
    onSuccess: () => invalidate(queryKeys.admin.news, queryKeys.admin.dashboard),
  });
}

export function useUpdateAdminNewsMutation() {
  const invalidate = useAdminInvalidation();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof updateAdminNews>[1] }) =>
      updateAdminNews(id, input),
    onSuccess: () => invalidate(queryKeys.admin.news),
  });
}

export function useDeleteAdminNewsMutation() {
  const invalidate = useAdminInvalidation();

  return useMutation({
    mutationFn: deleteAdminNews,
    onSuccess: () => invalidate(queryKeys.admin.news, queryKeys.admin.dashboard),
  });
}

export function useAssignAdminRoleMutation() {
  const invalidate = useAdminInvalidation();

  return useMutation({
    mutationFn: assignAdminRole,
    onSuccess: () =>
      invalidate(
        queryKeys.admin.roles,
        queryKeys.admin.roleSummary,
        queryKeys.admin.roleScopes,
      ),
  });
}

export function useUpdateAdminRoleMutation() {
  const invalidate = useAdminInvalidation();

  return useMutation({
    mutationFn: updateAdminRole,
    onSuccess: () =>
      invalidate(
        queryKeys.admin.roles,
        queryKeys.admin.roleSummary,
        queryKeys.admin.roleScopes,
      ),
  });
}

export function useRemoveAdminRoleMutation() {
  const invalidate = useAdminInvalidation();

  return useMutation({
    mutationFn: ({ email, role }: { email: string; role: Parameters<typeof removeAdminRole>[1] }) =>
      removeAdminRole(email, role),
    onSuccess: () => invalidate(queryKeys.admin.roles, queryKeys.admin.roleSummary),
  });
}

export function useCreateAdminOfferMutation() {
  const invalidate = useAdminInvalidation();

  return useMutation({
    mutationFn: createAdminOffer,
    onSuccess: () => invalidate(queryKeys.admin.offers, queryKeys.admin.dashboard),
  });
}

export function useUpdateAdminOfferMutation() {
  const invalidate = useAdminInvalidation();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof updateAdminOffer>[1] }) =>
      updateAdminOffer(id, input),
    onSuccess: () => invalidate(queryKeys.admin.offers, queryKeys.admin.dashboard),
  });
}

export function useDeleteAdminOfferMutation() {
  const invalidate = useAdminInvalidation();

  return useMutation({
    mutationFn: deleteAdminOffer,
    onSuccess: () => invalidate(queryKeys.admin.offers, queryKeys.admin.dashboard),
  });
}

export function useCreateAdminClubMutation() {
  const invalidate = useAdminInvalidation();

  return useMutation({
    mutationFn: createAdminClub,
    onSuccess: () =>
      invalidate(queryKeys.admin.clubs, queryKeys.admin.clubSummary, queryKeys.admin.dashboard),
  });
}

export function useUpdateAdminClubMutation() {
  const invalidate = useAdminInvalidation();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof updateAdminClub>[1] }) =>
      updateAdminClub(id, input),
    onSuccess: () =>
      invalidate(queryKeys.admin.clubs, queryKeys.admin.clubSummary, queryKeys.admin.dashboard),
  });
}

export function useDeleteAdminClubMutation() {
  const invalidate = useAdminInvalidation();

  return useMutation({
    mutationFn: deleteAdminClub,
    onSuccess: () =>
      invalidate(queryKeys.admin.clubs, queryKeys.admin.clubSummary, queryKeys.admin.dashboard),
  });
}

export function useRenewAdminClubMutation() {
  const invalidate = useAdminInvalidation();

  return useMutation({
    mutationFn: ({ id, subscriptionType }: { id: string; subscriptionType: Parameters<typeof renewAdminClub>[1] }) =>
      renewAdminClub(id, subscriptionType),
    onSuccess: () =>
      invalidate(queryKeys.admin.clubs, queryKeys.admin.clubSummary, queryKeys.admin.dashboard),
  });
}
