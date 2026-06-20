import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppLogoBadge } from '@/components/app-logo-badge';
import { useAppSettings } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import { FontFamily, FontSize, FontWeight, SemanticColors } from '@/styles/ui-theme';

const features = [
  {
    icon: 'briefcase-outline',
    color: SemanticColors.blue,
    titleKey: 'about.services',
    descriptionKey: 'about.servicesDescription',
  },
  {
    icon: 'bag-handle-outline',
    color: SemanticColors.orange,
    titleKey: 'about.marketplace',
    descriptionKey: 'about.marketplaceDescription',
  },
  {
    icon: 'calendar-outline',
    color: SemanticColors.green,
    titleKey: 'about.events',
    descriptionKey: 'about.eventsDescription',
  },
  {
    icon: 'notifications-outline',
    color: SemanticColors.red,
    titleKey: 'about.news',
    descriptionKey: 'about.newsDescription',
  },
  {
    icon: 'chatbubble-ellipses-outline',
    color: SemanticColors.violet,
    titleKey: 'about.messages',
    descriptionKey: 'about.messagesDescription',
  },
] as const;

export default function AboutRoute() {
  const insets = useSafeAreaInsets();
  const { t, isRtl } = useAppSettings();
  const { colors } = useThemePreference();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/settings');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.primary }]} edges={['top']}>
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { backgroundColor: colors.background, paddingBottom: insets.bottom + 28 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, { backgroundColor: colors.primary }]}>
          <View style={styles.heroGlowOne} />
          <View style={styles.heroGlowTwo} />

          <View style={[styles.headerRow, { flexDirection: isRtl ? 'row' : 'row-reverse' }]}>
            <Pressable
              onPress={handleBack}
              style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
            >
              <Ionicons
                name={isRtl ? 'chevron-back' : 'chevron-forward'}
                size={20}
                color="#ffffff"
              />
            </Pressable>
            <Text style={styles.headerTitle}>{t('about.title')}</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.logoPanel}>
            <AppLogoBadge size={76} iconSize={38} />
          </View>

          <Text style={styles.appName}>{t('common.appName')}</Text>
          <Text
            style={[
              styles.heroSubtitle,
              {
                textAlign: isRtl ? 'center' : 'center',
                writingDirection: isRtl ? 'rtl' : 'ltr',
              },
            ]}
          >
            {t('about.subtitle')}
          </Text>
        </View>

        <View style={styles.body}>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text
              style={[
                styles.bodyText,
                {
                  color: colors.foreground,
                  textAlign: isRtl ? 'right' : 'left',
                  writingDirection: isRtl ? 'rtl' : 'ltr',
                },
              ]}
            >
              {t('about.body')}
            </Text>
            <View style={[styles.versionPill, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.versionText, { color: colors.mutedForeground }]}>
                {t('about.version')}
              </Text>
            </View>
          </View>

          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.foreground,
                textAlign: isRtl ? 'right' : 'left',
                writingDirection: isRtl ? 'rtl' : 'ltr',
              },
            ]}
          >
            {t('about.featuresTitle')}
          </Text>

          <View style={styles.featureList}>
            {features.map((feature) => (
              <View
                key={feature.titleKey}
                style={[
                  styles.featureCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    flexDirection: isRtl ? 'row-reverse' : 'row',
                  },
                ]}
              >
                <View style={[styles.featureIcon, { backgroundColor: `${feature.color}18` }]}>
                  <Ionicons name={feature.icon} size={21} color={feature.color} />
                </View>
                <View style={[styles.featureCopy, { alignItems: isRtl ? 'flex-end' : 'flex-start' }]}>
                  <Text style={[styles.featureTitle, { color: colors.foreground }]}>
                    {t(feature.titleKey)}
                  </Text>
                  <Text
                    style={[
                      styles.featureDescription,
                      {
                        color: colors.mutedForeground,
                        textAlign: isRtl ? 'right' : 'left',
                        writingDirection: isRtl ? 'rtl' : 'ltr',
                      },
                    ]}
                  >
                    {t(feature.descriptionKey)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  hero: {
    minHeight: 332,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 32,
    overflow: 'hidden',
  },
  heroGlowOne: {
    position: 'absolute',
    top: -100,
    right: -34,
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: 'rgba(255,255,255,0.11)',
  },
  heroGlowTwo: {
    position: 'absolute',
    bottom: -116,
    left: -44,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  headerTitle: {
    color: '#ffffff',
    fontFamily: FontFamily.cairo,
    fontSize: 18,
    fontWeight: FontWeight.black,
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  logoPanel: {
    width: 106,
    height: 106,
    marginTop: 34,
    borderRadius: 32,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  appName: {
    marginTop: 18,
    color: '#ffffff',
    fontFamily: FontFamily.cairo,
    fontSize: 28,
    fontWeight: FontWeight.black,
    textAlign: 'center',
  },
  heroSubtitle: {
    maxWidth: 340,
    marginTop: 8,
    alignSelf: 'center',
    color: 'rgba(255,255,255,0.76)',
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    lineHeight: 24,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
  },
  bodyText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    lineHeight: 27,
  },
  versionPill: {
    minHeight: 34,
    marginTop: 16,
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  versionText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  sectionTitle: {
    marginTop: 22,
    marginBottom: 10,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extrabold,
  },
  featureList: {
    gap: 10,
  },
  featureCard: {
    minHeight: 86,
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCopy: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  featureDescription: {
    marginTop: 3,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    lineHeight: 21,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
