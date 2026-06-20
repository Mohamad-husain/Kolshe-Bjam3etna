import { Children, type PropsWithChildren } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useAppSettings } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import { FontFamily, FontSize, FontWeight } from '@/styles/ui-theme';

type SettingsSectionProps = PropsWithChildren<{
  title?: string;
  style?: StyleProp<ViewStyle>;
}>;

export function SettingsSection({ title, style, children }: SettingsSectionProps) {
  const { colors } = useThemePreference();
  const { isRtl } = useAppSettings();
  const items = Children.toArray(children);

  return (
    <View style={[styles.section, style]}>
      {title ? (
        <Text
          style={[
            styles.title,
            {
              color: colors.mutedForeground,
              textAlign: isRtl ? 'right' : 'left',
              writingDirection: isRtl ? 'rtl' : 'ltr',
            },
          ]}
        >
          {title}
        </Text>
      ) : null}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        {items.map((child, index) => (
          <View key={index}>
            {index > 0 ? (
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            ) : null}
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
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x13,
    fontWeight: FontWeight.bold,
  },
  card: {
    overflow: 'hidden',
    borderRadius: 22,
    borderWidth: 1,
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
  },
});
