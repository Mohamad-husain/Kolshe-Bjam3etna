import { Text, View } from 'react-native';

import type { AdminTheme } from '@/lib/admin/admin-theme';

import { styles } from './styles';

export function AdminBadge({
  theme,
  label,
  accent,
  subtle = true,
  compact = false,
}: {
  theme: AdminTheme;
  label: string;
  accent: string;
  subtle?: boolean;
  compact?: boolean;
}) {
  return (
    <View
      style={[
        styles.badge,
        compact ? styles.badgeCompact : null,
        {
          backgroundColor: subtle ? `${accent}18` : accent,
          borderColor: subtle ? 'transparent' : accent,
        },
      ]}
    >
      <Text style={[styles.badgeText, compact ? styles.badgeTextCompact : null, { color: subtle ? accent : '#ffffff' }]}>{label}</Text>
    </View>
  );
}
