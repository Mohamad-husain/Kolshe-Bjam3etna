import { SemanticColors } from '@/styles/ui-theme';
import { useAppSettings } from '@/contexts/app-settings-context';
import { SettingsRow } from './SettingsRow';
import { SettingsSection } from './SettingsSection';
import { SettingsToggle } from './SettingsToggle';

type SettingsPrivacySectionProps = {
  showOnlineStatus: boolean;
  onToggleShowOnline: () => void;
  onChangePassword: () => void;
};

export function SettingsPrivacySection({
  showOnlineStatus,
  onToggleShowOnline,
  onChangePassword,
}: SettingsPrivacySectionProps) {
  const { t } = useAppSettings();

  return (
    <SettingsSection title={t('settings.privacy')}>
      <SettingsRow
        icon="eye-outline"
        iconBackgroundColor={SemanticColors.lightBlue}
        title={t('settings.onlineStatus')}
        accessory={
          <SettingsToggle value={showOnlineStatus} onValueChange={onToggleShowOnline} />
        }
      />
      <SettingsRow
        icon="lock-closed-outline"
        iconBackgroundColor={SemanticColors.orange}
        title={t('settings.changePassword')}
        onPress={onChangePassword}
      />
    </SettingsSection>
  );
}
