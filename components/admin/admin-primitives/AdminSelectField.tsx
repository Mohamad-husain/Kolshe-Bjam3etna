import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { getAdminFocusShadow, getAdminShadow, type AdminTheme } from '@/lib/admin/admin-theme';

import { styles } from './styles';

export function AdminSelectField<T extends string>({
  theme,
  label,
  value,
  options,
  onChange,
  placeholder,
  accent,
}: {
  theme: AdminTheme;
  label: string;
  value: T | null;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  placeholder?: string;
  accent?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((option) => option.value === value) ?? null;
  const activeAccent = accent ?? theme.primary;

  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: theme.mutedText }]}>{label}</Text>
      <View style={styles.selectAnchor}>
        <Pressable
          onPress={() => setIsOpen((current) => !current)}
          style={({ pressed }) => [
            styles.selectShell,
            {
              backgroundColor: isOpen ? theme.inputFocused : theme.inputBackground,
              borderColor: isOpen ? activeAccent : theme.border,
            },
            isOpen ? getAdminFocusShadow(theme) : null,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name={isOpen ? 'chevron-up-outline' : 'chevron-down-outline'} size={20} color={theme.mutedText} />
          <Text
            style={[
              styles.selectValue,
              {
                color: selected ? theme.heading : theme.mutedText,
              },
            ]}
          >
            {selected?.label ?? placeholder ?? ''}
          </Text>
        </Pressable>

        {isOpen ? (
          <View
            style={[
              styles.selectMenu,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
              },
              getAdminShadow(theme),
            ]}
          >
            {options.map((option, index) => {
              const active = option.value === value;

              return (
                <Pressable
                  key={`${option.value}`}
                  onPress={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.selectOption,
                    {
                      backgroundColor: active ? `${activeAccent}16` : 'transparent',
                      borderBottomColor: index === options.length - 1 ? 'transparent' : theme.border,
                    },
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.selectOptionText,
                      {
                        color: active ? activeAccent : theme.heading,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </View>
    </View>
  );
}
