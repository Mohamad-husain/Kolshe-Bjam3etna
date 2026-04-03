import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { AdminTheme } from '@/lib/admin/admin-theme';

import { AdminCard } from './AdminCard';
import { styles } from './styles';

export function AdminEmptyState({
  theme,
  icon,
  title,
  description,
}: {
  theme: AdminTheme;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}) {
  return (
    <AdminCard theme={theme} style={styles.emptyCard}>
      <View style={[styles.emptyIconWrap, { backgroundColor: theme.neutralSoft }]}>
        <Ionicons name={icon} size={28} color={theme.mutedText} />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.heading }]}>{title}</Text>
      <Text style={[styles.emptyDescription, { color: theme.mutedText }]}>{description}</Text>
    </AdminCard>
  );
}
