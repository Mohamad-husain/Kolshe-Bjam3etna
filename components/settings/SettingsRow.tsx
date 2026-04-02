import type { ReactNode } from 'react';

import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontFamily, FontSize, FontWeight } from '@/styles/ui-theme';

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
  return (
    <>
      <View style={styles.accessorySlot}>
        {accessory ? (
          accessory
        ) : interactive && showChevron ? (
          <Ionicons name="chevron-back" size={18} color="rgba(142, 142, 147, 0.7)" />
        ) : null}
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, danger && styles.titleDanger]}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>

      <View style={[styles.iconBox, { backgroundColor: iconBackgroundColor }]}>
        <Ionicons name={icon} size={18} color="#ffffff" />
      </View>
    </>
  );
}

export function SettingsRow(props: SettingsRowProps) {
  if (!props.onPress) {
    return (
      <View style={styles.row}>
        <RowBody {...props} />
      </View>
    );
  }

  return (
    <Pressable onPress={props.onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <RowBody {...props} interactive />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 74,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
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
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x17,
    fontWeight: FontWeight.bold,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  titleDanger: {
    color: Colors.destructive,
  },
  description: {
    marginTop: 2,
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    textAlign: 'right',
    writingDirection: 'rtl',
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
