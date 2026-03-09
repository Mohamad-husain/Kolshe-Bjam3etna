import { Ionicons } from '@expo/vector-icons';
import { type ComponentProps } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import {
  Colors,
  FontFamily,
} from '@src/styles/ui-theme';

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
  return (
    <View style={styles.wrapper}>
      <Ionicons name={icon} size={20} color="#a1a1aa" />
      <TextInput
        placeholderTextColor="#a1a1aa"
        style={[styles.input, style]}
        {...props}
      />
      {trailingIcon ? (
        <Pressable
          accessibilityRole="button"
          onPress={onTrailingIconPress}
          hitSlop={8}
          style={styles.trailingButton}
        >
          <Ionicons name={trailingIcon} size={20} color="#a1a1aa" />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    backgroundColor: '#f4f4f7',
    borderWidth: 1,
    borderColor: '#e3e4ea',
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
    textAlign: 'right',
    writingDirection: 'rtl',
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: 14,
  },
  trailingButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
});
