import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  AdminBadge,
  AdminCard,
} from '@/components/admin/admin-primitives';
import { getRoleOption, toEnglishDigits } from '@/lib/admin/admin-config';
import type { AdminTheme } from '@/lib/admin/admin-theme';
import type { AdminRoleMember } from '@/types/admin';

import { styles } from './styles';

export function RoleCard({
  theme,
  item,
  onEdit,
  onDelete,
}: {
  theme: AdminTheme;
  item: AdminRoleMember;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const option = getRoleOption(item.role);

  return (
    <AdminCard theme={theme} style={{ paddingTop: 0, overflow: 'hidden' }}>
      <View style={[styles.accentBar, { backgroundColor: option.color }]} />
      <View style={styles.entityBody}>
        <View style={styles.entityRow}>
          <View style={styles.entityMain}>
            <View style={styles.userHeaderRow}>
              <AdminBadge theme={theme} label={option.label} accent={option.color} />
              <Text style={[styles.entityTitle, { color: theme.heading }]}>{item.fullName}</Text>
            </View>
            <Text style={[styles.entityMeta, { color: theme.mutedText }]}>{item.email}</Text>
          </View>

          <View style={[styles.avatarSquare, { backgroundColor: item.avatarColor }]}>
            <Text style={styles.avatarText}>{item.avatarInitial}</Text>
          </View>
        </View>

        {item.scopeName ? (
          <View style={styles.scopeWrap}>
            <View style={[styles.rolePermissionChip, { backgroundColor: `${option.color}12` }]}>
              <Text adjustsFontSizeToFit minimumFontScale={0.8} numberOfLines={1} style={[styles.rolePermissionText, { color: option.color }]}>
                {item.scopeName}
              </Text>
            </View>
          </View>
        ) : null}

        <View style={styles.permissionsWrap}>
          {item.permissions.map((permission) => (
            <View key={permission} style={[styles.rolePermissionChip, { backgroundColor: `${option.color}12` }]}>
              <Text adjustsFontSizeToFit minimumFontScale={0.8} numberOfLines={1} style={[styles.rolePermissionText, { color: option.color }]}>
                {permission}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.entityDivider, { backgroundColor: theme.border }]} />

        <View style={styles.entityFooterRow}>
          <View style={styles.footerActionRow}>
            <Pressable
              onPress={onEdit}
              style={({ pressed }) => [
                styles.actionButtonWide,
                { backgroundColor: theme.primarySoft },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="create-outline" size={17} color={theme.primary} />
              <Text style={[styles.actionTextWide, { color: theme.primary }]}>تعديل</Text>
            </Pressable>
            <Pressable
              onPress={onDelete}
              style={({ pressed }) => [
                styles.actionButtonWide,
                { backgroundColor: theme.dangerSoft },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="trash-outline" size={17} color={theme.danger} />
              <Text style={[styles.actionTextWide, { color: theme.danger }]}>إلغاء الدور</Text>
            </Pressable>
          </View>
          <Text style={[styles.roleMeta, { color: theme.mutedText }]}>
            أضافه: {item.addedBy} • {toEnglishDigits(item.addedAt)}
          </Text>
        </View>
      </View>
    </AdminCard>
  );
}
