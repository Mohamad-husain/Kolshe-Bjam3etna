import { Redirect, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { startTransition, useDeferredValue, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/auth-context';

import {
  AdminBadge,
  AdminBottomSheet,
  AdminCard,
  AdminConfirmDialog,
  AdminEmptyState,
  AdminHero,
  AdminMetricCard,
  AdminOutlinedStat,
  AdminPanelHeading,
  AdminPrimaryButton,
  AdminQuickAction,
  AdminSearchInput,
  AdminSelectField,
  AdminSegmentedOptions,
  AdminSwitchRow,
  AdminTextField,
  AdminToastBanner,
  AdminUploadField,
} from '@/components/admin/admin-primitives';
import {
  AdminChipGroup,
  ClubCard,
  NewsCard,
  OfferCard,
  OverviewActivityChart,
  RoleCard,
  UserCard,
} from '@/components/admin/admin-entities';
import { AdminProvider, useAdmin, useAdminClubSummary, useAdminRoleSummary } from '@/contexts/admin-context';
import {
  adminNewsCategories,
  adminOfferCategories,
  formatCompactNumber,
  getRoleOption,
  toEnglishDigits,
} from '@/lib/admin/admin-config';
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
  AdminUserStatus,
  AdminUserUpsertInput,
} from '@/types/admin';

type UserFormErrors = Partial<Record<'fullName' | 'email' | 'universityName', string>>;
type NewsFormErrors = Partial<Record<'title' | 'source' | 'content', string>>;
type RoleFormErrors = Partial<Record<'fullName' | 'email' | 'scopeId', string>>;
type OfferFormErrors = Partial<
  Record<'partnerName' | 'title' | 'description' | 'location' | 'phone' | 'email' | 'expireDateUtc' | 'discountPercent', string>
>;
type ClubFormState = {
  name: string;
  universityName: string;
  managerName: string;
  managerEmail: string;
  subscriptionType: AdminClubSubscriptionType;
};
type ClubFormErrors = Partial<Record<'name' | 'universityName' | 'managerName' | 'managerEmail', string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function countLetters(value: string) {
  return Array.from(normalizeText(value)).filter((char) => /\p{L}/u.test(char)).length;
}

function startsWithLetter(value: string) {
  const normalized = normalizeText(value);
  return normalized.length > 0 && /^\p{L}/u.test(normalized);
}

function isEmailValid(value: string) {
  return emailPattern.test(normalizeText(value).toLowerCase());
}

function isIsoDateValid(value: string) {
  if (!isoDatePattern.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function validateNameField(value: string, label: string, minimumLetters: number, maximumLetters: number) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return `${label} مطلوب`;
  }

  if (!startsWithLetter(normalized)) {
    return `${label} يجب أن يبدأ بحرف`;
  }

  const letters = countLetters(normalized);

  if (letters < minimumLetters) {
    return `${label} يجب أن يحتوي على ${toEnglishDigits(String(minimumLetters))} أحرف على الأقل`;
  }

  if (letters > maximumLetters) {
    return `${label} يجب ألّا يزيد عن ${toEnglishDigits(String(maximumLetters))} حرفاً`;
  }

  return undefined;
}

function validateRequiredText(value: string, label: string) {
  return normalizeText(value) ? undefined : `${label} مطلوب`;
}

function validateUserForm(form: AdminUserUpsertInput): UserFormErrors {
  return {
    fullName: validateNameField(form.fullName, 'الاسم', 6, 18),
    email: !normalizeText(form.email)
      ? 'البريد الإلكتروني مطلوب'
      : !isEmailValid(form.email)
        ? 'البريد الإلكتروني غير صحيح'
        : undefined,
    universityName: validateRequiredText(form.universityName, 'الجامعة'),
  };
}

function validateNewsForm(form: AdminNewsUpsertInput): NewsFormErrors {
  const title = normalizeText(form.title);
  const titleLetters = countLetters(title);
  const contentLetters = countLetters(form.content);

  return {
    title: !title
      ? 'عنوان الخبر مطلوب'
      : !startsWithLetter(title)
        ? 'عنوان الخبر يجب أن يبدأ بحرف'
        : titleLetters < 10
          ? 'عنوان الخبر يجب أن يحتوي على 10 أحرف على الأقل'
          : undefined,
    source: !normalizeText(form.source)
      ? 'المصدر مطلوب'
      : countLetters(form.source) < 3
        ? 'المصدر قصير جداً'
        : undefined,
    content: !normalizeText(form.content)
      ? 'تفاصيل الخبر مطلوبة'
      : contentLetters < 30
        ? 'تفاصيل الخبر يجب أن تحتوي على 30 حرفاً على الأقل'
        : undefined,
  };
}

function validateRoleForm(
  form: AdminRoleAssignInput,
  isEditing: boolean,
  roleOption = getRoleOption(form.role),
): RoleFormErrors {
  return {
    fullName: isEditing ? undefined : validateNameField(form.fullName, 'الاسم الكامل', 6, 18),
    email: isEditing
      ? undefined
      : !normalizeText(form.email)
        ? 'البريد الجامعي مطلوب'
        : !isEmailValid(form.email)
          ? 'البريد الجامعي غير صحيح'
          : undefined,
    scopeId: roleOption.requiresScope && !form.scopeId ? `حقل ${roleOption.scopeLabel ?? 'الفعالية المخصصة'} مطلوب` : undefined,
  };
}

function validateOfferForm(form: AdminOfferUpsertInput): OfferFormErrors {
  return {
    partnerName: !normalizeText(form.partnerName)
      ? 'الاسم مطلوب'
      : !startsWithLetter(form.partnerName)
        ? 'الاسم يجب أن يبدأ بحرف'
        : countLetters(form.partnerName) < 3
          ? 'الاسم قصير جداً'
          : undefined,
    title: !normalizeText(form.title)
      ? 'عنوان العرض مطلوب'
      : !startsWithLetter(form.title)
        ? 'عنوان العرض يجب أن يبدأ بحرف'
        : countLetters(form.title) < 10
          ? 'عنوان العرض يجب أن يحتوي على 10 أحرف على الأقل'
          : undefined,
    description: !normalizeText(form.description)
      ? 'تفاصيل العرض مطلوبة'
      : countLetters(form.description) < 20
        ? 'تفاصيل العرض يجب أن تحتوي على 20 حرفاً على الأقل'
        : undefined,
    location: validateRequiredText(form.location, 'الموقع'),
    phone: !normalizeText(form.phone)
      ? 'رقم التواصل مطلوب'
      : form.phone.replace(/\D/g, '').length < 8
        ? 'رقم التواصل غير صحيح'
        : undefined,
    email: normalizeText(form.email) && !isEmailValid(form.email) ? 'البريد الإلكتروني غير صحيح' : undefined,
    expireDateUtc: !normalizeText(form.expireDateUtc)
      ? 'تاريخ الانتهاء مطلوب'
      : !isIsoDateValid(form.expireDateUtc)
        ? 'تاريخ الانتهاء يجب أن يكون بصيغة YYYY-MM-DD'
        : undefined,
    discountPercent:
      !Number.isFinite(form.discountPercent) || form.discountPercent <= 0 || form.discountPercent > 100
        ? 'نسبة الخصم يجب أن تكون بين 1 و100'
        : undefined,
  };
}

function validateClubForm(form: ClubFormState): ClubFormErrors {
  return {
    name: !normalizeText(form.name)
      ? 'اسم النادي مطلوب'
      : !startsWithLetter(form.name)
        ? 'اسم النادي يجب أن يبدأ بحرف'
        : countLetters(form.name) < 3
          ? 'اسم النادي قصير جداً'
          : undefined,
    universityName: validateRequiredText(form.universityName, 'الجامعة'),
    managerName: validateNameField(form.managerName, 'اسم المسؤول', 6, 18),
    managerEmail: !normalizeText(form.managerEmail)
      ? 'البريد الإلكتروني مطلوب'
      : !isEmailValid(form.managerEmail)
        ? 'البريد الإلكتروني غير صحيح'
        : undefined,
  };
}

function hasValidationErrors(errors: Record<string, string | undefined>) {
  return Object.values(errors).some(Boolean);
}

function buildUserForm(user: AdminUser): AdminUserUpsertInput {
  return {
    fullName: normalizeText(user.fullName),
    email: normalizeText(user.email).toLowerCase(),
    universityId: user.universityId,
    universityName: normalizeText(user.universityName),
    isBlocked: user.status === 'blocked',
  };
}

function buildNewsForm(item?: AdminNewsItem | null): AdminNewsUpsertInput {
  return {
    title: normalizeText(item?.title ?? ''),
    content: normalizeText(item?.content ?? ''),
    source: normalizeText(item?.source ?? ''),
    category: item?.category ?? adminNewsCategories[0],
    image: null,
    isImportant: item?.isImportant ?? false,
    isPublished: item?.isPublished ?? false,
  };
}

function buildRoleForm(member?: AdminRoleMember | null): AdminRoleAssignInput {
  return {
    fullName: normalizeText(member?.fullName ?? ''),
    email: normalizeText(member?.email ?? '').toLowerCase(),
    role: member?.role ?? 'admin',
    scopeId: member?.scopeId ?? null,
  };
}

function buildOfferForm(item?: AdminOfferItem | null): AdminOfferUpsertInput {
  return {
    image: null,
    partnerName: normalizeText(item?.partnerName ?? ''),
    type: item?.type ?? 'academy',
    category: normalizeText(item?.category ?? adminOfferCategories[0]),
    title: normalizeText(item?.title ?? ''),
    description: normalizeText(item?.description ?? ''),
    location: normalizeText(item?.location ?? ''),
    phone: normalizeText(item?.phone ?? ''),
    email: normalizeText(item?.email ?? '').toLowerCase(),
    expireDateUtc: item?.expireDateUtc ?? new Date().toISOString().slice(0, 10),
    discountPercent: item?.discountPercent ?? 0,
    showOnHomePage: item?.showOnHomePage ?? true,
    isVerified: item?.isVerified ?? true,
  };
}

function buildClubForm(item?: AdminClubItem | null) {
  return {
    name: normalizeText(item?.name ?? ''),
    universityName: normalizeText(item?.universityName ?? ''),
    managerName: normalizeText(item?.managerName ?? ''),
    managerEmail: normalizeText(item?.managerEmail ?? '').toLowerCase(),
    subscriptionType: item?.subscriptionType ?? 'monthly',
  } satisfies ClubFormState;
}

async function pickImage() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    Alert.alert('صلاحية مطلوبة', 'يرجى السماح بالوصول إلى الصور لاختيار صورة مناسبة.');
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.9,
  });

  if (result.canceled || !result.assets?.length) {
    return null;
  }

  return result.assets[0] ?? null;
}

function AdminDashboardContent() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const {
    theme,
    activeSection,
    setActiveSection,
    toast,
    clearToast,
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
    showToast,
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
  const sectionHorizontalPadding = width <= 340 ? 4 : width <= 380 ? 6 : width <= 430 ? 8 : 10;

  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [userForm, setUserForm] = useState<AdminUserUpsertInput>({
    fullName: '',
    email: '',
    universityId: null,
    universityName: '',
    isBlocked: false,
  });
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
  const [togglingUser, setTogglingUser] = useState<AdminUser | null>(null);

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
  const [clubForm, setClubForm] = useState(buildClubForm());
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

  const openNewsEditor = (item?: AdminNewsItem | null) => {
    setEditingNews(item ?? null);
    setNewsEditorVisible(true);
    setNewsForm(buildNewsForm(item));
    setNewsErrors({});
    setNewsValidationEnabled(false);
    setNewsImagePreview(item?.imageUrl ?? null);
  };

  const openRoleEditor = (item?: AdminRoleMember | null) => {
    setEditingRole(item ?? null);
    setRoleEditorVisible(true);
    setRoleForm(buildRoleForm(item));
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

  const openClubEditor = (item?: AdminClubItem | null) => {
    setEditingClub(item ?? null);
    setClubEditorVisible(true);
    setClubForm(buildClubForm(item));
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
        setRoleErrors(validateRoleForm(next, Boolean(editingRole), getRoleOptionByValue(next.role)));
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
    if (!asset) return;

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
    if (!editingUser) return;
    setUserValidationEnabled(true);
    const errors = validateUserForm(userForm);
    setUserErrors(errors);

    if (hasValidationErrors(errors)) {
      showToast('يرجى تصحيح بيانات المستخدم أولاً', 'warning');
      return;
    }

    await saveUser(editingUser.id, {
      ...userForm,
      fullName: normalizeText(userForm.fullName),
      email: normalizeText(userForm.email).toLowerCase(),
      universityName: normalizeText(userForm.universityName),
    });
    setUserErrors({});
    setEditingUser(null);
  };

  const handleSaveNews = async (publishNow = false) => {
    setNewsValidationEnabled(true);
    const errors = validateNewsForm(newsForm);
    setNewsErrors(errors);

    if (hasValidationErrors(errors)) {
      showToast('يرجى تصحيح بيانات الخبر أولاً', 'warning');
      return;
    }

    await saveNews(editingNews, {
      ...newsForm,
      title: normalizeText(newsForm.title),
      source: normalizeText(newsForm.source),
      content: normalizeText(newsForm.content),
      isPublished: publishNow ? true : newsForm.isPublished,
    });
    setNewsErrors({});
    setEditingNews(null);
    setNewsEditorVisible(false);
  };

  const handleSaveRole = async () => {
    setRoleValidationEnabled(true);
    const errors = validateRoleForm(roleForm, Boolean(editingRole), selectedRoleOption);
    setRoleErrors(errors);

    if (hasValidationErrors(errors)) {
      showToast('يرجى تصحيح بيانات الدور أولاً', 'warning');
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
        fullName: normalizeText(roleForm.fullName),
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
      showToast('يرجى تصحيح بيانات العرض أولاً', 'warning');
      return;
    }

    await saveOffer(editingOffer, {
      ...offerForm,
      partnerName: normalizeText(offerForm.partnerName),
      category: normalizeText(offerForm.category),
      title: normalizeText(offerForm.title),
      description: normalizeText(offerForm.description),
      location: normalizeText(offerForm.location),
      phone: normalizeText(offerForm.phone),
      email: normalizeText(offerForm.email).toLowerCase(),
      expireDateUtc: normalizeText(offerForm.expireDateUtc),
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
      showToast('يرجى تصحيح بيانات النادي أولاً', 'warning');
      return;
    }

    await saveClub(editingClub, {
      ...clubForm,
      name: normalizeText(clubForm.name),
      universityName: normalizeText(clubForm.universityName),
      managerName: normalizeText(clubForm.managerName),
      managerEmail: normalizeText(clubForm.managerEmail).toLowerCase(),
    });
    setClubErrors({});
    setEditingClub(null);
    setClubEditorVisible(false);
  };

  const handleRenewClub = async () => {
    if (!renewingClub) return;
    await renewClub(renewingClub, renewType);
    setRenewingClub(null);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.pageBackground }]} edges={['top']}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <View style={styles.root}>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 42 }]} showsVerticalScrollIndicator={false}>
          <AdminHero
            theme={theme}
            activeSection={activeSection}
            onChangeSection={(section) => {
              clearToast();
              startTransition(() => setActiveSection(section));
            }}
            onBack={() => router.replace('/(tabs)/profile')}
          />
          <AdminToastBanner theme={theme} toast={toast} />
          <View style={[styles.sectionWrap, { paddingHorizontal: sectionHorizontalPadding }]}>
            {activeSection === 'overview' ? (
              <>
                <View style={styles.metricsRow}>
                  <AdminMetricCard theme={theme} icon="briefcase-outline" accent={theme.warning} value={toEnglishDigits(dashboard.adsCount.toLocaleString('en-US'))} label="الإعلانات" trend={`${toEnglishDigits(dashboard.adsGrowth)}%+`} />
                  <AdminMetricCard theme={theme} icon="people-outline" accent={theme.primary} value={toEnglishDigits(dashboard.usersCount.toLocaleString('en-US'))} label="المستخدمون" trend={`${toEnglishDigits(dashboard.usersGrowth)}%+`} />
                </View>
                <View style={styles.metricsSingle}>
                  <AdminMetricCard theme={theme} icon="mail-outline" accent={theme.success} value={formatCompactNumber(dashboard.messagesCount)} label="الرسائل" trend={`${toEnglishDigits(dashboard.messagesGrowth)}%+`} />
                </View>
                <AdminPanelHeading theme={theme} title="إجراءات سريعة" />
                <View style={styles.stack}>
                  <AdminQuickAction theme={theme} icon="document-text-outline" accent={theme.success} label="نشر خبر جديد" onPress={() => openNewsEditor()} />
                  <AdminQuickAction theme={theme} icon="stats-chart-outline" accent={theme.primary} label="تقرير النشاط الأسبوعي" onPress={() => showToast('تم تجهيز التقرير الأسبوعي', 'info')} />
                  <OverviewActivityChart
                    theme={theme}
                    points={dashboard.activityPoints}
                    windowLabel={dashboard.activityWindowLabel}
                  />
                </View>
              </>
            ) : null}

            {activeSection === 'users' ? (
              <>
                <AdminSearchInput theme={theme} value={userSearch} onChangeText={setUserSearch} placeholder="ابحث عن مستخدم..." />
                <View style={styles.stack}>
                  {usersLoading ? (
                    <AdminEmptyState
                      theme={theme}
                      icon="hourglass-outline"
                      title="جارٍ تحميل المستخدمين"
                      description="نقوم بسحب بيانات المستخدمين من لوحة الإدارة الآن."
                    />
                  ) : filteredUsers.length ? (
                    filteredUsers.map((item) => (
                      <UserCard key={item.id} theme={theme} user={item} onEdit={() => openUserEditor(item)} onDelete={() => setDeletingUser(item)} onToggleStatus={() => void toggleUserBlocked(item)} />
                    ))
                  ) : (
                    <AdminEmptyState
                      theme={theme}
                      icon="search-outline"
                      title={users.length ? 'لا توجد نتائج مطابقة' : 'لا يوجد مستخدمون حالياً'}
                      description={users.length ? 'جرّب كلمة بحث أخرى للعثور على المستخدم المطلوب.' : 'لا يوجد أي مستخدمين حالياً. ستظهر الحسابات هنا عند توفرها.'}
                    />
                  )}
                </View>
              </>
            ) : null}

            {activeSection === 'news' ? (
              <>
                <Pressable onPress={() => openNewsEditor()} style={({ pressed }) => [styles.addDashed, { borderColor: `${theme.primary}50`, backgroundColor: theme.cardBackground }, pressed && styles.pressed]}>
                  <Text style={[styles.addDashedText, { color: theme.primary }]}>نشر خبر جديد +</Text>
                </Pressable>
                <View style={styles.stack}>
                  {newsLoading ? (
                    <AdminEmptyState
                      theme={theme}
                      icon="hourglass-outline"
                      title="جارٍ تحميل الأخبار"
                      description="نقوم بجلب آخر الأخبار الإدارية الآن."
                    />
                  ) : news.length ? (
                    news.map((item) => (
                      <NewsCard key={item.id} theme={theme} item={item} onEdit={() => openNewsEditor(item)} onDelete={() => setDeletingNews(item)} onPublish={() => void saveNews(item, { title: item.title, content: item.content, source: item.source, category: item.category, image: null, isImportant: item.isImportant, isPublished: true })} />
                    ))
                  ) : (
                    <AdminEmptyState
                      theme={theme}
                      icon="newspaper-outline"
                      title="لا توجد أخبار حالياً"
                      description="لا يوجد أي خبر حالياً. أضف خبراً جديداً ليظهر هنا."
                    />
                  )}
                </View>
              </>
            ) : null}

            {activeSection === 'roles' ? (
              <>
                <View style={styles.summaryGrid}>
                  {roleSummary.map((item) => {
                    const option = getRoleOptionByValue(item.role);
                    return (
                      <View key={item.role} style={styles.summaryCell}>
                        <AdminOutlinedStat
                          theme={theme}
                          title={option.label}
                          value={String(item.count)}
                          accent={option.color}
                          active={roleFilter === item.role}
                          onPress={() => setRoleFilter((current) => (current === item.role ? 'all' : item.role))}
                        />
                      </View>
                    );
                  })}
                </View>
                <AdminPrimaryButton theme={theme} label="إضافة دور جديد" icon="git-network-outline" onPress={() => openRoleEditor()} />
                <AdminPanelHeading theme={theme} title={roleFilter === 'all' ? `\u062c\u0645\u064a\u0639 \u0627\u0644\u0623\u062f\u0648\u0627\u0631 (${toEnglishDigits(roles.length)})` : `${getRoleOptionByValue(roleFilter).label} (${toEnglishDigits(filteredRoles.length)})`} actionLabel="عرض الكل" onActionPress={() => setRoleFilter('all')} />
                <View style={styles.stack}>
                  {rolesLoading ? (
                    <AdminEmptyState
                      theme={theme}
                      icon="hourglass-outline"
                      title="جارٍ تحميل الأدوار"
                      description="نقوم بجلب صلاحيات ولوائح الأدوار من الخادم الآن."
                    />
                  ) : filteredRoles.length ? filteredRoles.map((item) => <RoleCard key={item.id} theme={theme} item={item} roleOption={getRoleOptionByValue(item.role)} onEdit={() => openRoleEditor(item)} onDelete={() => setDeletingRole(item)} />) : <AdminEmptyState theme={theme} icon="person-outline" title="لا يوجد أعضاء بهذا الدور" description="اختر دوراً آخر أو أضف عضواً جديداً من نفس اللوحة." />}
                </View>
              </>
            ) : null}

            {activeSection === 'offers' ? (
              <>
                <View style={styles.summaryGrid}>
                  <View style={styles.summaryCell}>
                    <AdminOutlinedStat
                      theme={theme}
                      title="أكاديميات"
                      value={String(offers.filter((item) => item.type === 'academy').length)}
                      accent={theme.violet}
                      active={offerFilter === 'academy'}
                      onPress={() => setOfferFilter((current) => (current === 'academy' ? 'all' : 'academy'))}
                    />
                  </View>
                  <View style={styles.summaryCell}>
                    <AdminOutlinedStat
                      theme={theme}
                      title="متاجر"
                      value={String(offers.filter((item) => item.type === 'store').length)}
                      accent={theme.warning}
                      active={offerFilter === 'store'}
                      onPress={() => setOfferFilter((current) => (current === 'store' ? 'all' : 'store'))}
                    />
                  </View>
                </View>
                <AdminPrimaryButton theme={theme} label="إضافة عرض جديد" icon="megaphone-outline" onPress={() => openOfferEditor()} />
                <View style={styles.stack}>
                  {offersLoading ? (
                    <AdminEmptyState
                      theme={theme}
                      icon="hourglass-outline"
                      title="جارٍ تحميل العروض"
                      description="نقوم بتحميل العروض المرتبطة بلوحة الإدارة الآن."
                    />
                  ) : filteredOffers.length ? (
                    filteredOffers.map((item) => <OfferCard key={item.id} theme={theme} offer={item} onEdit={() => openOfferEditor(item)} onDelete={() => setDeletingOffer(item)} />)
                  ) : (
                    <AdminEmptyState
                      theme={theme}
                      icon="calendar-outline"
                      title={offers.length ? 'لا توجد فعاليات من هذا النوع' : 'لا توجد فعاليات حالياً'}
                      description={offers.length ? 'جرّب نوعاً آخر أو أضف فعالية جديدة من نفس اللوحة.' : 'لا توجد أي فعاليات حالياً. أضف فعالية جديدة لتظهر هنا.'}
                    />
                  )}
                </View>
              </>
            ) : null}

            {activeSection === 'clubs' ? (
              <>
                <View style={styles.summaryGridWide}>
                  <View style={styles.summaryWideCell}>
                    <AdminOutlinedStat theme={theme} title="منتهي" value={String(clubSummary.expired)} accent={theme.danger} active={clubFilter === 'expired'} onPress={() => setClubFilter((current) => (current === 'expired' ? 'all' : 'expired'))} />
                  </View>
                  <View style={styles.summaryWideCell}>
                    <AdminOutlinedStat theme={theme} title="ينتهي قريباً" value={String(clubSummary.expiring)} accent={theme.warning} active={clubFilter === 'expiring'} onPress={() => setClubFilter((current) => (current === 'expiring' ? 'all' : 'expiring'))} />
                  </View>
                  <View style={styles.summaryWideCell}>
                    <AdminOutlinedStat theme={theme} title="نشط" value={String(clubSummary.active)} accent={theme.success} active={clubFilter === 'active'} onPress={() => setClubFilter((current) => (current === 'active' ? 'all' : 'active'))} />
                  </View>
                </View>
                <AdminPrimaryButton theme={theme} label="إضافة نادي جديد" icon="people-outline" onPress={() => openClubEditor()} />
                <View style={styles.stack}>
                  {clubsLoading ? (
                    <AdminEmptyState
                      theme={theme}
                      icon="hourglass-outline"
                      title="جارٍ تحميل الأندية"
                      description="نقوم بسحب بيانات الأندية والاشتراكات الآن."
                    />
                  ) : filteredClubs.length ? (
                    filteredClubs.map((item) => <ClubCard key={item.id} theme={theme} club={item} onEdit={() => openClubEditor(item)} onDelete={() => setDeletingClub(item)} onRenew={() => { setRenewingClub(item); setRenewType(item.subscriptionType); }} />)
                  ) : (
                    <AdminEmptyState
                      theme={theme}
                      icon="people-outline"
                      title={clubs.length ? 'لا توجد أندية بهذه الحالة' : 'لا توجد أندية حالياً'}
                      description={clubs.length ? 'اختر حالة أخرى أو أضف نادياً جديداً من نفس اللوحة.' : 'لا يوجد أي نادٍ حالياً. أضف نادياً جديداً ليظهر هنا.'}
                    />
                  )}
                </View>
              </>
            ) : null}
          </View>
        </ScrollView>
      </View>

      <AdminBottomSheet
        theme={theme}
        visible={false}
        title="بيانات المستخدم"
        onClose={() => setSelectedUser(null)}
      >
        {selectedUser ? (
          <>
            <AdminTextField theme={theme} label="الاسم" value={selectedUser.fullName} onChangeText={() => {}} readOnly />
            <AdminTextField theme={theme} label="البريد الإلكتروني" value={selectedUser.email} onChangeText={() => {}} readOnly />
            <AdminTextField theme={theme} label="الجامعة" value={selectedUser.universityName} onChangeText={() => {}} readOnly />
            <AdminTextField theme={theme} label="عدد المنشورات" value={toEnglishDigits(String(selectedUser.postsCount))} onChangeText={() => {}} readOnly />
            <AdminTextField theme={theme} label="تاريخ الانضمام" value={toEnglishDigits(selectedUser.joinedAt)} onChangeText={() => {}} readOnly />
          </>
        ) : null}
      </AdminBottomSheet>

      <AdminBottomSheet
        theme={theme}
        visible={editingUser !== null}
        title="تعديل المستخدم"
        onClose={() => {
          setEditingUser(null);
          setUserErrors({});
          setUserValidationEnabled(false);
        }}
      >
        <AdminTextField
          theme={theme}
          label="الاسم *"
          error={userErrors.fullName}
          value={userForm.fullName}
          onChangeText={(value: string) => {
            syncUserForm({ fullName: value });
          }}
          onBlur={showUserValidation}
          maxLength={18}
        />
        <AdminTextField
          theme={theme}
          label="البريد الإلكتروني *"
          error={userErrors.email}
          value={userForm.email}
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={(value: string) => {
            syncUserForm({ email: value });
          }}
          onBlur={showUserValidation}
        />
        <AdminTextField
          theme={theme}
          label="الجامعة"
          error={userErrors.universityName}
          value={userForm.universityName}
          onChangeText={(value: string) => {
            syncUserForm({ universityName: value });
          }}
          onBlur={showUserValidation}
        />
        <AdminSegmentedOptions
          theme={theme}
          value={userForm.isBlocked ? 'blocked' : 'active'}
          onChange={(value: AdminUserStatus) =>
            setUserForm((current) => ({ ...current, isBlocked: value === 'blocked' }))
          }
          options={[
            { value: 'active', label: 'نشط', accent: theme.success },
            { value: 'blocked', label: 'موقوف', accent: theme.danger },
          ]}
        />
        {universities?.length ? (
          <AdminChipGroup
            theme={theme}
            value={userForm.universityName}
            onChange={(value) => {
              const selected = universities.find((item) => item.name === value);
              syncUserForm({
                universityId: selected?.id ?? userForm.universityId,
                universityName: value,
              });
            }}
            options={universities.slice(0, 5).map((item) => item.name)}
          />
        ) : null}
        <AdminPrimaryButton theme={theme} label="حفظ التغييرات" icon="save-outline" onPress={() => void handleSaveUser()} />
      </AdminBottomSheet>

      <AdminBottomSheet
        theme={theme}
        visible={newsEditorVisible}
        title={editingNews ? 'تعديل الخبر' : 'خبر جديد'}
        backdropStyle={styles.roleSheetBackdrop}
        sheetStyle={styles.roleSheet}
        contentContainerStyle={styles.roleSheetContent}
        showsVerticalScrollIndicator
        onClose={() => {
          setEditingNews(null);
          setNewsEditorVisible(false);
          setNewsErrors({});
          setNewsValidationEnabled(false);
        }}
      >
        <AdminUploadField theme={theme} imageUri={newsImagePreview} onPress={() => void handlePickNewsImage()} />
        <AdminTextField theme={theme} label="عنوان الخبر الرئيسي *" error={newsErrors.title} value={newsForm.title} onChangeText={(value: string) => { syncNewsForm({ title: value }); }} onBlur={showNewsValidation} placeholder="مثال: تأجيل امتحانات الفصل الأول أسبوعاً" />
        <AdminTextField theme={theme} label="المصدر *" error={newsErrors.source} value={newsForm.source} onChangeText={(value: string) => { syncNewsForm({ source: value }); }} onBlur={showNewsValidation} placeholder="مثال: عمادة شؤون الطلبة" />
        <View style={styles.fieldSection}>
          <Text style={[styles.sectionLabel, { color: theme.mutedText }]}>التصنيف</Text>
          <AdminChipGroup theme={theme} value={newsForm.category} onChange={(value: string) => setNewsForm((current) => ({ ...current, category: value }))} options={adminNewsCategories} />
        </View>
        <AdminTextField
          theme={theme}
          error={newsErrors.content}
          label={`\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u062e\u0628\u0631 * ${toEnglishDigits(newsForm.content.length)}/800`}
          value={newsForm.content}
          onChangeText={(value: string) => {
            syncNewsForm({ content: value });
          }}
          onBlur={showNewsValidation}
          placeholder="اكتب تفاصيل الخبر بوضوح وإيجاز..."
          multiline
        />
        <AdminSwitchRow
          theme={theme}
          title="تمييز كخبر عاجل"
          subtitle="يرسل إشعاراً فورياً لجميع الطلبة"
          value={newsForm.isImportant}
          onValueChange={(value) => setNewsForm((current) => ({ ...current, isImportant: value }))}
          accent={theme.danger}
        />
        <AdminSwitchRow
          theme={theme}
          title="نشر الخبر مباشرة"
          subtitle="يعرض الخبر فوراً في التطبيق"
          value={newsForm.isPublished}
          onValueChange={(value) => setNewsForm((current) => ({ ...current, isPublished: value }))}
          accent={theme.primary}
        />
        <AdminCard theme={theme}>
          <View style={styles.previewHeader}>
            <Text style={[styles.previewHeaderText, { color: theme.primary }]}>معاينة</Text>
            {newsForm.isImportant ? <AdminBadge theme={theme} label="عاجل" accent={theme.danger} /> : null}
          </View>
          <Text style={[styles.previewTitle, { color: theme.heading }]}>{newsForm.title || 'عنوان الخبر'}</Text>
          <Text style={[styles.previewMeta, { color: theme.mutedText }]}>{`${newsForm.source || '\u0627\u0644\u0645\u0635\u062f\u0631'} - \u0627\u0644\u0622\u0646`}</Text>
        </AdminCard>
        <AdminPrimaryButton theme={theme} label={newsForm.isPublished ? 'نشر الخبر الآن' : 'حفظ كمسودة'} icon={newsForm.isPublished ? 'paper-plane-outline' : 'save-outline'} onPress={() => void handleSaveNews(newsForm.isPublished)} />
      </AdminBottomSheet>

      <AdminBottomSheet
        theme={theme}
        visible={roleEditorVisible}
        title={editingRole ? `\u062a\u0639\u062f\u064a\u0644 \u062f\u0648\u0631: ${editingRole.fullName}` : 'إضافة دور جديد'}
        backdropStyle={styles.roleSheetBackdrop}
        sheetStyle={styles.roleSheet}
        contentContainerStyle={styles.roleSheetContent}
        onClose={() => {
          setEditingRole(null);
          setRoleEditorVisible(false);
          setRoleForm(buildRoleForm());
          setRoleErrors({});
          setRoleValidationEnabled(false);
        }}
      >
        {!editingRole ? (
          <>
            <AdminTextField theme={theme} label="الاسم الكامل" error={roleErrors.fullName} value={roleForm.fullName} onChangeText={(value: string) => { syncRoleForm({ fullName: value }); }} onBlur={showRoleValidation} placeholder="مثال: سارة محمد" maxLength={18} />
            <AdminTextField theme={theme} label="البريد الجامعي" error={roleErrors.email} value={roleForm.email} keyboardType="email-address" autoCapitalize="none" onChangeText={(value: string) => { syncRoleForm({ email: value }); }} onBlur={showRoleValidation} placeholder="example@ju.edu.jo" />
          </>
        ) : null}
        <AdminSegmentedOptions
          theme={theme}
          value={roleForm.role}
          onChange={(value: AdminRoleValue) => {
            syncRoleForm({
              role: value,
              scopeId: getRoleOptionByValue(value).requiresScope ? roleForm.scopeId ?? roleScopes[0]?.id ?? null : null,
            });
          }}
          columns={2}
          options={roleOptions.map((option) => ({
            value: option.value,
            label: option.label,
            accent: option.color,
            icon: option.value === 'superAdmin' ? 'shield-checkmark-outline' : option.value === 'newsEditor' ? 'newspaper-outline' : option.value === 'eventOwner' ? 'calendar-outline' : 'shield-outline',
          }))}
        />
        {selectedRoleOption.requiresScope ? (
          <AdminSelectField
            theme={theme}
            label={selectedRoleOption.scopeLabel ?? 'الفعالية المخصصة'}
            value={String(roleForm.scopeId ?? roleScopes[0]?.id ?? '')}
            onChange={(value: string) => {
              syncRoleForm({ scopeId: Number(value) });
            }}
            options={roleScopes.map((item) => ({ value: String(item.id), label: item.name }))}
            placeholder="اختر الفعالية"
            accent={selectedRoleOption.color}
          />
        ) : null}
        {roleErrors.scopeId ? <Text style={[styles.inlineError, { color: theme.danger }]}>{roleErrors.scopeId}</Text> : null}
        <AdminCard theme={theme} style={[styles.permissionsCard, { backgroundColor: `${selectedRoleOption.color}14` }]}>
          <Text style={[styles.permissionsTitle, { color: selectedRoleOption.color }]}>الصلاحيات الممنوحة:</Text>
          <View style={styles.permissionsWrapLocal}>
            {selectedRoleOption.permissions.map((permission) => (
              <Text numberOfLines={1} key={permission} style={[styles.permissionChipText, { color: selectedRoleOption.color, backgroundColor: `${selectedRoleOption.color}12` }]}>{permission}</Text>
            ))}
          </View>
        </AdminCard>
        <AdminPrimaryButton theme={theme} label={editingRole ? 'حفظ التغييرات' : 'تأكيد وإضافة الدور'} icon="save-outline" onPress={() => void handleSaveRole()} />
      </AdminBottomSheet>

      <AdminBottomSheet
        theme={theme}
        visible={offerEditorVisible}
        title={editingOffer ? 'تعديل الفعالية' : 'إضافة فعالية جديدة'}
        backdropStyle={styles.roleSheetBackdrop}
        sheetStyle={styles.roleSheet}
        contentContainerStyle={styles.roleSheetContent}
        showsVerticalScrollIndicator
        onClose={() => {
          setEditingOffer(null);
          setOfferEditorVisible(false);
          setOfferForm(buildOfferForm());
          setOfferErrors({});
          setOfferValidationEnabled(false);
        }}
      >
        <AdminSegmentedOptions theme={theme} value={offerForm.type} onChange={(value: AdminOfferType) => setOfferForm((current) => ({ ...current, type: value }))} options={[{ value: 'academy', label: 'أكاديمية', accent: theme.violet, icon: 'school-outline' }, { value: 'store', label: 'متجر', accent: theme.warning, icon: 'storefront-outline' }]} />
        <AdminTextField theme={theme} label="الاسم *" error={offerErrors.partnerName} value={offerForm.partnerName} onChangeText={(value: string) => { syncOfferForm({ partnerName: value }); }} onBlur={showOfferValidation} placeholder="اسم الأكاديمية / المتجر" />
        <AdminTextField theme={theme} label="التصنيف" value={offerForm.category} onChangeText={(value: string) => setOfferForm((current) => ({ ...current, category: value }))} />
        <AdminChipGroup theme={theme} value={offerForm.category} onChange={(value: string) => setOfferForm((current) => ({ ...current, category: value }))} options={adminOfferCategories} />
        <AdminTextField theme={theme} label="عنوان العرض *" error={offerErrors.title} value={offerForm.title} onChangeText={(value: string) => { syncOfferForm({ title: value }); }} onBlur={showOfferValidation} placeholder="مثال: خصم %40 على دورة Flutter" />
        <AdminTextField theme={theme} label="تفاصيل العرض" error={offerErrors.description} value={offerForm.description} onChangeText={(value: string) => { syncOfferForm({ description: value }); }} onBlur={showOfferValidation} placeholder="تفاصيل إضافية عن العرض..." multiline />
        <AdminTextField theme={theme} label="الموقع" error={offerErrors.location} value={offerForm.location} onChangeText={(value: string) => { syncOfferForm({ location: value }); }} onBlur={showOfferValidation} />
        <AdminTextField theme={theme} label="رقم التواصل" error={offerErrors.phone} value={offerForm.phone} keyboardType="phone-pad" onChangeText={(value: string) => { syncOfferForm({ phone: value }); }} onBlur={showOfferValidation} />
        <AdminTextField theme={theme} label="البريد الإلكتروني" error={offerErrors.email} value={offerForm.email} keyboardType="email-address" autoCapitalize="none" onChangeText={(value: string) => { syncOfferForm({ email: value }); }} onBlur={showOfferValidation} />
        <AdminTextField theme={theme} label="تاريخ الانتهاء" error={offerErrors.expireDateUtc} value={toEnglishDigits(offerForm.expireDateUtc)} onChangeText={(value: string) => { syncOfferForm({ expireDateUtc: value }); }} onBlur={showOfferValidation} placeholder="YYYY-MM-DD" />
        <AdminTextField theme={theme} label="نسبة الخصم %" error={offerErrors.discountPercent} value={toEnglishDigits(String(offerForm.discountPercent))} keyboardType="numeric" onChangeText={(value: string) => { syncOfferForm({ discountPercent: Number(value || 0) }); }} onBlur={showOfferValidation} />
        <AdminSwitchRow theme={theme} title="نشر العرض في الصفحة الرئيسية" subtitle="يعرض العرض في نافذة التطبيق العامة" value={offerForm.showOnHomePage} onValueChange={(value) => setOfferForm((current) => ({ ...current, showOnHomePage: value }))} accent={theme.primary} />
        <AdminPrimaryButton theme={theme} label={editingOffer ? 'حفظ التغييرات' : 'نشر العرض في الصفحة الرئيسية'} icon="paper-plane-outline" onPress={() => void handleSaveOffer()} />
      </AdminBottomSheet>

      <AdminBottomSheet
        theme={theme}
        visible={clubEditorVisible}
        backdropStyle={styles.roleSheetBackdrop}
        sheetStyle={styles.roleSheet}
        contentContainerStyle={styles.roleSheetContent}
        title={editingClub ? 'تعديل النادي' : 'إضافة نادي'}
        onClose={() => {
          setEditingClub(null);
          setClubEditorVisible(false);
          setClubForm(buildClubForm());
          setClubErrors({});
          setClubValidationEnabled(false);
        }}
      >
        <AdminTextField theme={theme} label="اسم النادي *" error={clubErrors.name} value={clubForm.name} onChangeText={(value: string) => { syncClubForm({ name: value }); }} onBlur={showClubValidation} placeholder="مثال: نادي البرمجة" />
        <AdminTextField theme={theme} label="الجامعة" error={clubErrors.universityName} value={clubForm.universityName} onChangeText={(value: string) => { syncClubForm({ universityName: value }); }} onBlur={showClubValidation} />
        <AdminTextField theme={theme} label="اسم المسؤول" error={clubErrors.managerName} value={clubForm.managerName} onChangeText={(value: string) => { syncClubForm({ managerName: value }); }} onBlur={showClubValidation} maxLength={18} />
        <AdminTextField theme={theme} label="البريد الإلكتروني" error={clubErrors.managerEmail} value={clubForm.managerEmail} keyboardType="email-address" autoCapitalize="none" onChangeText={(value: string) => { syncClubForm({ managerEmail: value }); }} onBlur={showClubValidation} />
        <View style={styles.fieldSection}>
          <Text style={[styles.sectionLabel, { color: theme.mutedText }]}>نوع الاشتراك</Text>
          <AdminSegmentedOptions
            theme={theme}
            value={clubForm.subscriptionType}
            onChange={(value: AdminClubSubscriptionType) => setClubForm((current) => ({ ...current, subscriptionType: value }))}
            options={[
              { value: 'monthly', label: 'شهري - 15 د.ا', accent: theme.primary },
              { value: 'yearly', label: 'سنوي - 120 د.ا', accent: theme.primary },
            ]}
          />
        </View>
        <AdminPrimaryButton theme={theme} label={editingClub ? 'حفظ التغييرات' : 'إضافة وتفعيل الاشتراك'} icon="save-outline" onPress={() => void handleSaveClub()} />
      </AdminBottomSheet>

      <AdminConfirmDialog
        theme={theme}
        visible={deletingUser !== null}
        icon="trash-outline"
        accent={theme.danger}
        title="حذف المستخدم"
        subtitle={deletingUser?.fullName}
        description="هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="نعم، احذف"
        onConfirm={() => {
          if (deletingUser) {
            void deleteUser(deletingUser);
          }
          setDeletingUser(null);
        }}
        onCancel={() => setDeletingUser(null)}
      />
      <AdminConfirmDialog
        theme={theme}
        visible={deletingNews !== null}
        icon="trash-outline"
        accent={theme.danger}
        title="حذف الخبر"
        subtitle={deletingNews?.title}
        description="هل أنت متأكد من حذف هذا الخبر؟ لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="نعم، احذف"
        onConfirm={() => {
          if (deletingNews) {
            void deleteNews(deletingNews);
          }
          setDeletingNews(null);
        }}
        onCancel={() => setDeletingNews(null)}
      />
      <AdminConfirmDialog
        theme={theme}
        visible={deletingRole !== null}
        icon="trash-outline"
        accent={theme.danger}
        title="إلغاء الدور"
        description="هل أنت متأكد من إلغاء دور هذا المستخدم؟ سيفقد جميع الصلاحيات الممنوحة له."
        confirmLabel="نعم، إلغاء الدور"
        onConfirm={() => {
          if (deletingRole) {
            void deleteRole(deletingRole);
          }
          setDeletingRole(null);
        }}
        onCancel={() => setDeletingRole(null)}
      />
      <AdminConfirmDialog
        theme={theme}
        visible={deletingOffer !== null}
        icon="trash-outline"
        accent={theme.danger}
        title="حذف العرض"
        subtitle={deletingOffer?.title}
        description="هل أنت متأكد من حذف هذا العرض؟ لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="نعم، احذف"
        onConfirm={() => {
          if (deletingOffer) {
            void deleteOffer(deletingOffer);
          }
          setDeletingOffer(null);
        }}
        onCancel={() => setDeletingOffer(null)}
      />
      <AdminConfirmDialog
        theme={theme}
        visible={deletingClub !== null}
        icon="trash-outline"
        accent={theme.danger}
        title="حذف النادي"
        subtitle={deletingClub?.name}
        description="هل أنت متأكد من حذف هذا النادي؟ سيتم إلغاء الاشتراك المرتبط به نهائياً."
        confirmLabel="نعم، احذف"
        onConfirm={() => {
          if (deletingClub) {
            void deleteClub(deletingClub);
          }
          setDeletingClub(null);
        }}
        onCancel={() => setDeletingClub(null)}
      />
      <AdminConfirmDialog
        theme={theme}
        visible={false}
        icon={togglingUser?.status === 'active' ? 'ban-outline' : 'checkmark-circle-outline'}
        accent={togglingUser?.status === 'active' ? theme.danger : theme.success}
        title={togglingUser?.status === 'active' ? 'إيقاف المستخدم' : 'تفعيل المستخدم'}
        subtitle={togglingUser?.fullName}
        description={
          togglingUser?.status === 'active'
            ? 'هل أنت متأكد من إيقاف هذا المستخدم؟ سيتم إخفاء نشاطاته حتى إعادة تفعيله.'
            : 'هل تريد إعادة تفعيل هذا المستخدم لاسترجاع حالته إلى نشط؟'
        }
        confirmLabel={togglingUser?.status === 'active' ? 'نعم، أوقف' : 'نعم، فعّل'}
        onConfirm={() => {
          if (togglingUser) {
            void toggleUserBlocked(togglingUser);
          }
          setTogglingUser(null);
        }}
        onCancel={() => setTogglingUser(null)}
      />
      <AdminConfirmDialog theme={theme} visible={renewingClub !== null} icon="refresh-outline" accent={theme.primary} title="تجديد الاشتراك" subtitle={renewingClub?.name} subtitleColor={theme.primary} description="سيتم تمديد الاشتراك بحسب الخطة المختارة." confirmLabel="تأكيد التجديد" confirmTone="primary" onConfirm={() => void handleRenewClub()} onCancel={() => setRenewingClub(null)} />
      {renewingClub ? (
        <View style={styles.renewFloating}>
          <AdminCard theme={theme}>
            <Text style={[styles.renewLabel, { color: theme.mutedText }]}>اختر خطة التجديد</Text>
            <AdminSegmentedOptions theme={theme} value={renewType} onChange={setRenewType} options={[{ value: 'monthly', label: 'شهري - 15 د.ا', accent: theme.primary }, { value: 'yearly', label: 'سنوي - 120 د.ا', accent: theme.primary }]} />
          </AdminCard>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function AdminDashboardScreen() {
  return (
    <AdminProvider>
      <AdminDashboardContent />
    </AdminProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  root: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
    alignItems: 'center',
  },
  sectionWrap: {
    width: '100%',
    maxWidth: 620,
    paddingHorizontal: 16,
    gap: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  metricsSingle: {
    width: '49%',
    alignSelf: 'flex-end',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 12,
  },
  summaryCell: {
    width: '48.5%',
  },
  summaryGridWide: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginTop: 12,
  },
  summaryWideCell: {
    flex: 1,
  },
  stack: {
    gap: 10,
    marginTop: 6,
  },
  addDashed: {
    minHeight: 68,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  addDashedText: {
    fontFamily: 'Cairo',
    fontSize: 18,
    fontWeight: '800',
  },
  fieldSection: {
    gap: 8,
  },
  sectionLabel: {
    textAlign: 'right',
    fontFamily: 'Cairo',
    fontSize: 14,
    fontWeight: '700',
  },
  inlineError: {
    textAlign: 'right',
    fontFamily: 'Cairo',
    fontSize: 12,
    fontWeight: '700',
    marginTop: -6,
  },
  previewHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewHeaderText: {
    fontFamily: 'Cairo',
    fontSize: 14,
    fontWeight: '800',
  },
  previewTitle: {
    marginTop: 14,
    textAlign: 'right',
    fontFamily: 'Cairo',
    fontSize: 18,
    fontWeight: '900',
  },
  previewMeta: {
    marginTop: 6,
    textAlign: 'right',
    fontFamily: 'Cairo',
    fontSize: 13,
    fontWeight: '600',
  },
  roleSheetBackdrop: {
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
  roleSheet: {
    width: '100%',
    maxWidth: '100%',
    paddingHorizontal: 12,
  },
  roleSheetContent: {
    width: '100%',
    paddingBottom: 18,
    gap: 14,
  },
  permissionsCard: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 24,
  },
  permissionsTitle: {
    textAlign: 'right',
    fontFamily: 'Cairo',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 6,
  },
  permissionsWrapLocal: {
    flexDirection: 'row-reverse',
    flexWrap: 'nowrap',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 4,
  },
  permissionChipText: {
    fontFamily: 'Cairo',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 999,
  },
  renewFloating: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 18,
  },
  renewLabel: {
    textAlign: 'right',
    fontFamily: 'Cairo',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});

export default function AdminDashboardRoute() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/(auth)" />;
  }

  if (!user.isProfileCompleted) {
    return <Redirect href="/(auth)/select-university" />;
  }

  return <AdminDashboardScreen />;
}

