import { Ionicons } from '@expo/vector-icons';
import { type ComponentProps } from 'react';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';

import { Colors } from '@/styles/ui-theme';

import { styles } from './styles';

type IconInputFieldProps = TextInputProps & {
  icon: ComponentProps<typeof Ionicons>['name'];
  trailingIcon?: ComponentProps<typeof Ionicons>['name'];
  onTrailingPress?: () => void;
};

export function IconInputField({
  icon,
  trailingIcon,
  onTrailingPress,
  style,
  ...props
}: IconInputFieldProps) {
  return (
    <View style={styles.inputWrapper}>
      <Ionicons name={icon} size={20} color={Colors.mutedForeground} />
      <TextInput
        placeholderTextColor={Colors.mutedForeground}
        style={[styles.input, style]}
        {...props}
      />
      {trailingIcon ? (
        <Pressable
          hitSlop={8}
          onPress={onTrailingPress}
          style={styles.trailingIconButton}
        >
          <Ionicons name={trailingIcon} size={20} color={Colors.mutedForeground} />
        </Pressable>
      ) : null}
    </View>
  );
}
