import { Text, View } from 'react-native';

import {
  RecoveryErrorText,
  RecoveryPrimaryButton,
  RecoverySecondaryButton,
  SuccessBadge,
} from '@src/components/password-recovery';
import { styles } from '@src/components/password-recovery/styles';

type CodeSentScreenProps = {
  email: string;
  error: string;
  loading: boolean;
  onEnterCode: () => void;
  onResendCode: () => void;
};

export function CodeSentScreen({
  email,
  error,
  loading,
  onEnterCode,
  onResendCode,
}: CodeSentScreenProps) {
  return (
    <View style={styles.formArea}>
      <SuccessBadge />
      <Text style={styles.title}>تم الإرسال</Text>
      <Text style={styles.subtitleCompact}>أرسلنا رمز التحقق إلى</Text>
      <Text style={styles.emailText}>{email}</Text>

      <RecoveryErrorText message={error} />

      <RecoveryPrimaryButton title="أدخل رمز التحقق" onPress={onEnterCode} />
      <RecoverySecondaryButton
        title="إعادة إرسال الرمز"
        loading={loading}
        onPress={onResendCode}
      />
    </View>
  );
}
