import { Children, type PropsWithChildren } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { FontFamily, FontSize, FontWeight } from '@/styles/ui-theme';

type SettingsSectionProps = PropsWithChildren<{
  title?: string;
  style?: StyleProp<ViewStyle>;
}>;

export function SettingsSection({ title, style, children }: SettingsSectionProps) {
  const items = Children.toArray(children);

  return (
    <View style={[styles.section, style]}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <View style={styles.card}>
        {items.map((child, index) => (
          <View key={index}>
            {index > 0 ? <View style={styles.divider} /> : null}
            {child}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 22,
    paddingHorizontal: 18,
  },
  title: {
    marginBottom: 10,
    color: 'rgba(142, 142, 147, 0.92)',
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x13,
    fontWeight: FontWeight.bold,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  card: {
    overflow: 'hidden',
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.06)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
    marginRight: 16,
    backgroundColor: 'rgba(60,60,67,0.12)',
  },
});
