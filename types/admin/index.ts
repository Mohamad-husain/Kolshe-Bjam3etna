export type AdminSection = 'overview' | 'users' | 'news' | 'roles' | 'offers' | 'clubs';

export type AdminToastTone = 'success' | 'error' | 'info' | 'warning';

export type AdminToast = {
  id: string;
  message: string;
  tone: AdminToastTone;
};

export type AdminMetricPoint = {
  label: string;
  value: number;
};

export type AdminDashboardSummary = {
  usersCount: number;
  adsCount: number;
  messagesCount: number;
  usersGrowth: number;
  adsGrowth: number;
  messagesGrowth: number;
  activityWindowLabel: string;
  activityPoints: AdminMetricPoint[];
};

export type AdminUserStatus = 'active' | 'blocked';

export type AdminUser = {
  id: string;
  fullName: string;
  email: string;
  universityId: number | null;
  universityName: string;
  postsCount: number;
  status: AdminUserStatus;
  joinedAt: string;
  avatarInitial: string;
  avatarColor: string;
};

export type AdminUserUpsertInput = {
  fullName: string;
  email: string;
  universityId: number | null;
  universityName: string;
  isBlocked: boolean;
};

export type AdminNewsStatus = 'published' | 'draft';

export type AdminFileInput = {
  uri: string;
  name?: string | null;
  type?: string | null;
  file?: File;
};

export type AdminNewsItem = {
  id: string;
  title: string;
  content: string;
  source: string;
  category: string;
  imageUrl: string | null;
  isImportant: boolean;
  isPublished: boolean;
  viewsCount: number;
  createdAt: string;
  createdAtLabel: string;
  status: AdminNewsStatus;
};

export type AdminNewsUpsertInput = {
  title: string;
  content: string;
  source: string;
  category: string;
  image: AdminFileInput | null;
  isImportant: boolean;
  isPublished: boolean;
};

export type AdminRoleValue = 'admin' | 'superAdmin' | 'eventOwner';

export type AdminRoleSummary = {
  role: AdminRoleValue;
  count: number;
};

export type AdminRoleOption = {
  value: AdminRoleValue;
  label: string;
  description: string;
  color: string;
  permissions: string[];
  requiresScope: boolean;
  scopeLabel?: string;
};

export type AdminRoleScopeOption = {
  id: number;
  name: string;
};

export type AdminRoleMember = {
  id: string;
  fullName: string;
  email: string;
  role: AdminRoleValue;
  scopeId: number | null;
  scopeName: string | null;
  permissions: string[];
  addedAt: string;
  addedBy: string;
  avatarInitial: string;
  avatarColor: string;
};

export type AdminRoleAssignInput = {
  email: string;
  fullName?: string;
  role: AdminRoleValue;
  scopeId: number | null;
};

export type AdminRoleUpdateInput = {
  email: string;
  newRole: AdminRoleValue;
  scopeId: number | null;
};

export type AdminOfferType = 'academy' | 'store';

export type AdminOfferItem = {
  id: string;
  imageUrl: string | null;
  partnerName: string;
  type: AdminOfferType;
  category: string;
  title: string;
  description: string;
  location: string;
  phone: string;
  email: string;
  expireDateUtc: string;
  discountPercent: number;
  showOnHomePage: boolean;
  isVerified: boolean;
  viewsCount: number;
  rating: number;
  ratingsCount: number;
};

export type AdminOfferUpsertInput = {
  image: AdminFileInput | null;
  partnerName: string;
  type: AdminOfferType;
  category: string;
  title: string;
  description: string;
  location: string;
  phone: string;
  email: string;
  expireDateUtc: string;
  discountPercent: number;
  showOnHomePage: boolean;
  isVerified?: boolean;
};

export type AdminClubSubscriptionType = 'monthly' | 'yearly';

export type AdminClubStatus = 'active' | 'expiring' | 'expired';

export type AdminClubSummary = {
  active: number;
  expiring: number;
  expired: number;
};

export type AdminClubItem = {
  id: string;
  name: string;
  universityName: string;
  managerName: string;
  managerEmail: string;
  subscriptionType: AdminClubSubscriptionType;
  status: AdminClubStatus;
  startedAt: string;
  expiresAt: string;
  priceLabel: string;
  avatarInitial: string;
  avatarColor: string;
};

export type AdminClubUpsertInput = {
  name: string;
  universityName: string;
  managerName: string;
  managerEmail: string;
  subscriptionType: AdminClubSubscriptionType;
};
