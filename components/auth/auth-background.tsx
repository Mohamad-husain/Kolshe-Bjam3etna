import { StyleSheet, View } from 'react-native';

import { Dimensions } from '@/styles/ui-theme';

export function AuthBackground() {
  return (
    <>
      <View pointerEvents="none" style={styles.topRightBubble} />
      <View pointerEvents="none" style={styles.topLeftBubble} />
      <View pointerEvents="none" style={styles.bottomLeftBubble} />
      <View pointerEvents="none" style={styles.softOverlay} />
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
