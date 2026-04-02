import { SemanticColors } from '@/styles/ui-theme';
import { SettingsRow } from './SettingsRow';
import { SettingsSection } from './SettingsSection';
import { SettingsToggle } from './SettingsToggle';

type SettingsPrivacySectionProps = {
  showOnlineStatus: boolean;
  onToggleShowOnline: () => void;
  onChangePassword: () => void;
  onOpenTwoFactor: () => void;
};

export function SettingsPrivacySection({
  showOnlineStatus,
  onToggleShowOnline,
  onChangePassword,
  onOpenTwoFactor,
}: SettingsPrivacySectionProps) {
  return (
    <SettingsSection title="الخصوصية والأمان">
      <SettingsRow
        icon="eye-outline"
        iconBackgroundColor={SemanticColors.lightBlue}
        title="إظهار حالة الاتصال"
        accessory={
          <SettingsToggle value={showOnlineStatus} onValueChange={onToggleShowOnline} />
        }
      />
      <SettingsRow
        icon="lock-closed-outline"
        iconBackgroundColor={SemanticColors.orange}
        title="تغيير كلمة المرور"
        onPress={onChangePassword}
      />
      <SettingsRow
        icon="shield-checkmark-outline"
        iconBackgroundColor={SemanticColors.green}
        title="المصادقة الثنائية"
        description="غير مفعّلة"
        onPress={onOpenTwoFactor}
      />
    </SettingsSection>
  );
}
