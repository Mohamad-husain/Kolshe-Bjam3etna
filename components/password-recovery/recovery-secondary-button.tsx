import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

import { useThemePreference } from '@/contexts/theme-preference-context';

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
  const { colors } = useThemePreference();
  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.secondaryButton,
        { backgroundColor: colors.secondary },
        pressed && styles.buttonPressed,
        isDisabled && styles.buttonDisabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.foreground} />
      ) : (
        <Text style={[styles.secondaryButtonText, { color: colors.foreground }]}>{title}</Text>
      )}
    </Pressable>
  );
}
