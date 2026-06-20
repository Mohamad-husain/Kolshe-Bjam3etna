import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  type PressableProps,
} from 'react-native';

import { useAppSettings } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import { styles } from './styles';

type RecoveryPrimaryButtonProps = {
  title: string;
  loading?: boolean;
} & Omit<PressableProps, 'style'>;

export function RecoveryPrimaryButton({
  title,
  loading = false,
  disabled,
  onPress,
}: RecoveryPrimaryButtonProps) {
  const { isRtl } = useAppSettings();
  const { colors } = useThemePreference();
  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        { backgroundColor: colors.primary, shadowColor: colors.primary },
        pressed && styles.buttonPressed,
        isDisabled && styles.buttonDisabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <View style={[styles.buttonContent, { flexDirection: isRtl ? 'row' : 'row-reverse' }]}>
          <Ionicons name={isRtl ? 'arrow-back' : 'arrow-forward'} size={19} color="#ffffff" />
          <Text style={styles.primaryButtonText}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}
