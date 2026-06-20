import { StyleSheet } from 'react-native';

import { useAppSettings } from '@/contexts/app-settings-context';
import { SemanticColors } from '@/styles/ui-theme';
import { SettingsRow } from './SettingsRow';
import { SettingsSection } from './SettingsSection';

type SettingsLogoutSectionProps = {
  onPress: () => void;
};

export function SettingsLogoutSection({ onPress }: SettingsLogoutSectionProps) {
  const { t } = useAppSettings();

  return (
    <SettingsSection style={styles.section}>
      <SettingsRow
        icon="log-out-outline"
        iconBackgroundColor={SemanticColors.red}
        title={t('settings.logout')}
        danger
        showChevron={false}
        onPress={onPress}
      />
    </SettingsSection>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 28,
  },
});
