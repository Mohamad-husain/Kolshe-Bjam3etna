import { Pressable, Text, View } from 'react-native';

import type { AdminTheme } from '@/lib/admin/admin-theme';

import { styles } from './styles';

export function AdminChipGroup<T extends string>({
  theme,
  value,
  onChange,
  options,
}: {
  theme: AdminTheme;
  value: T;
  onChange: (value: T) => void;
  options: readonly T[];
}) {
  return (
    <View style={styles.chipWrap}>
      {options.map((option) => {
        const active = option === value;

        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={({ pressed }) => [
              styles.chipButton,
              {
                backgroundColor: active ? theme.primary : theme.neutralSoft,
                borderColor: active ? theme.primary : theme.border,
              },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.chipText, { color: active ? '#ffffff' : theme.mutedText }]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
