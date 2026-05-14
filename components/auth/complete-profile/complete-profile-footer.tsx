import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  Colors,
  FontFamily,
  FontWeight,
} from '@/styles/ui-theme';

type CompleteProfileFooterProps = {
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
};

export function CompleteProfileFooter({
  isSubmitting,
  onBack,
  onSubmit,
}: CompleteProfileFooterProps) {
  return (
    <View style={styles.footerActions}>
      <Pressable
        onPress={onBack}
        style={({ pressed }) => [
          styles.secondaryButton,
          pressed && styles.secondaryButtonPressed,
        ]}
      >
        <Text style={styles.secondaryButtonText}>رجوع</Text>
      </Pressable>

      <Pressable
        disabled={isSubmitting}
        onPress={onSubmit}
        style={({ pressed }) => [
          styles.primaryButton,
          pressed && !isSubmitting && styles.primaryButtonPressed,
          isSubmitting && styles.primaryButtonDisabled,
        ]}
      >
        <Text style={styles.primaryButtonText}>
          {isSubmitting ? 'جارٍ الإرسال...' : 'إكمال التسجيل'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  footerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#dddfe7',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  secondaryButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  secondaryButtonText: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: 17,
    fontWeight: FontWeight.semibold,
  },
  primaryButton: {
    flex: 1,
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 14,
    elevation: 5,
  },
  primaryButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  primaryButtonDisabled: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontFamily: FontFamily.cairo,
    fontSize: 17,
    fontWeight: FontWeight.bold,
  },
});
