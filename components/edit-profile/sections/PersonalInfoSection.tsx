import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';

import { EditProfileInfoBanner } from '@/components/edit-profile/EditProfileInfoBanner';
import { EditProfileTextField } from '@/components/edit-profile/EditProfileTextField';
import type { AdminEditProfileTheme } from '@/lib/edit-profile/edit-profile-theme';
import {
  validateBio,
  validateFullName,
  validatePhoneNumber,
  validateUniversityEmail,
  validateWebsiteUrl,
} from '@/lib/edit-profile/edit-profile-validation';
import { FontFamily, FontSize, FontWeight } from '@/styles/ui-theme';
import type { AdminEditProfileFormValues } from '@/types/edit-profile';

type PersonalInfoSectionProps = {
  bioLength: number;
  control: Control<AdminEditProfileFormValues>;
  errors: FieldErrors<AdminEditProfileFormValues>;
  onDirty: () => void;
  profileImageError?: string;
  theme: AdminEditProfileTheme;
};

export function PersonalInfoSection({
  bioLength,
  control,
  errors,
  onDirty,
  profileImageError,
  theme,
}: PersonalInfoSectionProps) {
  return (
    <>
      {profileImageError ? (
        <EditProfileInfoBanner text={profileImageError} theme={theme} tone="error" />
      ) : null}

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
              onDirty();
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
              onDirty();
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
        <Text style={[styles.counterText, { color: theme.mutedText }]}>({bioLength}/200)</Text>
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
              onDirty();
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
                onDirty();
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
  );
}

const styles = StyleSheet.create({
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
});
