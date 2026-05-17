import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useEditProfileForm } from '@/hooks/edit-profile/use-edit-profile-form';
import { useEditProfileImagePicker } from '@/hooks/edit-profile/use-edit-profile-image-picker';
import { useEditProfileSaveHandlers } from '@/hooks/edit-profile/use-edit-profile-save-handlers';
import {
  useAdminEditProfileQuery,
  useAdminEditProfileUniversitiesQuery,
} from '@/hooks/queries/use-edit-profile-queries';
import { getAdminEditProfileMajorOptions } from '@/lib/edit-profile/edit-profile-config';
import {
  blurActiveEditProfileElement,
  getEditProfileTab,
  normalizeEditProfileValue,
} from '@/lib/edit-profile/edit-profile-utils';
import type { User } from '@/services/auth-api';
import type {
  AdminEditProfileSelectKey,
  AdminEditProfileTab,
  AdminEditProfileToast,
} from '@/types/edit-profile';

type UseEditProfileScreenParams = {
  requestedTab?: string;
  signIn: (nextUser: User) => void;
  user: User | null;
};

function buildToast(message: string, tone: AdminEditProfileToast['tone']): AdminEditProfileToast {
  return {
    id: `${Date.now()}`,
    message,
    tone,
  };
}

export function useEditProfileScreen({
  requestedTab,
  signIn,
  user,
}: UseEditProfileScreenParams) {
  const [activeTab, setActiveTab] = useState<AdminEditProfileTab>(getEditProfileTab(requestedTab));
  const [openSelect, setOpenSelect] = useState<AdminEditProfileSelectKey | null>(null);
  const [savedTab, setSavedTab] = useState<AdminEditProfileTab | null>(null);
  const [toast, setToast] = useState<AdminEditProfileToast | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileQuery = useAdminEditProfileQuery(Boolean(user));
  const universitiesQuery = useAdminEditProfileUniversitiesQuery(Boolean(user));
  const form = useEditProfileForm({
    profile: profileQuery.data,
    user,
  });
  const {
    clearErrors,
    getFieldState,
    getValues,
    initialValues,
    setError,
    setValue,
    syncLocalSnapshot,
    trigger,
  } = form;
  const watchedBio = form.watch('bio');
  const watchedMajor = form.watch('major');
  const watchedImage = form.watch('profileImage');
  const universities = useMemo(() => universitiesQuery.data ?? [], [universitiesQuery.data]);
  const universityOptions = useMemo(
    () =>
      universities.map((university) => ({
        label: university.name,
        value: university.id,
      })),
    [universities],
  );
  const majorOptions = useMemo(
    () => getAdminEditProfileMajorOptions(watchedMajor),
    [watchedMajor],
  );

  useEffect(() => {
    if (!user) {
      router.replace('/(auth)');
    }
  }, [user]);

  useEffect(() => {
    setActiveTab(getEditProfileTab(requestedTab));
  }, [requestedTab]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }

      if (savedTimerRef.current) {
        clearTimeout(savedTimerRef.current);
      }

      if (navigationTimerRef.current) {
        clearTimeout(navigationTimerRef.current);
      }
    };
  }, []);

  const showToast = useCallback((message: string, tone: AdminEditProfileToast['tone']) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast(buildToast(message, tone));

    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 2600);
  }, []);

  const clearSavedState = useCallback(() => {
    setSavedTab(null);
  }, []);

  const closeSelects = useCallback(() => {
    setOpenSelect(null);
  }, []);

  const toggleSelect = useCallback((key: AdminEditProfileSelectKey) => {
    setOpenSelect((current) => (current === key ? null : key));
  }, []);

  const hasPersonalChanges = useCallback(() => {
    const values = getValues();

    return (
      normalizeEditProfileValue(values.fullName) !==
        normalizeEditProfileValue(initialValues.fullName) ||
      normalizeEditProfileValue(values.phoneNumber) !==
        normalizeEditProfileValue(initialValues.phoneNumber) ||
      normalizeEditProfileValue(values.bio) !== normalizeEditProfileValue(initialValues.bio) ||
      normalizeEditProfileValue(values.websiteUrl) !==
        normalizeEditProfileValue(initialValues.websiteUrl) ||
      (values.profileImage?.uri ?? '') !== (initialValues.profileImage?.uri ?? '')
    );
  }, [getValues, initialValues]);

  const hasPersonalDetailsChanges = useCallback(() => {
    const values = getValues();

    return (
      normalizeEditProfileValue(values.fullName) !==
        normalizeEditProfileValue(initialValues.fullName) ||
      normalizeEditProfileValue(values.phoneNumber) !==
        normalizeEditProfileValue(initialValues.phoneNumber) ||
      normalizeEditProfileValue(values.bio) !== normalizeEditProfileValue(initialValues.bio) ||
      normalizeEditProfileValue(values.websiteUrl) !==
        normalizeEditProfileValue(initialValues.websiteUrl)
    );
  }, [getValues, initialValues]);

  const hasAcademicChanges = useCallback(() => {
    const values = getValues();

    return (
      values.universityId !== initialValues.universityId ||
      normalizeEditProfileValue(values.major) !==
        normalizeEditProfileValue(initialValues.major) ||
      normalizeEditProfileValue(values.studyYear) !==
        normalizeEditProfileValue(initialValues.studyYear) ||
      normalizeEditProfileValue(values.universityNumber) !==
        normalizeEditProfileValue(initialValues.universityNumber)
    );
  }, [getValues, initialValues]);

  const hasPasswordInput = useCallback(() => {
    const values = getValues();

    return Boolean(
      normalizeEditProfileValue(values.currentPassword) ||
        normalizeEditProfileValue(values.newPassword) ||
        normalizeEditProfileValue(values.confirmNewPassword),
    );
  }, [getValues]);

  const markSaved = useCallback(
    (tab: AdminEditProfileTab, message: string) => {
      if (savedTimerRef.current) {
        clearTimeout(savedTimerRef.current);
      }

      if (navigationTimerRef.current) {
        clearTimeout(navigationTimerRef.current);
      }

      setSavedTab(tab);
      showToast(message, 'success');

      savedTimerRef.current = setTimeout(() => {
        setSavedTab(null);
      }, 2200);

      navigationTimerRef.current = setTimeout(() => {
        blurActiveEditProfileElement();
        router.replace('/(tabs)/profile');
      }, 900);
    },
    [showToast],
  );

  const handleGoBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)/profile');
  }, []);

  const handleTabChange = useCallback(
    (tab: AdminEditProfileTab) => {
      closeSelects();
      clearSavedState();
      setActiveTab(tab);
    },
    [clearSavedState, closeSelects],
  );

  const handlePickImage = useEditProfileImagePicker({
    clearErrors,
    onDirty: clearSavedState,
    setValue,
    showToast,
  });

  const { handleSaveActiveTab, isSaving } = useEditProfileSaveHandlers({
    activeTab,
    clearErrors,
    closeSelects,
    getFieldState,
    getValues,
    hasAcademicChanges,
    hasPasswordInput,
    hasPersonalChanges,
    hasPersonalDetailsChanges,
    markSaved,
    setError,
    showToast,
    signIn,
    syncLocalSnapshot,
    trigger,
    universities,
    user,
  });

  const buttonLabel =
    savedTab === activeTab ? 'تم الحفظ بنجاح' : isSaving ? 'جارٍ الحفظ...' : 'حفظ التغييرات';

  return {
    activeTab,
    buttonLabel,
    closeSelects,
    clearSavedState,
    currentAvatarUri: watchedImage?.uri ?? null,
    form,
    handleGoBack,
    handlePickImage,
    handleSaveActiveTab,
    handleTabChange,
    hasPasswordInput,
    isSaving,
    majorOptions,
    openSelect,
    profileQuery,
    securityVisibility: {
      showConfirmPassword,
      showCurrentPassword,
      showNewPassword,
      toggleConfirmPassword: () => setShowConfirmPassword((current) => !current),
      toggleCurrentPassword: () => setShowCurrentPassword((current) => !current),
      toggleNewPassword: () => setShowNewPassword((current) => !current),
    },
    toast,
    toggleSelect,
    universities,
    universitiesQuery,
    universityOptions,
    watchedBioLength: watchedBio.length,
  };
}
