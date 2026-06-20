import { Text, View } from 'react-native';

import { useAppSettings } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import {
  RecoveryErrorText,
  RecoveryPrimaryButton,
  RecoverySecondaryButton,
  SuccessBadge,
} from '@/components/password-recovery';
import { styles } from '@/components/password-recovery/styles';

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
  const { t } = useAppSettings();
  const { colors } = useThemePreference();

  return (
    <View style={styles.formArea}>
      <SuccessBadge />
      <Text style={[styles.title, { color: colors.foreground }]}>{t('recovery.codeSentTitle')}</Text>
      <Text style={[styles.subtitleCompact, { color: colors.mutedForeground }]}>
        {t('recovery.codeSentSubtitle')}
      </Text>
      <Text style={[styles.emailText, { color: colors.primary }]}>{email}</Text>

      <RecoveryErrorText message={error} />

      <RecoveryPrimaryButton title={t('recovery.codeSentButton')} onPress={onEnterCode} />
      <RecoverySecondaryButton
        title={t('recovery.resendCode')}
        loading={loading}
        onPress={onResendCode}
      />
    </View>
  );
}
