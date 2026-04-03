import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { getAdminFocusShadow, getAdminShadow, type AdminTheme } from '@/lib/admin/admin-theme';

import { styles } from './styles';

export function AdminSearchInput({
  theme,
  value,
  onChangeText,
  placeholder,
}: {
  theme: AdminTheme;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      style={[
        styles.searchWrap,
        {
          backgroundColor: theme.cardBackground,
          borderColor: isFocused ? theme.primary : theme.border,
        },
        isFocused ? getAdminFocusShadow(theme) : getAdminShadow(theme),
      ]}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={theme.mutedText}
        style={[styles.searchInput, { color: theme.heading }]}
        selectionColor={theme.primary}
        textAlign="right"
      />
      <Ionicons name="search-outline" size={24} color={theme.mutedText} />
    </View>
  );
}
