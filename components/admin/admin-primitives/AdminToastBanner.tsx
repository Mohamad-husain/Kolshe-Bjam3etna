import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { toEnglishDigits } from '@/lib/admin/admin-config';
import type { AdminTheme } from '@/lib/admin/admin-theme';
import type { AdminToast } from '@/types/admin';

import { styles } from './styles';

export function AdminToastBanner({
  theme,
  toast,
}: {
  theme: AdminTheme;
  toast: AdminToast | null;
}) {
  if (!toast) {
    return null;
  }

  const toneStyles =
    toast.tone === 'error'
      ? { backgroundColor: theme.danger, icon: 'close-circle-outline' as const }
      : toast.tone === 'info'
        ? { backgroundColor: theme.primary, icon: 'information-circle-outline' as const }
        : toast.tone === 'warning'
          ? { backgroundColor: theme.warning, icon: 'alert-circle-outline' as const }
          : { backgroundColor: theme.success, icon: 'checkmark-circle-outline' as const };

  return (
    <View style={[styles.toast, { backgroundColor: toneStyles.backgroundColor }]}>
      <Ionicons name={toneStyles.icon} size={28} color="#ffffff" />
      <Text style={styles.toastText}>{toEnglishDigits(toast.message)}</Text>
    </View>
  );
}
