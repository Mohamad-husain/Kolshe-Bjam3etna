import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import {
  Colors,
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
      ? 'مقبول'
      : offer.status === 'rejected'
        ? 'مرفوض'
        : 'قيد المراجعة';

  return (
    <View style={styles.card}>
      <View style={styles.referencePill}>
        <Ionicons name="bag-handle-outline" size={15} color={Colors.primary} />
        <Text style={styles.referenceText}>{offer.listingTitle}</Text>
      </View>

      <View style={styles.offerHeaderRow}>
        <View style={[styles.offerAvatar, { backgroundColor: offer.color }]}>
          <Text style={styles.offerAvatarText}>{offer.initials}</Text>
        </View>

        <View style={styles.offerIdentity}>
          <Text style={styles.offerName}>{offer.to}</Text>
        </View>

        <View style={[styles.statusBadge, statusStyle]}>
          <Text style={[styles.statusBadgeText, statusTextStyle]}>{statusLabel}</Text>
        </View>
      </View>

      <Text style={styles.messageBubble}>{offer.message}</Text>

      {offer.price ? (
        <View style={styles.outgoingPriceRow}>
          <Text style={styles.outgoingPrice}>{offer.price}</Text>
          <Text style={styles.offerTime}>{offer.time}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.06)',
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
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(120,120,128,0.08)',
  },
  referenceText: {
    flex: 1,
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.semibold,
    textAlign: 'right',
  },
  offerHeaderRow: {
    flexDirection: 'row-reverse',
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
    alignItems: 'flex-end',
  },
  offerName: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    textAlign: 'right',
  },
  offerTime: {
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  messageBubble: {
    marginTop: 14,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(120,120,128,0.08)',
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    lineHeight: 22,
    textAlign: 'right',
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
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  outgoingPrice: {
    color: Colors.primary,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
});
