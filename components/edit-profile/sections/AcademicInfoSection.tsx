import { Controller, type Control, type FieldErrors, type UseFormSetValue } from 'react-hook-form';

import { EditProfileInfoBanner } from '@/components/edit-profile/EditProfileInfoBanner';
import { EditProfileSegmentedField } from '@/components/edit-profile/EditProfileSegmentedField';
import { EditProfileSelectField } from '@/components/edit-profile/EditProfileSelectField';
import { EditProfileTextField } from '@/components/edit-profile/EditProfileTextField';
import { adminEditProfileStudyYearOptions } from '@/lib/edit-profile/edit-profile-config';
import type { AdminEditProfileTheme } from '@/lib/edit-profile/edit-profile-theme';
import {
  validateMajor,
  validateStudyYear,
  validateUniversityNumber,
  validateUniversitySelection,
} from '@/lib/edit-profile/edit-profile-validation';
import type { University } from '@/services/auth-api';
import type {
  AdminEditProfileFormValues,
  AdminEditProfileOption,
  AdminEditProfileSelectKey,
} from '@/types/edit-profile';

type AcademicInfoSectionProps = {
  control: Control<AdminEditProfileFormValues>;
  errors: FieldErrors<AdminEditProfileFormValues>;
  isUniversitiesLoading: boolean;
  majorOptions: AdminEditProfileOption<string>[];
  onCloseSelects: () => void;
  onDirty: () => void;
  onToggleSelect: (key: AdminEditProfileSelectKey) => void;
  openSelect: AdminEditProfileSelectKey | null;
  setValue: UseFormSetValue<AdminEditProfileFormValues>;
  theme: AdminEditProfileTheme;
  universities: University[];
  universityOptions: AdminEditProfileOption<number>[];
};

export function AcademicInfoSection({
  control,
  errors,
  isUniversitiesLoading,
  majorOptions,
  onCloseSelects,
  onDirty,
  onToggleSelect,
  openSelect,
  setValue,
  theme,
  universities,
  universityOptions,
}: AcademicInfoSectionProps) {
  return (
    <>
      <Controller
        control={control}
        name="universityId"
        rules={{ validate: validateUniversitySelection }}
        render={({ field: { onChange, value } }) => (
          <EditProfileSelectField
            error={errors.universityId?.message}
            icon="book-outline"
            isOpen={openSelect === 'university'}
            label="الجامعة"
            onSelect={(nextValue) => {
              onDirty();
              onChange(nextValue);
              onCloseSelects();

              const selectedUniversity = universities.find((item) => item.id === nextValue);

              if (selectedUniversity) {
                setValue('universityName', selectedUniversity.name);
              }
            }}
            onToggle={() => onToggleSelect('university')}
            options={universityOptions}
            placeholder={isUniversitiesLoading ? 'جارٍ تحميل الجامعات...' : 'اختر الجامعة'}
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
              onDirty();
              onChange(nextValue);
              onCloseSelects();
            }}
            onToggle={() => onToggleSelect('major')}
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
              onDirty();
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
              onDirty();
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
  );
}
