import { SettingsSection } from './SettingsSection';
import {
  SettingsThemeSelector,
  type SettingsThemeValue,
} from './SettingsThemeSelector';

type SettingsAppearanceSectionProps = {
  selectedTheme: SettingsThemeValue;
  onChangeTheme: (theme: SettingsThemeValue) => void;
};

export function SettingsAppearanceSection({
  selectedTheme,
  onChangeTheme,
}: SettingsAppearanceSectionProps) {
  return (
    <SettingsSection title="المظهر">
      <SettingsThemeSelector value={selectedTheme} onChange={onChangeTheme} />
    </SettingsSection>
  );
}
