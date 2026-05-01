import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors } from '@/styles/ui-theme';

type AppLogoBadgeProps = {
  size?: number;
  iconSize?: number;
  style?: StyleProp<ViewStyle>;
};

export function AppLogoBadge({
  size = 80,
  iconSize = 37,
  style,
}: AppLogoBadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.275),
        },
        style,
      ]}
    >
      <Ionicons name="school-outline" size={iconSize} color="#ffffff" />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
  },
});
