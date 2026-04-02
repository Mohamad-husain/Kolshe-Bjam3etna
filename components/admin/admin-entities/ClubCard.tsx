import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AdminCard } from '@/components/admin/admin-primitives';
import { formatIsoDate, getClubStatusLabel, getSubscriptionLabel } from '@/lib/admin/admin-config';
import type { AdminTheme } from '@/lib/admin/admin-theme';
import type { AdminClubItem } from '@/types/admin';

import { styles } from './styles';

export function ClubCard({
  theme,
  club,
  onEdit,
  onDelete,
  onRenew,
}: {
  theme: AdminTheme;
  club: AdminClubItem;
  onEdit: () => void;
  onDelete: () => void;
  onRenew: () => void;
}) {
  const accent =
    club.status === 'expired'
      ? theme.danger
      : club.status === 'expiring'
        ? theme.warning
        : theme.success;
  const statusIcon =
    club.status === 'expired'
      ? 'close-circle-outline'
      : club.status === 'expiring'
        ? 'alert-circle-outline'
        : 'checkmark-circle-outline';

  return (
    <AdminCard theme={theme} style={{ paddingTop: 0, overflow: 'hidden' }}>
      <View style={[styles.accentBar, { backgroundColor: accent }]} />
      <View style={styles.entityBody}>
        <View style={styles.clubTopRow}>
          <View style={[styles.clubStatusPill, { backgroundColor: `${accent}16` }]}>
            <Ionicons name={statusIcon} size={16} color={accent} />
            <Text style={[styles.clubStatusText, { color: accent }]}>{getClubStatusLabel(club.status)}</Text>
          </View>
          <View style={styles.clubIdentityWrap}>
            <Text style={[styles.entityTitle, { color: theme.heading }]}>{club.name}</Text>
            <Text style={[styles.entityMeta, { color: theme.mutedText }]}>{club.universityName}</Text>
          </View>
          <View style={[styles.avatarSquare, { backgroundColor: club.avatarColor }]}>
            <Text style={styles.avatarText}>{club.avatarInitial}</Text>
          </View>
        </View>

        <View style={styles.clubInfoGrid}>
          <View style={[styles.clubInfoBox, { backgroundColor: theme.cardMuted }]}>
            <Text style={[styles.clubInfoLabel, { color: theme.mutedText }]}>الخطة</Text>
            <Text style={[styles.clubInfoValue, { color: theme.heading }]}>{getSubscriptionLabel(club.subscriptionType)}</Text>
            <Text style={[styles.clubInfoHint, { color: theme.primary }]}>{club.priceLabel}</Text>
          </View>
          <View style={[styles.clubInfoBox, { backgroundColor: theme.cardMuted }]}>
            <Text style={[styles.clubInfoLabel, { color: theme.mutedText }]}>انتهاء الاشتراك</Text>
            <Text style={[styles.clubInfoValue, { color: theme.heading }]}>{formatIsoDate(club.expiresAt)}</Text>
            <Text style={[styles.clubInfoHint, { color: theme.mutedText }]}>بدأ: {formatIsoDate(club.startedAt)}</Text>
          </View>
        </View>

        <View style={styles.clubFooter}>
          <View style={styles.clubManagerRow}>
            <Text style={[styles.clubManagerText, { color: theme.mutedText }]}>{club.managerName}</Text>
            <Text style={[styles.clubMetaDot, { color: theme.mutedText }]}>•</Text>
            <Text style={[styles.clubManagerText, { color: theme.mutedText }]}>{club.managerEmail}</Text>
            <Ionicons name="mail-outline" size={16} color={theme.mutedText} />
          </View>

          <View style={[styles.entityDivider, { backgroundColor: theme.border }]} />

          <View style={styles.clubFooterActions}>
            <View style={styles.clubActionGroup}>
              <Pressable
                onPress={onDelete}
                style={({ pressed }) => [
                  styles.clubActionButton,
                  { backgroundColor: theme.dangerSoft },
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="trash-outline" size={16} color={theme.danger} />
                <Text style={[styles.clubActionText, { color: theme.danger }]}>حذف</Text>
              </Pressable>
              <Pressable
                onPress={onEdit}
                style={({ pressed }) => [
                  styles.clubActionButton,
                  { backgroundColor: theme.primarySoft },
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="create-outline" size={16} color={theme.primary} />
                <Text style={[styles.clubActionText, { color: theme.primary }]}>تعديل</Text>
              </Pressable>
            </View>

            <Pressable
              onPress={onRenew}
              style={({ pressed }) => [
                styles.clubRenewButton,
                { backgroundColor: theme.primarySoft },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="refresh-outline" size={16} color={theme.primary} />
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.78}
                style={[styles.renewButtonText, { color: theme.primary }]}
              >
                تجديد الاشتراك
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </AdminCard>
  );
}
