import { useDeferredValue, useMemo, useState } from 'react';

import { useAdmin, useAdminClubSummary, useAdminRoleSummary } from '@/contexts/admin-context';
import { adminValidationText } from '@/lib/admin/admin-copy';
import { adminSections, getRoleOption } from '@/lib/admin/admin-config';
import {
  buildClubForm,
  buildNewsForm,
  buildOfferForm,
  buildRoleForm,
  buildUserForm,
  hasValidationErrors,
  normalizeClubFormInput,
  normalizeNewsFormInput,
  normalizeOfferFormInput,
  normalizeText,
  normalizeUserFormInput,
  pickImage,
  type ClubFormErrors,
  type ClubFormState,
  type NewsFormErrors,
  type OfferFormErrors,
  type RoleFormErrors,
  type UserFormErrors,
  validateClubForm,
  validateNewsForm,
  validateOfferForm,
  validateRoleForm,
  validateUserForm,
} from '@/lib/admin/admin-dashboard-form-utils';
import type {
  AdminClubItem,
  AdminClubSubscriptionType,
  AdminNewsItem,
  AdminNewsUpsertInput,
  AdminOfferItem,
  AdminOfferType,
  AdminOfferUpsertInput,
  AdminRoleAssignInput,
  AdminRoleMember,
  AdminRoleUpdateInput,
  AdminRoleValue,
  AdminUser,
  AdminUserUpsertInput,
} from '@/types/admin';

export function useAdminDashboardController() {
  const {
    theme,
    activeSection,
    setActiveSection,
    allowedSections,
    toast,
    clearToast,
    showToast,
    accessDeniedMessage,
    dashboard,
    users,
    news,
    roles,
    roleOptions,
    roleScopes,
    offers,
    clubs,
    loading,
    universities,
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
  } = useAdmin();
  const roleSummary = useAdminRoleSummary();
  const clubSummary = useAdminClubSummary();
  const getRoleOptionByValue = (role: AdminRoleValue) =>
    roleOptions.find((option) => option.value === role) ?? getRoleOption(role);
  const rolesLoading = loading.roles && roles.length === 0;
  const usersLoading = loading.users && users.length === 0;
  const newsLoading = loading.news && news.length === 0;
  const offersLoading = loading.offers && offers.length === 0;
  const clubsLoading = loading.clubs && clubs.length === 0;
  const visibleSections = useMemo(
    () => adminSections.filter((section) => allowedSections.includes(section.key)),
    [allowedSections],
  );
  const resolvedActiveSection = allowedSections.includes(activeSection)
    ? activeSection
    : allowedSections[0] ?? 'overview';

  const [userSearch, setUserSearch] = useState('');
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [userForm, setUserForm] = useState<AdminUserUpsertInput>(buildUserForm());
  const [userErrors, setUserErrors] = useState<UserFormErrors>({});
  const [userValidationEnabled, setUserValidationEnabled] = useState(false);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);

  const [editingNews, setEditingNews] = useState<AdminNewsItem | null>(null);
  const [newsEditorVisible, setNewsEditorVisible] = useState(false);
  const [newsForm, setNewsForm] = useState<AdminNewsUpsertInput>(buildNewsForm());
  const [newsErrors, setNewsErrors] = useState<NewsFormErrors>({});
  const [newsValidationEnabled, setNewsValidationEnabled] = useState(false);
  const [newsImagePreview, setNewsImagePreview] = useState<string | null>(null);
  const [deletingNews, setDeletingNews] = useState<AdminNewsItem | null>(null);

  const [roleFilter, setRoleFilter] = useState<AdminRoleValue | 'all'>('all');
  const [editingRole, setEditingRole] = useState<AdminRoleMember | null>(null);
  const [roleEditorVisible, setRoleEditorVisible] = useState(false);
  const [roleForm, setRoleForm] = useState<AdminRoleAssignInput>(buildRoleForm());
  const selectedRoleOption = getRoleOptionByValue(roleForm.role);
  const [roleErrors, setRoleErrors] = useState<RoleFormErrors>({});
  const [roleValidationEnabled, setRoleValidationEnabled] = useState(false);
  const [deletingRole, setDeletingRole] = useState<AdminRoleMember | null>(null);

  const [offerFilter, setOfferFilter] = useState<'all' | AdminOfferType>('all');
  const [editingOffer, setEditingOffer] = useState<AdminOfferItem | null>(null);
  const [offerEditorVisible, setOfferEditorVisible] = useState(false);
  const [offerForm, setOfferForm] = useState<AdminOfferUpsertInput>(buildOfferForm());
  const [offerErrors, setOfferErrors] = useState<OfferFormErrors>({});
  const [offerValidationEnabled, setOfferValidationEnabled] = useState(false);
  const [deletingOffer, setDeletingOffer] = useState<AdminOfferItem | null>(null);

  const [clubFilter, setClubFilter] = useState<'all' | AdminClubItem['status']>('all');
  const [editingClub, setEditingClub] = useState<AdminClubItem | null>(null);
  const [clubEditorVisible, setClubEditorVisible] = useState(false);
  const [clubForm, setClubForm] = useState<ClubFormState>(buildClubForm());
  const [clubErrors, setClubErrors] = useState<ClubFormErrors>({});
  const [clubValidationEnabled, setClubValidationEnabled] = useState(false);
  const [deletingClub, setDeletingClub] = useState<AdminClubItem | null>(null);
  const [renewingClub, setRenewingClub] = useState<AdminClubItem | null>(null);
  const [renewType, setRenewType] = useState<AdminClubSubscriptionType>('yearly');

  const deferredUserSearch = useDeferredValue(userSearch);
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

  const filteredRoles = useMemo(
    () => roles.filter((item) => (roleFilter === 'all' ? true : item.role === roleFilter)),
    [roleFilter, roles],
  );

  const filteredOffers = useMemo(
    () => offers.filter((item) => (offerFilter === 'all' ? true : item.type === offerFilter)),
    [offerFilter, offers],
  );

  const filteredClubs = useMemo(
    () => clubs.filter((item) => (clubFilter === 'all' ? true : item.status === clubFilter)),
    [clubFilter, clubs],
  );

  const openUserEditor = (user: AdminUser) => {
    setEditingUser(user);
    setUserForm(buildUserForm(user));
    setUserErrors({});
    setUserValidationEnabled(false);
  };

  const closeUserEditor = () => {
    setEditingUser(null);
    setUserErrors({});
    setUserValidationEnabled(false);
  };

  const openNewsEditor = (item?: AdminNewsItem | null) => {
    setEditingNews(item ?? null);
    setNewsEditorVisible(true);
    setNewsForm(buildNewsForm(item));
    setNewsErrors({});
    setNewsValidationEnabled(false);
    setNewsImagePreview(item?.imageUrl ?? null);
  };

  const closeNewsEditor = () => {
    setEditingNews(null);
    setNewsEditorVisible(false);
    setNewsErrors({});
    setNewsValidationEnabled(false);
  };

  const openRoleEditor = (item?: AdminRoleMember | null) => {
    setEditingRole(item ?? null);
    setRoleEditorVisible(true);
    setRoleForm(buildRoleForm(item));
    setRoleErrors({});
    setRoleValidationEnabled(false);
  };

  const closeRoleEditor = () => {
    setEditingRole(null);
    setRoleEditorVisible(false);
    setRoleForm(buildRoleForm());
    setRoleErrors({});
    setRoleValidationEnabled(false);
  };

  const openOfferEditor = (item?: AdminOfferItem | null) => {
    setEditingOffer(item ?? null);
    setOfferEditorVisible(true);
    setOfferForm(buildOfferForm(item));
    setOfferErrors({});
    setOfferValidationEnabled(false);
  };

  const closeOfferEditor = () => {
    setEditingOffer(null);
    setOfferEditorVisible(false);
    setOfferForm(buildOfferForm());
    setOfferErrors({});
    setOfferValidationEnabled(false);
  };

  const openClubEditor = (item?: AdminClubItem | null) => {
    setEditingClub(item ?? null);
    setClubEditorVisible(true);
    setClubForm(buildClubForm(item));
    setClubErrors({});
    setClubValidationEnabled(false);
  };

  const closeClubEditor = () => {
    setEditingClub(null);
    setClubEditorVisible(false);
    setClubForm(buildClubForm());
    setClubErrors({});
    setClubValidationEnabled(false);
  };

  const syncUserForm = (changes: Partial<AdminUserUpsertInput>) => {
    setUserForm((current) => {
      const next = { ...current, ...changes };
      if (userValidationEnabled) {
        setUserErrors(validateUserForm(next));
      }
      return next;
    });
  };

  const syncNewsForm = (changes: Partial<AdminNewsUpsertInput>) => {
    setNewsForm((current) => {
      const next = { ...current, ...changes };
      if (newsValidationEnabled) {
        setNewsErrors(validateNewsForm(next));
      }
      return next;
    });
  };

  const syncRoleForm = (changes: Partial<AdminRoleAssignInput>) => {
    setRoleForm((current) => {
      const next = { ...current, ...changes };
      if (roleValidationEnabled) {
        setRoleErrors(
          validateRoleForm(next, Boolean(editingRole), getRoleOptionByValue(next.role)),
        );
      }
      return next;
    });
  };

  const syncOfferForm = (changes: Partial<AdminOfferUpsertInput>) => {
    setOfferForm((current) => {
      const next = { ...current, ...changes };
      if (offerValidationEnabled) {
        setOfferErrors(validateOfferForm(next));
      }
      return next;
    });
  };

  const syncClubForm = (changes: Partial<ClubFormState>) => {
    setClubForm((current) => {
      const next = { ...current, ...changes };
      if (clubValidationEnabled) {
        setClubErrors(validateClubForm(next));
      }
      return next;
    });
  };

  const showUserValidation = () => {
    setUserValidationEnabled(true);
    setUserErrors(validateUserForm(userForm));
  };

  const showNewsValidation = () => {
    setNewsValidationEnabled(true);
    setNewsErrors(validateNewsForm(newsForm));
  };

  const showRoleValidation = () => {
    setRoleValidationEnabled(true);
    setRoleErrors(validateRoleForm(roleForm, Boolean(editingRole), selectedRoleOption));
  };

  const showOfferValidation = () => {
    setOfferValidationEnabled(true);
    setOfferErrors(validateOfferForm(offerForm));
  };

  const showClubValidation = () => {
    setClubValidationEnabled(true);
    setClubErrors(validateClubForm(clubForm));
  };

  const handlePickNewsImage = async () => {
    const asset = await pickImage();
    if (!asset) {
      return;
    }

    setNewsImagePreview(asset.uri);
    setNewsForm((current) => ({
      ...current,
      image: {
        uri: asset.uri,
        name: asset.fileName,
        type: asset.mimeType,
        file: asset.file,
      },
    }));
  };

  const handleSaveUser = async () => {
    if (!editingUser) {
      return;
    }

    setUserValidationEnabled(true);
    const errors = validateUserForm(userForm);
    setUserErrors(errors);

    if (hasValidationErrors(errors)) {
      showToast(adminValidationText.user, 'warning');
      return;
    }

    await saveUser(editingUser.id, {
      ...normalizeUserFormInput(userForm),
    });
    setUserErrors({});
    setEditingUser(null);
  };

  const handleSaveNews = async (publishNow = false) => {
    setNewsValidationEnabled(true);
    const errors = validateNewsForm(newsForm);
    setNewsErrors(errors);

    if (hasValidationErrors(errors)) {
      showToast(adminValidationText.news, 'warning');
      return;
    }

    await saveNews(editingNews, {
      ...normalizeNewsFormInput(newsForm, publishNow),
    });
    setNewsErrors({});
    setEditingNews(null);
    setNewsEditorVisible(false);
  };

  const publishNews = async (item: AdminNewsItem) => {
    await saveNews(item, {
      title: item.title,
      content: item.content,
      source: item.source,
      category: item.category,
      image: null,
      isImportant: item.isImportant,
      isPublished: true,
    });
  };

  const handleSaveRole = async () => {
    setRoleValidationEnabled(true);
    const errors = validateRoleForm(roleForm, Boolean(editingRole), selectedRoleOption);
    setRoleErrors(errors);

    if (hasValidationErrors(errors)) {
      showToast(adminValidationText.role, 'warning');
      return;
    }

    if (editingRole) {
      const payload: AdminRoleUpdateInput = {
        email: editingRole.email,
        newRole: roleForm.role,
        scopeId: roleForm.scopeId,
      };
      await saveRole(editingRole, payload);
    } else {
      await saveRole(null, {
        ...roleForm,
        fullName: '',
        email: normalizeText(roleForm.email).toLowerCase(),
      });
    }
    setRoleErrors({});
    setEditingRole(null);
    setRoleEditorVisible(false);
  };

  const handleSaveOffer = async () => {
    setOfferValidationEnabled(true);
    const errors = validateOfferForm(offerForm);
    setOfferErrors(errors);

    if (hasValidationErrors(errors)) {
      showToast(adminValidationText.offer, 'warning');
      return;
    }

    await saveOffer(editingOffer, {
      ...normalizeOfferFormInput(offerForm),
    });
    setOfferErrors({});
    setEditingOffer(null);
    setOfferEditorVisible(false);
  };

  const handleSaveClub = async () => {
    setClubValidationEnabled(true);
    const errors = validateClubForm(clubForm);
    setClubErrors(errors);

    if (hasValidationErrors(errors)) {
      showToast(adminValidationText.club, 'warning');
      return;
    }

    await saveClub(editingClub, {
      ...normalizeClubFormInput(clubForm),
    });
    setClubErrors({});
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
    theme,
    activeSection,
    setActiveSection,
    allowedSections,
    visibleSections,
    resolvedActiveSection,
    toast,
    clearToast,
    showToast,
    accessDeniedMessage,
    dashboard,
    users,
    news,
    roles,
    roleOptions,
    roleScopes,
    offers,
    clubs,
    universities,
    roleSummary,
    clubSummary,
    getRoleOptionByValue,
    usersLoading,
    newsLoading,
    rolesLoading,
    offersLoading,
    clubsLoading,
    userSearch,
    setUserSearch,
    filteredUsers,
    editingUser,
    setEditingUser,
    userForm,
    setUserForm,
    userErrors,
    deletingUser,
    setDeletingUser,
    newsEditorVisible,
    editingNews,
    newsForm,
    setNewsForm,
    newsErrors,
    newsImagePreview,
    deletingNews,
    setDeletingNews,
    roleFilter,
    setRoleFilter,
    filteredRoles,
    editingRole,
    roleEditorVisible,
    roleForm,
    roleErrors,
    selectedRoleOption,
    deletingRole,
    setDeletingRole,
    offerFilter,
    setOfferFilter,
    filteredOffers,
    editingOffer,
    offerEditorVisible,
    offerForm,
    setOfferForm,
    offerErrors,
    deletingOffer,
    setDeletingOffer,
    clubFilter,
    setClubFilter,
    filteredClubs,
    editingClub,
    clubEditorVisible,
    clubForm,
    setClubForm,
    clubErrors,
    deletingClub,
    setDeletingClub,
    renewingClub,
    setRenewingClub,
    renewType,
    setRenewType,
    openUserEditor,
    closeUserEditor,
    openNewsEditor,
    closeNewsEditor,
    openRoleEditor,
    closeRoleEditor,
    openOfferEditor,
    closeOfferEditor,
    openClubEditor,
    closeClubEditor,
    syncUserForm,
    syncNewsForm,
    syncRoleForm,
    syncOfferForm,
    syncClubForm,
    showUserValidation,
    showNewsValidation,
    showRoleValidation,
    showOfferValidation,
    showClubValidation,
    handlePickNewsImage,
    handleSaveUser,
    handleSaveNews,
    publishNews,
    handleSaveRole,
    handleSaveOffer,
    handleSaveClub,
    handleRenewClub,
    deleteUser,
    toggleUserBlocked,
    deleteNews,
    deleteRole,
    deleteOffer,
    deleteClub,
  };
}

export type AdminDashboardController = ReturnType<typeof useAdminDashboardController>;
