import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppSettings } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import { FontFamily, FontSize, FontWeight, SemanticColors } from '@/styles/ui-theme';

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
  const { isRtl, t } = useAppSettings();
  const { colors } = useThemePreference();
  const rowDirection = isRtl ? 'row-reverse' : 'row';
  const alignItems = isRtl ? 'flex-end' : 'flex-start';
  const textAlign = isRtl ? 'right' : 'left';

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.listingHeader, { flexDirection: rowDirection }]}>
        <View style={[styles.listingBadges, { flexDirection: rowDirection }]}>
          <View style={styles.serviceOffersBadge}>
            <Text style={[styles.serviceOffersBadgeText, { color: colors.primary }]}>
              {t('profile.offersCount', { count: service.offers })}
            </Text>
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
                service.status !== 'active' && { color: colors.mutedForeground },
              ]}
            >
              {service.status === 'active' ? t('profile.active') : t('profile.closed')}
            </Text>
          </View>
        </View>

        <View style={[styles.listingTextWrap, { alignItems }]}>
          <Text style={[styles.offerName, { color: colors.foreground, textAlign }]}>{service.title}</Text>
          <Text style={[styles.metaText, { color: colors.mutedForeground, textAlign }]}>{service.category}</Text>
        </View>
      </View>

      <View style={[styles.separator, { backgroundColor: colors.border }]} />

      <View style={[styles.priceRow, { flexDirection: rowDirection }]}>
        <Pressable
          onPress={onShowOffers}
          style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}
        >
          <Text style={[styles.linkButtonText, { color: colors.primary }]}>{t('profile.showOffers')}</Text>
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
    borderWidth: 1,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 4,
  },
  listingHeader: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  listingBadges: {
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
  },
  listingTextWrap: {
    flex: 1,
  },
  offerName: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  metaText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.medium,
  },
  separator: {
    height: 1,
    marginTop: 14,
  },
  priceRow: {
    marginTop: 12,
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
