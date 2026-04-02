import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AdminCard } from '@/components/admin/admin-primitives';
import type { AdminTheme } from '@/lib/admin/admin-theme';

import { styles } from './styles';

export function OverviewActivityChart({
  theme,
  points,
}: {
  theme: AdminTheme;
  points: { label: string; value: number }[];
}) {
  const maxValue = Math.max(...points.map((point) => point.value), 1);

  return (
    <AdminCard theme={theme} style={{ minHeight: 210 }}>
      <View style={styles.chartHeader}>
        <Text style={[styles.chartHint, { color: theme.mutedText }]}>آخر 7 أيام</Text>
        <View style={styles.chartTitleRow}>
          <Text style={[styles.chartTitle, { color: theme.heading }]}>نشاط المنصة</Text>
          <Ionicons name="trending-up-outline" size={18} color={theme.success} />
        </View>
      </View>
      <View style={styles.chartBody}>
        {points.map((point) => (
          <View key={point.label} style={styles.chartColumn}>
            <View style={styles.chartBarWrap}>
              <View
                style={[
                  styles.chartBar,
                  {
                    height: Math.max(18, (point.value / maxValue) * 100),
                    backgroundColor: `${theme.primary}22`,
                  },
                ]}
              >
                <View style={[styles.chartDot, { backgroundColor: theme.primary }]} />
              </View>
            </View>
            <Text style={[styles.chartLabel, { color: theme.mutedText }]}>{point.label}</Text>
          </View>
        ))}
      </View>
    </AdminCard>
  );
}
