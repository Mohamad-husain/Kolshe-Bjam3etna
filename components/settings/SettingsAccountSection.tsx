import { SettingsRow } from './SettingsRow';
import { SettingsSection } from './SettingsSection';
import { SemanticColors } from '@/styles/ui-theme';
import { useAppSettings } from '@/contexts/app-settings-context';

type SettingsAccountSectionProps = {
  onEditProfile: () => void;
  onChangeUniversity: () => void;
  onOpenAppearance: () => void;
  onOpenLanguage: () => void;
  onAbout: () => void;
  appearanceDescription: string;
  languageDescription: string;
};

export function SettingsAccountSection({
  onEditProfile,
  onChangeUniversity,
  onOpenAppearance,
  onOpenLanguage,
  onAbout,
  appearanceDescription,
  languageDescription,
}: SettingsAccountSectionProps) {
  const { t } = useAppSettings();

  return (
    <SettingsSection title={t('settings.account')}>
      <SettingsRow
        icon="moon-outline"
        iconBackgroundColor={SemanticColors.violet}
        title={t('settings.appearance')}
        description={appearanceDescription}
        onPress={onOpenAppearance}
      />
      <SettingsRow
        icon="language-outline"
        iconBackgroundColor={SemanticColors.green}
        title={t('settings.language')}
        description={languageDescription}
        onPress={onOpenLanguage}
      />
      <SettingsRow
        icon="person-outline"
        iconBackgroundColor={SemanticColors.blue}
        title={t('settings.editProfile')}
        onPress={onEditProfile}
      />
      <SettingsRow
        icon="globe-outline"
        iconBackgroundColor={SemanticColors.lightBlue}
        title={t('settings.changeUniversity')}
        onPress={onChangeUniversity}
      />
      <SettingsRow
        icon="information-circle-outline"
        iconBackgroundColor="#8e8e93"
        title={t('settings.aboutTitle')}
        description={t('settings.aboutDescription')}
        onPress={onAbout}
      />
    </SettingsSection>
  );
}
