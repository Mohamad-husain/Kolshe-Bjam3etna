import { Text, TextInput, View } from 'react-native';

import {
  RecoveryErrorText,
  RecoveryPrimaryButton,
  RecoverySecondaryButton,
} from '@/components/password-recovery';
import { Colors } from '@/styles/ui-theme';
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
  return (
    <View style={styles.formArea}>
      <Text style={styles.title}>رمز التحقق</Text>
      <Text style={styles.subtitle}>
        أدخل الرمز المكون من 6 أرقام الذي أرسلناه لبريدك
      </Text>

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
            style={styles.codeInput}
            placeholder="-"
            placeholderTextColor={Colors.mutedForeground}
            textAlign="center"
          />
        ))}
      </View>

      <RecoveryErrorText message={error} />

      <RecoveryPrimaryButton
        title="تحقق من الرمز"
        loading={loading}
        onPress={onVerifyCode}
      />
      <RecoverySecondaryButton
        title="إعادة إرسال الرمز"
        loading={loading}
        onPress={onResendCode}
      />
    </View>
  );
}
