import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

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
import {
  useAdminRoleSummaryQuery,
  useAdminClubSummaryQuery,
  useAdminClubsQuery,
  useAdminDashboardQuery,
  useAdminNewsQuery,
  useAdminOffersQuery,
  useAdminRoleOptionsQuery,
  useAdminRolesQuery,
  useAdminRoleScopesQuery,
  useAdminUsersQuery,
} from '@/hooks/queries/use-admin-queries';
import { useUniversitiesQuery } from '@/hooks/queries/use-auth-queries';
import { adminRoleOptions, getRoleOption } from '@/lib/admin/admin-config';
import { useAdminTheme } from '@/lib/admin/admin-theme';
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
  AdminRoleOption,
  AdminRoleSummary,
  AdminRoleScopeOption,
  AdminRoleUpdateInput,
  AdminSection,
  AdminToast,
  AdminToastTone,
  AdminUser,
  AdminUserUpsertInput,
} from '@/types/admin';

type AdminContextValue = {
  theme: ReturnType<typeof useAdminTheme>;
  activeSection: AdminSection;
  setActiveSection: (section: AdminSection) => void;
  toast: AdminToast | null;
  showToast: (message: string, tone?: AdminToastTone) => void;
  clearToast: () => void;
  dashboard: AdminDashboardSummary;
  users: AdminUser[];
  news: AdminNewsItem[];
  roles: AdminRoleMember[];
  roleOptions: AdminRoleOption[];
  roleSummary: AdminRoleSummary[];
  roleScopes: AdminRoleScopeOption[];
  offers: AdminOfferItem[];
  clubs: AdminClubItem[];
  clubSummary: AdminClubSummary;
  universities: Awaited<ReturnType<typeof useUniversitiesQuery>>['data'];
  loading: {
    dashboard: boolean;
    users: boolean;
    news: boolean;
    roles: boolean;
    offers: boolean;
    clubs: boolean;
  };
  saveUser: (id: string, input: AdminUserUpsertInput) => Promise<void>;
  deleteUser: (user: AdminUser) => Promise<void>;
  toggleUserBlocked: (user: AdminUser) => Promise<void>;
  saveNews: (news: AdminNewsItem | null, input: AdminNewsUpsertInput) => Promise<void>;
  deleteNews: (news: AdminNewsItem) => Promise<void>;
  saveRole: (member: AdminRoleMember | null, input: AdminRoleAssignInput | AdminRoleUpdateInput) => Promise<void>;
  deleteRole: (member: AdminRoleMember) => Promise<void>;
  saveOffer: (offer: AdminOfferItem | null, input: AdminOfferUpsertInput) => Promise<void>;
  deleteOffer: (offer: AdminOfferItem) => Promise<void>;
  saveClub: (club: AdminClubItem | null, input: AdminClubUpsertInput) => Promise<void>;
  deleteClub: (club: AdminClubItem) => Promise<void>;
  renewClub: (club: AdminClubItem, subscriptionType: AdminClubSubscriptionType) => Promise<void>;
};

const AdminContext = createContext<AdminContextValue | null>(null);

const emptyDashboardSummary: AdminDashboardSummary = {
  usersCount: 0,
  adsCount: 0,
  messagesCount: 0,
  usersGrowth: 0,
  adsGrowth: 0,
  messagesGrowth: 0,
  activityWindowLabel: '',
  activityPoints: [],
};

const emptyClubSummary: AdminClubSummary = {
  active: 0,
  expiring: 0,
  expired: 0,
};

function summarizeRoles(members: AdminRoleMember[]): AdminRoleSummary[] {
  return adminRoleOptions.map((option) => ({
    role: option.value,
    count: members.filter((item) => item.role === option.value).length,
  }));
}

function summarizeClubs(clubs: AdminClubItem[]): AdminClubSummary {
  return {
    active: clubs.filter((item) => item.status === 'active').length,
    expiring: clubs.filter((item) => item.status === 'expiring').length,
    expired: clubs.filter((item) => item.status === 'expired').length,
  };
}

function createToast(message: string, tone: AdminToastTone = 'success'): AdminToast {
  return {
    id: `${Date.now()}`,
    message,
    tone,
  };
}

function createNewsDraftFallback(input: AdminNewsUpsertInput) {
  return {
    id: `draft-${Date.now()}`,
    title: input.title,
    content: input.content,
    source: input.source,
    category: input.category,
    imageUrl: input.image?.uri ?? null,
    isImportant: input.isImportant,
    isPublished: input.isPublished,
    viewsCount: 0,
    createdAt: new Date().toISOString(),
    createdAtLabel: new Date().toISOString().slice(0, 10),
    status: input.isPublished ? 'published' : 'draft',
  } satisfies AdminNewsItem;
}

function createOfferFallback(input: AdminOfferUpsertInput) {
  return {
    id: `offer-${Date.now()}`,
    imageUrl: input.image?.uri ?? null,
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
    isVerified: input.isVerified ?? true,
    viewsCount: 0,
    rating: 0,
    ratingsCount: 0,
  } satisfies AdminOfferItem;
}

function getClubPriceLabel(type: AdminClubSubscriptionType) {
  return type === 'monthly' ? '15 د.ا' : '120 د.ا';
}

function buildRoleMemberFallback(
  input: AdminRoleAssignInput | AdminRoleUpdateInput,
  roleScopes: AdminRoleScopeOption[],
) {
  const fullName = 'fullName' in input ? input.fullName : 'عضو جديد';
  const role = 'newRole' in input ? input.newRole : input.role;
  const option = getRoleOption(role);

  return {
    id: `${input.email}-${role}-${input.scopeId ?? 'global'}`,
    fullName,
    email: input.email,
    role,
    scopeId: input.scopeId,
    scopeName:
      input.scopeId !== null
        ? roleScopes.find((item) => item.id === input.scopeId)?.name ?? null
        : null,
    permissions: option.permissions,
    addedAt: new Date().toISOString().slice(0, 10),
    addedBy: 'لوحة الإدارة',
    avatarInitial: fullName.slice(0, 1) || 'ع',
    avatarColor: option.color,
  } satisfies AdminRoleMember;
}

function getNextClubStatus(subscriptionType: AdminClubSubscriptionType) {
  return subscriptionType === 'monthly' ? 'expiring' : 'active';
}

function createClubFallback(input: AdminClubUpsertInput) {
  return {
    id: `club-${Date.now()}`,
    name: input.name,
    universityName: input.universityName,
    managerName: input.managerName,
    managerEmail: input.managerEmail,
    subscriptionType: input.subscriptionType,
    status: getNextClubStatus(input.subscriptionType),
    startedAt: new Date().toISOString().slice(0, 10),
    expiresAt:
      input.subscriptionType === 'monthly'
        ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10)
        : new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString().slice(0, 10),
    priceLabel: getClubPriceLabel(input.subscriptionType),
    avatarInitial: input.name.slice(0, 1) || 'ن',
    avatarColor: '#2f67ea',
  } satisfies AdminClubItem;
}

function mergeNewsCollection(current: AdminNewsItem[], incoming: AdminNewsItem[]) {
  const incomingIds = new Set(incoming.map((item) => item.id));
  const localOnly = current.filter((item) => !incomingIds.has(item.id));

  return [...localOnly, ...incoming];
}

export function AdminProvider({ children }: PropsWithChildren) {
  const theme = useAdminTheme();
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [toast, setToast] = useState<AdminToast | null>(null);

  const dashboardQuery = useAdminDashboardQuery();
  const usersQuery = useAdminUsersQuery();
  const newsQuery = useAdminNewsQuery();
  const rolesQuery = useAdminRolesQuery();
  const roleSummaryQuery = useAdminRoleSummaryQuery();
  const roleOptionsQuery = useAdminRoleOptionsQuery();
  const roleScopesQuery = useAdminRoleScopesQuery();
  const offersQuery = useAdminOffersQuery();
  const clubsQuery = useAdminClubsQuery();
  const clubSummaryQuery = useAdminClubSummaryQuery();
  const universitiesQuery = useUniversitiesQuery();

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

  const [dashboard, setDashboard] = useState<AdminDashboardSummary>(emptyDashboardSummary);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [news, setNews] = useState<AdminNewsItem[]>([]);
  const [roles, setRoles] = useState<AdminRoleMember[]>([]);
  const [roleSummary, setRoleSummary] = useState<AdminRoleSummary[]>(() => summarizeRoles([]));
  const [offers, setOffers] = useState<AdminOfferItem[]>([]);
  const [clubs, setClubs] = useState<AdminClubItem[]>([]);
  const [clubSummary, setClubSummary] = useState<AdminClubSummary>(emptyClubSummary);

  useEffect(() => {
    if (dashboardQuery.data) {
      setDashboard(dashboardQuery.data);
    }
  }, [dashboardQuery.data]);

  useEffect(() => {
    if (usersQuery.data) {
      setUsers(usersQuery.data);
    }
  }, [usersQuery.data]);

  useEffect(() => {
    if (newsQuery.data) {
      setNews((current) => mergeNewsCollection(current, newsQuery.data));
    }
  }, [newsQuery.data]);

  useEffect(() => {
    if (rolesQuery.data) {
      setRoles(rolesQuery.data);
      if (!roleSummaryQuery.data) {
        setRoleSummary(summarizeRoles(rolesQuery.data));
      }
    }
  }, [roleSummaryQuery.data, rolesQuery.data]);

  useEffect(() => {
    if (roleSummaryQuery.data) {
      setRoleSummary(roleSummaryQuery.data);
    }
  }, [roleSummaryQuery.data]);

  useEffect(() => {
    if (offersQuery.data) {
      setOffers(offersQuery.data);
    }
  }, [offersQuery.data]);

  useEffect(() => {
    if (clubsQuery.data) {
      setClubs(clubsQuery.data);
      if (!clubSummaryQuery.data) {
        setClubSummary(summarizeClubs(clubsQuery.data));
      }
    }
  }, [clubSummaryQuery.data, clubsQuery.data]);

  useEffect(() => {
    if (clubSummaryQuery.data) {
      setClubSummary(clubSummaryQuery.data);
    }
  }, [clubSummaryQuery.data]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = setTimeout(() => {
      setToast(null);
    }, 2800);

    return () => clearTimeout(timer);
  }, [toast]);

  const roleOptions = useMemo(
    () =>
      Array.isArray(roleOptionsQuery.data) && roleOptionsQuery.data.length
        ? roleOptionsQuery.data
        : adminRoleOptions,
    [roleOptionsQuery.data],
  );

  const roleScopes = useMemo(
    () =>
      Array.isArray(roleScopesQuery.data) && roleScopesQuery.data.length
        ? roleScopesQuery.data
        : [],
    [roleScopesQuery.data],
  );

  const showToast = (message: string, tone: AdminToastTone = 'success') => {
    setToast(createToast(message, tone));
  };

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
      showToast('تم تحديث بيانات المستخدم', 'info');
    } catch (error) {
      setUsers(previous);
      showToast(error instanceof Error ? error.message : 'تعذر تحديث المستخدم', 'error');
    }
  };

  const deleteUser = async (user: AdminUser) => {
    const previous = users;
    const previousDashboard = dashboard;
    setUsers(users.filter((item) => item.id !== user.id));
    setDashboard((current) => ({ ...current, usersCount: Math.max(0, current.usersCount - 1) }));

    try {
      await deleteUserMutation.mutateAsync(user.id);
      showToast('تم حذف المستخدم');
    } catch (error) {
      setUsers(previous);
      setDashboard(previousDashboard);
      showToast(error instanceof Error ? error.message : 'تعذر حذف المستخدم', 'error');
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
      showToast(error instanceof Error ? error.message : 'تعذر تعديل حالة المستخدم', 'error');
    }
  };

  const saveNews = async (item: AdminNewsItem | null, input: AdminNewsUpsertInput) => {
    const previous = news;
    const nextStatus: AdminNewsItem['status'] = input.isPublished ? 'published' : 'draft';
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

    setNews(item ? news.map((entry) => (entry.id === item.id ? fallbackItem : entry)) : [fallbackItem, ...news]);

    try {
      if (item) {
        const remote = await updateNewsMutation.mutateAsync({ id: item.id, input });

        if (remote) {
          setNews((current) => current.map((entry) => (entry.id === item.id ? remote : entry)));
        }

        showToast('تم تحديث الخبر', 'info');
        return;
      }

      const created = await createNewsMutation.mutateAsync(input);

      if (created) {
        setNews((current) => current.map((entry) => (entry.id === fallbackItem.id ? created : entry)));
      }

      showToast(input.isPublished ? 'تم نشر الخبر بنجاح' : 'تم حفظ الخبر كمسودة', input.isPublished ? 'success' : 'warning');
    } catch (error) {
      setNews(previous);
      showToast(error instanceof Error ? error.message : 'تعذر حفظ الخبر', 'error');
    }
  };

  const deleteNews = async (item: AdminNewsItem) => {
    const previous = news;
    setNews(news.filter((entry) => entry.id !== item.id));

    try {
      await deleteNewsMutation.mutateAsync(item.id);
      showToast('تم حذف الخبر', 'warning');
    } catch (error) {
      setNews(previous);
      showToast(error instanceof Error ? error.message : 'تعذر حذف الخبر', 'error');
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
        showToast('تم تحديث الدور', 'info');
      } else {
        await assignRoleMutation.mutateAsync(input as AdminRoleAssignInput);
        showToast('تمت إضافة الدور');
      }
    } catch (error) {
      setRoles(previous);
      setRoleSummary(previousSummary);
      showToast(error instanceof Error ? error.message : 'تعذر حفظ الدور', 'error');
    }
  };

  const deleteRole = async (member: AdminRoleMember) => {
    const previous = roles;
    const nextRoles = roles.filter((entry) => entry.id !== member.id);
    setRoles(nextRoles);
    setRoleSummary(summarizeRoles(nextRoles));

    try {
      await removeRoleMutation.mutateAsync({ email: member.email, role: member.role });
      showToast('تم إلغاء الدور', 'warning');
    } catch (error) {
      setRoles(previous);
      showToast(error instanceof Error ? error.message : 'تعذر إلغاء الدور', 'error');
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
          setOffers((current) => current.map((entry) => (entry.id === offer.id ? updated : entry)));
        }

        showToast('تم تحديث العرض بنجاح', 'info');
      } else {
        const created = await createOfferMutation.mutateAsync(input);

        if (created) {
          setOffers((current) => current.map((entry) => (entry.id === fallbackOffer.id ? created : entry)));
        }

        showToast('تمت إضافة العرض بنجاح');
      }
    } catch (error) {
      setOffers(previous);
      showToast(error instanceof Error ? error.message : 'تعذر حفظ العرض', 'error');
    }
  };

  const deleteOffer = async (offer: AdminOfferItem) => {
    const previous = offers;
    setOffers(offers.filter((entry) => entry.id !== offer.id));

    try {
      await deleteOfferMutation.mutateAsync(offer.id);
      showToast('تم حذف العرض', 'warning');
    } catch (error) {
      setOffers(previous);
      showToast(error instanceof Error ? error.message : 'تعذر حذف العرض', 'error');
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
          setClubs((current) => current.map((entry) => (entry.id === club.id ? updated : entry)));
        }

        showToast('تم تحديث بيانات النادي', 'success');
      } else {
        const created = await createClubMutation.mutateAsync(input);

        if (created) {
          setClubs((current) => current.map((entry) => (entry.id === fallbackClub.id ? created : entry)));
        }

        showToast('تمت إضافة النادي');
      }
    } catch (error) {
      setClubs(previous);
      setClubSummary(previousSummary);
      showToast(error instanceof Error ? error.message : 'تعذر حفظ النادي', 'error');
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
      showToast('تم حذف النادي', 'success');
    } catch (error) {
      setClubs(previous);
      setClubSummary(previousSummary);
      showToast(error instanceof Error ? error.message : 'تعذر حذف النادي', 'error');
    }
  };

  const renewClub = async (club: AdminClubItem, subscriptionType: AdminClubSubscriptionType) => {
    const previous = clubs;
    const currentDate = new Date(club.expiresAt);
    const baseDate = Number.isNaN(currentDate.getTime()) ? new Date() : currentDate;
    const nextDate = new Date(baseDate.getTime());

    if (subscriptionType === 'monthly') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    } else {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    }

    const nextClubs = clubs.map((entry) =>
      entry.id === club.id
        ? {
            ...entry,
            subscriptionType,
            expiresAt: nextDate.toISOString().slice(0, 10),
            status: 'active',
            priceLabel: getClubPriceLabel(subscriptionType),
          }
        : entry,
    );

    setClubs(nextClubs);
    setClubSummary(summarizeClubs(nextClubs));

    try {
      await renewClubMutation.mutateAsync({ id: club.id, subscriptionType });
      showToast(`تم تجديد اشتراك ${club.name}`, 'success');
    } catch (error) {
      setClubs(previous);
      showToast(error instanceof Error ? error.message : 'تعذر تجديد الاشتراك', 'error');
    }
  };

  const value: AdminContextValue = {
    theme,
    activeSection,
    setActiveSection,
    toast,
    showToast,
    clearToast: () => setToast(null),
    dashboard,
    users,
    news,
    roles,
    roleOptions,
    roleSummary,
    roleScopes,
    offers,
    clubs,
    clubSummary,
    universities: universitiesQuery.data,
    loading: {
      dashboard: dashboardQuery.isLoading,
      users: usersQuery.isLoading,
      news: newsQuery.isLoading,
      roles: rolesQuery.isLoading || roleSummaryQuery.isLoading,
      offers: offersQuery.isLoading,
      clubs: clubsQuery.isLoading || clubSummaryQuery.isLoading,
    },
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

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);

  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }

  return context;
}

export function useAdminRoleSummary() {
  const { roles, roleSummary } = useAdmin();

  return useMemo(() => (roles.length ? summarizeRoles(roles) : roleSummary), [roleSummary, roles]);
}

export function useAdminClubSummary() {
  const { clubs, clubSummary } = useAdmin();

  return useMemo(() => (clubs.length ? summarizeClubs(clubs) : clubSummary), [clubSummary, clubs]);
}
