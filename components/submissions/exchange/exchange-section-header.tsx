import { StyleSheet, Text, View } from 'react-native';

import { Colors, FontFamily, FontSize, FontWeight } from '@/styles/ui-theme';

import { EXCHANGE_ACCENT, EXCHANGE_ACCENT_DARK } from './exchange-options';

type Props = {
  step: number;
  title: string;
  subtitle: string;
};

export function ExchangeSectionHeader({ step, title, subtitle }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={styles.number}>
        <Text style={styles.numberText}>{step}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  copy: {
    alignItems: 'flex-end',
  },
  title: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: 25,
    fontWeight: FontWeight.bold,
    textAlign: 'right',
  },
  subtitle: {
    marginTop: 1,
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    textAlign: 'right',
  },
  number: {
    width: 31,
    height: 31,
    borderRadius: 15.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: EXCHANGE_ACCENT_DARK,
    shadowColor: EXCHANGE_ACCENT,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 2,
  },
  numberText: {
    color: '#ffffff',
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.extrabold,
  },
});
