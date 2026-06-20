import { StyleSheet, Text, View } from 'react-native';

import { AppLogoBadge } from '@/components/app-logo-badge';
import { useAppSettings } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import {
  FontFamily,
  FontWeight,
} from '@/styles/ui-theme';

export function AuthBranding() {
  const { isRtl, t } = useAppSettings();
  const { colors } = useThemePreference();

  return (
    <View style={styles.container}>
      <AppLogoBadge style={styles.logoBox} />

      <Text
        style={[
          styles.title,
          { color: colors.foreground, writingDirection: isRtl ? 'rtl' : 'ltr' },
        ]}
      >
        {t('common.appName')}
      </Text>
      <Text
        style={[
          styles.subtitle,
          { color: colors.mutedForeground, writingDirection: isRtl ? 'rtl' : 'ltr' },
        ]}
      >
        {t('auth.appSubtitle')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 26,
  },
  logoBox: {
    marginBottom: 22,
  },
  title: {
    fontFamily: FontFamily.cairo,
    fontSize: 21,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: FontFamily.cairo,
    fontSize: 14,
    textAlign: 'center',
  },
});
