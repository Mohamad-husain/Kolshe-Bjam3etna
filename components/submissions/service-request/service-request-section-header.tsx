import { StyleSheet, Text, View } from 'react-native';

import { useThemePreference } from '@/contexts/theme-preference-context';
import {
  Colors,
  FontFamily,
  FontSize,
  FontWeight,
} from '@/styles/ui-theme';

type Props = {
  step: 1 | 2 | 3;
  title: string;
  subtitle: string;
};

export function ServiceRequestSectionHeader({ step, title, subtitle }: Props) {
  const { colors } = useThemePreference();

  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionCopy}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground }]}>{subtitle}</Text>
      </View>
      <View style={[styles.sectionNumber, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
        <Text style={styles.sectionNumberText}>{step}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
  },
  sectionCopy: { alignItems: 'flex-end' },
  sectionTitle: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: 25,
    fontWeight: FontWeight.bold,
  },
  sectionSubtitle: {
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: 12,
    fontWeight: FontWeight.medium,
    marginTop: 1,
  },
  sectionNumber: {
    width: 31,
    height: 31,
    borderRadius: 15.5,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 2,
  },
  sectionNumberText: {
    color: '#ffffff',
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.extrabold,
  },
});
