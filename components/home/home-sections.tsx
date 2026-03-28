import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, ScrollView, Text, View, type ViewProps } from 'react-native';

import type { EventCardData } from '@/components/explore/EventCard';
import type { MarketplaceCardData } from '@/components/explore/MarketplaceCard';
import type { ServiceCardData } from '@/components/explore/ServiceCard';
import type { NewsItem } from '@/services/news-api';
import type { PartnerOffer } from '@/services/partner-offers-api';
import { Colors, SemanticColors } from '@/styles/ui-theme';

import { HomeSectionHeader, HomeStateBlock } from './home-shared';
import { styles } from './home-styles';
import { adEmoji, dateParts, newsEmoji, offerMeta, price, serviceAccent } from './home-utils';

export function HomeNewsSection({
  tickerTitle,
  isLoading,
  isError,
  news,
  onPressTicker,
  onPressMore,
  onPressCard,
  onLayout,
}: {
  tickerTitle: string;
  isLoading: boolean;
  isError: boolean;
  news: NewsItem[];
  onPressTicker: () => void;
  onPressMore: () => void;
  onPressCard: (item: NewsItem) => void;
  onLayout?: ViewProps['onLayout'];
}) {
  return (
    <View onLayout={onLayout}>
      <Pressable onPress={onPressTicker} style={({ pressed }) => [styles.ticker, pressed && styles.pressed]}>
        <Ionicons name="chevron-back" size={16} color="rgba(255,149,0,0.5)" />
        <View style={styles.tickerIn}>
          <View style={styles.tickerText}>
            <Text numberOfLines={1} style={styles.tickerTitle}>
              {tickerTitle}
            </Text>
          </View>
          <View style={styles.tickerIcon}>
            <Ionicons name="megaphone-outline" size={16} color={SemanticColors.orange} />
          </View>
        </View>
      </Pressable>

      <View style={styles.sec}>
        <HomeSectionHeader title="آخر الأخبار" icon="newspaper-outline" color={SemanticColors.green} bg="rgba(52,199,89,0.1)" onPress={onPressMore} />
        {isLoading ? (
          <HomeStateBlock color={SemanticColors.green} loading empty="لا توجد أخبار حالياً" />
        ) : isError ? (
          <HomeStateBlock color={SemanticColors.green} error empty="لا توجد أخبار حالياً" />
        ) : news.length === 0 ? (
          <HomeStateBlock color={SemanticColors.green} empty="لا توجد أخبار حالياً" />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rtlScroll} contentContainerStyle={styles.hList}>
            {news.map((item) => (
              <Pressable key={item.id} onPress={() => onPressCard(item)} style={({ pressed }) => [styles.card, styles.newsCard, styles.mirrorX, styles.hCard, pressed && styles.mirrorPressed]}>
                <View
                  style={[
                    styles.newsTop,
                    { backgroundColor: item.isImportant ? 'rgba(255,59,48,0.04)' : 'rgba(37,99,235,0.04)' },
                  ]}
                >
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.newsImage} contentFit="cover" contentPosition="center" />
                  ) : (
                    <Text style={styles.emoji}>{newsEmoji(item)}</Text>
                  )}
                </View>
                <View style={styles.newsBody}>
                  <View style={styles.newsBadgeRow}>
                    {item.isImportant ? (
                      <View style={styles.imp}>
                        <Text style={styles.impTxt}>مهم</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text numberOfLines={2} style={styles.cardTitle}>
                    {item.title}
                  </Text>
                  <View style={styles.newsFoot}>
                    <Text style={styles.smallMuted}>{item.timeAgo}</Text>
                    <Text numberOfLines={1} style={styles.smallStrong}>
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

export function HomeServicesSection({
  isLoading,
  isError,
  services,
  onPressMore,
  onPressCard,
}: {
  isLoading: boolean;
  isError: boolean;
  services: ServiceCardData[];
  onPressMore: () => void;
  onPressCard: (item: ServiceCardData) => void;
}) {
  return (
    <View style={styles.sec}>
      <HomeSectionHeader title="خدمات رائجة" icon="flame-outline" color={SemanticColors.red} bg="rgba(255,59,48,0.1)" onPress={onPressMore} />
      {isLoading ? (
        <HomeStateBlock color={SemanticColors.blue} loading empty="لا توجد خدمات حالياً" />
      ) : isError ? (
        <HomeStateBlock color={SemanticColors.blue} error empty="لا توجد خدمات حالياً" />
      ) : services.length === 0 ? (
        <HomeStateBlock color={SemanticColors.blue} empty="لا توجد خدمات حالياً" />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rtlScroll} contentContainerStyle={styles.hList}>
          {services.map((item) => {
            const accent = serviceAccent(item.category);
            return (
              <Pressable key={item.id} onPress={() => onPressCard(item)} style={({ pressed }) => [styles.card, styles.serviceCard, styles.mirrorX, styles.hCard, pressed && styles.mirrorPressed]}>
                <View style={[styles.accent, { backgroundColor: accent }]} />
                <View style={styles.rowBetween}>
                  <View style={[styles.pill, { backgroundColor: `${accent}12` }]}>
                    <Text style={[styles.pillTxt, { color: accent }]}>{price(item.pricePerHour, '/ساعة')}</Text>
                  </View>
                  <View style={styles.softPill}>
                    <Text style={styles.softPillTxt}>{item.category}</Text>
                  </View>
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text numberOfLines={2} style={styles.cardDesc}>
                  {item.description}
                </Text>
                <View style={styles.footer}>
                  {item.deadline !== 'غير محدد' ? (
                    <View style={styles.time}>
                      <Ionicons name="time-outline" size={12} color={SemanticColors.green} />
                      <Text style={styles.timeTxt}>{item.deadline}</Text>
                    </View>
                  ) : (
                    <View />
                  )}
                  <View style={styles.owner}>
                    <Text style={styles.ownerTxt}>{item.owner.name}</Text>
                    <View style={[styles.avatar, { backgroundColor: accent }]}>
                      <Text style={styles.avatarTxt}>{item.owner.initials}</Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

export function HomeAdsSection({
  isLoading,
  isError,
  ads,
  onPressMore,
  onPressCard,
}: {
  isLoading: boolean;
  isError: boolean;
  ads: MarketplaceCardData[];
  onPressMore: () => void;
  onPressCard: (item: MarketplaceCardData) => void;
}) {
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

export function HomeOffersSection({
  isLoading,
  isError,
  offers,
  onPressMore,
  onPressCard,
  onLayout,
}: {
  isLoading: boolean;
  isError: boolean;
  offers: PartnerOffer[];
  onPressMore: () => void;
  onPressCard: (item: PartnerOffer) => void;
  onLayout?: ViewProps['onLayout'];
}) {
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

export function HomeEventsSection({
  isLoading,
  isError,
  events,
  onPressMore,
  onPressCard,
}: {
  isLoading: boolean;
  isError: boolean;
  events: EventCardData[];
  onPressMore: () => void;
  onPressCard: (item: EventCardData) => void;
}) {
  return (
    <View style={[styles.sec, styles.last]}>
      <HomeSectionHeader title="فعاليات قادمة" icon="calendar-outline" color={SemanticColors.violet} bg="rgba(175,82,222,0.1)" onPress={onPressMore} />
      {isLoading ? (
        <HomeStateBlock color={SemanticColors.violet} loading empty="لا توجد فعاليات حالياً" />
      ) : isError ? (
        <HomeStateBlock color={SemanticColors.violet} error empty="لا توجد فعاليات حالياً" />
      ) : events.length === 0 ? (
        <HomeStateBlock color={SemanticColors.violet} empty="لا توجد فعاليات حالياً" />
      ) : (
        <View style={styles.vList}>
          {events.map((item, index) => {
            const d = dateParts(item.date);
            const p = item.maxCount > 0 ? Math.min(item.registeredCount / item.maxCount, 1) : 0;
            return (
              <Pressable key={item.id} onPress={() => onPressCard(item)} style={({ pressed }) => [styles.event, index > 0 && styles.vGap, pressed && styles.pressed]}>
                <View style={styles.eventDate}>
                  <View style={styles.dateBadge}>
                    <Text style={styles.dateMonth}>{d.month}</Text>
                    <Text style={styles.dateDay}>{d.day}</Text>
                  </View>
                  <View style={styles.track}>
                    <View style={[styles.fill, { width: `${p * 100}%` }]} />
                  </View>
                  <Text style={styles.count}>
                    {item.registeredCount}/{item.maxCount}
                  </Text>
                </View>
                <View style={styles.eventBody}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text numberOfLines={2} style={styles.cardDesc}>
                    {item.description}
                  </Text>
                  <View style={styles.eventMetaRow}>
                    <View style={styles.metaItem}>
                      <Text style={styles.smallStrong}>{item.time}</Text>
                      <Ionicons name="time-outline" size={12} color={Colors.mutedForeground} />
                    </View>
                    <View style={styles.metaItem}>
                      <Text numberOfLines={1} style={styles.smallStrong}>
                        {item.location}
                      </Text>
                      <Ionicons name="location-outline" size={12} color={Colors.mutedForeground} />
                    </View>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}
