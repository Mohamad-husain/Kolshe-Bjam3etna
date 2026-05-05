import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontFamily, FontSize, FontWeight } from '@/styles/ui-theme';

import { EXCHANGE_ACCENT, EXCHANGE_ACCENT_DARK } from './exchange-options';

export function ExchangeSuccess() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.wrap}>
        <View style={styles.card}>
          <View style={styles.icon}>
            <Ionicons name="swap-horizontal-outline" size={42} color={EXCHANGE_ACCENT_DARK} />
          </View>

          <Text style={styles.title}>تم نشر طلب التبادل!</Text>
          <Text style={styles.text}>سيتواصل معك المهتمون بالتبادل قريباً</Text>

          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 30,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 30,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.08)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  },
  icon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(90,200,250,0.12)',
  },
  title: {
    marginTop: 16,
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extrabold,
    textAlign: 'center',
  },
  text: {
    marginTop: 8,
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
    lineHeight: 24,
  },
  progressTrack: {
    width: 126,
    height: 5,
    marginTop: 22,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: Colors.secondary,
  },
  progressFill: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: EXCHANGE_ACCENT,
  },
});
