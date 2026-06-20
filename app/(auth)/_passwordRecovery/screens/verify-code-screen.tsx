import { Text, TextInput, View } from 'react-native';

import { useAppSettings } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import {
  RecoveryErrorText,
  RecoveryPrimaryButton,
  RecoverySecondaryButton,
} from '@/components/password-recovery';
import { styles } from '@/components/password-recovery/styles';
import type {
  CodeInputRef,
  CodeKeyPressHandler,
  CodeValueChangeHandler,
} from '@/hooks/password-recovery/types';

type VerifyCodeScreenProps = {
  codeDigits: string[];
  error: string;
  loading: boolean;
  onCodeChange: CodeValueChangeHandler;
  onCodeKeyPress: CodeKeyPressHandler;
  onSetCodeRef: (index: number, ref: CodeInputRef) => void;
  onVerifyCode: () => void;
  onResendCode: () => void;
};

export function VerifyCodeScreen({
  codeDigits,
  error,
  loading,
  onCodeChange,
  onCodeKeyPress,
  onSetCodeRef,
  onVerifyCode,
  onResendCode,
}: VerifyCodeScreenProps) {
  const { t } = useAppSettings();
  const { colors } = useThemePreference();

  return (
    <View style={styles.formArea}>
      <Text style={[styles.title, { color: colors.foreground }]}>{t('recovery.verifyTitle')}</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{t('recovery.verifySubtitle')}</Text>

      <View style={styles.codeRow}>
        {codeDigits.map((digit, index) => (
          <TextInput
            key={`code-${index}`}
            ref={(node) => {
              onSetCodeRef(index, node);
            }}
            keyboardType="number-pad"
            maxLength={6}
            value={digit}
            onChangeText={(value) => {
              onCodeChange(value, index);
            }}
            onKeyPress={(event) => {
              onCodeKeyPress(event, index);
            }}
            style={[
              styles.codeInput,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.foreground,
              },
            ]}
            placeholder="-"
            placeholderTextColor={colors.mutedForeground}
            textAlign="center"
          />
        ))}
      </View>

      <RecoveryErrorText message={error} />

      <RecoveryPrimaryButton
        title={t('recovery.verifyCode')}
        loading={loading}
        onPress={onVerifyCode}
      />
      <RecoverySecondaryButton
        title={t('recovery.resendCode')}
        loading={loading}
        onPress={onResendCode}
      />
    </View>
  );
}
