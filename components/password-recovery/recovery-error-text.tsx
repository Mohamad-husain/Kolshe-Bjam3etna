import { Text } from 'react-native';

import { styles } from './styles';

type RecoveryErrorTextProps = {
  message: string;
};

export function RecoveryErrorText({ message }: RecoveryErrorTextProps) {
  if (!message) {
    return null;
  }

  return <Text style={styles.errorText}>{message}</Text>;
}
