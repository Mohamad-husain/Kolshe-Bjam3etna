import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';

import type { AdminEditProfileTheme } from '@/lib/edit-profile/edit-profile-theme';
import type { AdminEditProfileToast } from '@/types/edit-profile';
import { FontFamily, FontSize, FontWeight } from '@/styles/ui-theme';

export function EditProfileToastBanner({
  bottomInset,
  theme,
  toast,
}: {
  bottomInset: number;
  theme: AdminEditProfileTheme;
  toast: AdminEditProfileToast | null;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;
  const useNativeDriver = Platform.OS !== 'web';

  useEffect(() => {
    if (!toast) {
      return;
    }

    opacity.setValue(0);
    translateY.setValue(14);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver,
        damping: 14,
        stiffness: 160,
      }),
    ]).start();
  }, [opacity, toast, translateY, useNativeDriver]);

  if (!toast) {
    return null;
  }

  const tone =
    toast.tone === 'error'
      ? { backgroundColor: theme.danger, icon: 'alert-circle-outline' as const }
      : toast.tone === 'warning'
        ? { backgroundColor: theme.warning, icon: 'information-circle-outline' as const }
        : toast.tone === 'info'
          ? { backgroundColor: theme.primary, icon: 'information-circle-outline' as const }
          : { backgroundColor: theme.success, icon: 'checkmark-circle-outline' as const };

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          bottom: bottomInset + 16,
          opacity,
          pointerEvents: 'none' as const,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={[styles.toast, { backgroundColor: tone.backgroundColor }]}>
        <Ionicons color="#ffffff" name={tone.icon} size={24} />
        <Text style={styles.text}>{toast.message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 18,
    right: 18,
    zIndex: 80,
  },
  toast: {
    borderRadius: 24,
    minHeight: 58,
    paddingHorizontal: 18,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 22,
    elevation: 6,
  },
  text: {
    flex: 1,
    color: '#ffffff',
    textAlign: 'right',
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    writingDirection: 'rtl',
  },
});
