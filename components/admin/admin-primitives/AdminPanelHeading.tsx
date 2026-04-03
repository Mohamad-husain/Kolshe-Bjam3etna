import { Pressable, Text, View } from 'react-native';

import type { AdminTheme } from '@/lib/admin/admin-theme';

import { styles } from './styles';

export function AdminPanelHeading({
  theme,
  title,
  subtitle,
  actionLabel,
  onActionPress,
}: {
  theme: AdminTheme;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
}) {
  return (
    <View style={styles.panelHeading}>
      {actionLabel && onActionPress ? (
        <Pressable onPress={onActionPress}>
          <Text style={[styles.panelAction, { color: theme.primary }]}>{actionLabel}</Text>
        </Pressable>
      ) : (
        <View />
      )}
      <View style={styles.panelHeadingTextWrap}>
        {subtitle ? <Text style={[styles.panelSubtitle, { color: theme.mutedText }]}>{subtitle}</Text> : null}
        <Text style={[styles.panelTitle, { color: theme.heading }]}>{title}</Text>
      </View>
    </View>
  );
}
