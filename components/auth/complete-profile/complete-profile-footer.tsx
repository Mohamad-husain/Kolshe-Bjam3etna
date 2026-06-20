import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppSettings } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import {
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
  const { isRtl, t } = useAppSettings();
  const { colors } = useThemePreference();

  return (
    <View style={[styles.footerActions, { flexDirection: isRtl ? 'row' : 'row-reverse' }]}>
      <Pressable
        onPress={onBack}
        style={({ pressed }) => [
          styles.secondaryButton,
          { backgroundColor: colors.card, borderColor: colors.border },
          pressed && styles.secondaryButtonPressed,
        ]}
      >
        <Text style={[styles.secondaryButtonText, { color: colors.foreground }]}>
          {t('completeProfile.back')}
        </Text>
      </Pressable>

      <Pressable
        disabled={isSubmitting}
        onPress={onSubmit}
        style={({ pressed }) => [
          styles.primaryButton,
          { backgroundColor: colors.primary, shadowColor: colors.primary },
          pressed && !isSubmitting && styles.primaryButtonPressed,
          isSubmitting && styles.primaryButtonDisabled,
        ]}
      >
        <Text style={styles.primaryButtonText}>
          {isSubmitting ? t('completeProfile.footerPending') : t('completeProfile.footerSubmit')}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  footerActions: {
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 1,
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
    fontFamily: FontFamily.cairo,
    fontSize: 17,
    fontWeight: FontWeight.semibold,
  },
  primaryButton: {
    flex: 1,
    minHeight: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
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
