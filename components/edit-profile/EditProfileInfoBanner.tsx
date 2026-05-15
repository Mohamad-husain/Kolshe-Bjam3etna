import { StyleSheet, Text, View } from 'react-native';

import type { AdminEditProfileTheme } from '@/lib/edit-profile/edit-profile-theme';
import { FontFamily, FontSize, FontWeight } from '@/styles/ui-theme';

export function EditProfileInfoBanner({
  theme,
  tone = 'info',
  text,
}: {
  theme: AdminEditProfileTheme;
  tone?: 'info' | 'warning' | 'error';
  text: string;
}) {
  const backgroundColor =
    tone === 'warning'
      ? theme.warningSoft
      : tone === 'error'
        ? theme.dangerSoft
        : theme.primarySoft;
  const textColor =
    tone === 'warning' ? theme.warning : tone === 'error' ? theme.danger : theme.primary;

  return (
    <View style={[styles.banner, { backgroundColor }]}>
      <Text style={[styles.text, { color: textColor }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  text: {
    textAlign: 'center',
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    lineHeight: 28,
    writingDirection: 'rtl',
  },
});
