import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { AdminChipGroup } from '@/components/admin/admin-entities';
import {
  AdminBottomSheet,
  AdminPrimaryButton,
  AdminSegmentedOptions,
  AdminTextField,
} from '@/components/admin/admin-primitives';
import type { AdminDashboard } from '@/hooks/admin/use-admin-dashboard';
import { adminValidationText } from '@/lib/admin/admin-copy';
import {
  buildUserForm,
  createFieldValidator,
  validateUserForm,
} from '@/lib/admin/admin-dashboard-form-utils';
import type { AdminUserStatus, AdminUserUpsertInput } from '@/types/admin';


type AdminDashboardProps = {
  adminDashboard: AdminDashboard;
};

export function UserEditorSheet({ adminDashboard }: AdminDashboardProps) {
  const {
    theme,
    universities,
    editingUser,
    closeUserEditor,
    submitUserForm,
    showToast,
  } = adminDashboard;
  const {
    control,
    formState: { errors },
    getValues,
    handleSubmit,
    reset,
    setValue,
    watch,
  } = useForm<AdminUserUpsertInput>({
    defaultValues: buildUserForm(),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  useEffect(() => {
    reset(buildUserForm(editingUser));
  }, [editingUser, reset]);

  const selectedUniversityName = watch('universityName');
  const selectedUniversityId = watch('universityId');
  const validateField = createFieldValidator(() => getValues(), validateUserForm);
  const submit = handleSubmit(
    async (values) => {
      await submitUserForm(values);
    },
    () => {
      showToast(adminValidationText.user, 'warning');
    },
  );

  return (
    <AdminBottomSheet
      theme={theme}
      visible={editingUser !== null}
      title="تعديل المستخدم"
      onClose={closeUserEditor}
    >
      <Controller
        control={control}
        name="fullName"
        rules={{ validate: validateField('fullName') }}
        render={({ field: { onBlur, onChange, value } }) => (
          <AdminTextField
            theme={theme}
            label="الاسم *"
            error={errors.fullName?.message}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            maxLength={18}
          />
        )}
      />

      <Controller
        control={control}
        name="email"
        rules={{ validate: validateField('email') }}
        render={({ field: { onBlur, onChange, value } }) => (
          <AdminTextField
            theme={theme}
            label="البريد الإلكتروني *"
            error={errors.email?.message}
            value={value}
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />

      <Controller
        control={control}
        name="universityName"
        rules={{ validate: validateField('universityName') }}
        render={({ field: { onBlur, onChange, value } }) => (
          <AdminTextField
            theme={theme}
            label="الجامعة"
            error={errors.universityName?.message}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />

      <Controller
        control={control}
        name="isBlocked"
        render={({ field: { onChange, value } }) => (
          <AdminSegmentedOptions
            theme={theme}
            value={value ? 'blocked' : 'active'}
            onChange={(nextValue: AdminUserStatus) => onChange(nextValue === 'blocked')}
            options={[
              { value: 'active', label: 'نشط', accent: theme.success },
              { value: 'blocked', label: 'موقوف', accent: theme.danger },
            ]}
          />
        )}
      />

      {universities?.length ? (
        <AdminChipGroup
          theme={theme}
          value={selectedUniversityName}
          onChange={(value) => {
            const selected = universities.find((item) => item.name === value);

            setValue('universityId', selected?.id ?? selectedUniversityId, {
              shouldDirty: true,
              shouldValidate: true,
            });
            setValue('universityName', value, {
              shouldDirty: true,
              shouldValidate: true,
            });
          }}
          options={universities.slice(0, 5).map((item) => item.name)}
        />
      ) : null}

      <AdminPrimaryButton
        theme={theme}
        label="حفظ التغييرات"
        icon="save-outline"
        onPress={() => void submit()}
      />
    </AdminBottomSheet>
  );
}
