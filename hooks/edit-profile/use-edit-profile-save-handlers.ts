import { useCallback, useMemo } from 'react';
import type {
  UseFormClearErrors,
  UseFormGetFieldState,
  UseFormGetValues,
  UseFormSetError,
  UseFormTrigger,
} from 'react-hook-form';

import {
  useAdminEditProfileAcademicMutation,
  useAdminEditProfilePasswordMutation,
  useAdminEditProfilePersonalMutation,
} from '@/hooks/mutations/use-edit-profile-mutations';
import {
  academicValidationFields,
  personalValidationFields,
  securityValidationFields,
} from '@/lib/edit-profile/edit-profile-validation';
import {
  blurActiveEditProfileElement,
  getEditProfileErrorMessage,
  normalizeEditProfileDigits,
  normalizeEditProfileValue,
} from '@/lib/edit-profile/edit-profile-utils';
import type { University, User } from '@/services/auth-api';
import type {
  AdminEditProfileFormValues,
  AdminEditProfileTab,
  AdminEditProfileToast,
} from '@/types/edit-profile';

type UseEditProfileSaveHandlersParams = {
  activeTab: AdminEditProfileTab;
  clearErrors: UseFormClearErrors<AdminEditProfileFormValues>;
  closeSelects: () => void;
  getFieldState: UseFormGetFieldState<AdminEditProfileFormValues>;
  getValues: UseFormGetValues<AdminEditProfileFormValues>;
  hasAcademicChanges: () => boolean;
  hasPasswordInput: () => boolean;
  hasPersonalChanges: () => boolean;
  hasPersonalDetailsChanges: () => boolean;
  markSaved: (tab: AdminEditProfileTab, message: string) => void;
  setError: UseFormSetError<AdminEditProfileFormValues>;
  showToast: (message: string, tone: AdminEditProfileToast['tone']) => void;
  signIn: (nextUser: User) => void;
  syncLocalSnapshot: (nextValues: AdminEditProfileFormValues) => void;
  trigger: UseFormTrigger<AdminEditProfileFormValues>;
  universities: University[];
  user: User | null;
};

export function useEditProfileSaveHandlers({
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
}: UseEditProfileSaveHandlersParams) {
  const personalMutation = useAdminEditProfilePersonalMutation();
  const academicMutation = useAdminEditProfileAcademicMutation();
  const passwordMutation = useAdminEditProfilePasswordMutation();

  const getFirstValidationMessage = useCallback(
    (fieldNames: readonly (keyof AdminEditProfileFormValues)[]) => {
      for (const fieldName of fieldNames) {
        const message = getFieldState(fieldName).error?.message;

        if (typeof message === 'string' && message.trim()) {
          return message.trim();
        }
      }

      return null;
    },
    [getFieldState],
  );

  const handleSavePersonal = useCallback(async () => {
    const values = getValues();
    const valid = await trigger([...personalValidationFields]);

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
        getFirstValidationMessage(personalValidationFields) ??
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

          if (user) {
            signIn({ ...user, name: normalizeEditProfileValue(nextValues.fullName) || user.name });
          }

          markSaved('personal', message || 'تم حفظ البيانات الشخصية');
        },
        onError: (error) => {
          showToast(getEditProfileErrorMessage(error, 'تعذر حفظ البيانات الشخصية.'), 'error');
        },
      },
    );
  }, [
    clearErrors,
    getFirstValidationMessage,
    getValues,
    hasPersonalChanges,
    hasPersonalDetailsChanges,
    markSaved,
    personalMutation,
    setError,
    showToast,
    signIn,
    syncLocalSnapshot,
    trigger,
    user,
  ]);

  const handleSaveAcademic = useCallback(async () => {
    const values = getValues();
    const valid = await trigger([...academicValidationFields]);

    if (!valid) {
      showToast(
        getFirstValidationMessage(academicValidationFields) ??
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
        universityNumber: normalizeEditProfileDigits(values.universityNumber),
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
          showToast(getEditProfileErrorMessage(error, 'تعذر حفظ البيانات الأكاديمية.'), 'error');
        },
      },
    );
  }, [
    academicMutation,
    getFirstValidationMessage,
    getValues,
    hasAcademicChanges,
    markSaved,
    showToast,
    syncLocalSnapshot,
    trigger,
    universities,
  ]);

  const handleSaveSecurity = useCallback(async () => {
    const values = getValues();
    const valid = await trigger([...securityValidationFields]);

    if (!valid) {
      showToast(
        getFirstValidationMessage(securityValidationFields) ?? 'يرجى مراجعة حقول كلمة المرور.',
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
          showToast(getEditProfileErrorMessage(error, 'تعذر تحديث كلمة المرور.'), 'error');
        },
      },
    );
  }, [
    getFirstValidationMessage,
    getValues,
    hasPasswordInput,
    markSaved,
    passwordMutation,
    showToast,
    syncLocalSnapshot,
    trigger,
  ]);

  const handleSaveActiveTab = useCallback(() => {
    blurActiveEditProfileElement();
    closeSelects();

    if (activeTab === 'personal') {
      void handleSavePersonal();
      return;
    }

    if (activeTab === 'academic') {
      void handleSaveAcademic();
      return;
    }

    void handleSaveSecurity();
  }, [activeTab, closeSelects, handleSaveAcademic, handleSavePersonal, handleSaveSecurity]);

  const isSaving = useMemo(
    () => personalMutation.isPending || academicMutation.isPending || passwordMutation.isPending,
    [academicMutation.isPending, passwordMutation.isPending, personalMutation.isPending],
  );

  return {
    handleSaveAcademic,
    handleSaveActiveTab,
    handleSavePersonal,
    handleSaveSecurity,
    isSaving,
  };
}
