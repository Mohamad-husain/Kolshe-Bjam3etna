import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontFamily, FontSize, FontWeight } from '@/styles/ui-theme';

export type SettingsThemeValue = 'system' | 'light' | 'dark';

type SettingsThemeSelectorProps = {
  value: SettingsThemeValue;
  onChange: (value: SettingsThemeValue) => void;
};

const options: {
  value: SettingsThemeValue;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}[] = [
  {
    value: 'system',
    label: 'تلقائي',
    icon: 'phone-portrait-outline',
    iconColor: '#ffffff',
  },
  {
    value: 'light',
    label: 'فاتح',
    icon: 'sunny-outline',
    iconColor: '#ff9500',
  },
  {
    value: 'dark',
    label: 'داكن',
    icon: 'moon-outline',
    iconColor: '#0a84ff',
  },
];

export function SettingsThemeSelector({
  value,
  onChange,
}: SettingsThemeSelectorProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        {options.map((option) => {
          const selected = option.value === value;

          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              style={({ pressed }) => [
                styles.option,
                selected ? styles.optionSelected : styles.optionIdle,
                pressed && styles.pressed,
              ]}
            >
              {selected ? (
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark" size={12} color="#ffffff" />
                </View>
              ) : null}
              <Ionicons
                name={option.icon}
                size={22}
                color={selected ? '#ffffff' : option.iconColor}
              />
              <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 12,
  },
  row: {
    flexDirection: 'row-reverse',
    gap: 10,
  },
  option: {
    flex: 1,
    minHeight: 94,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  optionIdle: {
    backgroundColor: '#f1f2f6',
  },
  optionSelected: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 4,
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  optionLabel: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  optionLabelSelected: {
    color: '#ffffff',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
