import type { ReactNode } from 'react';

import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppSettings } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import { FontFamily, FontSize, FontWeight } from '@/styles/ui-theme';

type SettingsRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  iconBackgroundColor: string;
  title: string;
  description?: string;
  accessory?: ReactNode;
  onPress?: () => void;
  danger?: boolean;
  showChevron?: boolean;
};

function RowBody({
  icon,
  iconBackgroundColor,
  title,
  description,
  accessory,
  danger = false,
  showChevron = true,
  interactive = false,
}: SettingsRowProps & { interactive?: boolean }) {
  const { colors } = useThemePreference();
  const { isRtl } = useAppSettings();

  return (
    <>
      <View style={styles.accessorySlot}>
        {accessory ? (
          accessory
        ) : interactive && showChevron ? (
          <Ionicons
            name={isRtl ? 'chevron-back' : 'chevron-forward'}
            size={18}
            color={colors.mutedForeground}
          />
        ) : null}
      </View>

      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            {
              color: danger ? colors.destructive : colors.foreground,
              textAlign: isRtl ? 'right' : 'left',
              writingDirection: isRtl ? 'rtl' : 'ltr',
            },
          ]}
        >
          {title}
        </Text>
        {description ? (
          <Text
            style={[
              styles.description,
              {
                color: colors.mutedForeground,
                textAlign: isRtl ? 'right' : 'left',
                writingDirection: isRtl ? 'rtl' : 'ltr',
              },
            ]}
          >
            {description}
          </Text>
        ) : null}
      </View>

      <View style={[styles.iconBox, { backgroundColor: iconBackgroundColor }]}>
        <Ionicons name={icon} size={18} color="#ffffff" />
      </View>
    </>
  );
}

export function SettingsRow(props: SettingsRowProps) {
  const { isRtl } = useAppSettings();

  if (!props.onPress) {
    return (
      <View style={[styles.row, { flexDirection: isRtl ? 'row' : 'row-reverse' }]}>
        <RowBody {...props} />
      </View>
    );
  }

  return (
    <Pressable
      onPress={props.onPress}
      style={({ pressed }) => [
        styles.row,
        { flexDirection: isRtl ? 'row' : 'row-reverse' },
        pressed && styles.pressed,
      ]}
    >
      <RowBody {...props} interactive />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 74,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  accessorySlot: {
    width: 54,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginHorizontal: 12,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x17,
    fontWeight: FontWeight.bold,
  },
  description: {
    marginTop: 2,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  pressed: {
    backgroundColor: 'rgba(37,99,235,0.04)',
  },
});
