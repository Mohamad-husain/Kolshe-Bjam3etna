import { type PropsWithChildren, useState } from 'react';
import {
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type TextInputProps,
} from 'react-native';

import { getAdminFocusShadow, type AdminTheme } from '@/lib/admin/admin-theme';

import { styles } from './styles';

export function AdminTextField({
  theme,
  label,
  error,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  readOnly,
  children,
  ...props
}: PropsWithChildren<{
  theme: AdminTheme;
  label: string;
  error?: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  readOnly?: boolean;
} & Omit<TextInputProps, 'value' | 'onChangeText'>>) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: error ? theme.danger : theme.mutedText }]}>{label}</Text>
      <View
        style={[
          styles.fieldShell,
          {
            backgroundColor: readOnly
              ? theme.cardMuted
              : isFocused
                ? theme.inputFocused
                : theme.inputBackground,
            borderColor: error ? theme.danger : isFocused ? theme.primary : theme.border,
            minHeight: multiline ? 132 : 58,
          },
          error ? getAdminFocusShadow({ ...theme, primary: theme.danger }) : isFocused ? getAdminFocusShadow(theme) : null,
        ]}
      >
        {children}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={(event) => {
            setIsFocused(true);
            props.onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            props.onBlur?.(event);
          }}
          placeholder={placeholder}
          placeholderTextColor={theme.mutedText}
          keyboardType={keyboardType}
          multiline={multiline}
          editable={!readOnly}
          selectionColor={theme.primary}
          style={[
            styles.fieldInput,
            {
              color: theme.heading,
              minHeight: multiline ? 112 : 32,
              textAlignVertical: multiline ? 'top' : 'center',
            },
          ]}
          textAlign="right"
          {...props}
        />
      </View>
      {error ? <Text style={[styles.fieldError, { color: theme.danger }]}>{error}</Text> : null}
    </View>
  );
}
