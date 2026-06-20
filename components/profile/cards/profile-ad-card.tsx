import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppSettings } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import { FontFamily, FontSize, FontWeight, SemanticColors } from '@/styles/ui-theme';

type ProfileAdCardData = {
  id: number;
  title: string;
  category: string;
  price: string;
  condition: string;
  status: 'active' | 'sold';
};

type ProfileAdCardProps = {
  item: ProfileAdCardData;
  onOpenStore: () => void;
};

export function ProfileAdCard({ item, onOpenStore }: ProfileAdCardProps) {
  const { isRtl, t } = useAppSettings();
  const { colors } = useThemePreference();
  const rowDirection = isRtl ? 'row-reverse' : 'row';
  const alignItems = isRtl ? 'flex-end' : 'flex-start';
  const textAlign = isRtl ? 'right' : 'left';

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.listingHeader, { flexDirection: rowDirection }]}>
        <View style={[styles.statusBadge, item.status === 'active' ? styles.acceptedBadge : styles.soldBadge]}>
          <Text
            style={[
              styles.statusBadgeText,
              item.status === 'active' ? styles.acceptedBadgeText : styles.soldBadgeText,
              item.status !== 'active' && { color: colors.mutedForeground },
            ]}
          >
            {item.status === 'active' ? t('profile.active') : t('profile.sold')}
          </Text>
        </View>

        <View style={[styles.listingTextWrap, { alignItems }]}>
          <Text style={[styles.offerName, { color: colors.foreground, textAlign }]}>{item.title}</Text>
          <View style={[styles.metaRow, { flexDirection: rowDirection }]}>
            <Text style={[styles.metaText, { color: colors.mutedForeground, textAlign }]}>{item.condition}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={[styles.metaText, { color: colors.mutedForeground, textAlign }]}>{item.category}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.separator, { backgroundColor: colors.border }]} />

      <View style={[styles.priceRow, { flexDirection: rowDirection }]}>
        <Pressable onPress={onOpenStore} style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}>
          <Text style={[styles.linkButtonText, { color: colors.primary }]}>{t('profile.openStore')}</Text>
        </Pressable>
        <Text style={styles.adPrice}>{item.price}</Text>
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
  listingTextWrap: {
    flex: 1,
  },
  offerName: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  metaRow: {
    marginTop: 4,
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.medium,
  },
  metaDot: {
    color: 'rgba(142,142,147,0.42)',
    fontSize: FontSize.x11,
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
  soldBadge: {
    backgroundColor: 'rgba(142,142,147,0.12)',
  },
  soldBadgeText: {
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
  adPrice: {
    color: SemanticColors.orange,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
