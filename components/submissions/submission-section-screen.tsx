import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemePreference } from '@/contexts/theme-preference-context';
import {
  Colors,
  FontFamily,
  FontWeight,
} from '@/styles/ui-theme';

type SubmissionSectionScreenProps = {
  title: string;
};

export function SubmissionSectionScreen({ title }: SubmissionSectionScreenProps) {
  const { colors, effectiveTheme } = useThemePreference();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar style={effectiveTheme === 'dark' ? 'light' : 'dark'} />

      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="العودة إلى قائمة الإضافة"
            onPress={() => router.replace('/(tabs)/add-menu')}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: colors.card, borderColor: colors.border },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="chevron-forward" size={20} color={colors.foreground} />
          </Pressable>

          <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>

          <View style={styles.headerSpacer} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f6fb',
  },
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(60,60,67,0.12)',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.06)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
  },
  title: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: 18,
    fontWeight: FontWeight.extrabold,
  },
  headerSpacer: {
    width: 42,
    height: 42,
  },
  pressed: {
    transform: [{ scale: 0.96 }],
  },
});
