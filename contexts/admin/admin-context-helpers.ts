import { adminAccessText, adminCopy } from '@/lib/admin/admin-copy';
import { adminRoleOptions, getRoleOption } from '@/lib/admin/admin-config';
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
  AdminToast,
  AdminToastTone,
} from '@/types/admin';

export const emptyDashboardSummary: AdminDashboardSummary = {
  usersCount: 0,
  adsCount: 0,
  messagesCount: 0,
  usersGrowth: 0,
  adsGrowth: 0,
  messagesGrowth: 0,
  activityWindowLabel: '',
  activityPoints: [],
};

export const emptyClubSummary: AdminClubSummary = {
  active: 0,
  expiring: 0,
  expired: 0,
};

export function summarizeRoles(members: AdminRoleMember[]): AdminRoleSummary[] {
  return adminRoleOptions.map((option) => ({
    role: option.value,
    count: members.filter((item) => item.role === option.value).length,
  }));
}

export function summarizeClubs(clubs: AdminClubItem[]): AdminClubSummary {
  return {
    active: clubs.filter((item) => item.status === 'active').length,
    expiring: clubs.filter((item) => item.status === 'expiring').length,
    expired: clubs.filter((item) => item.status === 'expired').length,
  };
}

export function buildRoleScopesFromClubs(clubs: AdminClubItem[]): AdminRoleScopeOption[] {
  return clubs
    .map((club, index) => {
      const numericId = Number(club.id);

      return {
        id: Number.isFinite(numericId) && numericId > 0 ? numericId : index + 1,
        name: club.name,
      };
    })
    .filter(
      (item, index, collection) =>
        collection.findIndex((entry) => entry.id === item.id) === index,
    );
}

export function createToast(
  message: string,
  tone: AdminToastTone = 'success',
): AdminToast {
  return {
    id: `${Date.now()}`,
    message,
    tone,
  };
}

export function isAdminAccessDeniedMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.message.includes(
    adminAccessText.noAccessError,
  );
}

export function createNewsDraftFallback(input: AdminNewsUpsertInput) {
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

export function isLocalDraftNewsId(id: string) {
  return id.startsWith('draft-');
}

export function createOfferFallback(input: AdminOfferUpsertInput) {
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

export function getClubPriceLabel(type: AdminClubSubscriptionType) {
  return type === 'monthly' ? adminCopy.priceMonthly : adminCopy.priceYearly;
}

export function buildRoleMemberFallback(
  input: AdminRoleAssignInput | AdminRoleUpdateInput,
  roleScopes: AdminRoleScopeOption[],
) {
  const derivedName =
    input.email.split('@')[0]?.trim().replace(/[._-]+/g, ' ') || 'New member';
  const fullName =
    'fullName' in input && typeof input.fullName === 'string' && input.fullName.trim().length
      ? input.fullName.trim()
      : derivedName;
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
    addedBy: adminAccessText.panelLabel,
    avatarInitial: fullName.slice(0, 1) || adminCopy.adminAvatarFallback,
    avatarColor: option.color,
  } satisfies AdminRoleMember;
}

function getNextClubStatus(subscriptionType: AdminClubSubscriptionType) {
  return subscriptionType === 'monthly' ? 'expiring' : 'active';
}

export function createClubFallback(input: AdminClubUpsertInput) {
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
    avatarInitial: input.name.slice(0, 1) || adminCopy.clubAvatarFallback,
    avatarColor: '#2f67ea',
  } satisfies AdminClubItem;
}

export function mergeNewsCollection(
  current: AdminNewsItem[],
  incoming: AdminNewsItem[],
) {
  const incomingIds = new Set(incoming.map((item) => item.id));
  const localOnly = current.filter(
    (item) => !incomingIds.has(item.id) && !isLocalDraftNewsId(item.id),
  );

  return [...localOnly, ...incoming];
}
