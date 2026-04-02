import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import {
  Colors,
  FontFamily,
  FontSize,
  FontWeight,
  SemanticColors,
} from '@/styles/ui-theme';

type ProfileStatCardProps = {
  label: string;
  value: string;
  highlight?: boolean;
};

export function ProfileStatCard({
  label,
  value,
  highlight,
}: ProfileStatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statValueRow}>
        {highlight ? <Ionicons name="star" size={15} color={SemanticColors.orange} /> : null}
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statCard: {
    flex: 1,
    minHeight: 82,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#f8f9fc',
  },
  statValueRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: 16,
    fontWeight: FontWeight.extrabold,
  },
  statLabel: {
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xxs,
    fontWeight: FontWeight.semibold,
  },
});
