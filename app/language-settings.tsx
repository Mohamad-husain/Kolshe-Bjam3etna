import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppSettings } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import type { SettingsLanguageValue } from '@/lib/storage/settings-preferences';
import { FontFamily, FontSize, FontWeight, SemanticColors } from '@/styles/ui-theme';

const languageOptions: {
  value: SettingsLanguageValue;
  titleKey: 'language.arabic' | 'language.english';
  subtitleKey: 'language.arabicDescription' | 'language.englishDescription';
}[] = [
  { value: 'ar', titleKey: 'language.arabic', subtitleKey: 'language.arabicDescription' },
  { value: 'en', titleKey: 'language.english', subtitleKey: 'language.englishDescription' },
];

export default function LanguageSettingsRoute() {
  const { language, setLanguage, t, isRtl } = useAppSettings();
  const { colors, effectiveTheme } = useThemePreference();

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/settings');
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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{t('language.title')}</Text>
        <View style={styles.iconButton} />
      </View>

      <View style={styles.content}>
        <View style={[styles.heroIcon, { backgroundColor: `${SemanticColors.green}18` }]}>
          <Ionicons name="language-outline" size={30} color={SemanticColors.green} />
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
          {t('language.description')}
        </Text>

        <View style={styles.options}>
          {languageOptions.map((option) => {
            const selected = option.value === language;

            return (
              <Pressable
                key={option.value}
                onPress={() => setLanguage(option.value)}
                style={({ pressed }) => [
                  styles.optionCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: selected ? colors.primary : colors.border,
                    flexDirection: isRtl ? 'row-reverse' : 'row',
                  },
                  selected && styles.optionSelected,
                  pressed && styles.pressed,
                ]}
              >
                <View style={[styles.optionIcon, { backgroundColor: colors.secondary }]}>
                  <Ionicons name="globe-outline" size={22} color={colors.primary} />
                </View>
                <View style={[styles.optionCopy, { alignItems: isRtl ? 'flex-end' : 'flex-start' }]}>
                  <Text style={[styles.optionTitle, { color: colors.foreground }]}>
                    {t(option.titleKey)}
                  </Text>
                  <Text
                    style={[
                      styles.optionSubtitle,
                      {
                        color: colors.mutedForeground,
                        textAlign: isRtl ? 'right' : 'left',
                        writingDirection: isRtl ? 'rtl' : 'ltr',
                      },
                    ]}
                  >
                    {t(option.subtitleKey)}
                  </Text>
                </View>
                {selected ? (
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                ) : null}
              </Pressable>
            );
          })}
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
  options: {
    marginTop: 22,
    gap: 12,
  },
  optionCard: {
    minHeight: 88,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 14,
    alignItems: 'center',
    gap: 12,
  },
  optionSelected: {
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 4,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionCopy: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
  },
  optionSubtitle: {
    marginTop: 3,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    lineHeight: 20,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
