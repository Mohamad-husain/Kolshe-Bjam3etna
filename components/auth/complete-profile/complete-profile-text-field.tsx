import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useAppSettings } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import {
  FontFamily,
  FontWeight,
} from '@/styles/ui-theme';
import { CompleteProfileErrorText } from './complete-profile-error-text';
import type { CompleteProfileFormValues } from '@/hooks/use-complete-profile-flow';

type CompleteProfileTextFieldName = 'major' | 'bio';

type CompleteProfileTextFieldProps = {
  control: Control<CompleteProfileFormValues>;
  errors: FieldErrors<CompleteProfileFormValues>;
  name: CompleteProfileTextFieldName;
  label: string;
  placeholder: string;
  requiredMessage?: string;
  multiline?: boolean;
  onValueChange: () => void;
};

export function CompleteProfileTextField({
  control,
  errors,
  name,
  label,
  placeholder,
  requiredMessage,
  multiline = false,
  onValueChange,
}: CompleteProfileTextFieldProps) {
  const { isRtl } = useAppSettings();
  const { colors } = useThemePreference();
  const errorMessage = errors[name]?.message;

  return (
    <View style={styles.fieldGroup}>
      <Text
        style={[
          styles.label,
          {
            color: colors.foreground,
            textAlign: isRtl ? 'right' : 'left',
            writingDirection: isRtl ? 'rtl' : 'ltr',
          },
        ]}
      >
        {label}
      </Text>
      <Controller<CompleteProfileFormValues, CompleteProfileTextFieldName>
        control={control}
        name={name}
        rules={requiredMessage ? { required: requiredMessage } : undefined}
        render={({ field: { onBlur, onChange, value } }) => (
          <>
            <TextInput
              multiline={multiline}
              onBlur={onBlur}
              onChangeText={(nextValue) => {
                onValueChange();
                onChange(nextValue);
              }}
              placeholder={placeholder}
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.foreground,
                  writingDirection: isRtl ? 'rtl' : 'ltr',
                },
                multiline ? styles.textArea : null,
              ]}
              textAlign={isRtl ? 'right' : 'left'}
              textAlignVertical={multiline ? 'top' : undefined}
              value={value}
            />
            <CompleteProfileErrorText message={errorMessage} />
          </>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    gap: 10,
  },
  label: {
    fontFamily: FontFamily.cairo,
    fontSize: 16,
    fontWeight: FontWeight.medium,
    paddingHorizontal: 4,
  },
  input: {
    minHeight: 58,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1,
    fontFamily: FontFamily.cairo,
    fontSize: 15,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  textArea: {
    minHeight: 132,
  },
});
