import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AdminEditProfileTheme } from '@/lib/edit-profile/edit-profile-theme';
import type { AdminEditProfileOption } from '@/types/edit-profile';
import { FontFamily, FontSize, FontWeight } from '@/styles/ui-theme';

export function EditProfileSegmentedField({
  error,
  label,
  onChange,
  options,
  theme,
  value,
}: {
  error?: string;
  label: string;
  onChange: (nextValue: string) => void;
  options: AdminEditProfileOption<string>[];
  theme: AdminEditProfileTheme;
  value: string;
}) {
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>

      <View style={styles.optionsWrap}>
        {options.map((option) => {
          const active = option.value === value;

          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              style={(state) => {
                const hovered = (state as { hovered?: boolean }).hovered === true;

                return [
                  styles.option,
                  {
                    backgroundColor: active ? theme.primary : theme.cardBackground,
                    borderColor: active ? theme.primary : theme.fieldBorder,
                  },
                  hovered && !active && styles.hovered,
                  state.pressed && styles.pressed,
                ];
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: active ? theme.white : theme.placeholder },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error ? <Text style={[styles.error, { color: theme.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  label: {
    textAlign: 'right',
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    writingDirection: 'rtl',
  },
  optionsWrap: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    flexGrow: 1,
    minWidth: 58,
    minHeight: 50,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  optionText: {
    textAlign: 'center',
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  error: {
    minHeight: 18,
    textAlign: 'right',
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    writingDirection: 'rtl',
  },
  hovered: {
    opacity: 0.9,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
