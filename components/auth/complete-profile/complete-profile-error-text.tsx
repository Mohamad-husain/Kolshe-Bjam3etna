import { StyleSheet, Text } from 'react-native';

import { useAppSettings } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import {
  FontFamily,
  FontSize,
} from '@/styles/ui-theme';

type CompleteProfileErrorTextProps = {
  message?: string | null;
};

export function CompleteProfileErrorText({ message }: CompleteProfileErrorTextProps) {
  const { isRtl } = useAppSettings();
  const { colors } = useThemePreference();

  if (!message) {
    return null;
  }

  return (
    <Text
      style={[
        styles.errorText,
        {
          color: colors.destructive,
          textAlign: isRtl ? 'right' : 'left',
          writingDirection: isRtl ? 'rtl' : 'ltr',
        },
      ]}
    >
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  errorText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    paddingHorizontal: 4,
  },
});
