import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import {
  FontFamily,
  FontSize,
  FontWeight,
  SemanticColors,
} from '@/styles/ui-theme';
import { useThemePreference } from '@/contexts/theme-preference-context';

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
  const { colors } = useThemePreference();

  return (
    <View style={[styles.statCard, { backgroundColor: colors.secondary }]}>
      <View style={styles.statValueRow}>
        {highlight ? <Ionicons name="star" size={15} color={SemanticColors.orange} /> : null}
        <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      </View>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
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
  },
  statValueRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontFamily: FontFamily.cairo,
    fontSize: 16,
    fontWeight: FontWeight.extrabold,
  },
  statLabel: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xxs,
    fontWeight: FontWeight.semibold,
  },
});
