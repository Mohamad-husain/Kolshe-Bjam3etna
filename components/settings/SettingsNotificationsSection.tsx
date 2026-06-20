import { SemanticColors } from '@/styles/ui-theme';
import { useAppSettings } from '@/contexts/app-settings-context';
import { SettingsRow } from './SettingsRow';
import { SettingsSection } from './SettingsSection';
import { SettingsToggle } from './SettingsToggle';

type SettingsNotificationsSectionProps = {
  notificationsEnabled: boolean;
  messageNotifications: boolean;
  offerNotifications: boolean;
  newsNotifications: boolean;
  soundEnabled: boolean;
  onToggleNotifications: () => void;
  onToggleMessages: () => void;
  onToggleOffers: () => void;
  onToggleNews: () => void;
  onToggleSound: () => void;
};

export function SettingsNotificationsSection({
  notificationsEnabled,
  messageNotifications,
  offerNotifications,
  newsNotifications,
  soundEnabled,
  onToggleNotifications,
  onToggleMessages,
  onToggleOffers,
  onToggleNews,
  onToggleSound,
}: SettingsNotificationsSectionProps) {
  const { t } = useAppSettings();

  return (
    <SettingsSection title={t('settings.notifications')}>
      <SettingsRow
        icon="notifications-outline"
        iconBackgroundColor={SemanticColors.red}
        title={t('settings.notifications')}
        description={
          notificationsEnabled
            ? t('settings.notificationsEnabled')
            : t('settings.notificationsDisabled')
        }
        accessory={
          <SettingsToggle
            value={notificationsEnabled}
            onValueChange={onToggleNotifications}
          />
        }
      />
      <SettingsRow
        icon="notifications-outline"
        iconBackgroundColor={SemanticColors.blue}
        title={t('settings.messagesNotifications')}
        accessory={
          <SettingsToggle
            value={notificationsEnabled && messageNotifications}
            disabled={!notificationsEnabled}
            onValueChange={onToggleMessages}
          />
        }
      />
      <SettingsRow
        icon="notifications-outline"
        iconBackgroundColor={SemanticColors.green}
        title={t('settings.offerNotifications')}
        accessory={
          <SettingsToggle
            value={notificationsEnabled && offerNotifications}
            disabled={!notificationsEnabled}
            onValueChange={onToggleOffers}
          />
        }
      />
      <SettingsRow
        icon="notifications-outline"
        iconBackgroundColor={SemanticColors.orange}
        title={t('settings.newsNotifications')}
        accessory={
          <SettingsToggle
            value={notificationsEnabled && newsNotifications}
            disabled={!notificationsEnabled}
            onValueChange={onToggleNews}
          />
        }
      />
      <SettingsRow
        icon="volume-mute-outline"
        iconBackgroundColor={SemanticColors.violet}
        title={t('settings.sound')}
        accessory={<SettingsToggle value={soundEnabled} onValueChange={onToggleSound} />}
      />
    </SettingsSection>
  );
}
