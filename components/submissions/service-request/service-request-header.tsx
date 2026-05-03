import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { Colors } from '@/styles/ui-theme';

import { getStepCopy, serviceRequestStyles as styles, type ServiceRequestStep } from './shared';

type Props = {
  activeStep: ServiceRequestStep;
  step1Done: boolean;
  step2Done: boolean;
  onBack: () => void;
  onStepPress: (step: ServiceRequestStep) => void;
};

export function ServiceRequestHeader({
  activeStep,
  step1Done,
  step2Done,
  onBack,
  onStepPress,
}: Props) {
  return (
    <View style={styles.header}>
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
              activeStep === stepNumber && styles.progressDotActive,
              activeStep > stepNumber && styles.progressDotDone,
            ]}
          />
        ))}
      </View>

      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>طلب خدمة جديد</Text>
        <Text style={styles.headerSubtitle}>{getStepCopy(activeStep)}</Text>
      </View>

      <Pressable onPress={onBack} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
        <Ionicons name="chevron-forward" size={20} color={Colors.foreground} />
      </Pressable>
    </View>
  );
}
