import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  Colors,
  FontFamily,
  FontSize,
  FontWeight,
  SemanticColors,
} from '@/styles/ui-theme';

type ExchangeCardData = {
  id: number;
  title: string;
  offering: string;
  seeking: string;
  status: 'active' | 'completed';
  responses: number;
};

type ProfileExchangeCardProps = {
  exchange: ExchangeCardData;
  onOpenResponses: () => void;
};

export function ProfileExchangeCard({
  exchange,
  onOpenResponses,
}: ProfileExchangeCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.exchangeHeader}>
        <View
          style={[
            styles.statusBadge,
            exchange.status === 'active' ? styles.exchangeBadge : styles.acceptedBadge,
          ]}
        >
          <Text
            style={[
              styles.statusBadgeText,
              exchange.status === 'active' ? styles.exchangeBadgeText : styles.acceptedBadgeText,
            ]}
          >
            {exchange.status === 'active' ? 'نشط' : 'مكتمل'}
          </Text>
        </View>

        <View style={styles.exchangeIconWrap}>
          <Ionicons name="swap-horizontal-outline" size={20} color={SemanticColors.lightBlue} />
        </View>
      </View>

      <Text style={styles.exchangeTitle}>{exchange.title}</Text>

      <View style={styles.exchangeDetails}>
        <View style={styles.exchangeLine}>
          <Text style={styles.exchangeValue}>{exchange.offering}</Text>
          <Text style={styles.exchangeLabel}>أقدم:</Text>
        </View>
        <View style={styles.exchangeLine}>
          <Text style={styles.exchangeValue}>{exchange.seeking}</Text>
          <Text style={styles.exchangeLabel}>أطلب:</Text>
        </View>
      </View>

      {exchange.status === 'active' ? (
        <>
          <View style={styles.separator} />
          <View style={styles.priceRow}>
            <View style={styles.serviceOffersBadge}>
              <Text style={styles.serviceOffersBadgeText}>{exchange.responses} ردود</Text>
            </View>
            <Pressable
              onPress={onOpenResponses}
              style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}
            >
              <Text style={styles.linkButtonText}>عرض الردود</Text>
            </Pressable>
          </View>
        </>
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
  exchangeHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  exchangeBadge: {
    backgroundColor: 'rgba(90,200,250,0.14)',
  },
  exchangeBadgeText: {
    color: SemanticColors.lightBlue,
  },
  acceptedBadge: {
    backgroundColor: 'rgba(52,199,89,0.12)',
  },
  acceptedBadgeText: {
    color: SemanticColors.green,
  },
  exchangeIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(90,200,250,0.12)',
  },
  exchangeTitle: {
    marginTop: 14,
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    textAlign: 'right',
  },
  exchangeDetails: {
    marginTop: 14,
    borderRadius: 18,
    padding: 14,
    backgroundColor: 'rgba(120,120,128,0.08)',
    gap: 10,
  },
  exchangeLine: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exchangeLabel: {
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  exchangeValue: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
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
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
