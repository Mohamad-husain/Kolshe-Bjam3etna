import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { SemanticColors } from '@src/styles/ui-theme';

import { styles } from './styles';

export function SuccessBadge() {
  return (
    <View style={styles.successIconCircle}>
      <Ionicons name="checkmark" size={44} color={SemanticColors.green} />
    </View>
  );
}
