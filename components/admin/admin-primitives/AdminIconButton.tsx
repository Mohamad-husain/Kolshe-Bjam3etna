import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { AdminTheme } from '@/lib/admin/admin-theme';

import { getHovered } from './shared';
import { styles } from './styles';

export function AdminIconButton({
  theme,
  icon,
  accent,
  onPress,
  size = 42,
  iconSize = 20,
}: {
  theme: AdminTheme;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  onPress: () => void;
  size?: number;
  iconSize?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={(state) => {
        const hovered = getHovered(state);
        return [
        styles.iconButton,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: hovered ? `${accent}1f` : `${accent}16`,
          borderColor: `${accent}24`,
        },
        hovered && styles.hoveredLift,
        state.pressed && styles.pressed,
      ];
      }}
    >
      <Ionicons name={icon} size={iconSize} color={accent} />
    </Pressable>
  );
}
