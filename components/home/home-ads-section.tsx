import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppSettings } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import type { MarketplaceCardData } from '@/types/explore';
import { FontFamily, FontSize, FontWeight, SemanticColors } from '@/styles/ui-theme';
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
  const { t } = useAppSettings();
  const { colors } = useThemePreference();

  return (
    <View style={styles.sec}>
      <HomeSectionHeader title={t('home.ads')} icon="sparkles-outline" color={SemanticColors.orange} bg="rgba(255,149,0,0.1)" onPress={onPressMore} />
      {isLoading ? (
        <HomeStateBlock color={SemanticColors.orange} loading empty={t('home.noAds')} />
      ) : isError ? (
        <HomeStateBlock color={SemanticColors.orange} error empty={t('home.noAds')} />
      ) : ads.length === 0 ? (
        <HomeStateBlock color={SemanticColors.orange} empty={t('home.noAds')} />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rtlScroll} contentContainerStyle={styles.hList}>
          {ads.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => onPressCard(item)}
              style={({ pressed }) => [
                styles.card,
                styles.adCard,
                styles.mirrorX,
                styles.hCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && styles.mirrorPressed,
              ]}
            >
              <View style={[styles.media, { backgroundColor: colors.secondary }]}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.adImage} contentFit="cover" contentPosition="center" />
                ) : (
                  <Text style={styles.mediaEmoji}>{adEmoji(item)}</Text>
                )}
                <View style={[styles.adPrice, { backgroundColor: colors.card }]}>
                  <Text style={styles.adPriceTxt}>{price(item.price)}</Text>
                </View>
              </View>
              <View style={styles.adBody}>
                <Text numberOfLines={1} style={[styles.cardTitle, { color: colors.foreground }]}>
                  {item.title}
                </Text>
                <View style={styles.adMeta}>
                  <Text style={[styles.smallMuted, { color: colors.mutedForeground }]}>{item.condition}</Text>
                  <Text style={styles.sep}>/</Text>
                  <Text style={[styles.smallStrong, { color: colors.mutedForeground }]}>{item.category}</Text>
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
    borderRadius: 24, borderWidth: 1, ...cardShadow
  },
  adCard: {
    width: 170, overflow: 'hidden'
  },
  media: {
    height: 128, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 10
  },
  adImage: {
    ...StyleSheet.absoluteFillObject
  },
  mediaEmoji: {
    fontSize: 40
  },
  adPrice: {
    position: 'absolute', top: 12, left: 12, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4
  },
  adPriceTxt: {
    color: SemanticColors.orange, fontFamily: FontFamily.cairo, fontSize: FontSize.xs, fontWeight: FontWeight.bold
  },
  adBody: {
    paddingHorizontal: 14, paddingVertical: 14
  },
  cardTitle: {
    fontFamily: FontFamily.cairo, fontSize: FontSize.md, fontWeight: FontWeight.bold, textAlign: 'right', lineHeight: 22
  },
  adMeta: {
    flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 6
  },
  sep: {
    color: 'rgba(142,142,147,0.36)'
  },
  smallMuted: { fontFamily: FontFamily.cairo, fontSize: FontSize.xxs },
  smallStrong: {
    fontFamily: FontFamily.cairo, fontSize: FontSize.x11, fontWeight: FontWeight.medium
  },
  pressed: {
    transform: [{ scale: 0.97 }]
  },
});
