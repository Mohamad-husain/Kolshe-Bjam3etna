import { Ionicons } from '@expo/vector-icons';
import { type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  Colors,
  FontFamily,
  FontSize,
  FontWeight,
  Spacing,
} from '@/styles/ui-theme';

type AuthErrorTextProps = {
  message?: string | null;
};

type AuthSubmitButtonProps = {
  label: string;
  pendingLabel: string;
  isPending: boolean;
  onPress: () => void;
  icon?: ComponentProps<typeof Ionicons>['name'];
};

export function AuthErrorText({ message }: AuthErrorTextProps) {
  if (!message) {
    return null;
  }

  return <Text style={authFormStyles.errorText}>{message}</Text>;
}

export function AuthSubmitButton({
  label,
  pendingLabel,
  isPending,
  onPress,
  icon = 'arrow-back',
}: AuthSubmitButtonProps) {
  return (
    <Pressable
      disabled={isPending}
      onPress={onPress}
      style={({ pressed }) => [
        authFormStyles.submitButton,
        pressed && authFormStyles.submitButtonPressed,
        isPending && authFormStyles.submitButtonDisabled,
      ]}
    >
      <View style={authFormStyles.submitContent}>
        <Ionicons name={icon} size={20} color="#ffffff" />
        <Text style={authFormStyles.submitButtonText}>
          {isPending ? pendingLabel : label}
        </Text>
      </View>
    </Pressable>
  );
}

export const authFormStyles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  inlineButton: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  inlineButtonText: {
    color: Colors.primary,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  errorText: {
    color: Colors.destructive,
    textAlign: 'right',
    writingDirection: 'rtl',
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  submitButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    writingDirection: 'rtl',
    fontFamily: FontFamily.cairo,
    fontSize: 16,
    fontWeight: FontWeight.bold,
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
