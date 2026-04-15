import type { useUniversitiesQuery } from '@/hooks/queries/use-auth-queries';
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
  AdminRoleScopeOption,
  AdminRoleSummary,
  AdminRoleUpdateInput,
  AdminSection,
  AdminToast,
  AdminToastTone,
  AdminUser,
  AdminUserUpsertInput,
} from '@/types/admin';

export type AdminLoadingState = {
  dashboard: boolean;
  users: boolean;
  news: boolean;
  roles: boolean;
  offers: boolean;
  clubs: boolean;
};

export type AdminContextValue = {
  theme: ReturnType<typeof useAdminTheme>;
  activeSection: AdminSection;
  setActiveSection: (section: AdminSection) => void;
  allowedSections: AdminSection[];
  toast: AdminToast | null;
  showToast: (message: string, tone?: AdminToastTone) => void;
  clearToast: () => void;
  accessDeniedMessage: string | null;
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
  loading: AdminLoadingState;
  saveUser: (id: string, input: AdminUserUpsertInput) => Promise<void>;
  deleteUser: (user: AdminUser) => Promise<void>;
  toggleUserBlocked: (user: AdminUser) => Promise<void>;
  saveNews: (news: AdminNewsItem | null, input: AdminNewsUpsertInput) => Promise<void>;
  deleteNews: (news: AdminNewsItem) => Promise<void>;
  saveRole: (
    member: AdminRoleMember | null,
    input: AdminRoleAssignInput | AdminRoleUpdateInput,
  ) => Promise<void>;
  deleteRole: (member: AdminRoleMember) => Promise<void>;
  saveOffer: (offer: AdminOfferItem | null, input: AdminOfferUpsertInput) => Promise<void>;
  deleteOffer: (offer: AdminOfferItem) => Promise<void>;
  saveClub: (club: AdminClubItem | null, input: AdminClubUpsertInput) => Promise<void>;
  deleteClub: (club: AdminClubItem) => Promise<void>;
  renewClub: (
    club: AdminClubItem,
    subscriptionType: AdminClubSubscriptionType,
  ) => Promise<void>;
};
