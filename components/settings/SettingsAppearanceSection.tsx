import { SettingsSection } from './SettingsSection';
import {
  SettingsThemeSelector,
  type SettingsThemeValue,
} from './SettingsThemeSelector';
import { useAppSettings } from '@/contexts/app-settings-context';

type SettingsAppearanceSectionProps = {
  selectedTheme: SettingsThemeValue;
  onChangeTheme: (theme: SettingsThemeValue) => void;
};

export function SettingsAppearanceSection({
  selectedTheme,
  onChangeTheme,
}: SettingsAppearanceSectionProps) {
  const { t } = useAppSettings();

  return (
    <SettingsSection title={t('settings.appearance')}>
      <SettingsThemeSelector value={selectedTheme} onChange={onChangeTheme} />
    </SettingsSection>
  );
}
