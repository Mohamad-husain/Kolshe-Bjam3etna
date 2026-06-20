import { StyleSheet, Text, View } from 'react-native';

import { useAppSettings } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import { FontFamily, FontSize, FontWeight } from '@/styles/ui-theme';

export function ProfileLoadingBanner() {
  const { t } = useAppSettings();
  const { colors } = useThemePreference();

  return (
    <View style={[styles.loadingBanner, { backgroundColor: colors.secondary }]}>
      <Text style={[styles.loadingBannerText, { color: colors.primary }]}>
        {t('profile.loading')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingBanner: {
    marginHorizontal: 18,
    marginTop: 14,
    borderRadius: 16,
    paddingVertical: 11,
    backgroundColor: 'rgba(37,99,235,0.08)',
  },
  loadingBannerText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
  },
});
