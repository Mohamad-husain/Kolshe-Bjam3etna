import { StyleSheet, Text, View } from 'react-native';

import { useAppSettings } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import {
  Dimensions,
  FontFamily,
} from '@/styles/ui-theme';

type AuthHintCardProps = {
  message: string;
};

export function AuthHintCard({ message }: AuthHintCardProps) {
  const { isRtl } = useAppSettings();
  const { colors } = useThemePreference();

  return (
    <View
      style={[
        styles.hintBox,
        {
          backgroundColor: colors.secondary,
          flexDirection: isRtl ? 'row-reverse' : 'row',
        },
      ]}
    >
      <View style={[styles.hintDot, { backgroundColor: colors.primary }]} />
      <Text
        style={[
          styles.hintText,
          {
            color: colors.primary,
            textAlign: isRtl ? 'right' : 'left',
            writingDirection: isRtl ? 'rtl' : 'ltr',
          },
        ]}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hintBox: {
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  hintDot: {
    width: 6,
    height: 6,
    borderRadius: Dimensions.radiusFull,
  },
  hintText: {
    flex: 1,
    fontFamily: FontFamily.cairo,
    fontSize: 12,
    lineHeight: 18,
  },
});
