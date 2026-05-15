import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type KeyboardTypeOptions,
  type TextInputProps,
  View,
} from 'react-native';

import {
  getAdminEditProfileFocusShadow,
  getAdminEditProfileShadow,
  type AdminEditProfileTheme,
} from '@/lib/edit-profile/edit-profile-theme';
import { FontFamily, FontSize, FontWeight } from '@/styles/ui-theme';

export function EditProfileTextField({
  autoCapitalize = 'sentences',
  error,
  icon,
  inputProps,
  keyboardType = 'default',
  label,
  maxLength,
  multiline = false,
  onChangeText,
  placeholder,
  readOnly = false,
  required = false,
  secureTextEntry = false,
  suffixIcon,
  onPressSuffix,
  theme,
  value,
}: {
  autoCapitalize?: TextInputProps['autoCapitalize'];
  error?: string;
  icon: keyof typeof Ionicons.glyphMap;
  inputProps?: Omit<TextInputProps, 'value' | 'onChangeText' | 'placeholder'>;
  keyboardType?: KeyboardTypeOptions;
  label: string;
  maxLength?: number;
  multiline?: boolean;
  onChangeText: (value: string) => void;
  placeholder: string;
  readOnly?: boolean;
  required?: boolean;
  secureTextEntry?: boolean;
  suffixIcon?: keyof typeof Ionicons.glyphMap;
  onPressSuffix?: () => void;
  theme: AdminEditProfileTheme;
  value: string;
}) {
  const inputRef = useRef<TextInput | null>(null);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      {label ? (
        <View style={styles.labelRow}>
          {required ? <Text style={[styles.required, { color: theme.danger }]}>*</Text> : null}
          <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
        </View>
      ) : null}

      <Pressable
        disabled={readOnly}
        onPress={() => inputRef.current?.focus()}
        style={(state) => {
          const hovered = (state as { hovered?: boolean }).hovered === true;

          return [
            styles.field,
            multiline && styles.fieldMultiline,
            getAdminEditProfileShadow(theme),
            {
              backgroundColor: focused
                ? theme.fieldFocus
                : hovered
                  ? theme.fieldHover
                  : theme.fieldBackground,
              borderColor: error
                ? theme.danger
                : focused
                  ? theme.fieldBorderStrong
                  : theme.fieldBorder,
            },
            focused && getAdminEditProfileFocusShadow(theme),
            state.pressed && !readOnly && styles.pressed,
          ];
        }}
      >
        <View style={[styles.iconShell, { backgroundColor: theme.iconShell }]}>
          <Ionicons color={theme.iconColor} name={icon} size={20} />
        </View>

        <TextInput
          ref={inputRef}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          editable={!readOnly}
          keyboardType={keyboardType}
          maxLength={maxLength}
          multiline={multiline}
          onBlur={() => setFocused(false)}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          placeholderTextColor={theme.placeholder}
          secureTextEntry={secureTextEntry}
          selectionColor={theme.primary}
          style={[
            styles.input,
            multiline && styles.multilineInput,
            {
              color: readOnly ? theme.text : theme.text,
            },
          ]}
          textAlign="right"
          textAlignVertical={multiline ? 'top' : 'center'}
          value={value}
          {...inputProps}
        />

        {suffixIcon ? (
          <Pressable
            onPress={onPressSuffix}
            style={({ pressed }) => [styles.suffixButton, pressed && styles.pressed]}
          >
            <Ionicons color={theme.iconColor} name={suffixIcon} size={20} />
          </Pressable>
        ) : null}
      </Pressable>

      {error ? <Text style={[styles.error, { color: theme.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
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
    gap: 14,
  },
  fieldMultiline: {
    alignItems: 'flex-start',
    paddingTop: 16,
    paddingBottom: 16,
  },
  iconShell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    minHeight: 26,
    textAlign: 'right',
    fontFamily: FontFamily.cairo,
    fontSize: 17,
    fontWeight: FontWeight.medium,
    writingDirection: 'rtl',
    paddingVertical: 0,
  },
  multilineInput: {
    minHeight: 120,
    paddingTop: 2,
  },
  suffixButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    minHeight: 18,
    textAlign: 'right',
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    writingDirection: 'rtl',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
