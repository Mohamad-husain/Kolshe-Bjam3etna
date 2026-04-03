import { Pressable, StyleSheet, View } from 'react-native';

type SettingsToggleProps = {
  value: boolean;
  onValueChange: () => void;
  disabled?: boolean;
};

export function SettingsToggle({
  value,
  onValueChange,
  disabled = false,
}: SettingsToggleProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={onValueChange}
      style={({ pressed }) => [
        styles.track,
        value ? styles.trackActive : styles.trackInactive,
        disabled && styles.trackDisabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <View style={[styles.thumb, value ? styles.thumbActive : styles.thumbInactive]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 48,
    height: 28,
    borderRadius: 999,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackActive: {
    backgroundColor: '#34c759',
  },
  trackInactive: {
    backgroundColor: '#d1d5db',
  },
  trackDisabled: {
    opacity: 0.55,
  },
  thumb: {
    position: 'absolute',
    top: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 2,
  },
  thumbActive: {
    right: 2,
  },
  thumbInactive: {
    left: 2,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
