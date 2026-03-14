import { Text, View } from 'react-native';

import {
  RecoveryPrimaryButton,
  SuccessBadge,
} from '@src/components/password-recovery';
import { styles } from '@src/components/password-recovery/styles';

type PasswordResetSuccessScreenProps = {
  onDone: () => void;
};

export function PasswordResetSuccessScreen({
  onDone,
}: PasswordResetSuccessScreenProps) {
  return (
    <View style={styles.formArea}>
      <SuccessBadge />
      <Text style={styles.title}>تم بنجاح!</Text>
      <Text style={styles.subtitle}>
        تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.
      </Text>
      <RecoveryPrimaryButton title="تسجيل الدخول" onPress={onDone} />
    </View>
  );
}
