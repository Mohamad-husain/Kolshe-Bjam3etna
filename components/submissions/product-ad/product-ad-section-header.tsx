import { StyleSheet, Text, View } from 'react-native';

import { useThemePreference } from '@/contexts/theme-preference-context';
import {
  Colors,
  FontFamily,
  FontSize,
  FontWeight,
} from '@/styles/ui-theme';

import { PRODUCT_AD_ACCENT } from './shared';

type Props = {
  step: 1 | 2 | 3;
  title: string;
  subtitle: string;
};

export function ProductAdSectionHeader({ step, title, subtitle }: Props) {
  const { colors } = useThemePreference();

  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionCopy}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground }]}>{subtitle}</Text>
      </View>
      <View style={styles.sectionNumber}>
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
  sectionCopy: { alignItems: 'flex-end', flex: 1 },
  sectionTitle: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: 25,
    fontWeight: FontWeight.bold,
    textAlign: 'right',
  },
  sectionSubtitle: {
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: 12,
    fontWeight: FontWeight.medium,
    marginTop: 1,
    textAlign: 'right',
  },
  sectionNumber: {
    width: 31,
    height: 31,
    borderRadius: 15.5,
    backgroundColor: PRODUCT_AD_ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRODUCT_AD_ACCENT,
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
