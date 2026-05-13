import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Colors,
  FontFamily,
  FontSize,
  FontWeight,
} from '@/styles/ui-theme';

export function ServiceRequestSuccess() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.successWrap}>
        <View style={styles.successCard}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color={Colors.primary} />
          </View>
          <Text style={styles.successTitle}>تم نشر طلب الخدمة</Text>
          <Text style={styles.successText}>
            سيظهر الآن ضمن خدماتك ويمكنك متابعة العروض من صفحة الحساب.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f6f7fb' },
  successWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: Colors.background,
  },
  successCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 30,
    paddingHorizontal: 24,
    paddingVertical: 28,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.08)',
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  },
  successIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(37,99,235,0.10)',
  },
  successTitle: {
    marginTop: 16,
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extrabold,
    textAlign: 'center',
  },
  successText: {
    marginTop: 8,
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
    lineHeight: 24,
  },
});
