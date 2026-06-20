import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  SettingsThemeSelector,
  type SettingsThemeValue,
} from '@/components/settings/SettingsThemeSelector';
import { useAppSettings } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import { FontFamily, FontSize, FontWeight, SemanticColors } from '@/styles/ui-theme';

export default function AppearanceSettingsRoute() {
  const { t, isRtl } = useAppSettings();
  const { selectedTheme, setSelectedTheme, colors, effectiveTheme } = useThemePreference();

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/settings');
  };

  const changeTheme = (theme: SettingsThemeValue) => {
    setSelectedTheme(theme);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={effectiveTheme === 'dark' ? 'light' : 'dark'} />

      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={goBack} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
          <Ionicons
            name={isRtl ? 'chevron-back' : 'chevron-forward'}
            size={22}
            color={colors.foreground}
          />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{t('appearance.title')}</Text>
        <View style={styles.iconButton} />
      </View>

      <View style={styles.content}>
        <View style={[styles.heroIcon, { backgroundColor: `${SemanticColors.violet}18` }]}>
          <Ionicons
            name={effectiveTheme === 'dark' ? 'moon-outline' : 'sunny-outline'}
            size={30}
            color={SemanticColors.violet}
          />
        </View>
        <Text
          style={[
            styles.description,
            {
              color: colors.mutedForeground,
              textAlign: isRtl ? 'right' : 'left',
              writingDirection: isRtl ? 'rtl' : 'ltr',
            },
          ]}
        >
          {t('settings.appearanceDescription', {
            mode:
              selectedTheme === 'system'
                ? t('settings.themeAuto')
                : selectedTheme === 'dark'
                  ? t('settings.themeDark')
                  : t('settings.themeLight'),
          })}
        </Text>

        <View style={[styles.selectorCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingsThemeSelector value={selectedTheme} onChange={changeTheme} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    minHeight: 62,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extrabold,
  },
  content: {
    padding: 18,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  description: {
    marginTop: 16,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    lineHeight: 24,
  },
  selectorCard: {
    marginTop: 22,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
