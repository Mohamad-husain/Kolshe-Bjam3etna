import { Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { AdminTheme } from '@/lib/admin/admin-theme';

import { AdminCard } from './AdminCard';
import { styles } from './styles';

export function AdminSwitchRow({
  theme,
  title,
  subtitle,
  value,
  onValueChange,
  accent,
}: {
  theme: AdminTheme;
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  accent: string;
}) {
  return (
    <AdminCard theme={theme} style={styles.switchCard}>
      <Switch
        value={value}
        onValueChange={onValueChange}
        thumbColor="#ffffff"
        trackColor={{ false: theme.neutralSoft, true: accent }}
      />
      <View style={styles.switchTextWrap}>
        <Text style={[styles.switchTitle, { color: theme.heading }]}>{title}</Text>
        <Text style={[styles.switchSubtitle, { color: theme.mutedText }]}>{subtitle}</Text>
      </View>
      <View style={[styles.switchIconWrap, { backgroundColor: `${accent}14` }]}>
        <Ionicons name="alert-circle-outline" size={22} color={accent} />
      </View>
    </AdminCard>
  );
}
