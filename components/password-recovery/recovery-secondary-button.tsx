import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

import { Colors } from '@/styles/ui-theme';

import { styles } from './styles';

type RecoverySecondaryButtonProps = {
  title: string;
  loading?: boolean;
} & Omit<PressableProps, 'style'>;

export function RecoverySecondaryButton({
  title,
  loading = false,
  disabled,
  onPress,
}: RecoverySecondaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.secondaryButton,
        pressed && styles.buttonPressed,
        isDisabled && styles.buttonDisabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={Colors.foreground} />
      ) : (
        <Text style={styles.secondaryButtonText}>{title}</Text>
      )}
    </Pressable>
  );
}
