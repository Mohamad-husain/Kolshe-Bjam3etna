import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/styles/ui-theme';

import { serviceRequestStyles as styles } from './shared';

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
