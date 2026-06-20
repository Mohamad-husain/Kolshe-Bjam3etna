import { Ionicons } from '@expo/vector-icons';
import { type ComponentProps } from 'react';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';

import { useAppSettings } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';

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
  const { isRtl } = useAppSettings();
  const { colors } = useThemePreference();

  return (
    <View
      style={[
        styles.inputWrapper,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          flexDirection: isRtl ? 'row' : 'row-reverse',
        },
      ]}
    >
      <Ionicons name={icon} size={20} color={colors.mutedForeground} />
      <TextInput
        placeholderTextColor={colors.mutedForeground}
        style={[
          styles.input,
          {
            color: colors.foreground,
            textAlign: isRtl ? 'right' : 'left',
            writingDirection: isRtl ? 'rtl' : 'ltr',
          },
          style,
        ]}
        {...props}
      />
      {trailingIcon ? (
        <Pressable
          hitSlop={8}
          onPress={onTrailingPress}
          style={styles.trailingIconButton}
        >
          <Ionicons name={trailingIcon} size={20} color={colors.mutedForeground} />
        </Pressable>
      ) : null}
    </View>
  );
}
