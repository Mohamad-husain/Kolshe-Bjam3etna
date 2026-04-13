import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { AdminTheme } from '@/lib/admin/admin-theme';

import { styles } from './styles';

export function AdminSuccessState({
  theme,
  title,
  description,
}: {
  theme: AdminTheme;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.successState}>
      <View style={[styles.successIconWrap, { backgroundColor: `${theme.success}14` }]}>
        <Ionicons name="checkmark" size={48} color={theme.success} />
      </View>
      <Text style={[styles.successTitle, { color: theme.heading }]}>{title}</Text>
      <Text style={[styles.successDescription, { color: theme.mutedText }]}>{description}</Text>
    </View>
  );
}
