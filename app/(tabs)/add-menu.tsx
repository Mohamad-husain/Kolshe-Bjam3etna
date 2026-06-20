import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppSettings, type TranslationKey } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import {
  Dimensions,
  FontFamily,
  FontSize,
  FontWeight,
  SemanticColors,
} from '@/styles/ui-theme';

type AddMenuItem = {
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  href: '/new-service' | '/new-ad' | '/new-exchange';
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  softColor: string;
  borderColor: string;
};

const menuItems: AddMenuItem[] = [
  {
    titleKey: 'addMenu.serviceTitle',
    descriptionKey: 'addMenu.serviceDescription',
    href: '/new-service',
    icon: 'briefcase-outline',
    color: SemanticColors.blue,
    softColor: 'rgba(37,99,235,0.10)',
    borderColor: 'rgba(37,99,235,0.16)',
  },
  {
    titleKey: 'addMenu.adTitle',
    descriptionKey: 'addMenu.adDescription',
    href: '/new-ad',
    icon: 'bag-handle-outline',
    color: SemanticColors.orange,
    softColor: 'rgba(255,149,0,0.10)',
    borderColor: 'rgba(255,149,0,0.16)',
  },
  {
    titleKey: 'addMenu.exchangeTitle',
    descriptionKey: 'addMenu.exchangeDescription',
    href: '/new-exchange',
    icon: 'swap-horizontal-outline',
    color: SemanticColors.green,
    softColor: 'rgba(52,199,89,0.10)',
    borderColor: 'rgba(52,199,89,0.16)',
  },
];

export default function AddMenuRoute() {
  const insets = useSafeAreaInsets();
  const { t, isRtl } = useAppSettings();
  const { colors, effectiveTheme } = useThemePreference();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar style={effectiveTheme === 'dark' ? 'light' : 'dark'} />

      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.primaryGlow} pointerEvents="none" />
        <View style={styles.secondaryGlow} pointerEvents="none" />

        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + Dimensions.bottomNavigationHeight + 32 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.headerSide} />

            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: colors.foreground }]}>
                {t('addMenu.title')}
              </Text>
            </View>

            <View style={styles.headerSide} />
          </View>

          <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              {t('addMenu.sectionLabel')}
            </Text>

            <View style={styles.cardsList}>
              {menuItems.map((item) => (
                <Pressable
                  key={item.titleKey}
                  accessibilityRole="button"
                  accessibilityLabel={t(item.titleKey)}
                  onPress={() => router.push(item.href)}
                  style={({ pressed }) => [
                    styles.optionCard,
                    {
                      borderColor: item.borderColor,
                      shadowColor: item.color,
                      backgroundColor: colors.card,
                      flexDirection: isRtl ? 'row' : 'row-reverse',
                    },
                    pressed && styles.optionCardPressed,
                  ]}
                >
                  <View style={[styles.iconShell, { backgroundColor: item.softColor, borderColor: item.borderColor }]}>
                    <Ionicons name={item.icon} size={27} color={item.color} />
                  </View>

                  <View style={[styles.copyBlock, { alignItems: isRtl ? 'flex-end' : 'flex-start' }]}>
                    <Text
                      style={[
                        styles.optionTitle,
                        { color: colors.foreground, textAlign: isRtl ? 'right' : 'left' },
                      ]}
                    >
                      {t(item.titleKey)}
                    </Text>
                    <Text
                      style={[
                        styles.optionDescription,
                        {
                          color: colors.mutedForeground,
                          textAlign: isRtl ? 'right' : 'left',
                          writingDirection: isRtl ? 'rtl' : 'ltr',
                        },
                      ]}
                    >
                      {t(item.descriptionKey)}
                    </Text>
                  </View>

                  <View style={[styles.chevronWrap, { backgroundColor: colors.secondary }]}>
                    <Ionicons
                      name={isRtl ? 'chevron-back' : 'chevron-forward'}
                      size={18}
                      color={colors.mutedForeground}
                    />
                  </View>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.helperText, { color: colors.mutedForeground }]}>
              {t('addMenu.helper')}
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  primaryGlow: {
    position: 'absolute',
    top: 110,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(37,99,235,0.08)',
  },
  secondaryGlow: {
    position: 'absolute',
    bottom: 90,
    left: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(90,200,250,0.08)',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  headerSide: {
    width: 46,
    height: 46,
  },
  titleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flex: 1,
  },
  title: {
    fontFamily: FontFamily.cairo,
    fontSize: 18,
    fontWeight: FontWeight.extrabold,
  },
  sheet: {
    borderRadius: 34,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 6,
  },
  sectionLabel: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
  },
  cardsList: {
    marginTop: 18,
    gap: 14,
  },
  optionCard: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
  },
  optionCardPressed: {
    transform: [{ scale: 0.985 }],
  },
  iconShell: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  copyBlock: {
    flex: 1,
    marginHorizontal: 14,
  },
  optionTitle: {
    fontFamily: FontFamily.cairo,
    fontSize: 17,
    fontWeight: FontWeight.bold,
  },
  optionDescription: {
    marginTop: 3,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  chevronWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helperText: {
    marginTop: 18,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
});
