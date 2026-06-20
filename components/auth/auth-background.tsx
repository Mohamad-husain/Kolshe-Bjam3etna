import { StyleSheet, View } from 'react-native';

import { useThemePreference } from '@/contexts/theme-preference-context';
import { Dimensions } from '@/styles/ui-theme';

export function AuthBackground() {
  const { effectiveTheme } = useThemePreference();
  const isDark = effectiveTheme === 'dark';

  return (
    <>
      <View
        pointerEvents="none"
        style={[
          styles.topRightBubble,
          { backgroundColor: isDark ? 'rgba(96,165,250,0.16)' : 'rgba(104, 140, 245, 0.2)' },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.topLeftBubble,
          { backgroundColor: isDark ? 'rgba(96,165,250,0.08)' : 'rgba(124, 156, 251, 0.11)' },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.bottomLeftBubble,
          { backgroundColor: isDark ? 'rgba(96,165,250,0.10)' : 'rgba(108, 150, 255, 0.12)' },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.softOverlay,
          { backgroundColor: isDark ? 'rgba(11,17,32,0.78)' : 'rgba(244, 245, 250, 0.82)' },
        ]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  softOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(244, 245, 250, 0.82)',
  },
  topRightBubble: {
    position: 'absolute',
    top: -110,
    right: -90,
    width: 360,
    height: 360,
    borderRadius: Dimensions.radiusFull,
    backgroundColor: 'rgba(104, 140, 245, 0.2)',
  },
  topLeftBubble: {
    position: 'absolute',
    top: 260,
    left: -130,
    width: 250,
    height: 250,
    borderRadius: Dimensions.radiusFull,
    backgroundColor: 'rgba(124, 156, 251, 0.11)',
  },
  bottomLeftBubble: {
    position: 'absolute',
    bottom: -110,
    right: -40,
    width: 210,
    height: 210,
    borderRadius: Dimensions.radiusFull,
    backgroundColor: 'rgba(108, 150, 255, 0.12)',
  },
});
