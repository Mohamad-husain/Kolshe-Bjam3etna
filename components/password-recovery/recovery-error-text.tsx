import { Text } from 'react-native';

import { useAppSettings } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import { styles } from './styles';

type RecoveryErrorTextProps = {
  message: string;
};

export function RecoveryErrorText({ message }: RecoveryErrorTextProps) {
  const { isRtl } = useAppSettings();
  const { colors } = useThemePreference();

  if (!message) {
    return null;
  }

  return (
    <Text
      style={[
        styles.errorText,
        {
          color: colors.destructive,
          textAlign: isRtl ? 'right' : 'left',
          writingDirection: isRtl ? 'rtl' : 'ltr',
        },
      ]}
    >
      {message}
    </Text>
  );
}
