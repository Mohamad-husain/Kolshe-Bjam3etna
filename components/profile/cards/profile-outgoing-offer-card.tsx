import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useAppSettings } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import {
  FontFamily,
  FontSize,
  FontWeight,
  SemanticColors,
} from '@/styles/ui-theme';

type OutgoingOfferCardData = {
  id: number;
  type: 'service' | 'exchange' | 'ad';
  listingTitle: string;
  to: string;
  initials: string;
  color: string;
  price?: string;
  message: string;
  time: string;
  status: 'pending' | 'accepted' | 'rejected';
};

type ProfileOutgoingOfferCardProps = {
  offer: OutgoingOfferCardData;
};

export function ProfileOutgoingOfferCard({ offer }: ProfileOutgoingOfferCardProps) {
  const { isRtl, t } = useAppSettings();
  const { colors } = useThemePreference();
  const rowDirection = isRtl ? 'row-reverse' : 'row';
  const textAlign = isRtl ? 'right' : 'left';
  const alignItems = isRtl ? 'flex-end' : 'flex-start';

  const statusStyle =
    offer.status === 'accepted'
      ? styles.acceptedBadge
      : offer.status === 'rejected'
        ? styles.rejectedBadge
        : styles.pendingBadge;

  const statusTextStyle =
    offer.status === 'accepted'
      ? styles.acceptedBadgeText
      : offer.status === 'rejected'
        ? styles.rejectedBadgeText
        : styles.pendingBadgeText;

  const statusLabel =
    offer.status === 'accepted'
      ? t('profile.accepted')
      : offer.status === 'rejected'
        ? t('profile.rejected')
        : t('profile.pending');

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.referencePill, { backgroundColor: colors.secondary, flexDirection: rowDirection }]}>
        <Ionicons name="bag-handle-outline" size={15} color={colors.primary} />
        <Text style={[styles.referenceText, { color: colors.foreground, textAlign }]}>{offer.listingTitle}</Text>
      </View>

      <View style={[styles.offerHeaderRow, { flexDirection: rowDirection }]}>
        <View style={[styles.offerAvatar, { backgroundColor: offer.color }]}>
          <Text style={styles.offerAvatarText}>{offer.initials}</Text>
        </View>

        <View style={[styles.offerIdentity, { alignItems }]}>
          <Text style={[styles.offerName, { color: colors.foreground, textAlign }]}>{offer.to}</Text>
        </View>

        <View style={[styles.statusBadge, statusStyle]}>
          <Text style={[styles.statusBadgeText, statusTextStyle]}>{statusLabel}</Text>
        </View>
      </View>

      <Text
        style={[
          styles.messageBubble,
          { backgroundColor: colors.secondary, color: colors.mutedForeground, textAlign },
        ]}
      >
        {offer.message}
      </Text>

      {offer.price ? (
        <View style={[styles.outgoingPriceRow, { flexDirection: rowDirection }]}>
          <Text style={[styles.outgoingPrice, { color: colors.primary }]}>{offer.price}</Text>
          <Text style={[styles.offerTime, { color: colors.mutedForeground }]}>{offer.time}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 4,
  },
  referencePill: {
    minHeight: 40,
    borderRadius: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
  },
  referenceText: {
    flex: 1,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.semibold,
  },
  offerHeaderRow: {
    alignItems: 'center',
    gap: 12,
    marginTop: 14,
  },
  offerAvatar: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerAvatarText: {
    color: '#ffffff',
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  offerIdentity: {
    flex: 1,
  },
  offerName: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  offerTime: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  messageBubble: {
    marginTop: 14,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    lineHeight: 22,
  },
  statusBadge: {
    minHeight: 30,
    borderRadius: 999,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgeText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  acceptedBadge: {
    backgroundColor: 'rgba(52,199,89,0.12)',
  },
  acceptedBadgeText: {
    color: SemanticColors.green,
  },
  rejectedBadge: {
    backgroundColor: 'rgba(255,59,48,0.12)',
  },
  rejectedBadgeText: {
    color: SemanticColors.red,
  },
  pendingBadge: {
    backgroundColor: 'rgba(255,149,0,0.12)',
  },
  pendingBadgeText: {
    color: SemanticColors.orange,
  },
  outgoingPriceRow: {
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  outgoingPrice: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
});
