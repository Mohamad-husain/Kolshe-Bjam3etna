import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  type PressableProps,
} from 'react-native';

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
  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        pressed && styles.buttonPressed,
        isDisabled && styles.buttonDisabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <View style={styles.buttonContent}>
          <Ionicons name="arrow-back" size={19} color="#ffffff" />
          <Text style={styles.primaryButtonText}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}
