import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

import { getAdminShadow, type AdminTheme } from '@/lib/admin/admin-theme';

import { AdminPrimaryButton } from './AdminPrimaryButton';
import { styles } from './styles';

export function AdminConfirmDialog({
  theme,
  visible,
  icon,
  accent,
  title,
  subtitle,
  subtitleColor,
  description,
  confirmLabel,
  confirmTone = 'danger',
  cancelLabel = 'إلغاء',
  onConfirm,
  onCancel,
}: {
  theme: AdminTheme;
  visible: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  title: string;
  subtitle?: string;
  subtitleColor?: string;
  description: string;
  confirmLabel: string;
  confirmTone?: 'primary' | 'danger' | 'muted';
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.confirmBackdrop}>
        <BlurView
          tint={theme.isDark ? 'dark' : 'light'}
          intensity={theme.isDark ? 62 : 46}
          experimentalBlurMethod="dimezisBlurView"
          style={StyleSheet.absoluteFill}
        />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.overlay }]} />
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <View
          style={[
            styles.confirmCard,
            {
              backgroundColor: theme.modalSurface,
              borderColor: theme.border,
            },
            getAdminShadow(theme),
          ]}
        >
          <View style={[styles.confirmIconWrap, { backgroundColor: `${accent}16` }]}>
            <Ionicons name={icon} size={30} color={accent} />
          </View>
          <Text style={[styles.confirmTitle, { color: theme.heading }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.confirmSubtitle, { color: subtitleColor ?? theme.heading }]}>{subtitle}</Text>
          ) : null}
          <Text style={[styles.confirmDescription, { color: theme.mutedText }]}>{description}</Text>
          <View style={styles.confirmActions}>
            <View style={styles.confirmButtonHalf}>
              <AdminPrimaryButton theme={theme} label={cancelLabel} tone="muted" onPress={onCancel} />
            </View>
            <View style={styles.confirmButtonHalf}>
              <AdminPrimaryButton theme={theme} label={confirmLabel} tone={confirmTone} onPress={onConfirm} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
