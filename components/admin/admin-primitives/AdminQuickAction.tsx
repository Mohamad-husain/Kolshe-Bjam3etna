import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { getAdminShadow, type AdminTheme } from '@/lib/admin/admin-theme';

import { getHovered } from './shared';
import { styles } from './styles';

export function AdminQuickAction({
  theme,
  icon,
  accent,
  label,
  onPress,
}: {
  theme: AdminTheme;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={(state) => {
        const hovered = getHovered(state);
        return [
        styles.quickAction,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
        },
        getAdminShadow(theme),
        hovered && styles.hoveredLift,
        state.pressed && styles.pressed,
      ];
      }}
    >
      <View style={styles.quickActionLeading}>
        <Ionicons name="chevron-forward" size={20} color={theme.mutedText} />
        <Text style={[styles.quickActionText, { color: theme.heading }]}>{label}</Text>
      </View>
      <View style={[styles.quickActionIcon, { backgroundColor: `${accent}16` }]}>
        <Ionicons name={icon} size={22} color={accent} />
      </View>
    </Pressable>
  );
}
