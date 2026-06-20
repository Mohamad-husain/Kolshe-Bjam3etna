import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppSettings } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import { FontFamily, FontSize, FontWeight } from '@/styles/ui-theme';

export function HomeSectionHeader({
  title,
  icon,
  color,
  bg,
  onPress,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  onPress: () => void;
}) {
  const { t, isRtl } = useAppSettings();
  const { colors } = useThemePreference();

  return (
    <View style={[styles.hRow, { flexDirection: isRtl ? 'row' : 'row-reverse' }]}>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.moreBtn, pressed && styles.pressed]}>
        <Text style={[styles.moreTxt, { color: colors.primary }]}>{t('common.showAll')}</Text>
        <Ionicons
          name={isRtl ? 'chevron-back' : 'chevron-forward'}
          size={14}
          color={colors.primary}
        />
      </Pressable>
      <View style={[styles.titleRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
        <Text style={[styles.titleTxt, { color: colors.foreground }]}>{title}</Text>
        <View style={[styles.titleIcon, { backgroundColor: bg }]}>
          <Ionicons name={icon} size={14} color={color} />
        </View>
      </View>
    </View>
  );
}

export function HomeStateBlock({
  color,
  loading,
  error,
  empty,
}: {
  color: string;
  loading?: boolean;
  error?: boolean;
  empty: string;
}) {
  const { t } = useAppSettings();
  const { colors } = useThemePreference();

  return (
    <View style={[styles.state, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {loading ? <ActivityIndicator color={color} /> : null}
      <Text style={[styles.stateTxt, { color: colors.mutedForeground }]}>
        {loading ? t('home.loadingSection') : error ? t('home.sectionError') : empty}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  moreBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 2,
  },
  moreTxt: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.semibold,
  },
  titleRow: {
    alignItems: 'center',
    gap: 8,
  },
  titleTxt: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x17,
    fontWeight: FontWeight.bold,
  },
  titleIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  state: {
    minHeight: 112,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 18,
  },
  stateTxt: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    textAlign: 'center',
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
