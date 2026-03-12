import { Text, View } from 'react-native';

import {
  IconInputField,
  RecoveryErrorText,
  RecoveryPrimaryButton,
} from '@src/components/password-recovery';
import { styles } from '@src/components/password-recovery/styles';

type NewPasswordScreenProps = {
  newPassword: string;
  confirmPassword: string;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  error: string;
  loading: boolean;
  onChangeNewPassword: (value: string) => void;
  onChangeConfirmPassword: (value: string) => void;
  onToggleShowNewPassword: () => void;
  onToggleShowConfirmPassword: () => void;
  onSavePassword: () => void;
};

export function NewPasswordScreen({
  newPassword,
  confirmPassword,
  showNewPassword,
  showConfirmPassword,
  error,
  loading,
  onChangeNewPassword,
  onChangeConfirmPassword,
  onToggleShowNewPassword,
  onToggleShowConfirmPassword,
  onSavePassword,
}: NewPasswordScreenProps) {
  return (
    <View style={styles.formArea}>
      <Text style={styles.title}>كلمة مرور جديدة</Text>
      <Text style={styles.subtitle}>أنشئ كلمة مرور قوية لحماية حسابك</Text>

      <IconInputField
        icon="lock-closed-outline"
        placeholder="كلمة المرور الجديدة"
        value={newPassword}
        secureTextEntry={!showNewPassword}
        onChangeText={onChangeNewPassword}
        trailingIcon={showNewPassword ? 'eye-outline' : 'eye-off-outline'}
        onTrailingPress={onToggleShowNewPassword}
      />

      <IconInputField
        icon="lock-closed-outline"
        placeholder="تأكيد كلمة المرور"
        value={confirmPassword}
        secureTextEntry={!showConfirmPassword}
        onChangeText={onChangeConfirmPassword}
        trailingIcon={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
        onTrailingPress={onToggleShowConfirmPassword}
      />

      <RecoveryErrorText message={error} />

      <RecoveryPrimaryButton
        title="حفظ كلمة المرور"
        loading={loading}
        onPress={onSavePassword}
      />
    </View>
  );
}
