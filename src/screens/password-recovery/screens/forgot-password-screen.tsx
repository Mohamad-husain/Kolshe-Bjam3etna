import { Text, View } from 'react-native';

import {
  IconInputField,
  RecoveryErrorText,
  RecoveryPrimaryButton,
} from '@src/components/password-recovery';
import { styles } from '@src/components/password-recovery/styles';

type ForgotPasswordScreenProps = {
  email: string;
  error: string;
  loading: boolean;
  onChangeEmail: (value: string) => void;
  onSendCode: () => void;
};

export function ForgotPasswordScreen({
  email,
  error,
  loading,
  onChangeEmail,
  onSendCode,
}: ForgotPasswordScreenProps) {
  return (
    <View style={styles.formArea}>
      <Text style={styles.title}>نسيت كلمة المرور؟</Text>
      <Text style={styles.subtitle}>
        أدخل بريدك الجامعي وسنرسل لك رمز تحقق لإعادة تعيين كلمة المرور
      </Text>

      <IconInputField
        icon="mail-outline"
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="البريد الجامعي"
        value={email}
        onChangeText={onChangeEmail}
      />

      <View style={styles.hintBox}>
        <View style={styles.hintDot} />
        <Text style={styles.hintText}>
          سيصلك رمز مكوّن من 6 أرقام على بريدك الجامعي خلال دقيقتين.
        </Text>
      </View>

      <RecoveryErrorText message={error} />

      <RecoveryPrimaryButton
        title="إرسال رمز التحقق"
        loading={loading}
        onPress={onSendCode}
      />
    </View>
  );
}
