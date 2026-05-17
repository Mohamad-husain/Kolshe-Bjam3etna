import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  getAdminEditProfileFocusShadow,
  getAdminEditProfileShadow,
  type AdminEditProfileTheme,
} from '@/lib/edit-profile/edit-profile-theme';
import type { AdminEditProfileOption } from '@/types/edit-profile';
import { FontFamily, FontSize, FontWeight } from '@/styles/ui-theme';

export function EditProfileSelectField<TValue extends string | number>({
  error,
  icon,
  isOpen,
  label,
  onSelect,
  onToggle,
  options,
  placeholder,
  required = false,
  selectedValue,
  theme,
}: {
  error?: string;
  icon: keyof typeof Ionicons.glyphMap;
  isOpen: boolean;
  label: string;
  onSelect: (value: TValue) => void;
  onToggle: () => void;
  options: AdminEditProfileOption<TValue>[];
  placeholder: string;
  required?: boolean;
  selectedValue: TValue | null;
  theme: AdminEditProfileTheme;
}) {
  const activeLabel = options.find((option) => option.value === selectedValue)?.label ?? '';

  return (
    <View style={[styles.wrap, isOpen && styles.openWrap]}>
      <View style={styles.labelRow}>
        {required ? <Text style={[styles.required, { color: theme.danger }]}>*</Text> : null}
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      </View>

      <Pressable
        onPress={onToggle}
        style={(state) => {
          const hovered = (state as { hovered?: boolean }).hovered === true;

          return [
            styles.field,
            getAdminEditProfileShadow(theme),
            {
              backgroundColor: isOpen
                ? theme.fieldFocus
                : hovered
                  ? theme.fieldHover
                  : theme.fieldBackground,
              borderColor: error
                ? theme.danger
                : isOpen
                  ? theme.fieldBorderStrong
                  : theme.fieldBorder,
            },
            isOpen && getAdminEditProfileFocusShadow(theme),
            state.pressed && styles.pressed,
          ];
        }}
      >
        <View style={styles.leftCluster}>
          <View style={[styles.iconShell, { backgroundColor: theme.iconShell }]}>
            <Ionicons color={theme.iconColor} name={icon} size={20} />
          </View>
          <Ionicons
            color={theme.text}
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={18}
          />
        </View>

        <Text
          numberOfLines={1}
          style={[
            styles.value,
            { color: activeLabel ? theme.text : theme.placeholder },
          ]}
        >
          {activeLabel || placeholder}
        </Text>
      </Pressable>

      {isOpen ? (
        <View
          style={[
            styles.menu,
            getAdminEditProfileShadow(theme),
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.fieldBorderStrong,
            },
          ]}
        >
          {options.map((option, index) => {
            const active = option.value === selectedValue;

            return (
              <Pressable
                key={String(option.value)}
                onPress={() => onSelect(option.value)}
                style={(state) => {
                  const hovered = (state as { hovered?: boolean }).hovered === true;

                  return [
                    styles.option,
                    {
                      backgroundColor: active ? theme.primary : theme.cardBackground,
                      borderBottomColor:
                        index === options.length - 1 ? 'transparent' : theme.fieldBorder,
                    },
                    hovered && !active && styles.hovered,
                    state.pressed && styles.pressed,
                  ];
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: active ? theme.white : theme.text },
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {error ? <Text style={[styles.error, { color: theme.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  openWrap: {
    zIndex: 50,
  },
  labelRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 4,
  },
  label: {
    textAlign: 'right',
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    writingDirection: 'rtl',
  },
  required: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
  },
  field: {
    minHeight: 74,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  leftCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconShell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    flex: 1,
    textAlign: 'right',
    fontFamily: FontFamily.cairo,
    fontSize: 17,
    fontWeight: FontWeight.medium,
    writingDirection: 'rtl',
  },
  menu: {
    marginLeft: 60,
    marginTop: 8,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  option: {
    minHeight: 56,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  optionText: {
    textAlign: 'right',
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    writingDirection: 'rtl',
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
    opacity: 0.92,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
