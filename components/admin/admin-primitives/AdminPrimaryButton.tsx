import { Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { toEnglishDigits } from '@/lib/admin/admin-config';
import { getAdminShadow, type AdminTheme } from '@/lib/admin/admin-theme';

import { getHovered } from './shared';
import { styles } from './styles';

export function AdminPrimaryButton({
  theme,
  label,
  icon,
  onPress,
  disabled,
  tone = 'primary',
}: {
  theme: AdminTheme;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'primary' | 'danger' | 'muted';
}) {
  const backgroundColor =
    tone === 'danger' ? theme.danger : tone === 'muted' ? theme.neutralSoft : theme.primary;
  const textColor = tone === 'muted' ? theme.mutedText : '#ffffff';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={(state) => {
        const hovered = getHovered(state);
        return [
        styles.primaryButton,
        {
          backgroundColor: disabled ? `${backgroundColor}80` : backgroundColor,
          opacity: hovered && !disabled ? 0.94 : 1,
        },
        tone !== 'muted' && !disabled ? getAdminShadow(theme) : null,
        hovered && !disabled ? styles.hoveredLift : null,
        state.pressed && !disabled && styles.pressed,
      ];
      }}
    >
      {icon ? <Ionicons name={icon} size={20} color={textColor} /> : null}
      <Text style={[styles.primaryButtonText, { color: textColor }]}>{toEnglishDigits(label)}</Text>
    </Pressable>
  );
}
