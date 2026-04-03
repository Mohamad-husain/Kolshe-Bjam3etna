import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontFamily, FontSize, FontWeight, SemanticColors } from '@/styles/ui-theme';

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
  return (
    <View style={styles.card}>
      <View style={styles.listingHeader}>
        <View style={[styles.statusBadge, item.status === 'active' ? styles.acceptedBadge : styles.soldBadge]}>
          <Text
            style={[
              styles.statusBadgeText,
              item.status === 'active' ? styles.acceptedBadgeText : styles.soldBadgeText,
            ]}
          >
            {item.status === 'active' ? 'نشط' : 'تم البيع'}
          </Text>
        </View>

        <View style={styles.listingTextWrap}>
          <Text style={styles.offerName}>{item.title}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{item.condition}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>{item.category}</Text>
          </View>
        </View>
      </View>

      <View style={styles.separator} />

      <View style={styles.priceRow}>
        <Pressable onPress={onOpenStore} style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}>
          <Text style={styles.linkButtonText}>فتح المتجر</Text>
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
  metaRow: {
    marginTop: 4,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.medium,
    textAlign: 'right',
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
    color: Colors.mutedForeground,
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
