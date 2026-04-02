import type { PropsWithChildren } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';

import type { AdminTheme } from '@/lib/admin/admin-theme';

import { styles } from './styles';

export function AdminBottomSheet({
  theme,
  visible,
  title,
  onClose,
  backdropStyle,
  sheetStyle,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  children,
}: PropsWithChildren<{
  theme: AdminTheme;
  visible: boolean;
  title: string;
  onClose: () => void;
  backdropStyle?: StyleProp<ViewStyle>;
  sheetStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  showsVerticalScrollIndicator?: boolean;
}>) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.modalBackdrop, backdropStyle]}>
        <BlurView
          tint={theme.isDark ? 'dark' : 'light'}
          intensity={theme.isDark ? 58 : 44}
          experimentalBlurMethod="dimezisBlurView"
          style={StyleSheet.absoluteFill}
        />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.overlay }]} />
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.modalSurface,
              borderColor: theme.border,
            },
            sheetStyle,
          ]}
        >
          <View style={[styles.sheetHandle, { backgroundColor: theme.borderStrong }]} />
          <Pressable onPress={onClose} style={styles.sheetClose}>
            <Text style={[styles.sheetCloseText, { color: theme.danger }]}>إلغاء</Text>
          </Pressable>
          <Text style={[styles.sheetTitle, { color: theme.heading }]}>{title}</Text>
          <ScrollView
            showsVerticalScrollIndicator={showsVerticalScrollIndicator}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[styles.sheetContent, contentContainerStyle]}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
