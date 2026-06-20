import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { useThemePreference } from '@/contexts/theme-preference-context';
import { SemanticColors } from '@/styles/ui-theme';

import { styles } from './styles';

export function SuccessBadge() {
  const { colors } = useThemePreference();

  return (
    <View style={[styles.successIconCircle, { backgroundColor: `${SemanticColors.green}2E`, borderColor: colors.border }]}>
      <Ionicons name="checkmark" size={44} color={SemanticColors.green} />
    </View>
  );
}
