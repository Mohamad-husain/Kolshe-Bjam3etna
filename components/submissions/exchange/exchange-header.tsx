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

import {
  EXCHANGE_ACCENT,
  getExchangeStepCopy,
  type ExchangeStep,
} from './exchange-options';

type Props = {
  activeStep: ExchangeStep;
  step1Done: boolean;
  step2Done: boolean;
  onBack: () => void;
  onStepPress: (step: ExchangeStep) => void;
};

export function ExchangeHeader({
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
              if (stepNumber === 1) onStepPress(1);
              if (stepNumber === 2 && step1Done) onStepPress(2);
              if (stepNumber === 3 && step1Done && step2Done) onStepPress(3);
            }}
            style={[
              styles.dot,
              { backgroundColor: colors.border },
              activeStep === stepNumber && styles.dotActive,
              activeStep > stepNumber && styles.dotDone,
            ]}
          />
        ))}
      </View>

      <View style={styles.center}>
        <Text style={[styles.title, { color: colors.foreground }]}>تبادل جديد</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{getExchangeStepCopy(activeStep)}</Text>
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
  dot: {
    width: 7,
    height: 7,
    borderRadius: Dimensions.radiusFull,
    backgroundColor: Colors.border,
  },
  dotActive: {
    width: 22,
    backgroundColor: EXCHANGE_ACCENT,
  },
  dotDone: {
    backgroundColor: 'rgba(90,200,250,0.42)',
  },
  center: {
    alignItems: 'center',
    paddingHorizontal: 64,
  },
  title: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: 19,
    fontWeight: FontWeight.extrabold,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 1,
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: 12,
    fontWeight: FontWeight.medium,
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
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
