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
  const { isRtl, t } = useAppSettings();
  const { colors } = useThemePreference();
  const rowDirection = isRtl ? 'row-reverse' : 'row';
  const textAlign = isRtl ? 'right' : 'left';

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.exchangeHeader, { flexDirection: rowDirection }]}>
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
            {exchange.status === 'active' ? t('profile.active') : t('profile.completed')}
          </Text>
        </View>

        <View style={styles.exchangeIconWrap}>
          <Ionicons name="swap-horizontal-outline" size={20} color={SemanticColors.lightBlue} />
        </View>
      </View>

      <Text style={[styles.exchangeTitle, { color: colors.foreground, textAlign }]}>{exchange.title}</Text>

      <View style={[styles.exchangeDetails, { backgroundColor: colors.secondary }]}>
        <View style={[styles.exchangeLine, { flexDirection: rowDirection }]}>
          <Text style={[styles.exchangeValue, { color: colors.foreground, textAlign }]}>{exchange.offering}</Text>
          <Text style={[styles.exchangeLabel, { color: colors.mutedForeground }]}>{t('profile.offering')}</Text>
        </View>
        <View style={[styles.exchangeLine, { flexDirection: rowDirection }]}>
          <Text style={[styles.exchangeValue, { color: colors.foreground, textAlign }]}>{exchange.seeking}</Text>
          <Text style={[styles.exchangeLabel, { color: colors.mutedForeground }]}>{t('profile.seeking')}</Text>
        </View>
      </View>

      {exchange.status === 'active' ? (
        <>
          <View style={[styles.separator, { backgroundColor: colors.border }]} />
          <View style={[styles.priceRow, { flexDirection: rowDirection }]}>
            <View style={styles.serviceOffersBadge}>
              <Text style={[styles.serviceOffersBadgeText, { color: colors.primary }]}>
                {t('profile.responsesCount', { count: exchange.responses })}
              </Text>
            </View>
            <Pressable
              onPress={onOpenResponses}
              style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}
            >
              <Text style={[styles.linkButtonText, { color: colors.primary }]}>{t('profile.showResponses')}</Text>
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
    borderWidth: 1,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 4,
  },
  exchangeHeader: {
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
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  exchangeDetails: {
    marginTop: 14,
    borderRadius: 18,
    padding: 14,
    gap: 10,
  },
  exchangeLine: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exchangeLabel: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  exchangeValue: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
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
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
