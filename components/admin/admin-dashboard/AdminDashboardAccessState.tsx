import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { adminAccessText } from '@/lib/admin/admin-copy';

import { styles } from './styles';

type AdminDashboardAccessStateProps = {
  title: string;
  message: string;
};

export function AdminDashboardAccessState({
  title,
  message,
}: AdminDashboardAccessStateProps) {
  return (
    <SafeAreaView style={[styles.safeArea, styles.accessStateScreen]}>
      <StatusBar style="dark" />
      <View style={styles.accessStateContainer}>
        <View style={styles.accessStateCard}>
          <Text style={styles.accessStateEyebrow}>{adminAccessText.panelLabel}</Text>
          <Text style={styles.accessStateTitle}>{title}</Text>
          <Text style={styles.accessStateMessage}>{message}</Text>
          <Pressable
            onPress={() => router.replace('/(tabs)/profile')}
            style={({ pressed }) => [styles.accessStateButton, pressed && styles.pressed]}
          >
            <Text style={styles.accessStateButtonText}>{adminAccessText.backToProfile}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
