import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { MarketplaceCardData } from '@/types/explore';
import { Colors, FontFamily, FontSize, FontWeight, SemanticColors } from '@/styles/ui-theme';

import { HomeSectionHeader, HomeStateBlock } from './home-shared';
import { adEmoji, price } from './home-utils';

type HomeAdsSectionProps = {
  isLoading: boolean;
  isError: boolean;
  ads: MarketplaceCardData[];
  onPressMore: () => void;
  onPressCard: (item: MarketplaceCardData) => void;
};

export function HomeAdsSection({
  isLoading,
  isError,
  ads,
  onPressMore,
  onPressCard,
}: HomeAdsSectionProps) {
  return (
    <View style={styles.sec}>
      <HomeSectionHeader title="إعلانات جديدة" icon="sparkles-outline" color={SemanticColors.orange} bg="rgba(255,149,0,0.1)" onPress={onPressMore} />
      {isLoading ? (
        <HomeStateBlock color={SemanticColors.orange} loading empty="لا توجد إعلانات حالياً" />
      ) : isError ? (
        <HomeStateBlock color={SemanticColors.orange} error empty="لا توجد إعلانات حالياً" />
      ) : ads.length === 0 ? (
        <HomeStateBlock color={SemanticColors.orange} empty="لا توجد إعلانات حالياً" />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rtlScroll} contentContainerStyle={styles.hList}>
          {ads.map((item) => (
            <Pressable key={item.id} onPress={() => onPressCard(item)} style={({ pressed }) => [styles.card, styles.adCard, styles.mirrorX, styles.hCard, pressed && styles.mirrorPressed]}>
              <View style={styles.media}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.adImage} contentFit="cover" contentPosition="center" />
                ) : (
                  <Text style={styles.mediaEmoji}>{adEmoji(item)}</Text>
                )}
                <View style={styles.adPrice}>
                  <Text style={styles.adPriceTxt}>{price(item.price)}</Text>
                </View>
              </View>
              <View style={styles.adBody}>
                <Text numberOfLines={1} style={styles.cardTitle}>
                  {item.title}
                </Text>
                <View style={styles.adMeta}>
                  <Text style={styles.smallMuted}>{item.condition}</Text>
                  <Text style={styles.sep}>/</Text>
                  <Text style={styles.smallStrong}>{item.category}</Text>
                </View>
              </View>
            </Pressable>
          ))}
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
  adCard: {
    width: 170, overflow: 'hidden'
  },
  media: {
    height: 128, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(120,120,128,0.06)', overflow: 'hidden', padding: 10
  },
  adImage: {
    ...StyleSheet.absoluteFillObject
  },
  mediaEmoji: {
    fontSize: 40
  },
  adPrice: {
    position: 'absolute', top: 12, left: 12, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.86)', paddingHorizontal: 10, paddingVertical: 4
  },
  adPriceTxt: {
    color: SemanticColors.orange, fontFamily: FontFamily.cairo, fontSize: FontSize.xs, fontWeight: FontWeight.bold
  },
  adBody: {
    paddingHorizontal: 14, paddingVertical: 14
  },
  cardTitle: {
    color: Colors.foreground, fontFamily: FontFamily.cairo, fontSize: FontSize.md, fontWeight: FontWeight.bold, textAlign: 'right', lineHeight: 22
  },
  adMeta: {
    flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 6
  },
  sep: {
    color: 'rgba(142,142,147,0.36)'
  },
  smallMuted: { color: 'rgba(142,142,147,0.7)', fontFamily: FontFamily.cairo, fontSize: FontSize.xxs },
  smallStrong: {
    color: Colors.mutedForeground, fontFamily: FontFamily.cairo, fontSize: FontSize.x11, fontWeight: FontWeight.medium
  },
  pressed: {
    transform: [{ scale: 0.97 }]
  },
});
