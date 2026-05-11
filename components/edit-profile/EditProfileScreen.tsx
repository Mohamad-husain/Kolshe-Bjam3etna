import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { getValidImageUri } from '@/components/chat/chat-ui';
import { useAuth } from '@/contexts/auth-context';
import {
  adminEditProfileStudyYearOptions,
  getAdminEditProfileMajorOptions,
  normalizeStudyYearForForm,
  normalizeWebsiteUrl,
} from '@/lib/edit-profile-config';
import { useAdminEditProfileTheme } from '@/lib/edit-profile-theme';
import {
  useAdminEditProfileAcademicMutation,
  useAdminEditProfilePasswordMutation,
  useAdminEditProfilePersonalMutation,
} from '@/hooks/mutations/use-edit-profile-mutations';
import {
  useAdminEditProfileQuery,
  useAdminEditProfileUniversitiesQuery,
} from '@/hooks/queries/use-edit-profile-queries';
import type { AccountProfile, University } from '@/services/auth-api';
import type {
  AdminEditProfileFormValues,
  AdminEditProfileTab,
  AdminEditProfileToast,
} from '@/types/edit-profile';
import { FontFamily, FontSize, FontWeight } from '@/styles/ui-theme';

import { EditProfileHero } from './EditProfileHero';
import { EditProfileInfoBanner } from './EditProfileInfoBanner';
import { EditProfileSegmentedField } from './EditProfileSegmentedField';
import { EditProfileSelectField } from './EditProfileSelectField';
import { EditProfileTabs } from './EditProfileTabs';
import { EditProfileTextField } from './EditProfileTextField';
import { EditProfileToastBanner } from './EditProfileToast';

function buildFormValues(
  profile: AccountProfile | null | undefined,
  userEmail: string,
  userName: string,
) {
  const imageUri = getValidImageUri(normalizeValue(profile?.profileImageUrl) || null);

  return {
    fullName: normalizeValue(profile?.fullName) || userName,
    universityEmail: normalizeValue(profile?.email) || userEmail,
    phoneNumber: normalizeValue(profile?.phoneNumber),
    bio: normalizeValue(profile?.bio),
    websiteUrl: normalizeValue(profile?.websiteUrl),
    universityId: profile?.universityId ?? null,
    universityName: normalizeValue(profile?.universityName),
    major: normalizeValue(profile?.major),
    studyYear: normalizeStudyYearForForm(profile?.studyYear),
    universityNumber: normalizeValue(profile?.universityNumber),
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    profileImage: imageUri
      ? {
          uri: imageUri,
          isRemote: true,
        }
      : null,
  } satisfies AdminEditProfileFormValues;
}

function normalizeValue(value: string | number | null | undefined) {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value).trim();
  }

  return '';
}

function buildToast(message: string, tone: AdminEditProfileToast['tone']): AdminEditProfileToast {
  return {
    id: `${Date.now()}`,
    message,
    tone,
  };
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function normalizeDigits(value: string | number | null | undefined) {
  return normalizeValue(value).replace(/\D/g, '');
}

function blurActiveWebElement() {
  if (Platform.OS !== 'web') {
    return;
  }

  const activeElement = (
    globalThis as {
      document?: {
        activeElement?: {
          blur?: () => void;
        } | null;
      };
    }
  ).document?.activeElement;

  if (activeElement && typeof activeElement.blur === 'function') {
    activeElement.blur();
  }
}

function validateFullName(value: string) {
  if (value !== value.trim()) {
    return 'الاسم لا يجب أن يبدأ أو ينتهي بمسافات.';
  }

  const normalizedValue = normalizeValue(value);

  if (!normalizedValue) {
    return 'الاسم الكامل مطلوب.';
  }

  if (/^\d/.test(normalizedValue)) {
    return 'الاسم لا يجب أن يبدأ برقم.';
  }

  if (normalizedValue.length < 4) {
    return 'الاسم الكامل يجب أن يكون 4 أحرف على الأقل.';
  }

  if (/\d/.test(normalizedValue)) {
    return 'الاسم الكامل لا يجب أن يحتوي على أرقام.';
  }

  if (!/^[A-Za-z\u0600-\u06FF][A-Za-z\u0600-\u06FF\s]*$/.test(normalizedValue)) {
    return 'الاسم الكامل يجب أن يحتوي على أحرف ومسافات فقط.';
  }

  return true;
}

function validateUniversityEmail(value: string) {
  const normalizedValue = normalizeValue(value);

  if (!normalizedValue) {
    return 'البريد الجامعي مطلوب.';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedValue)) {
    return 'أدخل بريداً جامعياً صالحاً.';
  }

  return true;
}

function validatePhoneNumber(value: string) {
  const normalizedValue = normalizeValue(value);

  if (!normalizedValue) {
    return 'رقم الهاتف مطلوب.';
  }

  if (!/^[0-9+\-\s()]+$/.test(normalizedValue)) {
    return 'رقم الهاتف غير صالح.';
  }

  const digits = normalizeDigits(normalizedValue);

  if (digits.length < 8 || digits.length > 15) {
    return 'رقم الهاتف يجب أن يحتوي على 8 إلى 15 رقماً.';
  }

  return true;
}

function validateBio(value: string) {
  const normalizedValue = normalizeValue(value);

  if (!normalizedValue) {
    return 'النبذة مطلوبة.';
  }

  if (normalizedValue.length < 10) {
    return 'النبذة يجب أن تكون 10 أحرف على الأقل.';
  }

  if (normalizedValue.length > 200) {
    return 'الحد الأقصى للنبذة هو 200 حرف.';
  }

  return true;
}

function validateWebsiteUrl(value: string) {
  const normalizedValue = normalizeValue(value);

  if (!normalizedValue) {
    return true;
  }

  const normalizedUrl = normalizeWebsiteUrl(normalizedValue);

  if (!/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(normalizedUrl)) {
    return 'أدخل رابطاً صالحاً.';
  }

  if (normalizedUrl.length > 200) {
    return 'رابط الموقع طويل جداً.';
  }

  return true;
}

function validateMajor(value: string) {
  const normalizedValue = normalizeValue(value);

  if (!normalizedValue) {
    return 'يرجى اختيار التخصص أو القسم.';
  }

  if (normalizedValue.length < 2) {
    return 'التخصص أو القسم غير صالح.';
  }

  return true;
}

function validateStudyYear(value: string) {
  const normalizedValue = normalizeValue(value);

  if (!normalizedValue) {
    return 'يرجى اختيار السنة الدراسية.';
  }

  if (!adminEditProfileStudyYearOptions.some((option) => option.value === normalizedValue)) {
    return 'يرجى اختيار سنة دراسية صالحة.';
  }

  return true;
}

function validateUniversityNumber(value: string) {
  const normalizedValue = normalizeDigits(value);

  if (!normalizedValue) {
    return 'الرقم الجامعي مطلوب.';
  }

  if (!/^\d{8}$/.test(normalizedValue)) {
    return 'الرقم الجامعي يجب أن يكون 8 أرقام بالضبط.';
  }

  return true;
}

export function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ tab?: string }>();
  const theme = useAdminEditProfileTheme();
  const { user, signIn } = useAuth();
  const initialTab =
    params.tab === 'academic' || params.tab === 'security' || params.tab === 'personal'
      ? params.tab
      : 'personal';

  const [activeTab, setActiveTab] = useState<AdminEditProfileTab>(initialTab);
  const [openSelect, setOpenSelect] = useState<'university' | 'major' | null>(null);
  const [toast, setToast] = useState<AdminEditProfileToast | null>(null);
  const [savedTab, setSavedTab] = useState<AdminEditProfileTab | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const profileQuery = useAdminEditProfileQuery(Boolean(user));
  const universitiesQuery = useAdminEditProfileUniversitiesQuery(Boolean(user));
  const personalMutation = useAdminEditProfilePersonalMutation();
  const academicMutation = useAdminEditProfileAcademicMutation();
  const passwordMutation = useAdminEditProfilePasswordMutation();
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialValuesRef = useRef<AdminEditProfileFormValues | null>(null);

  const {
    clearErrors,
    control,
    formState: { errors },
    getFieldState,
    getValues,
    reset,
    setError,
    setValue,
    trigger,
    watch,
  } = useForm<AdminEditProfileFormValues>({
    defaultValues: buildFormValues(null, user?.email ?? '', user?.name ?? ''),
  });

  const watchedBio = watch('bio');
  const watchedMajor = watch('major');
  const watchedImage = watch('profileImage');

  useEffect(() => {
    if (!user) {
      router.replace('/(auth)');
      return;
    }

    const nextValues = buildFormValues(profileQuery.data, user.email, user.name);
    reset(nextValues);
    initialValuesRef.current = nextValues;
  }, [profileQuery.data, reset, user]);

  useEffect(() => {
    if (params.tab === 'academic' || params.tab === 'security' || params.tab === 'personal') {
      setActiveTab(params.tab);
    }
  }, [params.tab]);

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

  const universities = useMemo(() => universitiesQuery.data ?? [], [universitiesQuery.data]);
  const universityOptions = useMemo(
    () =>
      universities.map((university: University) => ({
        label: university.name,
        value: university.id,
      })),
    [universities],
  );
  const majorOptions = useMemo(
    () => getAdminEditProfileMajorOptions(watchedMajor),
    [watchedMajor],
  );

  const isSaving =
    personalMutation.isPending || academicMutation.isPending || passwordMutation.isPending;
  const currentAvatarUri = watchedImage?.uri ?? null;
  const buttonLabel =
    savedTab === activeTab
      ? 'تم الحفظ بنجاح'
      : isSaving
        ? 'جارٍ الحفظ...'
        : 'حفظ التغييرات';

  if (!user) {
    return null;
  }

  const initialValues =
    initialValuesRef.current ?? buildFormValues(profileQuery.data, user.email, user.name);

  const showToast = (message: string, tone: AdminEditProfileToast['tone']) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast(buildToast(message, tone));

    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 2600);
  };

  const getFirstValidationMessage = (fieldNames: (keyof AdminEditProfileFormValues)[]) => {
    for (const fieldName of fieldNames) {
      const message = getFieldState(fieldName).error?.message;

      if (typeof message === 'string' && message.trim()) {
        return message.trim();
      }
    }

    return null;
  };

  const markSaved = (tab: AdminEditProfileTab, message: string) => {
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
      blurActiveWebElement();
      router.replace('/(tabs)/profile');
    }, 900);
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)/profile');
  };

  const syncLocalSnapshot = (nextValues: AdminEditProfileFormValues) => {
    reset(nextValues);
    initialValuesRef.current = nextValues;
  };

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      showToast('يرجى السماح بالوصول للصور لاختيار صورة جديدة.', 'warning');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.92,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];

    if (!asset) {
      return;
    }

    setValue('profileImage', {
      uri: asset.uri,
      name: asset.fileName ?? asset.file?.name ?? `profile-${Date.now()}.jpg`,
      type: asset.mimeType ?? asset.file?.type ?? 'image/jpeg',
      file: asset.file,
      isRemote: false,
    });
    clearErrors('profileImage');
    setSavedTab(null);
  };

  const hasPersonalChanges = () => {
    const values = getValues();

    return (
      normalizeValue(values.fullName) !== normalizeValue(initialValues.fullName) ||
      normalizeValue(values.phoneNumber) !== normalizeValue(initialValues.phoneNumber) ||
      normalizeValue(values.bio) !== normalizeValue(initialValues.bio) ||
      normalizeValue(values.websiteUrl) !== normalizeValue(initialValues.websiteUrl) ||
      (values.profileImage?.uri ?? '') !== (initialValues.profileImage?.uri ?? '')
    );
  };

  const hasPersonalDetailsChanges = () => {
    const values = getValues();

    return (
      normalizeValue(values.fullName) !== normalizeValue(initialValues.fullName) ||
      normalizeValue(values.phoneNumber) !== normalizeValue(initialValues.phoneNumber) ||
      normalizeValue(values.bio) !== normalizeValue(initialValues.bio) ||
      normalizeValue(values.websiteUrl) !== normalizeValue(initialValues.websiteUrl)
    );
  };

  const hasAcademicChanges = () => {
    const values = getValues();

    return (
      values.universityId !== initialValues.universityId ||
      normalizeValue(values.major) !== normalizeValue(initialValues.major) ||
      normalizeValue(values.studyYear) !== normalizeValue(initialValues.studyYear) ||
      normalizeValue(values.universityNumber) !== normalizeValue(initialValues.universityNumber)
    );
  };

  const hasPasswordInput = () => {
    const values = getValues();
    return Boolean(
      normalizeValue(values.currentPassword) ||
        normalizeValue(values.newPassword) ||
        normalizeValue(values.confirmNewPassword),
    );
  };

  const handleSavePersonal = async () => {
    const values = getValues();
    const valid = await trigger(['fullName', 'phoneNumber', 'bio']);

    if (!values.profileImage?.uri?.trim()) {
      setError('profileImage', {
        type: 'required',
        message: 'يرجى اختيار صورة شخصية.',
      });
      showToast('يرجى اختيار صورة شخصية قبل الحفظ.', 'error');
      return;
    }

    clearErrors('profileImage');

    if (!valid) {
      showToast(
        getFirstValidationMessage(['fullName', 'phoneNumber', 'bio']) ??
          'يرجى مراجعة البيانات الشخصية قبل الحفظ.',
        'error',
      );
      return;
    }

    if (!hasPersonalChanges()) {
      showToast('لا توجد تغييرات جديدة في البيانات الشخصية.', 'info');
      return;
    }

    personalMutation.mutate(
      {
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        bio: values.bio,
        websiteUrl: values.websiteUrl,
        profileImage: values.profileImage,
        skipPersonalDetailsUpdate: !hasPersonalDetailsChanges(),
      },
      {
        onSuccess: (message) => {
          const nextValues = {
            ...values,
          };

          syncLocalSnapshot(nextValues);
          signIn({ ...user, name: normalizeValue(nextValues.fullName) || user.name });
          markSaved('personal', message || 'تم حفظ البيانات الشخصية');
        },
        onError: (error) => {
          showToast(getErrorMessage(error, 'تعذر حفظ البيانات الشخصية.'), 'error');
        },
      },
    );
  };

  const handleSaveAcademic = async () => {
    const values = getValues();
    const valid = await trigger(['universityId', 'major', 'studyYear', 'universityNumber']);

    if (!valid) {
      showToast(
        getFirstValidationMessage(['universityId', 'major', 'studyYear', 'universityNumber']) ??
          'يرجى مراجعة البيانات الأكاديمية قبل الحفظ.',
        'error',
      );
      return;
    }

    if (!hasAcademicChanges()) {
      showToast('لا توجد تغييرات جديدة في البيانات الأكاديمية.', 'info');
      return;
    }

    const selectedUniversity = universities.find((item) => item.id === values.universityId);
    const universityName = selectedUniversity?.name ?? values.universityName;

    if (!values.universityId || !universityName.trim()) {
      showToast('يرجى اختيار الجامعة أولاً.', 'error');
      return;
    }

    academicMutation.mutate(
      {
        universityId: values.universityId,
        universityName,
        major: values.major,
        studyYear: values.studyYear,
        universityNumber: normalizeDigits(values.universityNumber),
      },
      {
        onSuccess: (message) => {
          const nextValues = {
            ...values,
            universityName,
          };

          syncLocalSnapshot(nextValues);
          markSaved('academic', message || 'تم حفظ البيانات الأكاديمية');
        },
        onError: (error) => {
          showToast(getErrorMessage(error, 'تعذر حفظ البيانات الأكاديمية.'), 'error');
        },
      },
    );
  };

  const handleSaveSecurity = async () => {
    const values = getValues();
    const valid = await trigger(['currentPassword', 'newPassword', 'confirmNewPassword']);

    if (!valid) {
      showToast(
        getFirstValidationMessage([
          'currentPassword',
          'newPassword',
          'confirmNewPassword',
        ]) ?? 'يرجى مراجعة حقول كلمة المرور.',
        'error',
      );
      return;
    }

    if (!hasPasswordInput()) {
      showToast('أدخل بيانات كلمة المرور إذا كنت تريد تغييرها.', 'warning');
      return;
    }

    passwordMutation.mutate(
      {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmNewPassword,
      },
      {
        onSuccess: (message) => {
          const nextValues = {
            ...values,
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: '',
          };

          syncLocalSnapshot(nextValues);
          markSaved('security', message || 'تم تحديث كلمة المرور');
        },
        onError: (error) => {
          showToast(getErrorMessage(error, 'تعذر تحديث كلمة المرور.'), 'error');
        },
      },
    );
  };

  const handleSaveActiveTab = () => {
    blurActiveWebElement();
    setOpenSelect(null);

    if (activeTab === 'personal') {
      void handleSavePersonal();
      return;
    }

    if (activeTab === 'academic') {
      void handleSaveAcademic();
      return;
    }

    void handleSaveSecurity();
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.heroBackground }]}
      edges={['top']}
    >
      <StatusBar style="light" />

      <View style={[styles.container, { backgroundColor: theme.pageBackground }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoider}
        >
          <ScrollView
            contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          >
            <EditProfileHero
              avatarUri={currentAvatarUri}
              isSaving={isSaving}
              onBack={handleGoBack}
              onPickImage={() => {
                void handlePickImage();
              }}
              onSave={handleSaveActiveTab}
              theme={theme}
              topInset={insets.top}
            />

            <View style={[styles.body, { backgroundColor: theme.pageBackground }]}>
              <View style={styles.tabsWrap}>
                <EditProfileTabs
                  activeTab={activeTab}
                  onChange={(tab) => {
                    setOpenSelect(null);
                    setSavedTab(null);
                    setActiveTab(tab);
                  }}
                  theme={theme}
                />
              </View>

              <View style={styles.section}>
                {profileQuery.isError ? (
                  <EditProfileInfoBanner
                    text={getErrorMessage(profileQuery.error, 'تعذر تحميل بيانات الملف حالياً.')}
                    theme={theme}
                    tone="error"
                  />
                ) : null}

                {activeTab === 'personal' && errors.profileImage?.message ? (
                  <EditProfileInfoBanner
                    text={errors.profileImage.message}
                    theme={theme}
                    tone="error"
                  />
                ) : null}

                {activeTab === 'personal' ? (
                  <>
                    <Controller
                      control={control}
                      name="fullName"
                      rules={{ validate: validateFullName }}
                      render={({ field: { onChange, value } }) => (
                        <EditProfileTextField
                          error={errors.fullName?.message}
                          icon="person-outline"
                          label="الاسم الكامل"
                          onChangeText={(text) => {
                            setSavedTab(null);
                            onChange(text);
                          }}
                          placeholder="أدخل الاسم الكامل"
                          required
                          theme={theme}
                          value={value}
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="universityEmail"
                      rules={{ validate: validateUniversityEmail }}
                      render={({ field: { value } }) => (
                        <EditProfileTextField
                          error={errors.universityEmail?.message}
                          icon="mail-outline"
                          keyboardType="email-address"
                          label="البريد الجامعي"
                          onChangeText={() => undefined}
                          placeholder="البريد الجامعي"
                          readOnly
                          required
                          theme={theme}
                          value={value}
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="phoneNumber"
                      rules={{ validate: validatePhoneNumber }}
                      render={({ field: { onChange, value } }) => (
                        <EditProfileTextField
                          error={errors.phoneNumber?.message}
                          icon="call-outline"
                          keyboardType="phone-pad"
                          label="رقم الهاتف"
                          onChangeText={(text) => {
                            setSavedTab(null);
                            onChange(text);
                          }}
                          placeholder="مثال: 0791234567"
                          required
                          theme={theme}
                          value={value}
                        />
                      )}
                    />

                    <View style={styles.counterLabelRow}>
                      <Text style={[styles.counterText, { color: theme.mutedText }]}>
                        ({watchedBio.length}/200)
                      </Text>
                      <Text style={[styles.counterLabel, { color: theme.text }]}>نبذة عنك</Text>
                    </View>

                    <Controller
                      control={control}
                      name="bio"
                      rules={{ validate: validateBio }}
                      render={({ field: { onChange, value } }) => (
                        <EditProfileTextField
                          error={errors.bio?.message}
                          icon="document-text-outline"
                          label=""
                          maxLength={200}
                          multiline
                          onChangeText={(text) => {
                            setSavedTab(null);
                            onChange(text);
                          }}
                          placeholder="اكتب نبذة قصيرة عنك"
                          theme={theme}
                          value={value}
                        />
                      )}
                    />

                    <View style={styles.hiddenField}>
                      <Controller
                      control={control}
                      name="websiteUrl"
                      rules={{ validate: validateWebsiteUrl }}
                      render={({ field: { onChange, value } }) => (
                        <EditProfileTextField
                          error={errors.websiteUrl?.message}
                          icon="globe-outline"
                          keyboardType="url"
                          label="الموقع الشخصي"
                          onChangeText={(text) => {
                            setSavedTab(null);
                            onChange(text);
                          }}
                          placeholder="https://yoursite.com"
                          theme={theme}
                          value={value}
                        />
                      )}
                      />
                    </View>
                  </>
                ) : null}

                {activeTab === 'academic' ? (
                  <>
                    <Controller
                      control={control}
                      name="universityId"
                      rules={{
                        validate: (value) =>
                          typeof value === 'number' && value > 0
                            ? true
                            : 'يرجى اختيار الجامعة.',
                      }}
                      render={({ field: { onChange, value } }) => (
                        <EditProfileSelectField
                          error={errors.universityId?.message}
                          icon="book-outline"
                          isOpen={openSelect === 'university'}
                          label="الجامعة"
                          onSelect={(nextValue) => {
                            setSavedTab(null);
                            onChange(nextValue);
                            setOpenSelect(null);

                            const selectedUniversity = universities.find(
                              (item) => item.id === nextValue,
                            );

                            if (selectedUniversity) {
                              setValue('universityName', selectedUniversity.name);
                            }
                          }}
                          onToggle={() =>
                            setOpenSelect((current) =>
                              current === 'university' ? null : 'university',
                            )
                          }
                          options={universityOptions}
                          placeholder={
                            universitiesQuery.isLoading
                              ? 'جارٍ تحميل الجامعات...'
                              : 'اختر الجامعة'
                          }
                          required
                          selectedValue={value}
                          theme={theme}
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="major"
                      rules={{ validate: validateMajor }}
                      render={({ field: { onChange, value } }) => (
                        <EditProfileSelectField
                          error={errors.major?.message}
                          icon="book-outline"
                          isOpen={openSelect === 'major'}
                          label="التخصص / القسم"
                          onSelect={(nextValue) => {
                            setSavedTab(null);
                            onChange(nextValue);
                            setOpenSelect(null);
                          }}
                          onToggle={() =>
                            setOpenSelect((current) => (current === 'major' ? null : 'major'))
                          }
                          options={majorOptions}
                          placeholder="اختر التخصص"
                          required
                          selectedValue={value || null}
                          theme={theme}
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="studyYear"
                      rules={{ validate: validateStudyYear }}
                      render={({ field: { onChange, value } }) => (
                        <EditProfileSegmentedField
                          error={errors.studyYear?.message}
                          label="السنة الدراسية"
                          onChange={(nextValue) => {
                            setSavedTab(null);
                            onChange(nextValue);
                          }}
                          options={adminEditProfileStudyYearOptions}
                          theme={theme}
                          value={value}
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="universityNumber"
                      rules={{ validate: validateUniversityNumber }}
                      render={({ field: { onChange, value } }) => (
                        <EditProfileTextField
                          error={errors.universityNumber?.message}
                          icon="location-outline"
                          keyboardType="number-pad"
                          label="الرقم الجامعي"
                          onChangeText={(text) => {
                            setSavedTab(null);
                            onChange(text);
                          }}
                          placeholder="مثال: 202110123"
                          required
                          theme={theme}
                          value={value}
                        />
                      )}
                    />

                    <EditProfileInfoBanner
                      text="البريد الجامعي المسجل سيتم التحقق منه تلقائياً، تأكد من استخدام بريدك الجامعي الرسمي للحصول على التوثيق الفوري."
                      theme={theme}
                    />
                  </>
                ) : null}

                {activeTab === 'security' ? (
                  <>
                    <EditProfileInfoBanner
                      text="لتغيير كلمة المرور أدخل كلمة المرور الحالية أولاً، اتركها فارغة إذا لا تريد تغييرها."
                      theme={theme}
                      tone="warning"
                    />

                    <Controller
                      control={control}
                      name="currentPassword"
                      rules={{
                        validate: (value) => {
                          return !hasPasswordInput()
                            ? true
                            : Boolean(value.trim()) || 'أدخل كلمة المرور الحالية.';
                        },
                      }}
                      render={({ field: { onChange, value } }) => (
                        <EditProfileTextField
                          error={errors.currentPassword?.message}
                          icon="lock-closed-outline"
                          label="كلمة المرور الحالية"
                          onChangeText={(text) => {
                            setSavedTab(null);
                            onChange(text);
                          }}
                          onPressSuffix={() => setShowCurrentPassword((current) => !current)}
                          placeholder="أدخل كلمة المرور الحالية"
                          secureTextEntry={!showCurrentPassword}
                          suffixIcon={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                          theme={theme}
                          value={value}
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="newPassword"
                      rules={{
                        validate: (value) => {
                          const values = getValues();
                          const normalizedValue = normalizeValue(value);
                          const normalizedCurrentPassword = normalizeValue(values.currentPassword);

                          if (!hasPasswordInput()) {
                            return true;
                          }

                          if (!normalizedValue) {
                            return 'أدخل كلمة المرور الجديدة.';
                          }

                          if (normalizedValue.length < 8) {
                            return 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل.';
                          }

                          if (
                            normalizedCurrentPassword &&
                            normalizedValue === normalizedCurrentPassword
                          ) {
                            return 'يجب أن تكون كلمة المرور الجديدة مختلفة عن الحالية.';
                          }

                          return true;
                        },
                      }}
                      render={({ field: { onChange, value } }) => (
                        <EditProfileTextField
                          error={errors.newPassword?.message}
                          icon="lock-closed-outline"
                          label="كلمة المرور الجديدة"
                          onChangeText={(text) => {
                            setSavedTab(null);
                            onChange(text);
                          }}
                          onPressSuffix={() => setShowNewPassword((current) => !current)}
                          placeholder="8 أحرف على الأقل"
                          secureTextEntry={!showNewPassword}
                          suffixIcon={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                          theme={theme}
                          value={value}
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="confirmNewPassword"
                      rules={{
                        validate: (value) => {
                          const values = getValues();
                          if (!hasPasswordInput()) {
                            return true;
                          }

                          if (!value.trim()) {
                            return 'أعد كتابة كلمة المرور الجديدة.';
                          }

                          return value === values.newPassword || 'كلمتا المرور غير متطابقتين.';
                        },
                      }}
                      render={({ field: { onChange, value } }) => (
                        <EditProfileTextField
                          error={errors.confirmNewPassword?.message}
                          icon="lock-closed-outline"
                          label="تأكيد كلمة المرور"
                          onChangeText={(text) => {
                            setSavedTab(null);
                            onChange(text);
                          }}
                          onPressSuffix={() => setShowConfirmPassword((current) => !current)}
                          placeholder="أعد كتابة كلمة المرور الجديدة"
                          secureTextEntry={!showConfirmPassword}
                          suffixIcon={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                          theme={theme}
                          value={value}
                        />
                      )}
                    />
                  </>
                ) : null}

                <Pressable
                  disabled={isSaving}
                  onPress={handleSaveActiveTab}
                  style={(state) => {
                    const hovered = (state as { hovered?: boolean }).hovered === true;

                    return [
                      styles.saveButton,
                      {
                        backgroundColor: isSaving ? theme.primaryPressed : theme.primary,
                        shadowColor: theme.primary,
                      },
                      hovered && !isSaving && styles.hovered,
                      state.pressed && !isSaving && styles.pressed,
                    ];
                  }}
                >
                  <Text style={styles.saveButtonText}>{buttonLabel}</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <EditProfileToastBanner bottomInset={insets.bottom} theme={theme} toast={toast} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  keyboardAvoider: {
    flex: 1,
  },
  content: {
    backgroundColor: 'transparent',
  },
  body: {
    flex: 1,
    marginTop: -2,
  },
  tabsWrap: {
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  section: {
    gap: 18,
    paddingHorizontal: 24,
    paddingTop: 22,
  },
  hiddenField: {
    display: 'none',
  },
  counterLabelRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  counterLabel: {
    textAlign: 'right',
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    writingDirection: 'rtl',
  },
  counterText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  saveButton: {
    minHeight: 70,
    borderRadius: 24,
    marginTop: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.24,
    shadowRadius: 20,
    elevation: 7,
  },
  saveButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontFamily: FontFamily.cairo,
    fontSize: 18,
    fontWeight: FontWeight.bold,
  },
  hovered: {
    opacity: 0.94,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
  },
});
