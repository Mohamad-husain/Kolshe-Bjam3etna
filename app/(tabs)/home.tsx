import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeAdsSection } from '@/components/home/home-ads-section';
import { HomeEventsSection } from '@/components/home/home-events-section';
import { HomeHero } from '@/components/home/home-hero';
import { HomeNewsSection } from '@/components/home/home-news-section';
import { HomeOffersSection } from '@/components/home/home-offers-section';
import { HomeQuickAccess } from '@/components/home/home-quick-access';
import { HomeServicesSection } from '@/components/home/home-services-section';
import type { ExploreTab, SectionKey } from '@/components/home/home-types';
import { hasText } from '@/components/home/home-utils';
import { useAuth } from '@/contexts/auth-context';
import { useProfileQuery } from '@/hooks/queries/use-auth-queries';
import { useEventsQuery, useMarketplaceQuery, useServicesQuery } from '@/hooks/queries/use-explore-queries';
import { useNewsQuery, usePartnerOffersQuery } from '@/hooks/queries/use-home-queries';
import type { NewsItem } from '@/services/news-api';
import type { PartnerOffer } from '@/services/partner-offers-api';
import { Colors } from '@/styles/ui-theme';

function filterHomeItems<T>(items: T[] | undefined, query: string, values: (item: T) => string[], limit: number) {
  return (items ?? [])
    .filter((item) => !query || values(item).some((value) => hasText(value, query)))
    .slice(0, limit);
}

export default function HomeRoute() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const positions = useRef<Record<SectionKey, number>>({ news: 0, offers: 0 });
  const [search, setSearch] = useState('');

  const newsQuery = useNewsQuery();
  const servicesQuery = useServicesQuery();
  const adsQuery = useMarketplaceQuery();
  const offersQuery = usePartnerOffersQuery();
  const eventsQuery = useEventsQuery();
  const profileQuery = useProfileQuery(!!user);

  const q = search.trim().toLowerCase();

  const news = useMemo(() => filterHomeItems(newsQuery.data, q, (item) => [item.title, item.source, item.category], 3), [newsQuery.data, q]);
  const services = useMemo(() => filterHomeItems(servicesQuery.data, q, (item) => [item.title, item.description, item.category, item.owner.name], 3), [servicesQuery.data, q]);
  const ads = useMemo(() => filterHomeItems(adsQuery.data, q, (item) => [item.title, item.description, item.category, item.condition], 3), [adsQuery.data, q]);
  const offers = useMemo(() => filterHomeItems(offersQuery.data, q, (item) => [item.name, item.offerTitle, item.location ?? '', item.type], 5), [offersQuery.data, q]);
  const events = useMemo(() => filterHomeItems(eventsQuery.data, q, (item) => [item.title, item.description, item.club, item.location], 2), [eventsQuery.data, q]);

  const ticker = news[0] ?? newsQuery.data?.[0] ?? null;
  const showOffers = offersQuery.isLoading || offers.length > 0;
  const universityName = profileQuery.data?.universityName?.trim() || 'المجتمع الجامعي';
  const universityNumber = profileQuery.data?.universityNumber?.trim() || '';
  const fullName = profileQuery.data?.fullName?.trim() || user?.name || '';
  const scrollBottomPadding = insets.bottom + 118;
  const fabBottom = insets.bottom + 86;

  const toExplore = (tab: ExploreTab) => {
    router.push({ pathname: '/(tabs)/explore', params: { tab } });
  };

  const openNewsScreen = () => {
    router.push('/news');
  };

  const goToOffers = () => onSection('offers');
  const goToServices = () => toExplore('services');
  const goToMarketplace = () => toExplore('marketplace');
  const goToEvents = () => toExplore('events');

  const onSection = (key: SectionKey) => {
    scrollRef.current?.scrollTo({ y: Math.max(positions.current[key] - 8, 0), animated: true });
  };

  const register = (key: SectionKey) => (event: LayoutChangeEvent) => {
    positions.current[key] = event.nativeEvent.layout.y;
  };

  const openNewsCard = (_item: NewsItem) => {
    openNewsScreen();
  };

  const openOfferCard = (item: PartnerOffer) => {
    Alert.alert(item.name, item.offerTitle);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="light" />
      <View style={styles.root}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.content, { paddingBottom: scrollBottomPadding }]}
          showsVerticalScrollIndicator={false}
        >
          <HomeHero
            universityNumber={universityNumber}
            universityName={universityName}
            fullName={fullName}
            search={search}
            onChangeSearch={setSearch}
          />

          <HomeQuickAccess showOffers={showOffers} onExplore={toExplore} onSection={onSection} />

          <View style={styles.body}>
            <HomeNewsSection
              tickerTitle={ticker?.title ?? 'لا توجد أخبار جديدة حالياً'}
              isLoading={newsQuery.isLoading}
              isError={newsQuery.isError}
              news={news}
              onPressTicker={openNewsScreen}
              onPressMore={openNewsScreen}
              onPressCard={openNewsCard}
              onLayout={register('news')}
            />

            <HomeServicesSection
              isLoading={servicesQuery.isLoading}
              isError={servicesQuery.isError}
              services={services}
              onPressMore={goToServices}
              onPressCard={goToServices}
            />

            <HomeAdsSection
              isLoading={adsQuery.isLoading}
              isError={adsQuery.isError}
              ads={ads}
              onPressMore={goToMarketplace}
              onPressCard={goToMarketplace}
            />

            {showOffers ? (
              <HomeOffersSection
                isLoading={offersQuery.isLoading}
                isError={offersQuery.isError}
                offers={offers}
                onPressMore={goToOffers}
                onPressCard={openOfferCard}
                onLayout={register('offers')}
              />
            ) : null}

            <HomeEventsSection
              isLoading={eventsQuery.isLoading}
              isError={eventsQuery.isError}
              events={events}
              onPressMore={goToEvents}
              onPressCard={goToEvents}
            />
          </View>
        </ScrollView>

        <Pressable
          accessibilityLabel="المساعد الذكي"
          onPress={() => router.push('/ai-assistant')}
          style={({ pressed }) => [styles.fab, { bottom: fabBottom }, pressed && styles.pressed]}
        >
          <Ionicons name="sparkles-outline" size={23} color="#ffffff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  root: { flex: 1, backgroundColor: Colors.background },
  content: { backgroundColor: Colors.background },
  body: { paddingTop: 18, paddingHorizontal: 16 },
  fab: {
    position: 'absolute',
    left: 20,
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a84ff',
    shadowColor: '#0a84ff',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 8,
  },
  pressed: { transform: [{ scale: 0.97 }] },
});
