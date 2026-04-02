import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  AdminBadge,
  AdminCard,
} from '@/components/admin/admin-primitives';
import { formatIsoDate, getOfferTypeLabel, toEnglishDigits } from '@/lib/admin/admin-config';
import type { AdminTheme } from '@/lib/admin/admin-theme';
import type { AdminOfferItem } from '@/types/admin';

import { styles } from './styles';

export function OfferCard({
  theme,
  offer,
  onEdit,
  onDelete,
}: {
  theme: AdminTheme;
  offer: AdminOfferItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const accent = offer.type === 'academy' ? theme.violet : theme.warning;

  return (
    <AdminCard theme={theme} style={{ paddingTop: 0, overflow: 'hidden' }}>
      <View style={[styles.accentBar, { backgroundColor: accent }]} />
      <View style={styles.entityBody}>
        <View style={styles.offerHeaderRow}>
          <View style={styles.offerBadges}>
            <AdminBadge theme={theme} label={`خصم %${toEnglishDigits(offer.discountPercent)}`} accent={theme.danger} />
            <AdminBadge theme={theme} label={getOfferTypeLabel(offer.type)} accent={accent} />
          </View>
          <View style={styles.offerIdentity}>
            <Text style={[styles.entityTitle, { color: theme.heading }]}>{offer.partnerName}</Text>
            <Text style={[styles.entityMeta, { color: theme.mutedText }]}>{offer.category}</Text>
          </View>
        </View>
        <View style={[styles.offerHighlight, { backgroundColor: theme.cardMuted }]}>
          <Text style={[styles.offerHeadline, { color: theme.heading }]}>{offer.title}</Text>
          <Text style={[styles.offerDescription, { color: theme.mutedText }]}>{offer.description}</Text>
        </View>
        <View style={styles.offerMetaRow}>
          <View style={styles.offerMetaDetails}>
            <Text style={[styles.offerFooterText, { color: theme.mutedText }]}>{offer.location}</Text>
            <Ionicons name="location-outline" size={16} color={theme.mutedText} />
            <Text style={[styles.offerFooterText, { color: theme.mutedText }]}>{offer.phone}</Text>
            <Ionicons name="call-outline" size={16} color={theme.mutedText} />
          </View>
          <AdminBadge theme={theme} label={`ينتهي ${formatIsoDate(offer.expireDateUtc)}`} accent={theme.danger} />
        </View>

        <View style={[styles.entityDivider, { backgroundColor: theme.border }]} />

        <View style={styles.offerBottomRow}>
          <View style={styles.offerActionRow}>
            <Pressable
              onPress={onEdit}
              style={({ pressed }) => [
                styles.smallAction,
                { backgroundColor: theme.primarySoft },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="create-outline" size={17} color={theme.primary} />
              <Text style={[styles.smallActionText, { color: theme.primary }]}>تعديل</Text>
            </Pressable>
            <Pressable
              onPress={onDelete}
              style={({ pressed }) => [
                styles.smallAction,
                { backgroundColor: theme.dangerSoft },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="trash-outline" size={17} color={theme.danger} />
              <Text style={[styles.smallActionText, { color: theme.danger }]}>حذف</Text>
            </Pressable>
          </View>
          <View style={styles.offerRatingRow}>
            <Text style={[styles.offerFooterText, { color: theme.mutedText }]}>({toEnglishDigits(offer.ratingsCount)})</Text>
            <Text style={[styles.offerFooterText, { color: theme.heading }]}>{toEnglishDigits(offer.rating.toFixed(1))}</Text>
            <Ionicons name="star" size={16} color={theme.warning} />
          </View>
        </View>
      </View>
    </AdminCard>
  );
}
