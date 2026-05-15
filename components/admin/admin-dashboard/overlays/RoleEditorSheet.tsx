import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, View } from 'react-native';

import {
  AdminBottomSheet,
  AdminCard,
  AdminPrimaryButton,
  AdminSelectField,
  AdminSegmentedOptions,
  AdminTextField,
} from '@/components/admin/admin-primitives';
import type { AdminDashboard } from '@/hooks/admin/use-admin-dashboard';
import { adminValidationText } from '@/lib/admin/admin-copy';
import {
  buildRoleForm,
  createFieldValidator,
  validateRoleForm,
} from '@/lib/admin/admin-dashboard-form-utils';
import type { AdminRoleAssignInput, AdminRoleValue } from '@/types/admin';

import { styles } from '../styles';

type AdminDashboardProps = {
  adminDashboard: AdminDashboard;
};

export function RoleEditorSheet({ adminDashboard }: AdminDashboardProps) {
  const {
    theme,
    editingRole,
    roleEditorVisible,
    roleOptions,
    roleScopes,
    closeRoleEditor,
    submitRoleForm,
    showToast,
    getRoleOptionByValue,
  } = adminDashboard;
  const {
    control,
    formState: { errors },
    getValues,
    handleSubmit,
    reset,
    setValue,
    watch,
  } = useForm<AdminRoleAssignInput>({
    defaultValues: buildRoleForm(),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  useEffect(() => {
    reset(roleEditorVisible ? buildRoleForm(editingRole) : buildRoleForm());
  }, [editingRole, reset, roleEditorVisible]);

  const selectedRole = watch('role');
  const selectedScopeId = watch('scopeId');
  const selectedRoleOption = getRoleOptionByValue(selectedRole);
  const validateField = createFieldValidator<
    AdminRoleAssignInput,
    'email' | 'scopeId',
    Partial<Record<'email' | 'scopeId', string>>
  >(() => getValues(), (values) =>
    validateRoleForm(values, Boolean(editingRole), getRoleOptionByValue(values.role)),
  );
  const submit = handleSubmit(
    async (values) => {
      await submitRoleForm(values);
    },
    () => {
      showToast(adminValidationText.role, 'warning');
    },
  );

  return (
    <AdminBottomSheet
      theme={theme}
      visible={roleEditorVisible}
      title={editingRole ? `تعديل دور: ${editingRole.fullName}` : 'إضافة دور جديد'}
      backdropStyle={styles.roleSheetBackdrop}
      sheetStyle={styles.roleSheet}
      contentContainerStyle={styles.roleSheetContent}
      onClose={closeRoleEditor}
    >
      {!editingRole ? (
        <Controller
          control={control}
          name="email"
          rules={{ validate: validateField('email') }}
          render={({ field: { onBlur, onChange, value } }) => (
            <AdminTextField
              theme={theme}
              label="البريد الجامعي"
              error={errors.email?.message}
              value={value}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="example@ju.edu.jo"
            />
          )}
        />
      ) : null}

      <Controller
        control={control}
        name="role"
        render={({ field: { value } }) => (
          <AdminSegmentedOptions
            theme={theme}
            value={value}
            onChange={(nextValue: AdminRoleValue) => {
              const nextRoleOption = getRoleOptionByValue(nextValue);
              const nextScopeId = nextRoleOption.requiresScope
                ? selectedScopeId ?? roleScopes[0]?.id ?? null
                : null;

              setValue('role', nextValue, {
                shouldDirty: true,
                shouldValidate: true,
              });
              setValue('scopeId', nextScopeId, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
            columns={roleOptions.length === 3 ? 3 : 2}
            options={roleOptions.map((option) => ({
              value: option.value,
              label: option.label,
              accent: option.color,
              icon:
                option.value === 'superAdmin'
                  ? 'shield-checkmark-outline'
                  : option.value === 'Coordinator'
                    ? 'calendar-outline'
                    : 'shield-outline',
            }))}
          />
        )}
      />

      {selectedRoleOption.requiresScope ? (
        <Controller
          control={control}
          name="scopeId"
          rules={{ validate: validateField('scopeId') }}
          render={({ field: { onChange, value } }) => (
            <AdminSelectField
              theme={theme}
              label={selectedRoleOption.scopeLabel ?? 'النطاق المخصص'}
              value={value ? String(value) : null}
              onChange={(nextValue: string) => onChange(Number(nextValue))}
              options={roleScopes.map((item) => ({
                value: String(item.id),
                label: item.name,
              }))}
              placeholder="اختر النطاق"
              accent={selectedRoleOption.color}
            />
          )}
        />
      ) : null}

      {errors.scopeId?.message ? (
        <Text style={[styles.inlineError, { color: theme.danger }]}>
          {errors.scopeId.message}
        </Text>
      ) : null}

      <AdminCard
        theme={theme}
        style={[
          styles.permissionsCard,
          { backgroundColor: `${selectedRoleOption.color}14` },
        ]}
      >
        <Text style={[styles.permissionsTitle, { color: selectedRoleOption.color }]}>
          الصلاحيات الممنوحة:
        </Text>
        <View style={styles.permissionsWrapLocal}>
          {selectedRoleOption.permissions.map((permission) => (
            <Text
              key={permission}
              numberOfLines={1}
              style={[
                styles.permissionChipText,
                {
                  color: selectedRoleOption.color,
                  backgroundColor: `${selectedRoleOption.color}12`,
                },
              ]}
            >
              {permission}
            </Text>
          ))}
        </View>
      </AdminCard>

      <AdminPrimaryButton
        theme={theme}
        label={editingRole ? 'حفظ التغييرات' : 'تأكيد وإضافة الدور'}
        icon="save-outline"
        onPress={() => void submit()}
      />
    </AdminBottomSheet>
  );
}
