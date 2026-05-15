import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { AdminChipGroup } from '@/components/admin/admin-entities';
import {
  AdminBottomSheet,
  AdminPrimaryButton,
  AdminSegmentedOptions,
  AdminSwitchRow,
  AdminTextField,
} from '@/components/admin/admin-primitives';
import type { AdminDashboard } from '@/hooks/admin/use-admin-dashboard';
import { adminValidationText } from '@/lib/admin/admin-copy';
import {
  adminOfferCategories,
  toEnglishDigits,
} from '@/lib/admin/admin-config';
import {
  buildOfferForm,
  createFieldValidator,
  validateOfferForm,
} from '@/lib/admin/admin-dashboard-form-utils';
import type { AdminOfferType, AdminOfferUpsertInput } from '@/types/admin';

import { styles } from '../styles';

type AdminDashboardProps = {
  adminDashboard: AdminDashboard;
};

export function OfferEditorSheet({ adminDashboard }: AdminDashboardProps) {
  const {
    theme,
    editingOffer,
    offerEditorVisible,
    closeOfferEditor,
    submitOfferForm,
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
  } = useForm<AdminOfferUpsertInput>({
    defaultValues: buildOfferForm(),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  useEffect(() => {
    reset(offerEditorVisible ? buildOfferForm(editingOffer) : buildOfferForm());
  }, [editingOffer, offerEditorVisible, reset]);

  const selectedCategory = watch('category');
  const validateField = createFieldValidator<
    AdminOfferUpsertInput,
    | 'partnerName'
    | 'title'
    | 'description'
    | 'location'
    | 'phone'
    | 'email'
    | 'expireDateUtc'
    | 'discountPercent',
    Partial<
      Record<
        | 'partnerName'
        | 'title'
        | 'description'
        | 'location'
        | 'phone'
        | 'email'
        | 'expireDateUtc'
        | 'discountPercent',
        string
      >
    >
  >(() => getValues(), validateOfferForm);
  const submit = handleSubmit(
    async (values) => {
      await submitOfferForm(values);
    },
    () => {
      showToast(adminValidationText.offer, 'warning');
    },
  );

  return (
    <AdminBottomSheet
      theme={theme}
      visible={offerEditorVisible}
      title={editingOffer ? 'تعديل العرض' : 'إضافة عرض جديد'}
      backdropStyle={styles.roleSheetBackdrop}
      sheetStyle={styles.roleSheet}
      contentContainerStyle={styles.roleSheetContent}
      showsVerticalScrollIndicator
      onClose={closeOfferEditor}
    >
      <Controller
        control={control}
        name="type"
        render={({ field: { onChange, value } }) => (
          <AdminSegmentedOptions
            theme={theme}
            value={value}
            onChange={(nextValue: AdminOfferType) => onChange(nextValue)}
            options={[
              {
                value: 'academy',
                label: 'أكاديمية',
                accent: theme.violet,
                icon: 'school-outline',
              },
              {
                value: 'store',
                label: 'متجر',
                accent: theme.warning,
                icon: 'storefront-outline',
              },
            ]}
          />
        )}
      />

      <Controller
        control={control}
        name="partnerName"
        rules={{ validate: validateField('partnerName') }}
        render={({ field: { onBlur, onChange, value } }) => (
          <AdminTextField
            theme={theme}
            label="الاسم *"
            error={errors.partnerName?.message}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="اسم الأكاديمية / المتجر"
          />
        )}
      />

      <Controller
        control={control}
        name="category"
        render={({ field: { onChange, value } }) => (
          <AdminTextField
            theme={theme}
            label="التصنيف"
            value={value}
            onChangeText={onChange}
          />
        )}
      />

      <AdminChipGroup
        theme={theme}
        value={selectedCategory}
        onChange={(value) => {
          setValue('category', value, {
            shouldDirty: true,
          });
        }}
        options={adminOfferCategories}
      />

      <Controller
        control={control}
        name="title"
        rules={{ validate: validateField('title') }}
        render={({ field: { onBlur, onChange, value } }) => (
          <AdminTextField
            theme={theme}
            label="عنوان العرض *"
            error={errors.title?.message}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="مثال: خصم %40 على دورة Flutter"
          />
        )}
      />

      <Controller
        control={control}
        name="description"
        rules={{ validate: validateField('description') }}
        render={({ field: { onBlur, onChange, value } }) => (
          <AdminTextField
            theme={theme}
            label="تفاصيل العرض"
            error={errors.description?.message}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="تفاصيل إضافية عن العرض..."
            multiline
          />
        )}
      />

      <Controller
        control={control}
        name="location"
        rules={{ validate: validateField('location') }}
        render={({ field: { onBlur, onChange, value } }) => (
          <AdminTextField
            theme={theme}
            label="الموقع"
            error={errors.location?.message}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />

      <Controller
        control={control}
        name="phone"
        rules={{ validate: validateField('phone') }}
        render={({ field: { onBlur, onChange, value } }) => (
          <AdminTextField
            theme={theme}
            label="رقم التواصل"
            error={errors.phone?.message}
            value={value}
            keyboardType="phone-pad"
            onChangeText={onChange}
            onBlur={onBlur}
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
            label="البريد الإلكتروني"
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
        name="expireDateUtc"
        rules={{ validate: validateField('expireDateUtc') }}
        render={({ field: { onBlur, onChange, value } }) => (
          <AdminTextField
            theme={theme}
            label="تاريخ الانتهاء"
            error={errors.expireDateUtc?.message}
            value={toEnglishDigits(value)}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="YYYY-MM-DD"
          />
        )}
      />

      <Controller
        control={control}
        name="discountPercent"
        rules={{ validate: validateField('discountPercent') }}
        render={({ field: { onBlur, onChange, value } }) => (
          <AdminTextField
            theme={theme}
            label="نسبة الخصم %"
            error={errors.discountPercent?.message}
            value={toEnglishDigits(String(value))}
            keyboardType="numeric"
            onChangeText={(nextValue: string) => {
              onChange(Number(nextValue || 0));
            }}
            onBlur={onBlur}
          />
        )}
      />

      <Controller
        control={control}
        name="showOnHomePage"
        render={({ field: { onChange, value } }) => (
          <AdminSwitchRow
            theme={theme}
            title="نشر العرض في الصفحة الرئيسية"
            subtitle="يعرض العرض في نافذة التطبيق العامة"
            value={value}
            onValueChange={onChange}
            accent={theme.primary}
          />
        )}
      />

      <AdminPrimaryButton
        theme={theme}
        label={editingOffer ? 'حفظ التغييرات' : 'إضافة العرض'}
        icon={editingOffer ? 'save-outline' : 'paper-plane-outline'}
        onPress={() => void submit()}
      />
    </AdminBottomSheet>
  );
}
