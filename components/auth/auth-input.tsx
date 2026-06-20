import { Ionicons } from '@expo/vector-icons';
import { type ComponentProps } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { useAppSettings } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import {
  FontFamily,
} from '@/styles/ui-theme';

type AuthInputProps = TextInputProps & {
  icon: ComponentProps<typeof Ionicons>['name'];
  trailingIcon?: ComponentProps<typeof Ionicons>['name'];
  onTrailingIconPress?: () => void;
};

export function AuthInput({
  icon,
  trailingIcon,
  onTrailingIconPress,
  style,
  ...props
}: AuthInputProps) {
  const { isRtl } = useAppSettings();
  const { colors } = useThemePreference();

  return (
    <View
      style={[
        styles.wrapper,
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
          accessibilityRole="button"
          onPress={onTrailingIconPress}
          hitSlop={8}
          style={styles.trailingButton}
        >
          <Ionicons name={trailingIcon} size={20} color={colors.mutedForeground} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    minHeight: 56,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.cairo,
    fontSize: 14,
  },
  trailingButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
});
