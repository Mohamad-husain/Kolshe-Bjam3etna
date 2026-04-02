import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { toEnglishDigits } from '@/lib/admin/admin-config';
import type { AdminTheme } from '@/lib/admin/admin-theme';

import { AdminCard } from './AdminCard';
import { styles } from './styles';

export function AdminMetricCard({
  theme,
  icon,
  accent,
  value,
  label,
  trend,
}: {
  theme: AdminTheme;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  value: string;
  label: string;
  trend: string;
}) {
  return (
    <AdminCard theme={theme} style={styles.metricCard}>
      <View style={styles.metricTopRow}>
        <View style={[styles.metricIcon, { backgroundColor: `${accent}16` }]}>
          <Ionicons name={icon} size={22} color={accent} />
        </View>
        <View style={[styles.trendPill, { backgroundColor: `${theme.success}16` }]}>
          <Text style={[styles.trendText, { color: theme.success }]}>{toEnglishDigits(trend)}</Text>
        </View>
      </View>
      <Text style={[styles.metricValue, { color: theme.heading }]}>{toEnglishDigits(value)}</Text>
      <Text style={[styles.metricLabel, { color: theme.mutedText }]}>{label}</Text>
    </AdminCard>
  );
}
