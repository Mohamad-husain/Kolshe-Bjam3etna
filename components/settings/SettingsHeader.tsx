import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontFamily, FontSize, FontWeight } from '@/styles/ui-theme';
import { SettingsToggle } from './SettingsToggle';

type SettingsHeaderProps = {
  isDarkPreview: boolean;
  onGoBack: () => void;
  onToggleTheme: () => void;
};

export function SettingsHeader({
  isDarkPreview,
  onGoBack,
  onToggleTheme,
}: SettingsHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerGlowPrimary} />
      <View style={styles.headerGlowSecondary} />
      <View style={styles.headerGlowTertiary} />

      <View style={styles.headerTop}>
        <Pressable onPress={onGoBack} style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}>
          <Ionicons name="chevron-back" size={20} color="#ffffff" />
        </Pressable>

        <Text style={styles.headerTitle}>الإعدادات</Text>

        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.heroCard}>
        <SettingsToggle value={isDarkPreview} onValueChange={onToggleTheme} />

        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>
            {isDarkPreview ? 'الوضع الليلي' : 'الوضع النهاري'}
          </Text>
          <Text style={styles.heroDescription}>
            {isDarkPreview
              ? 'اضغط للتبديل للوضع الفاتح'
              : 'اضغط للتبديل للوضع الداكن'}
          </Text>
        </View>

        <Pressable
          onPress={onToggleTheme}
          style={({ pressed }) => [styles.heroIconButton, pressed && styles.pressed]}
        >
          <Ionicons
            name={isDarkPreview ? 'sunny-outline' : 'moon-outline'}
            size={24}
            color={isDarkPreview ? '#ffb340' : '#ffffff'}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 270,
    paddingTop: 8,
    paddingBottom: 30,
    backgroundColor: Colors.primary,
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
  heroCard: {
    marginTop: 26,
    marginHorizontal: 18,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  heroContent: {
    flex: 1,
    marginHorizontal: 14,
    alignItems: 'flex-end',
  },
  heroTitle: {
    color: '#ffffff',
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x17,
    fontWeight: FontWeight.black,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  heroDescription: {
    marginTop: 2,
    color: 'rgba(255,255,255,0.72)',
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  heroIconButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
