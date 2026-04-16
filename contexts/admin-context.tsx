import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useAuth } from '@/contexts/auth-context';
import {
  useAdminClubSummaryQuery,
  useAdminClubsQuery,
  useAdminDashboardQuery,
  useAdminNewsQuery,
  useAdminOffersQuery,
  useAdminRolesQuery,
  useAdminUsersQuery,
} from '@/hooks/queries/use-admin-queries';
import { useUniversitiesQuery } from '@/hooks/queries/use-auth-queries';
import { adminRoleOptions } from '@/lib/admin/admin-config';
import { useAdminTheme } from '@/lib/admin/admin-theme';
import { getAllowedAdminSections } from '@/lib/auth/admin-access';
import type {
  AdminClubItem,
  AdminClubSummary,
  AdminDashboardSummary,
  AdminNewsItem,
  AdminOfferItem,
  AdminRoleMember,
  AdminRoleSummary,
  AdminSection,
  AdminToast,
  AdminToastTone,
  AdminUser,
} from '@/types/admin';

import {
  buildRoleScopesFromClubs,
  createToast,
  emptyClubSummary,
  emptyDashboardSummary,
  isAdminAccessDeniedMessage,
  mergeNewsCollection,
  summarizeClubs,
  summarizeRoles,
} from './admin/admin-context-helpers';
import type { AdminContextValue } from './admin/admin-context-types';
import { useAdminEntityActions } from './admin/use-admin-entity-actions';

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: PropsWithChildren) {
  const theme = useAdminTheme();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [toast, setToast] = useState<AdminToast | null>(null);
  const allowedSections = useMemo(() => getAllowedAdminSections(user?.roles ?? []), [user?.roles]);
  const canAccessUsers = allowedSections.includes('users');
  const canAccessRoles = allowedSections.includes('roles');
  const canAccessClubs = allowedSections.includes('clubs');
  const canAccessNews = allowedSections.includes('news');
  const canAccessOffers = allowedSections.includes('offers');
  const fallbackSection = allowedSections[0] ?? 'overview';

  const dashboardQuery = useAdminDashboardQuery();
  const usersQuery = useAdminUsersQuery({ enabled: canAccessUsers });
  const newsQuery = useAdminNewsQuery({ enabled: canAccessNews });
  const rolesQuery = useAdminRolesQuery({ enabled: canAccessRoles });
  const offersQuery = useAdminOffersQuery({ enabled: canAccessOffers });
  const clubsQuery = useAdminClubsQuery({ enabled: canAccessClubs });
  const clubSummaryQuery = useAdminClubSummaryQuery({ enabled: canAccessClubs });
  const universitiesQuery = useUniversitiesQuery();

  const [dashboard, setDashboard] = useState<AdminDashboardSummary>(emptyDashboardSummary);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [news, setNews] = useState<AdminNewsItem[]>([]);
  const [roles, setRoles] = useState<AdminRoleMember[]>([]);
  const [roleSummary, setRoleSummary] = useState<AdminRoleSummary[]>(() => summarizeRoles([]));
  const [offers, setOffers] = useState<AdminOfferItem[]>([]);
  const [clubs, setClubs] = useState<AdminClubItem[]>([]);
  const [clubSummary, setClubSummary] = useState<AdminClubSummary>(emptyClubSummary);

  useEffect(() => {
    if (!allowedSections.includes(activeSection)) {
      setActiveSection(fallbackSection);
    }
  }, [activeSection, allowedSections, fallbackSection]);

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
    if (!canAccessUsers) {
      setUsers([]);
    }
  }, [canAccessUsers]);

  useEffect(() => {
    if (newsQuery.data) {
      setNews((current) => mergeNewsCollection(current, newsQuery.data));
    }
  }, [newsQuery.data]);

  useEffect(() => {
    if (rolesQuery.data) {
      setRoles(rolesQuery.data);
      setRoleSummary(summarizeRoles(rolesQuery.data));
    }
  }, [rolesQuery.data]);

  useEffect(() => {
    if (!canAccessRoles) {
      setRoles([]);
      setRoleSummary(summarizeRoles([]));
    }
  }, [canAccessRoles]);

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
    if (!canAccessClubs) {
      setClubs([]);
      setClubSummary(emptyClubSummary);
    }
  }, [canAccessClubs]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = setTimeout(() => {
      setToast(null);
    }, 2800);

    return () => clearTimeout(timer);
  }, [toast]);

  const roleOptions = useMemo(() => adminRoleOptions, []);
  const roleScopes = useMemo(() => buildRoleScopesFromClubs(clubs), [clubs]);

  const accessDeniedMessage = useMemo(() => {
    const queryErrors = [
      dashboardQuery.error,
      usersQuery.error,
      newsQuery.error,
      rolesQuery.error,
      offersQuery.error,
      clubsQuery.error,
      clubSummaryQuery.error,
    ];

    const deniedError = queryErrors.find(isAdminAccessDeniedMessage);

    return deniedError instanceof Error ? deniedError.message : null;
  }, [
    clubSummaryQuery.error,
    clubsQuery.error,
    dashboardQuery.error,
    newsQuery.error,
    offersQuery.error,
    rolesQuery.error,
    usersQuery.error,
  ]);

  const showToast = (message: string, tone: AdminToastTone = 'success') => {
    setToast(createToast(message, tone));
  };

  const actions = useAdminEntityActions({
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
  });

  const value: AdminContextValue = {
    theme,
    activeSection,
    setActiveSection,
    allowedSections,
    toast,
    accessDeniedMessage,
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
      roles: rolesQuery.isLoading,
      offers: offersQuery.isLoading,
      clubs: clubsQuery.isLoading || clubSummaryQuery.isLoading,
    },
    ...actions,
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
