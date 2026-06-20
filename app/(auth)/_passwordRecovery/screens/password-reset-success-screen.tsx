import { Text, View } from 'react-native';

import { useAppSettings } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import {
  RecoveryPrimaryButton,
  SuccessBadge,
} from '@/components/password-recovery';
import { styles } from '@/components/password-recovery/styles';

type PasswordResetSuccessScreenProps = {
  onDone: () => void;
};

export function PasswordResetSuccessScreen({
  onDone,
}: PasswordResetSuccessScreenProps) {
  const { t } = useAppSettings();
  const { colors } = useThemePreference();

  return (
    <View style={styles.formArea}>
      <SuccessBadge />
      <Text style={[styles.title, { color: colors.foreground }]}>{t('recovery.resetSuccessTitle')}</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{t('recovery.resetSuccessBody')}</Text>
      <RecoveryPrimaryButton title={t('auth.loginButton')} onPress={onDone} />
    </View>
  );
}
