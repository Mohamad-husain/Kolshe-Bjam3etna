import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  AdminBadge,
  AdminCard,
} from '@/components/admin/admin-primitives';
import { getNewsStatusLabel, toEnglishDigits } from '@/lib/admin/admin-config';
import type { AdminTheme } from '@/lib/admin/admin-theme';
import type { AdminNewsItem } from '@/types/admin';

import { styles } from './styles';

export function NewsCard({
  theme,
  item,
  onEdit,
  onDelete,
  onPublish,
}: {
  theme: AdminTheme;
  item: AdminNewsItem;
  onEdit: () => void;
  onDelete: () => void;
  onPublish: () => void;
}) {
  return (
    <AdminCard theme={theme} style={styles.newsCard}>
      <View style={styles.newsTopRow}>
        <View style={styles.newsActionRow}>
          <Pressable
            onPress={onEdit}
            style={({ pressed }) => [
              styles.newsEditButton,
              { backgroundColor: theme.primarySoft },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="create-outline" size={16} color={theme.primary} />
            <Text style={[styles.newsEditText, { color: theme.primary }]}>تعديل</Text>
          </Pressable>
          {item.status === 'draft' ? (
            <Pressable
              onPress={onPublish}
              style={({ pressed }) => [
                styles.publishButton,
                { backgroundColor: theme.success },
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.publishButtonText}>نشر</Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={onDelete}
            style={({ pressed }) => [
              styles.newsDeleteButton,
              { backgroundColor: theme.dangerSoft },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="trash-outline" size={18} color={theme.danger} />
          </Pressable>
        </View>
        <View style={styles.newsBadgeRow}>
          <AdminBadge
            theme={theme}
            label={getNewsStatusLabel(item.status)}
            accent={item.status === 'published' ? theme.success : theme.warning}
            compact
          />
          {item.isImportant ? <AdminBadge theme={theme} label="عاجل" accent={theme.danger} compact /> : null}
        </View>
      </View>

      <Text numberOfLines={2} style={[styles.newsTitle, { color: theme.heading }]}>
        {item.title}
      </Text>
      <Text numberOfLines={2} style={[styles.newsExcerpt, { color: theme.mutedText }]}>
        {item.content}
      </Text>
      <View style={styles.newsMetaRow}>
        <View style={styles.newsMetaChip}>
          <Ionicons name="pricetag-outline" size={14} color={theme.primary} />
          <Text numberOfLines={1} style={[styles.newsMetaText, { color: theme.primary }]}>
            {item.category}
          </Text>
        </View>
        <View style={styles.newsMetaChip}>
          <Ionicons name="newspaper-outline" size={14} color={theme.mutedText} />
          <Text numberOfLines={1} style={[styles.newsMetaText, { color: theme.mutedText }]}>
            {item.source}
          </Text>
        </View>
      </View>
      <View style={styles.newsFooter}>
        <Text style={[styles.newsDate, { color: theme.mutedText }]}>
          {toEnglishDigits(item.createdAtLabel)}
        </Text>
        <View style={styles.newsViewsRow}>
          <Ionicons name="eye-outline" size={16} color={theme.mutedText} />
          <Text style={[styles.newsViewsText, { color: theme.mutedText }]}>
            {toEnglishDigits(item.viewsCount)} مشاهدة
          </Text>
        </View>
      </View>
    </AdminCard>
  );
}
