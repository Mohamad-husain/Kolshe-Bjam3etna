import { Pressable, Text, View } from 'react-native';

import { toEnglishDigits } from '@/lib/admin/admin-config';
import { getAdminShadow, type AdminTheme } from '@/lib/admin/admin-theme';

import { getHovered } from './shared';
import { styles } from './styles';

export function AdminOutlinedStat({
  theme,
  title,
  value,
  accent,
  active,
  onPress,
}: {
  theme: AdminTheme;
  title: string;
  value: string;
  accent: string;
  active?: boolean;
  onPress?: () => void;
}) {
  const content = (
    <View
      style={[
        styles.outlinedStat,
        {
          backgroundColor: theme.cardBackground,
          borderColor: active ? accent : theme.border,
        },
        getAdminShadow(theme),
      ]}
    >
      <Text style={[styles.outlinedStatValue, { color: accent }]}>{toEnglishDigits(value)}</Text>
      <Text style={[styles.outlinedStatTitle, { color: theme.heading }]}>{title}</Text>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable onPress={onPress} style={(state) => [styles.outlinedStatPressable, getHovered(state) && styles.hoveredLift, state.pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}
