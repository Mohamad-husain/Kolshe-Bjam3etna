import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  Colors,
  FontFamily,
  FontSize,
  FontWeight,
  SemanticColors,
} from '@/styles/ui-theme';

type IncomingOfferCardData = {
  id: number;
  type: 'service' | 'exchange' | 'ad';
  listingTitle: string;
  from: string;
  initials: string;
  color: string;
  price?: string;
  message: string;
  time: string;
  rating: number;
  status: 'pending' | 'accepted' | 'rejected';
};

type ProfileIncomingOfferCardProps = {
  offer: IncomingOfferCardData;
  onOpenMessages: () => void;
  onRejectOffer: (offer: IncomingOfferCardData) => void;
  onAcceptOffer: (offer: IncomingOfferCardData) => void;
  isAccepting?: boolean;
  isRejecting?: boolean;
};

export function ProfileIncomingOfferCard({
  offer,
  onOpenMessages,
  onRejectOffer,
  onAcceptOffer,
  isAccepting,
  isRejecting,
}: ProfileIncomingOfferCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.referencePill}>
        <Ionicons
          name={offer.type === 'exchange' ? 'swap-horizontal-outline' : 'bag-handle-outline'}
          size={15}
          color={offer.type === 'exchange' ? SemanticColors.lightBlue : Colors.primary}
        />
        <Text style={styles.referenceText}>{offer.listingTitle}</Text>
      </View>

      <View style={styles.offerHeaderRow}>
        <View style={[styles.offerAvatar, { backgroundColor: offer.color }]}>
          <Text style={styles.offerAvatarText}>{offer.initials}</Text>
        </View>

        <View style={styles.offerIdentity}>
          <Text style={styles.offerName}>{offer.from}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color={SemanticColors.orange} />
            <Text style={styles.ratingText}>{offer.rating.toFixed(1)}</Text>
          </View>
        </View>

        <Text style={styles.offerTime}>{offer.time}</Text>
      </View>

      <Text style={styles.messageBubble}>{offer.message}</Text>

      <View style={styles.offerFooter}>
        {offer.price ? <Text style={styles.offerPrice}>{offer.price}</Text> : <View />}

        <View style={styles.offerActions}>
          <Pressable
            onPress={onOpenMessages}
            style={({ pressed }) => [styles.iconAction, styles.messageAction, pressed && styles.pressed]}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={15} color={Colors.primary} />
          </Pressable>

          <Pressable
            disabled={isAccepting || isRejecting}
            onPress={() => onRejectOffer(offer)}
            style={({ pressed }) => [
              styles.secondaryAction,
              (isAccepting || isRejecting) && styles.disabledAction,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="close-circle-outline" size={15} color={Colors.mutedForeground} />
            <Text style={styles.secondaryActionText}>{isRejecting ? 'جاري الرفض' : 'رفض'}</Text>
          </Pressable>

          <Pressable
            disabled={isAccepting || isRejecting}
            onPress={() => onAcceptOffer(offer)}
            style={({ pressed }) => [
              styles.primaryAction,
              (isAccepting || isRejecting) && styles.disabledAction,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="checkmark-circle-outline" size={15} color="#ffffff" />
            <Text style={styles.primaryActionText}>{isAccepting ? 'جاري القبول' : 'قبول'}</Text>
          </Pressable>
        </View>
      </View>
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
  ratingRow: {
    marginTop: 2,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xxs,
    fontWeight: FontWeight.semibold,
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
  offerFooter: {
    marginTop: 14,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  offerPrice: {
    color: SemanticColors.green,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  offerActions: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  iconAction: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageAction: {
    backgroundColor: 'rgba(37,99,235,0.10)',
  },
  primaryAction: {
    minHeight: 38,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    backgroundColor: SemanticColors.green,
  },
  primaryActionText: {
    color: '#ffffff',
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.bold,
  },
  secondaryAction: {
    minHeight: 38,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(120,120,128,0.08)',
  },
  secondaryActionText: {
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.semibold,
  },
  disabledAction: {
    opacity: 0.6,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
