import { Text, View } from 'react-native';

import {
  AdminBadge,
  AdminCard,
  AdminIconButton,
} from '@/components/admin/admin-primitives';
import { toEnglishDigits } from '@/lib/admin/admin-config';
import type { AdminTheme } from '@/lib/admin/admin-theme';
import type { AdminUser } from '@/types/admin';

import { styles } from './styles';

export function UserCard({
  theme,
  user,
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  theme: AdminTheme;
  user: AdminUser;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}) {
  return (
    <AdminCard theme={theme}>
      <View style={styles.userCardRow}>
        <View style={styles.userActions}>
          <AdminIconButton theme={theme} icon="create-outline" accent={theme.primary} onPress={onEdit} size={32} iconSize={15} />
          <AdminIconButton
            theme={theme}
            icon={user.status === 'active' ? 'ban-outline' : 'checkmark-circle-outline'}
            accent={user.status === 'active' ? theme.danger : theme.success}
            onPress={onToggleStatus}
            size={32}
            iconSize={15}
          />
          <AdminIconButton theme={theme} icon="trash-outline" accent={theme.danger} onPress={onDelete} size={32} iconSize={15} />
        </View>

        <View style={styles.userContent}>
          <View style={styles.userHeaderRow}>
            <AdminBadge
              theme={theme}
              label={user.status === 'active' ? 'نشط' : 'موقوف'}
              accent={user.status === 'active' ? theme.success : theme.danger}
              compact
            />
            <Text numberOfLines={1} style={[styles.userTitle, { color: theme.heading }]}>{user.fullName}</Text>
          </View>
          <Text numberOfLines={1} style={[styles.userEmail, { color: theme.mutedText }]}>{user.email}</Text>
          <View style={styles.userMetaRow}>
            <Text numberOfLines={1} style={[styles.userMetaText, styles.userPostsText, { color: theme.mutedText }]}>{toEnglishDigits(user.postsCount)} منشور</Text>
            <Text style={[styles.userMetaSeparator, { color: theme.mutedText }]}>|</Text>
            <Text numberOfLines={2} style={[styles.userMetaText, styles.userUniversityText, { color: theme.mutedText }]}>{user.universityName}</Text>
          </View>
        </View>

        <View style={[styles.avatarSquare, styles.userAvatar, { backgroundColor: user.avatarColor }]}>
          <Text style={styles.avatarText}>{user.avatarInitial}</Text>
        </View>
      </View>
    </AdminCard>
  );
}
