import { Text, View } from 'react-native';

import { useAppSettings } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import {
  IconInputField,
  RecoveryErrorText,
  RecoveryPrimaryButton,
} from '@/components/password-recovery';
import { styles } from '@/components/password-recovery/styles';

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
  const { t } = useAppSettings();
  const { colors } = useThemePreference();

  return (
    <View style={styles.formArea}>
      <Text style={[styles.title, { color: colors.foreground }]}>{t('recovery.title')}</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{t('recovery.subtitle')}</Text>

      <IconInputField
        icon="mail-outline"
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder={t('recovery.emailPlaceholder')}
        value={email}
        onChangeText={onChangeEmail}
      />

      <View style={[styles.hintBox, { backgroundColor: colors.secondary }]}>
        <View style={[styles.hintDot, { backgroundColor: colors.primary }]} />
        <Text style={[styles.hintText, { color: colors.primary }]}>
          {t('recovery.emailHint')}
        </Text>
      </View>

      <RecoveryErrorText message={error} />

      <RecoveryPrimaryButton
        title={t('recovery.sendCode')}
        loading={loading}
        onPress={onSendCode}
      />
    </View>
  );
}
