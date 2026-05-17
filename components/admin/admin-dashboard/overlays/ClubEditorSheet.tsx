import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, View } from 'react-native';

import {
  AdminBottomSheet,
  AdminPrimaryButton,
  AdminSegmentedOptions,
  AdminTextField,
} from '@/components/admin/admin-primitives';
import type { AdminDashboard } from '@/hooks/admin/use-admin-dashboard';
import { adminValidationText } from '@/lib/admin/admin-copy';
import {
  buildClubForm,
  createFieldValidator,
  validateClubForm,
} from '@/lib/admin/admin-dashboard-form-utils';
import type { AdminClubSubscriptionType, AdminClubUpsertInput } from '@/types/admin';

import { styles } from '../styles';

type AdminDashboardProps = {
  adminDashboard: AdminDashboard;
};

export function ClubEditorSheet({ adminDashboard }: AdminDashboardProps) {
  const {
    theme,
    editingClub,
    clubEditorVisible,
    closeClubEditor,
    submitClubForm,
    showToast,
  } = adminDashboard;
  const {
    control,
    formState: { errors },
    getValues,
    handleSubmit,
    reset,
  } = useForm<AdminClubUpsertInput>({
    defaultValues: buildClubForm(),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  useEffect(() => {
    reset(clubEditorVisible ? buildClubForm(editingClub) : buildClubForm());
  }, [clubEditorVisible, editingClub, reset]);

  const validateField = createFieldValidator(() => getValues(), validateClubForm);
  const submit = handleSubmit(
    async (values) => {
      await submitClubForm(values);
    },
    () => {
      showToast(adminValidationText.club, 'warning');
    },
  );

  return (
    <AdminBottomSheet
      theme={theme}
      visible={clubEditorVisible}
      backdropStyle={styles.roleSheetBackdrop}
      sheetStyle={styles.roleSheet}
      contentContainerStyle={styles.roleSheetContent}
      title={editingClub ? 'تعديل النادي' : 'إضافة نادي'}
      onClose={closeClubEditor}
    >
      <Controller
        control={control}
        name="name"
        rules={{ validate: validateField('name') }}
        render={({ field: { onBlur, onChange, value } }) => (
          <AdminTextField
            theme={theme}
            label="اسم النادي *"
            error={errors.name?.message}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="مثال: نادي البرمجة"
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
        name="managerName"
        rules={{ validate: validateField('managerName') }}
        render={({ field: { onBlur, onChange, value } }) => (
          <AdminTextField
            theme={theme}
            label="اسم المسؤول"
            error={errors.managerName?.message}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            maxLength={18}
          />
        )}
      />

      <Controller
        control={control}
        name="managerEmail"
        rules={{ validate: validateField('managerEmail') }}
        render={({ field: { onBlur, onChange, value } }) => (
          <AdminTextField
            theme={theme}
            label="البريد الإلكتروني"
            error={errors.managerEmail?.message}
            value={value}
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />

      <View style={styles.fieldSection}>
        <Text style={[styles.sectionLabel, { color: theme.mutedText }]}>نوع الاشتراك</Text>
        <Controller
          control={control}
          name="subscriptionType"
          render={({ field: { onChange, value } }) => (
            <AdminSegmentedOptions
              theme={theme}
              value={value}
              onChange={(nextValue: AdminClubSubscriptionType) => onChange(nextValue)}
              options={[
                { value: 'monthly', label: 'شهري - 15 شيقل', accent: theme.primary },
                { value: 'yearly', label: 'سنوي - 120 شيقل', accent: theme.primary },
              ]}
            />
          )}
        />
      </View>

      <AdminPrimaryButton
        theme={theme}
        label={editingClub ? 'حفظ التغييرات' : 'إضافة وتفعيل الاشتراك'}
        icon="save-outline"
        onPress={() => void submit()}
      />
    </AdminBottomSheet>
  );
}
