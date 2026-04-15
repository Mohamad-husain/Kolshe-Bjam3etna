import type { Dispatch, SetStateAction } from 'react';

import {
  useAssignAdminRoleMutation,
  useBlockAdminUserMutation,
  useCreateAdminClubMutation,
  useCreateAdminNewsMutation,
  useCreateAdminOfferMutation,
  useDeleteAdminClubMutation,
  useDeleteAdminNewsMutation,
  useDeleteAdminOfferMutation,
  useDeleteAdminUserMutation,
  useRemoveAdminRoleMutation,
  useRenewAdminClubMutation,
  useUnblockAdminUserMutation,
  useUpdateAdminClubMutation,
  useUpdateAdminNewsMutation,
  useUpdateAdminOfferMutation,
  useUpdateAdminRoleMutation,
  useUpdateAdminUserMutation,
} from '@/hooks/mutations/use-admin-mutations';
import type { useAdminNewsQuery } from '@/hooks/queries/use-admin-queries';
import { adminActionText } from '@/lib/admin/admin-copy';
import { getRoleOption } from '@/lib/admin/admin-config';
import type {
  AdminClubItem,
  AdminClubSummary,
  AdminClubSubscriptionType,
  AdminClubUpsertInput,
  AdminDashboardSummary,
  AdminNewsItem,
  AdminNewsUpsertInput,
  AdminOfferItem,
  AdminOfferUpsertInput,
  AdminRoleAssignInput,
  AdminRoleMember,
  AdminRoleScopeOption,
  AdminRoleSummary,
  AdminRoleUpdateInput,
  AdminToastTone,
  AdminUser,
  AdminUserUpsertInput,
} from '@/types/admin';

import {
  buildRoleMemberFallback,
  createClubFallback,
  createNewsDraftFallback,
  createOfferFallback,
  getClubPriceLabel,
  isLocalDraftNewsId,
  mergeNewsCollection,
  summarizeClubs,
  summarizeRoles,
} from './admin-context-helpers';

type SetState<T> = Dispatch<SetStateAction<T>>;
type AdminNewsQueryControls = Pick<ReturnType<typeof useAdminNewsQuery>, 'refetch'>;

type UseAdminEntityActionsParams = {
  dashboard: AdminDashboardSummary;
  setDashboard: SetState<AdminDashboardSummary>;
  users: AdminUser[];
  setUsers: SetState<AdminUser[]>;
  news: AdminNewsItem[];
  setNews: SetState<AdminNewsItem[]>;
  newsQuery: AdminNewsQueryControls;
  roles: AdminRoleMember[];
  setRoles: SetState<AdminRoleMember[]>;
  roleSummary: AdminRoleSummary[];
  setRoleSummary: SetState<AdminRoleSummary[]>;
  roleScopes: AdminRoleScopeOption[];
  offers: AdminOfferItem[];
  setOffers: SetState<AdminOfferItem[]>;
  clubs: AdminClubItem[];
  setClubs: SetState<AdminClubItem[]>;
  clubSummary: AdminClubSummary;
  setClubSummary: SetState<AdminClubSummary>;
  showToast: (message: string, tone?: AdminToastTone) => void;
};

export function useAdminEntityActions({
  dashboard,
  setDashboard,
  users,
  setUsers,
  news,
  setNews,
  newsQuery,
  roles,
  setRoles,
  roleSummary,
  setRoleSummary,
  roleScopes,
  offers,
  setOffers,
  clubs,
  setClubs,
  clubSummary,
  setClubSummary,
  showToast,
}: UseAdminEntityActionsParams) {
  const updateUserMutation = useUpdateAdminUserMutation();
  const deleteUserMutation = useDeleteAdminUserMutation();
  const blockUserMutation = useBlockAdminUserMutation();
  const unblockUserMutation = useUnblockAdminUserMutation();
  const createNewsMutation = useCreateAdminNewsMutation();
  const updateNewsMutation = useUpdateAdminNewsMutation();
  const deleteNewsMutation = useDeleteAdminNewsMutation();
  const assignRoleMutation = useAssignAdminRoleMutation();
  const updateRoleMutation = useUpdateAdminRoleMutation();
  const removeRoleMutation = useRemoveAdminRoleMutation();
  const createOfferMutation = useCreateAdminOfferMutation();
  const updateOfferMutation = useUpdateAdminOfferMutation();
  const deleteOfferMutation = useDeleteAdminOfferMutation();
  const createClubMutation = useCreateAdminClubMutation();
  const updateClubMutation = useUpdateAdminClubMutation();
  const deleteClubMutation = useDeleteAdminClubMutation();
  const renewClubMutation = useRenewAdminClubMutation();

  const saveUser = async (id: string, input: AdminUserUpsertInput) => {
    const previous = users;
    const nextStatus: AdminUser['status'] = input.isBlocked ? 'blocked' : 'active';
    const next: AdminUser[] = users.map((item) =>
      item.id === id
        ? {
            ...item,
            fullName: input.fullName,
            email: input.email,
            universityId: input.universityId,
            universityName: input.universityName,
            status: nextStatus,
          }
        : item,
    );

    setUsers(next);

    try {
      await updateUserMutation.mutateAsync({ id, input });
      showToast(adminActionText.updateUser, 'info');
    } catch (error) {
      setUsers(previous);
      showToast(error instanceof Error ? error.message : adminActionText.updateUserError, 'error');
    }
  };

  const deleteUser = async (user: AdminUser) => {
    const previous = users;
    const previousDashboard = dashboard;
    setUsers(users.filter((item) => item.id !== user.id));
    setDashboard((current) => ({
      ...current,
      usersCount: Math.max(0, current.usersCount - 1),
    }));

    try {
      await deleteUserMutation.mutateAsync(user.id);
      showToast(adminActionText.deleteUser);
    } catch (error) {
      setUsers(previous);
      setDashboard(previousDashboard);
      showToast(error instanceof Error ? error.message : adminActionText.deleteUserError, 'error');
    }
  };

  const toggleUserBlocked = async (user: AdminUser) => {
    const previous = users;
    const nextStatus = user.status === 'active' ? 'blocked' : 'active';
    setUsers(
      users.map((item) => (item.id === user.id ? { ...item, status: nextStatus } : item)),
    );

    try {
      if (nextStatus === 'blocked') {
        await blockUserMutation.mutateAsync(user.id);
      } else {
        await unblockUserMutation.mutateAsync(user.id);
      }
    } catch (error) {
      setUsers(previous);
      showToast(
        error instanceof Error ? error.message : adminActionText.toggleUserStatusError,
        'error',
      );
    }
  };

  const saveNews = async (item: AdminNewsItem | null, input: AdminNewsUpsertInput) => {
    const previous = news;
    const nextStatus: AdminNewsItem['status'] = input.isPublished ? 'published' : 'draft';
    const syncNewsWithServer = async () => {
      const result = await newsQuery.refetch();

      if (result.data) {
        setNews((current) => mergeNewsCollection(current, result.data));
      }
    };
    const fallbackItem: AdminNewsItem = item
      ? {
          ...item,
          title: input.title,
          content: input.content,
          source: input.source,
          category: input.category,
          imageUrl: input.image?.uri ?? item.imageUrl,
          isImportant: input.isImportant,
          isPublished: input.isPublished,
          status: nextStatus,
        }
      : createNewsDraftFallback(input);

    setNews(
      item
        ? news.map((entry) => (entry.id === item.id ? fallbackItem : entry))
        : [fallbackItem, ...news],
    );

    try {
      if (item) {
        if (isLocalDraftNewsId(item.id)) {
          setNews(previous);
          await syncNewsWithServer();
          showToast(
            adminActionText.syncEditNewsWarning,
            'warning',
          );
          return;
        }

        const remote = await updateNewsMutation.mutateAsync({ id: item.id, input });

        if (remote) {
          setNews((current) =>
            current.map((entry) => (entry.id === item.id ? remote : entry)),
          );
        }

        showToast(adminActionText.updateNews, 'info');
        return;
      }

      const created = await createNewsMutation.mutateAsync(input);

      if (created) {
        setNews((current) =>
          current.map((entry) => (entry.id === fallbackItem.id ? created : entry)),
        );
      } else {
        setNews(previous);
        await syncNewsWithServer();
      }

      showToast(
        input.isPublished
          ? adminActionText.publishNewsSuccess
          : adminActionText.saveNewsDraft,
        input.isPublished ? 'success' : 'warning',
      );
    } catch (error) {
      setNews(previous);
      showToast(error instanceof Error ? error.message : adminActionText.saveNewsError, 'error');
    }
  };

  const deleteNews = async (item: AdminNewsItem) => {
    if (isLocalDraftNewsId(item.id)) {
      const result = await newsQuery.refetch();

      if (result.data) {
        setNews((current) => mergeNewsCollection(current, result.data));
      }

      showToast(
        adminActionText.syncDeleteNewsWarning,
        'warning',
      );
      return;
    }

    const previous = news;
    setNews(news.filter((entry) => entry.id !== item.id));

    try {
      await deleteNewsMutation.mutateAsync(item.id);
      showToast(adminActionText.deleteNews, 'warning');
    } catch (error) {
      setNews(previous);
      showToast(error instanceof Error ? error.message : adminActionText.deleteNewsError, 'error');
    }
  };

  const saveRole = async (
    member: AdminRoleMember | null,
    input: AdminRoleAssignInput | AdminRoleUpdateInput,
  ) => {
    const previous = roles;
    const previousSummary = roleSummary;
    const fallbackMember = buildRoleMemberFallback(input, roleScopes);

    const nextRoles = member
      ? roles.map((entry) =>
          entry.id === member.id
            ? {
                ...entry,
                role: fallbackMember.role,
                scopeId: fallbackMember.scopeId,
                scopeName: fallbackMember.scopeName,
                permissions: getRoleOption(fallbackMember.role).permissions,
              }
            : entry,
        )
      : [fallbackMember, ...roles];

    setRoles(nextRoles);
    setRoleSummary(summarizeRoles(nextRoles));

    try {
      if (member) {
        await updateRoleMutation.mutateAsync({
          email: input.email,
          newRole: (input as AdminRoleUpdateInput).newRole,
          scopeId: input.scopeId,
        });
        showToast(adminActionText.updateRole, 'info');
      } else {
        await assignRoleMutation.mutateAsync(input as AdminRoleAssignInput);
        showToast(adminActionText.createRole);
      }
    } catch (error) {
      setRoles(previous);
      setRoleSummary(previousSummary);
      showToast(error instanceof Error ? error.message : adminActionText.saveRoleError, 'error');
    }
  };

  const deleteRole = async (member: AdminRoleMember) => {
    const previous = roles;
    const nextRoles = roles.filter((entry) => entry.id !== member.id);
    setRoles(nextRoles);
    setRoleSummary(summarizeRoles(nextRoles));

    try {
      await removeRoleMutation.mutateAsync({ email: member.email, role: member.role });
      showToast(adminActionText.deleteRole, 'warning');
    } catch (error) {
      setRoles(previous);
      showToast(error instanceof Error ? error.message : adminActionText.deleteRoleError, 'error');
    }
  };

  const saveOffer = async (offer: AdminOfferItem | null, input: AdminOfferUpsertInput) => {
    const previous = offers;
    const fallbackOffer = offer
      ? {
          ...offer,
          imageUrl: input.image?.uri ?? offer.imageUrl,
          partnerName: input.partnerName,
          type: input.type,
          category: input.category,
          title: input.title,
          description: input.description,
          location: input.location,
          phone: input.phone,
          email: input.email,
          expireDateUtc: input.expireDateUtc,
          discountPercent: input.discountPercent,
          showOnHomePage: input.showOnHomePage,
          isVerified: input.isVerified ?? offer.isVerified,
        }
      : createOfferFallback(input);

    setOffers(
      offer
        ? offers.map((entry) => (entry.id === offer.id ? fallbackOffer : entry))
        : [fallbackOffer, ...offers],
    );

    try {
      if (offer) {
        const updated = await updateOfferMutation.mutateAsync({ id: offer.id, input });

        if (updated) {
          setOffers((current) =>
            current.map((entry) => (entry.id === offer.id ? updated : entry)),
          );
        }

        showToast(adminActionText.updateOffer, 'info');
      } else {
        const created = await createOfferMutation.mutateAsync(input);

        if (created) {
          setOffers((current) =>
            current.map((entry) => (entry.id === fallbackOffer.id ? created : entry)),
          );
        }

        showToast(adminActionText.createOffer);
      }
    } catch (error) {
      setOffers(previous);
      showToast(error instanceof Error ? error.message : adminActionText.saveOfferError, 'error');
    }
  };

  const deleteOffer = async (offer: AdminOfferItem) => {
    const previous = offers;
    setOffers(offers.filter((entry) => entry.id !== offer.id));

    try {
      await deleteOfferMutation.mutateAsync(offer.id);
      showToast(adminActionText.deleteOffer, 'warning');
    } catch (error) {
      setOffers(previous);
      showToast(error instanceof Error ? error.message : adminActionText.deleteOfferError, 'error');
    }
  };

  const saveClub = async (club: AdminClubItem | null, input: AdminClubUpsertInput) => {
    const previous = clubs;
    const previousSummary = clubSummary;
    const fallbackClub = club
      ? {
          ...club,
          name: input.name,
          universityName: input.universityName,
          managerName: input.managerName,
          managerEmail: input.managerEmail,
          subscriptionType: input.subscriptionType,
          priceLabel: getClubPriceLabel(input.subscriptionType),
        }
      : createClubFallback(input);

    const nextClubs = club
      ? clubs.map((entry) => (entry.id === club.id ? fallbackClub : entry))
      : [fallbackClub, ...clubs];

    setClubs(nextClubs);
    setClubSummary(summarizeClubs(nextClubs));

    try {
      if (club) {
        const updated = await updateClubMutation.mutateAsync({ id: club.id, input });

        if (updated) {
          setClubs((current) =>
            current.map((entry) => (entry.id === club.id ? updated : entry)),
          );
        }

        showToast(adminActionText.updateClub, 'success');
      } else {
        const created = await createClubMutation.mutateAsync(input);

        if (created) {
          setClubs((current) =>
            current.map((entry) => (entry.id === fallbackClub.id ? created : entry)),
          );
        }

        showToast(adminActionText.createClub);
      }
    } catch (error) {
      setClubs(previous);
      setClubSummary(previousSummary);
      showToast(error instanceof Error ? error.message : adminActionText.saveClubError, 'error');
    }
  };

  const deleteClub = async (club: AdminClubItem) => {
    const previous = clubs;
    const previousSummary = clubSummary;
    const nextClubs = clubs.filter((entry) => entry.id !== club.id);
    setClubs(nextClubs);
    setClubSummary(summarizeClubs(nextClubs));

    try {
      await deleteClubMutation.mutateAsync(club.id);
      showToast(adminActionText.deleteClub, 'success');
    } catch (error) {
      setClubs(previous);
      setClubSummary(previousSummary);
      showToast(error instanceof Error ? error.message : adminActionText.deleteClubError, 'error');
    }
  };

  const renewClub = async (
    club: AdminClubItem,
    subscriptionType: AdminClubSubscriptionType,
  ) => {
    const previous = clubs;
    const currentDate = new Date(club.expiresAt);
    const baseDate = Number.isNaN(currentDate.getTime()) ? new Date() : currentDate;
    const nextDate = new Date(baseDate.getTime());

    if (subscriptionType === 'monthly') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    } else {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    }

    const nextClubs: AdminClubItem[] = clubs.map((entry) =>
      entry.id === club.id
        ? {
            ...entry,
            subscriptionType,
            expiresAt: nextDate.toISOString().slice(0, 10),
            status: 'active' as const,
            priceLabel: getClubPriceLabel(subscriptionType),
          }
        : entry,
    );

    setClubs(nextClubs);
    setClubSummary(summarizeClubs(nextClubs));

    try {
      await renewClubMutation.mutateAsync({ id: club.id, subscriptionType });
      showToast(adminActionText.renewClub(club.name), 'success');
    } catch (error) {
      setClubs(previous);
      showToast(error instanceof Error ? error.message : adminActionText.renewClubError, 'error');
    }
  };

  return {
    saveUser,
    deleteUser,
    toggleUserBlocked,
    saveNews,
    deleteNews,
    saveRole,
    deleteRole,
    saveOffer,
    deleteOffer,
    saveClub,
    deleteClub,
    renewClub,
  };
}
