import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { getAdminShadow, type AdminTheme } from '@/lib/admin/admin-theme';

import { styles } from './styles';

export function AdminSegmentedOptions<T extends string>({
  theme,
  value,
  options,
  onChange,
  columns = 2,
}: {
  theme: AdminTheme;
  value: T;
  options: { value: T; label: string; accent?: string; icon?: keyof typeof Ionicons.glyphMap }[];
  onChange: (value: T) => void;
  columns?: 1 | 2;
}) {
  const itemWidth = columns === 2 ? '47.2%' : '100%';

  return (
    <View style={[styles.segmentedWrap, { gap: 10 }]}>
      {options.map((option) => {
        const active = option.value === value;
        const accent = option.accent ?? theme.primary;

        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.segmentOption,
              {
                width: itemWidth,
                maxWidth: itemWidth,
                flexBasis: itemWidth,
                backgroundColor: active ? `${accent}14` : theme.trackBackground,
                borderColor: active ? accent : theme.border,
              },
              active ? getAdminShadow(theme) : null,
              pressed && styles.pressed,
            ]}
          >
            {option.icon ? <Ionicons name={option.icon} size={18} color={active ? accent : theme.mutedText} /> : null}
            <Text style={[styles.segmentText, { color: active ? accent : theme.mutedText }]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
