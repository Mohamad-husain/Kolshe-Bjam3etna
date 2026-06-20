import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, Text, View, type ViewProps } from 'react-native';
import { useAppSettings } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import type { NewsItem } from '@/services/news-api';
import { FontFamily, FontSize, FontWeight, SemanticColors } from '@/styles/ui-theme';
import { HomeSectionHeader, HomeStateBlock } from './home-shared';
import { newsEmoji } from './home-utils';

type HomeNewsSectionProps = {
  tickerTitle: string;
  isLoading: boolean;
  isError: boolean;
  news: NewsItem[];
  onPressTicker: () => void;
  onPressMore: () => void;
  onPressCard: (item: NewsItem) => void;
  onLayout?: ViewProps['onLayout'];
};

export function HomeNewsSection({
  tickerTitle,
  isLoading,
  isError,
  news,
  onPressTicker,
  onPressMore,
  onPressCard,
  onLayout,
}: HomeNewsSectionProps) {
  const { t } = useAppSettings();
  const { colors } = useThemePreference();

  return (
    <View onLayout={onLayout}>
      <Pressable
        onPress={onPressTicker}
        style={({ pressed }) => [
          styles.ticker,
          { backgroundColor: colors.secondary },
          pressed && styles.pressed,
        ]}
      >
        <Ionicons name="chevron-back" size={16} color="rgba(255,149,0,0.5)" />
        <View style={styles.tickerIn}>
          <Text numberOfLines={1} style={[styles.tickerTitle, { color: colors.foreground }]}>
            {tickerTitle}
          </Text>
          <Ionicons name="megaphone-outline" size={16} color={SemanticColors.orange} />
        </View>
      </Pressable>

      <View style={styles.sec}>
        <HomeSectionHeader title={t('home.news')} icon="newspaper-outline" color={SemanticColors.green} bg="rgba(52,199,89,0.1)" onPress={onPressMore} />
        {isLoading ? (
          <HomeStateBlock color={SemanticColors.green} loading empty={t('home.noNews')} />
        ) : isError ? (
          <HomeStateBlock color={SemanticColors.green} error empty={t('home.noNews')} />
        ) : news.length === 0 ? (
          <HomeStateBlock color={SemanticColors.green} empty={t('home.noNews')} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rtlScroll} contentContainerStyle={styles.hList}>
            {news.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => onPressCard(item)}
                style={({ pressed }) => [
                  styles.card,
                  styles.newsCard,
                  styles.mirrorX,
                  styles.hCard,
                  { backgroundColor: colors.card },
                  pressed && styles.mirrorPressed,
                ]}
              >
                <View style={styles.newsTop}>
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.newsImage} contentFit="cover" contentPosition="center" />
                  ) : (
                    <Text style={styles.emoji}>{newsEmoji(item)}</Text>
                  )}
                </View>
                <View style={styles.newsBody}>
                  {item.isImportant ? (
                    <View style={styles.imp}>
                      <Text style={styles.impTxt}>{t('news.important')}</Text>
                    </View>
                  ) : null}
                  <Text numberOfLines={2} style={[styles.cardTitle, { color: colors.foreground }]}>
                    {item.title}
                  </Text>
                  <View style={styles.newsFoot}>
                    <Text style={[styles.smallMuted, { color: colors.mutedForeground }]}>{item.timeAgo}</Text>
                    <Text numberOfLines={1} style={[styles.smallStrong, { color: colors.mutedForeground }]}>
                      {item.source}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ticker: {
    minHeight: 56, borderRadius: 18, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
  },
  tickerIn: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 10, flex: 1
  },
  tickerTitle: {
    flex: 1, fontFamily: FontFamily.cairo, fontSize: FontSize.md, fontWeight: FontWeight.bold, textAlign: 'right'
  },
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
    paddingHorizontal: 6
  },
  hCard: {
    marginHorizontal: 6
  },
  card: {
    borderRadius: 24
  },
  newsCard: {
    width: 210, overflow: 'hidden'
  },
  newsTop: {
    height: 92, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 8
  },
  newsImage: {
    ...StyleSheet.absoluteFillObject
  },
  emoji: {
    fontSize: 30
  },
  newsBody: {
    paddingHorizontal: 14, paddingVertical: 14
  },
  imp: {
    alignSelf: 'flex-end', borderRadius: 8, backgroundColor: 'rgba(255,59,48,0.1)', paddingHorizontal: 6, paddingVertical: 2, marginBottom: 8
  },
  impTxt: {
    color: SemanticColors.red, fontFamily: FontFamily.cairo, fontSize: FontSize.xxs, fontWeight: FontWeight.bold
  },
  cardTitle: {
    fontFamily: FontFamily.cairo, fontSize: FontSize.md, fontWeight: FontWeight.bold, textAlign: 'right', lineHeight: 22
  },
  newsFoot: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10
  },
  smallMuted: {
    fontFamily: FontFamily.cairo, fontSize: FontSize.xxs
  },
  smallStrong: {
    fontFamily: FontFamily.cairo, fontSize: FontSize.x11, fontWeight: FontWeight.medium
  },
  pressed: {
    transform: [{ scale: 0.97 }]
  },
});
