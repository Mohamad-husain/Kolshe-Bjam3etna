import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View, type ViewProps } from 'react-native';
import type { PartnerOffer } from '@/services/partner-offers-api';
import { Colors, FontFamily, FontSize, FontWeight, SemanticColors } from '@/styles/ui-theme';
import { HomeSectionHeader, HomeStateBlock } from './home-shared';
import { offerMeta } from './home-utils';

type HomeOffersSectionProps = {
  isLoading: boolean;
  isError: boolean;
  offers: PartnerOffer[];
  onPressMore: () => void;
  onPressCard: (item: PartnerOffer) => void;
  onLayout?: ViewProps['onLayout'];
};

export function HomeOffersSection({
  isLoading,
  isError,
  offers,
  onPressMore,
  onPressCard,
  onLayout,
}: HomeOffersSectionProps) {
  return (
    <View style={styles.sec} onLayout={onLayout}>
      <HomeSectionHeader title="عروض وخصومات" icon="megaphone-outline" color={SemanticColors.violet} bg="rgba(175,82,222,0.1)" onPress={onPressMore} />
      {isLoading ? (
        <HomeStateBlock color={SemanticColors.violet} loading empty="لا توجد عروض حالياً" />
      ) : isError ? (
        <HomeStateBlock color={SemanticColors.violet} error empty="لا توجد عروض حالياً" />
      ) : offers.length === 0 ? (
        <HomeStateBlock color={SemanticColors.violet} empty="لا توجد عروض حالياً" />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rtlScroll} contentContainerStyle={styles.hList}>
          {offers.map((item) => {
            const meta = offerMeta(item.type);
            return (
              <Pressable key={item.id} onPress={() => onPressCard(item)} style={({ pressed }) => [styles.card, styles.offerCard, styles.mirrorX, styles.hCard, pressed && styles.mirrorPressed]}>
                <View style={[styles.offerTopBar, { backgroundColor: meta.color }]} />
                <View style={styles.offerBody}>
                  <View style={styles.rowBetween}>
                    <View>
                      {item.discount ? (
                        <View style={styles.discount}>
                          <Ionicons name="pricetag-outline" size={10} color={SemanticColors.red} />
                          <Text style={styles.discountTxt}>{item.discount}%</Text>
                        </View>
                      ) : null}
                    </View>
                    <View style={[styles.offerType, { backgroundColor: meta.bg }]}>
                      <Text style={[styles.offerTypeTxt, { color: meta.color }]}>{meta.label}</Text>
                      <Ionicons name={meta.icon} size={12} color={meta.color} />
                    </View>
                  </View>
                  <Text numberOfLines={1} style={styles.offerName}>
                    {item.name}
                  </Text>
                  <Text numberOfLines={2} style={[styles.offerTitle, { color: meta.color }]}>
                    {item.offerTitle}
                  </Text>
                  {item.expiryDate || item.location ? (
                    <View style={styles.offerFoot}>
                      <Text style={styles.offerFootTxt}>{item.expiryDate ? `ينتهي ${item.expiryDate}` : item.location}</Text>
                      <Ionicons name={item.expiryDate ? 'time-outline' : 'location-outline'} size={10} color="rgba(60,60,67,0.45)" />
                    </View>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const cardShadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.06,
  shadowRadius: 12,
  elevation: 4,
} as const;

const styles = StyleSheet.create({
  sec: {
    paddingTop: 20
  },
  rtlScroll: {
    transform: [{ scaleX: -1 }]
  },
  mirrorX: {
    transform: [{ scaleX: -1 }]
  },
  mirrorPressed: {
    transform: [{ scaleX: -1 }, { scale: 0.97 }]
  },
  hList: {
    paddingBottom: 2, paddingHorizontal: 6
  },
  hCard: {
    marginHorizontal: 6
  },
  card: {
    borderRadius: 24, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, ...cardShadow
  },
  offerCard: {
    width: 224, overflow: 'hidden'
  },
  offerTopBar: {
    height: 6
  },
  offerBody: {
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16
  },
  rowBetween: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
  },
  discount: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 2, borderRadius: 10, backgroundColor: 'rgba(255,59,48,0.1)', paddingHorizontal: 8, paddingVertical: 4
  },
  discountTxt: {
    color: SemanticColors.red, fontFamily: FontFamily.cairo, fontSize: FontSize.xs, fontWeight: FontWeight.bold
  },
  offerType: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 4, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6
  },
  offerTypeTxt: {
    fontFamily: FontFamily.cairo, fontSize: FontSize.xs, fontWeight: FontWeight.bold
  },
  offerName: {
    marginTop: 12, color: Colors.foreground, fontFamily: FontFamily.cairo, fontSize: FontSize.md, fontWeight: FontWeight.extrabold, textAlign: 'right'
  },
  offerTitle: {
    marginTop: 4, fontFamily: FontFamily.cairo, fontSize: FontSize.sm, fontWeight: FontWeight.semibold, lineHeight: 20, textAlign: 'right'
  },
  offerFoot: {
    marginTop: 12, flexDirection: 'row-reverse', alignItems: 'center', gap: 4, justifyContent: 'flex-end'
  },
  offerFootTxt: {
    color: 'rgba(60,60,67,0.62)', fontFamily: FontFamily.cairo, fontSize: FontSize.xxs, fontWeight: FontWeight.semibold
  },
  pressed: {
    transform: [{ scale: 0.97 }]
  },
});
