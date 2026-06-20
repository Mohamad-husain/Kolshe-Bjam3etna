import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppSettings } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import {
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
  const { isRtl, t } = useAppSettings();
  const { colors } = useThemePreference();
  const rowDirection = isRtl ? 'row-reverse' : 'row';
  const textAlign = isRtl ? 'right' : 'left';
  const alignItems = isRtl ? 'flex-end' : 'flex-start';

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.referencePill, { backgroundColor: colors.secondary, flexDirection: rowDirection }]}>
        <Ionicons
          name={offer.type === 'exchange' ? 'swap-horizontal-outline' : 'bag-handle-outline'}
          size={15}
          color={offer.type === 'exchange' ? SemanticColors.lightBlue : colors.primary}
        />
        <Text style={[styles.referenceText, { color: colors.foreground, textAlign }]}>{offer.listingTitle}</Text>
      </View>

      <View style={[styles.offerHeaderRow, { flexDirection: rowDirection }]}>
        <View style={[styles.offerAvatar, { backgroundColor: offer.color }]}>
          <Text style={styles.offerAvatarText}>{offer.initials}</Text>
        </View>

        <View style={[styles.offerIdentity, { alignItems }]}>
          <Text style={[styles.offerName, { color: colors.foreground, textAlign }]}>{offer.from}</Text>
          <View style={[styles.ratingRow, { flexDirection: rowDirection }]}>
            <Ionicons name="star" size={12} color={SemanticColors.orange} />
            <Text style={[styles.ratingText, { color: colors.mutedForeground }]}>{offer.rating.toFixed(1)}</Text>
          </View>
        </View>

        <Text style={[styles.offerTime, { color: colors.mutedForeground }]}>{offer.time}</Text>
      </View>

      <Text
        style={[
          styles.messageBubble,
          { backgroundColor: colors.secondary, color: colors.mutedForeground, textAlign },
        ]}
      >
        {offer.message}
      </Text>

      <View style={[styles.offerFooter, { flexDirection: rowDirection }]}>
        {offer.price ? <Text style={styles.offerPrice}>{offer.price}</Text> : <View />}

        <View style={[styles.offerActions, { flexDirection: rowDirection }]}>
          <Pressable
            onPress={onOpenMessages}
            style={({ pressed }) => [styles.iconAction, styles.messageAction, pressed && styles.pressed]}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={15} color={colors.primary} />
          </Pressable>

          <Pressable
            disabled={isAccepting || isRejecting}
            onPress={() => onRejectOffer(offer)}
            style={({ pressed }) => [
              styles.secondaryAction,
              { flexDirection: rowDirection },
              (isAccepting || isRejecting) && styles.disabledAction,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="close-circle-outline" size={15} color={colors.mutedForeground} />
            <Text style={[styles.secondaryActionText, { color: colors.mutedForeground }]}>
              {isRejecting ? t('profile.rejecting') : t('profile.reject')}
            </Text>
          </Pressable>

          <Pressable
            disabled={isAccepting || isRejecting}
            onPress={() => onAcceptOffer(offer)}
            style={({ pressed }) => [
              styles.primaryAction,
              { flexDirection: rowDirection },
              (isAccepting || isRejecting) && styles.disabledAction,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="checkmark-circle-outline" size={15} color="#ffffff" />
            <Text style={styles.primaryActionText}>
              {isAccepting ? t('profile.accepting') : t('profile.accept')}
            </Text>
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
  ratingRow: {
    marginTop: 2,
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xxs,
    fontWeight: FontWeight.semibold,
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
  offerFooter: {
    marginTop: 14,
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
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(120,120,128,0.08)',
  },
  secondaryActionText: {
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
