import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemePreference } from '@/contexts/theme-preference-context';
import {
  Colors,
  Dimensions,
  FontFamily,
  FontWeight,
  Spacing,
} from '@/styles/ui-theme';

import { getStepCopy, PRODUCT_AD_ACCENT, type ProductAdStep } from './shared';

type Props = {
  activeStep: ProductAdStep;
  step1Done: boolean;
  step2Done: boolean;
  onBack: () => void;
  onStepPress: (step: ProductAdStep) => void;
};

export function ProductAdHeader({
  activeStep,
  step1Done,
  step2Done,
  onBack,
  onStepPress,
}: Props) {
  const { colors } = useThemePreference();

  return (
    <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <View style={styles.progressRow}>
        {[1, 2, 3].map((stepNumber) => (
          <Pressable
            key={stepNumber}
            onPress={() => {
              if (stepNumber === 1) {
                onStepPress(1);
              }

              if (stepNumber === 2 && step1Done) {
                onStepPress(2);
              }

              if (stepNumber === 3 && step1Done && step2Done) {
                onStepPress(3);
              }
            }}
            style={[
              styles.progressDot,
              { backgroundColor: colors.border },
              activeStep === stepNumber && styles.progressDotActive,
              activeStep > stepNumber && styles.progressDotDone,
            ]}
          />
        ))}
      </View>

      <View style={styles.headerCenter}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>إعلان بيع جديد</Text>
        <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>{getStepCopy(activeStep)}</Text>
      </View>

      <Pressable
        onPress={onBack}
        style={({ pressed }) => [
          styles.backButton,
          { backgroundColor: colors.card, borderColor: colors.border },
          pressed && styles.pressed,
        ]}
      >
        <Ionicons name="chevron-forward" size={20} color={colors.foreground} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 90,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(60,60,67,0.08)',
    backgroundColor: 'rgba(246,247,251,0.96)',
  },
  progressRow: {
    position: 'absolute',
    left: Spacing.md,
    top: 16,
    flexDirection: 'row-reverse',
    gap: 6,
  },
  progressDot: {
    width: 7,
    height: 7,
    borderRadius: Dimensions.radiusFull,
    backgroundColor: Colors.border,
  },
  progressDotActive: {
    width: 22,
    backgroundColor: PRODUCT_AD_ACCENT,
  },
  progressDotDone: {
    backgroundColor: 'rgba(255,149,0,0.38)',
  },
  headerCenter: { alignItems: 'center', paddingHorizontal: 64 },
  headerTitle: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: 19,
    fontWeight: FontWeight.extrabold,
    textAlign: 'center',
  },
  headerSubtitle: {
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: 12,
    fontWeight: FontWeight.medium,
    marginTop: 1,
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    right: Spacing.md,
    top: 10,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.05)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  pressed: { transform: [{ scale: 0.98 }] },
});
