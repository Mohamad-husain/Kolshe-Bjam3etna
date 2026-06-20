import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppSettings } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import { FontFamily, FontWeight } from '@/styles/ui-theme';

type SettingsHeaderProps = {
  onGoBack: () => void;
};

export function SettingsHeader({
  onGoBack,
}: SettingsHeaderProps) {
  const { t, isRtl } = useAppSettings();
  const { colors } = useThemePreference();

  return (
    <View style={[styles.header, { backgroundColor: colors.primary }]}>
      <View style={styles.headerGlowPrimary} />
      <View style={styles.headerGlowSecondary} />
      <View style={styles.headerGlowTertiary} />

      <View style={[styles.headerTop, { flexDirection: isRtl ? 'row' : 'row-reverse' }]}>
        <Pressable onPress={onGoBack} style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}>
          <Ionicons name={isRtl ? 'chevron-back' : 'chevron-forward'} size={20} color="#ffffff" />
        </Pressable>

        <Text style={styles.headerTitle}>{t('settings.title')}</Text>

        <View style={styles.headerSpacer} />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 84,
    paddingTop: 8,
    paddingBottom: 14,
    overflow: 'hidden',
  },
  headerGlowPrimary: {
    position: 'absolute',
    top: -90,
    right: -30,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  headerGlowSecondary: {
    position: 'absolute',
    bottom: -100,
    left: -28,
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerGlowTertiary: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  headerButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  headerTitle: {
    color: '#ffffff',
    fontFamily: FontFamily.cairo,
    fontSize: 18,
    fontWeight: FontWeight.black,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 38,
    height: 38,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
