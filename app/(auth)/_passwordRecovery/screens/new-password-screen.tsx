import { Text, View } from 'react-native';

import { useAppSettings } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import {
  IconInputField,
  RecoveryErrorText,
  RecoveryPrimaryButton,
} from '@/components/password-recovery';
import { styles } from '@/components/password-recovery/styles';

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
  const { t } = useAppSettings();
  const { colors } = useThemePreference();

  return (
    <View style={styles.formArea}>
      <Text style={[styles.title, { color: colors.foreground }]}>{t('recovery.newPasswordTitle')}</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{t('recovery.newPasswordSubtitle')}</Text>

      <IconInputField
        icon="lock-closed-outline"
        placeholder={t('recovery.newPasswordPlaceholder')}
        value={newPassword}
        secureTextEntry={!showNewPassword}
        onChangeText={onChangeNewPassword}
        trailingIcon={showNewPassword ? 'eye-outline' : 'eye-off-outline'}
        onTrailingPress={onToggleShowNewPassword}
      />

      <IconInputField
        icon="lock-closed-outline"
        placeholder={t('recovery.confirmPasswordPlaceholder')}
        value={confirmPassword}
        secureTextEntry={!showConfirmPassword}
        onChangeText={onChangeConfirmPassword}
        trailingIcon={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
        onTrailingPress={onToggleShowConfirmPassword}
      />

      <RecoveryErrorText message={error} />

      <RecoveryPrimaryButton
        title={t('recovery.savePassword')}
        loading={loading}
        onPress={onSavePassword}
      />
    </View>
  );
}
