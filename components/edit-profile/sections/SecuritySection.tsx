import { useMemo } from 'react';
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormGetValues,
} from 'react-hook-form';

import { EditProfileInfoBanner } from '@/components/edit-profile/EditProfileInfoBanner';
import { EditProfileTextField } from '@/components/edit-profile/EditProfileTextField';
import type { AdminEditProfileTheme } from '@/lib/edit-profile/edit-profile-theme';
import {
  createConfirmNewPasswordValidator,
  createCurrentPasswordValidator,
  createNewPasswordValidator,
} from '@/lib/edit-profile/edit-profile-validation';
import type { AdminEditProfileFormValues } from '@/types/edit-profile';

type SecurityVisibility = {
  showConfirmPassword: boolean;
  showCurrentPassword: boolean;
  showNewPassword: boolean;
  toggleConfirmPassword: () => void;
  toggleCurrentPassword: () => void;
  toggleNewPassword: () => void;
};

type SecuritySectionProps = {
  control: Control<AdminEditProfileFormValues>;
  errors: FieldErrors<AdminEditProfileFormValues>;
  getValues: UseFormGetValues<AdminEditProfileFormValues>;
  hasPasswordInput: () => boolean;
  onDirty: () => void;
  theme: AdminEditProfileTheme;
  visibility: SecurityVisibility;
};

export function SecuritySection({
  control,
  errors,
  getValues,
  hasPasswordInput,
  onDirty,
  theme,
  visibility,
}: SecuritySectionProps) {
  const currentPasswordValidator = useMemo(
    () => createCurrentPasswordValidator(hasPasswordInput),
    [hasPasswordInput],
  );
  const newPasswordValidator = useMemo(
    () => createNewPasswordValidator(getValues, hasPasswordInput),
    [getValues, hasPasswordInput],
  );
  const confirmNewPasswordValidator = useMemo(
    () => createConfirmNewPasswordValidator(getValues, hasPasswordInput),
    [getValues, hasPasswordInput],
  );

  return (
    <>
      <EditProfileInfoBanner
        text="لتغيير كلمة المرور أدخل كلمة المرور الحالية أولاً، اتركها فارغة إذا لا تريد تغييرها."
        theme={theme}
        tone="warning"
      />

      <Controller
        control={control}
        name="currentPassword"
        rules={{ validate: currentPasswordValidator }}
        render={({ field: { onChange, value } }) => (
          <EditProfileTextField
            error={errors.currentPassword?.message}
            icon="lock-closed-outline"
            label="كلمة المرور الحالية"
            onChangeText={(text) => {
              onDirty();
              onChange(text);
            }}
            onPressSuffix={visibility.toggleCurrentPassword}
            placeholder="أدخل كلمة المرور الحالية"
            secureTextEntry={!visibility.showCurrentPassword}
            suffixIcon={visibility.showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
            theme={theme}
            value={value}
          />
        )}
      />

      <Controller
        control={control}
        name="newPassword"
        rules={{ validate: newPasswordValidator }}
        render={({ field: { onChange, value } }) => (
          <EditProfileTextField
            error={errors.newPassword?.message}
            icon="lock-closed-outline"
            label="كلمة المرور الجديدة"
            onChangeText={(text) => {
              onDirty();
              onChange(text);
            }}
            onPressSuffix={visibility.toggleNewPassword}
            placeholder="8 أحرف على الأقل"
            secureTextEntry={!visibility.showNewPassword}
            suffixIcon={visibility.showNewPassword ? 'eye-off-outline' : 'eye-outline'}
            theme={theme}
            value={value}
          />
        )}
      />

      <Controller
        control={control}
        name="confirmNewPassword"
        rules={{ validate: confirmNewPasswordValidator }}
        render={({ field: { onChange, value } }) => (
          <EditProfileTextField
            error={errors.confirmNewPassword?.message}
            icon="lock-closed-outline"
            label="تأكيد كلمة المرور"
            onChangeText={(text) => {
              onDirty();
              onChange(text);
            }}
            onPressSuffix={visibility.toggleConfirmPassword}
            placeholder="أعد كتابة كلمة المرور الجديدة"
            secureTextEntry={!visibility.showConfirmPassword}
            suffixIcon={visibility.showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
            theme={theme}
            value={value}
          />
        )}
      />
    </>
  );
}
