import type { PropsWithChildren } from 'react';
import { View } from 'react-native';

import { getAdminShadow, type AdminTheme } from '@/lib/admin/admin-theme';

import { styles } from './styles';

export function AdminCard({
  theme,
  style,
  children,
}: PropsWithChildren<{ theme: AdminTheme; style?: object }>) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
        },
        getAdminShadow(theme),
        style,
      ]}
    >
      {children}
    </View>
  );
}
