import { Ionicons } from '@expo/vector-icons';
import { type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppSettings } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import {
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

export function getAuthErrorMessage(error: unknown, fallbackMessage: string) {
  if (!error) {
    return '';
  }

  return error instanceof Error ? error.message : fallbackMessage;
}

export function AuthErrorText({ message }: AuthErrorTextProps) {
  const { isRtl } = useAppSettings();
  const { colors } = useThemePreference();

  if (!message) {
    return null;
  }

  return (
    <Text
      style={[
        authFormStyles.errorText,
        {
          color: colors.destructive,
          textAlign: isRtl ? 'right' : 'left',
          writingDirection: isRtl ? 'rtl' : 'ltr',
        },
      ]}
    >
      {message}
    </Text>
  );
}

export function AuthSubmitButton({
  label,
  pendingLabel,
  isPending,
  onPress,
  icon = 'arrow-back',
}: AuthSubmitButtonProps) {
  const { isRtl } = useAppSettings();
  const { colors } = useThemePreference();

  return (
    <Pressable
      disabled={isPending}
      onPress={onPress}
      style={({ pressed }) => [
        authFormStyles.submitButton,
        { backgroundColor: colors.primary, shadowColor: colors.primary },
        pressed && authFormStyles.submitButtonPressed,
        isPending && authFormStyles.submitButtonDisabled,
      ]}
    >
      <View style={[authFormStyles.submitContent, { flexDirection: isRtl ? 'row' : 'row-reverse' }]}>
        <Ionicons name={icon} size={20} color="#ffffff" />
        <Text
          style={[
            authFormStyles.submitButtonText,
            { writingDirection: isRtl ? 'rtl' : 'ltr' },
          ]}
        >
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
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  errorText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
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
    fontFamily: FontFamily.cairo,
    fontSize: 16,
    fontWeight: FontWeight.bold,
  },
  submitContent: {
    alignItems: 'center',
    gap: 8,
  },
});
