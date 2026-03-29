import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontFamily, FontSize, FontWeight, SemanticColors } from '@/styles/ui-theme';

type ProfileServiceCardData = {
  id: number;
  title: string;
  category: string;
  price: string;
  offers: number;
  status: 'active' | 'closed';
};

type ProfileServiceCardProps = {
  service: ProfileServiceCardData;
  onShowOffers: () => void;
};

export function ProfileServiceCard({ service, onShowOffers }: ProfileServiceCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.listingHeader}>
        <View style={styles.listingBadges}>
          <View style={styles.serviceOffersBadge}>
            <Text style={styles.serviceOffersBadgeText}>{service.offers} عروض</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              service.status === 'active' ? styles.acceptedBadge : styles.closedBadge,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                service.status === 'active' ? styles.acceptedBadgeText : styles.closedBadgeText,
              ]}
            >
              {service.status === 'active' ? 'نشط' : 'مغلق'}
            </Text>
          </View>
        </View>

        <View style={styles.listingTextWrap}>
          <Text style={styles.offerName}>{service.title}</Text>
          <Text style={styles.metaText}>{service.category}</Text>
        </View>
      </View>

      <View style={styles.separator} />

      <View style={styles.priceRow}>
        <Pressable
          onPress={onShowOffers}
          style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}
        >
          <Text style={styles.linkButtonText}>عرض العروض</Text>
        </Pressable>
        <Text style={styles.offerPrice}>{service.price}</Text>
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
  listingHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  listingBadges: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  serviceOffersBadge: {
    minHeight: 30,
    borderRadius: 999,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(37,99,235,0.08)',
  },
  serviceOffersBadgeText: {
    color: Colors.primary,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
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
  closedBadge: {
    backgroundColor: 'rgba(142,142,147,0.12)',
  },
  closedBadgeText: {
    color: Colors.mutedForeground,
  },
  listingTextWrap: {
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
  metaText: {
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.medium,
    textAlign: 'right',
  },
  separator: {
    height: 1,
    marginTop: 14,
    backgroundColor: 'rgba(60,60,67,0.08)',
  },
  priceRow: {
    marginTop: 12,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  linkButton: {
    minHeight: 34,
    borderRadius: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(37,99,235,0.08)',
  },
  linkButtonText: {
    color: Colors.primary,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.semibold,
  },
  offerPrice: {
    color: SemanticColors.green,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
