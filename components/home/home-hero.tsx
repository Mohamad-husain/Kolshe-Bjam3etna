import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppLogoBadge } from '@/components/app-logo-badge';
import { useAppSettings } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import { FontFamily, FontSize, FontWeight, SemanticColors } from '@/styles/ui-theme';

type HomeHeroProps = {
  universityName: string;
  fullName: string;
  search: string;
  unreadNotifications: number;
  onChangeSearch: (value: string) => void;
  onOpenNotifications: () => void;
};

export function HomeHero({
  universityName,
  fullName,
  search,
  unreadNotifications,
  onChangeSearch,
  onOpenNotifications,
}: HomeHeroProps) {
  const { t, isRtl } = useAppSettings();
  const { colors } = useThemePreference();
  const commaName = fullName ? (isRtl ? `، ${fullName}` : `, ${fullName}`) : isRtl ? ' بك' : '';

  return (
    <View style={[styles.hero, { backgroundColor: colors.primary }]}>
      <View style={styles.heroIn}>
        <View style={[styles.top, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('notifications.title')}
            onPress={onOpenNotifications}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
          >
            <Ionicons name="notifications-outline" size={18} color="rgba(255,255,255,0.92)" />
            {unreadNotifications > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeTxt}>
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </Text>
              </View>
            ) : null}
          </Pressable>

          <View style={[styles.brand, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <View style={[styles.brandTxt, { alignItems: isRtl ? 'flex-end' : 'flex-start' }]}>
              <Text style={[styles.app, { textAlign: isRtl ? 'right' : 'left' }]}>
                {t('home.appName')}
              </Text>
              <View style={styles.meta}>
                <Text style={styles.metaStrong}>{universityName}</Text>
              </View>
            </View>

            <View style={styles.logoWrap}>
              <AppLogoBadge size={42} iconSize={22} />
            </View>
          </View>
        </View>

        <View style={[styles.welcome, { alignItems: isRtl ? 'flex-end' : 'flex-start' }]}>
          <Text style={[styles.welcomeSmall, { textAlign: isRtl ? 'right' : 'left' }]}>
            {t('home.greeting', { commaName })}
          </Text>
          <Text style={[styles.welcomeBig, { textAlign: isRtl ? 'right' : 'left' }]}>
            {t('home.searchTitle')}
          </Text>
        </View>

        <View style={[styles.search, { flexDirection: isRtl ? 'row' : 'row-reverse' }]}>
          <View style={styles.searchIcon}>
            <Ionicons name="search-outline" size={16} color="rgba(255,255,255,0.65)" />
          </View>
          <TextInput
            value={search}
            onChangeText={onChangeSearch}
            placeholder={t('home.searchPlaceholder')}
            placeholderTextColor="rgba(255,255,255,0.42)"
            style={[
              styles.searchInput,
              {
                textAlign: isRtl ? 'right' : 'left',
                writingDirection: isRtl ? 'rtl' : 'ltr',
              },
            ]}
          />
        </View>
      </View>

      <View style={[styles.heroCurve, { backgroundColor: colors.background }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    overflow: 'hidden'
  },
  heroIn:
  {
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 36
  },
  top: {
    alignItems: 'center', justifyContent: 'space-between', marginBottom: 20
  },
  iconBtn: {
    width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.12)'
  },
  badge: {
    position: 'absolute', top: -3, right: -3, minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: SemanticColors.red, paddingHorizontal: 4
  },
  badgeTxt: {
    color: '#fff', fontFamily: FontFamily.cairo, fontSize: FontSize.xxs, fontWeight: FontWeight.bold
  },
  brand: {
    alignItems: 'center', gap: 12
  },
  brandTxt: {
  },
  app: {
    color: '#fff', fontFamily: FontFamily.cairo, fontSize: FontSize.xl, fontWeight: FontWeight.extrabold
  },
  meta: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 6
  },
  metaStrong: {
    color: 'rgba(191,219,254,0.9)', fontFamily: FontFamily.cairo, fontSize: FontSize.x11, fontWeight: FontWeight.semibold
  },
  logoWrap: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  welcome: {
    marginBottom: 20
  },
  welcomeSmall: {
    color: 'rgba(219,234,254,0.72)', fontFamily: FontFamily.cairo, fontSize: FontSize.md, fontWeight: FontWeight.medium
  },
  welcomeBig: {
    color: 'rgba(255,255,255,0.96)', fontFamily: FontFamily.cairo, fontSize: FontSize.lg, fontWeight: FontWeight.bold
  },
  search: {
    minHeight: 56, borderRadius: 20, alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 16
  },
  searchIcon: {
    width: 32, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.1)'
  },
  searchInput: {
    flex: 1, color: '#fff', fontFamily: FontFamily.cairo, fontSize: FontSize.md
  },
  heroCurve: {
    position: 'absolute', left: -8, right: -8, bottom: -20, height: 34, borderTopLeftRadius: 42, borderTopRightRadius: 42
  },
  pressed: {
    transform: [{ scale: 0.97 }]
  },
});
