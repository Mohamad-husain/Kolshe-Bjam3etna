import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, View } from 'react-native';

import { AdminChipGroup } from '@/components/admin/admin-entities';
import {
  AdminBadge,
  AdminBottomSheet,
  AdminCard,
  AdminPrimaryButton,
  AdminSwitchRow,
  AdminTextField,
  AdminUploadField,
} from '@/components/admin/admin-primitives';
import type { AdminDashboard } from '@/hooks/admin/use-admin-dashboard';
import { adminValidationText } from '@/lib/admin/admin-copy';
import {
  adminNewsCategories,
  toEnglishDigits,
} from '@/lib/admin/admin-config';
import {
  buildNewsForm,
  createFieldValidator,
  pickImage,
  validateNewsForm,
} from '@/lib/admin/admin-dashboard-form-utils';
import type { AdminNewsUpsertInput } from '@/types/admin';

import { styles } from '../styles';

type AdminDashboardProps = {
  adminDashboard: AdminDashboard;
};

export function NewsEditorSheet({ adminDashboard }: AdminDashboardProps) {
  const {
    theme,
    newsEditorVisible,
    editingNews,
    closeNewsEditor,
    submitNewsForm,
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
  } = useForm<AdminNewsUpsertInput>({
    defaultValues: buildNewsForm(),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  useEffect(() => {
    reset(newsEditorVisible ? buildNewsForm(editingNews) : buildNewsForm());
  }, [editingNews, newsEditorVisible, reset]);

  const watchedContent = watch('content');
  const watchedImage = watch('image');
  const watchedImportant = watch('isImportant');
  const watchedPublished = watch('isPublished');
  const watchedSource = watch('source');
  const watchedTitle = watch('title');
  const validateField = createFieldValidator(() => getValues(), validateNewsForm);
  const imageUri = watchedImage?.uri ?? editingNews?.imageUrl ?? null;
  const submit = handleSubmit(
    async (values) => {
      await submitNewsForm(values);
    },
    () => {
      showToast(adminValidationText.news, 'warning');
    },
  );

  return (
    <AdminBottomSheet
      theme={theme}
      visible={newsEditorVisible}
      title={editingNews ? 'تعديل الخبر' : 'خبر جديد'}
      backdropStyle={styles.roleSheetBackdrop}
      sheetStyle={styles.roleSheet}
      contentContainerStyle={styles.roleSheetContent}
      showsVerticalScrollIndicator
      onClose={closeNewsEditor}
    >
      <AdminUploadField
        theme={theme}
        imageUri={imageUri}
        onPress={() => {
          void (async () => {
            const asset = await pickImage();

            if (!asset) {
              return;
            }

            setValue(
              'image',
              {
                uri: asset.uri,
                name: asset.fileName,
                type: asset.mimeType,
                file: asset.file,
              },
              {
                shouldDirty: true,
              },
            );
          })();
        }}
      />

      <Controller
        control={control}
        name="title"
        rules={{ validate: validateField('title') }}
        render={({ field: { onBlur, onChange, value } }) => (
          <AdminTextField
            theme={theme}
            label="عنوان الخبر الرئيسي *"
            error={errors.title?.message}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="مثال: تأجيل امتحانات الفصل الأول أسبوعاً"
          />
        )}
      />

      <Controller
        control={control}
        name="source"
        rules={{ validate: validateField('source') }}
        render={({ field: { onBlur, onChange, value } }) => (
          <AdminTextField
            theme={theme}
            label="المصدر *"
            error={errors.source?.message}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="مثال: عمادة شؤون الطلبة"
          />
        )}
      />

      <View style={styles.fieldSection}>
        <Text style={[styles.sectionLabel, { color: theme.mutedText }]}>التصنيف</Text>
        <Controller
          control={control}
          name="category"
          render={({ field: { onChange, value } }) => (
            <AdminChipGroup
              theme={theme}
              value={value}
              onChange={onChange}
              options={adminNewsCategories}
            />
          )}
        />
      </View>

      <Controller
        control={control}
        name="content"
        rules={{ validate: validateField('content') }}
        render={({ field: { onBlur, onChange, value } }) => (
          <AdminTextField
            theme={theme}
            error={errors.content?.message}
            label={`تفاصيل الخبر * ${toEnglishDigits(watchedContent.length)}/800`}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="اكتب تفاصيل الخبر بوضوح وإيجاز..."
            multiline
          />
        )}
      />

      <Controller
        control={control}
        name="isImportant"
        render={({ field: { onChange, value } }) => (
          <AdminSwitchRow
            theme={theme}
            title="تمييز كخبر عاجل"
            subtitle="يرسل إشعاراً فورياً لجميع الطلبة"
            value={value}
            onValueChange={onChange}
            accent={theme.danger}
          />
        )}
      />

      <Controller
        control={control}
        name="isPublished"
        render={({ field: { onChange, value } }) => (
          <AdminSwitchRow
            theme={theme}
            title="نشر الخبر مباشرة"
            subtitle="يعرض الخبر فوراً في التطبيق"
            value={value}
            onValueChange={onChange}
            accent={theme.primary}
          />
        )}
      />

      <AdminCard theme={theme}>
        <View style={styles.previewHeader}>
          <Text style={[styles.previewHeaderText, { color: theme.primary }]}>معاينة</Text>
          {watchedImportant ? (
            <AdminBadge theme={theme} label="عاجل" accent={theme.danger} />
          ) : null}
        </View>
        <Text style={[styles.previewTitle, { color: theme.heading }]}>
          {watchedTitle || 'عنوان الخبر'}
        </Text>
        <Text style={[styles.previewMeta, { color: theme.mutedText }]}>
          {`${watchedSource || 'المصدر'} - الآن`}
        </Text>
      </AdminCard>

      <AdminPrimaryButton
        theme={theme}
        label={watchedPublished ? 'نشر الخبر الآن' : 'حفظ كمسودة'}
        icon={watchedPublished ? 'paper-plane-outline' : 'save-outline'}
        onPress={() => void submit()}
      />
    </AdminBottomSheet>
  );
}
