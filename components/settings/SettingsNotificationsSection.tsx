import { SemanticColors } from '@/styles/ui-theme';
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
  return (
    <SettingsSection title="الإشعارات">
      <SettingsRow
        icon="notifications-outline"
        iconBackgroundColor={SemanticColors.red}
        title="الإشعارات"
        description={notificationsEnabled ? 'مفعّلة' : 'مقفلة'}
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
        title="إشعارات الرسائل"
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
        title="إشعارات العروض"
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
        title="إشعارات الأخبار"
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
        title="الأصوات"
        accessory={<SettingsToggle value={soundEnabled} onValueChange={onToggleSound} />}
      />
    </SettingsSection>
  );
}
