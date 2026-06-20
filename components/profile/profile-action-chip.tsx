import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useAppSettings } from '@/contexts/app-settings-context';
import { FontFamily, FontSize, FontWeight } from '@/styles/ui-theme';

type ProfileActionChipProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

export function ProfileActionChip({
  label,
  icon,
  onPress,
}: ProfileActionChipProps) {
  const { isRtl } = useAppSettings();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionChip,
        { flexDirection: isRtl ? 'row-reverse' : 'row' },
        pressed && styles.pressed,
      ]}
    >
      <Ionicons name={icon} size={15} color="#ffffff" />
      <Text style={styles.actionChipText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actionChip: {
    minHeight: 42,
    borderRadius: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  actionChipText: {
    color: '#ffffff',
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.bold,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
