import { StyleSheet } from 'react-native';

import { SemanticColors } from '@/styles/ui-theme';
import { SettingsRow } from './SettingsRow';
import { SettingsSection } from './SettingsSection';

type SettingsLogoutSectionProps = {
  onPress: () => void;
};

export function SettingsLogoutSection({ onPress }: SettingsLogoutSectionProps) {
  return (
    <SettingsSection style={styles.section}>
      <SettingsRow
        icon="log-out-outline"
        iconBackgroundColor={SemanticColors.red}
        title="تسجيل الخروج"
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
