import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from 'react-native';
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
import {
  getCachedHomeDataFromSQLite,
  syncHomeDataFromApiToSQLite,
  type HomeData,
} from '@/services/home-sqlite';
import type { NewsItem } from '@/services/news-api';
import type { PartnerOffer } from '@/services/partner-offers-api';
import { Colors } from '@/styles/ui-theme';

const emptyHomeData: HomeData = {
  news: [],
  services: [],
  ads: [],
  offers: [],
  events: [],
  updatedAt: null,
};

function filterHomeItems<T>(items: T[] | undefined, query: string, values: (item: T) => string[], limit: number) {
  return (items ?? [])
    .filter((item) => !query || values(item).some((value) => hasText(value, query)))
    .slice(0, limit);
}

function hasAnyHomeData(data: HomeData) {
  return (
    data.news.length > 0 ||
    data.services.length > 0 ||
    data.ads.length > 0 ||
    data.offers.length > 0 ||
    data.events.length > 0
  );
}

export default function HomeRoute() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const positions = useRef<Record<SectionKey, number>>({ news: 0, offers: 0 });
  const [search, setSearch] = useState('');
  const [homeData, setHomeData] = useState<HomeData>(emptyHomeData);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoadError, setHasLoadError] = useState(false);

  const profileQuery = useProfileQuery(!!user);

  const loadHomeData = useCallback(async (refreshing = false) => {
    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setHasLoadError(false);

    try {
      // Show the latest SQLite cache first, then refresh it from the API.
      const cachedData = await getCachedHomeDataFromSQLite();
      setHomeData(cachedData);

      const syncResult = await syncHomeDataFromApiToSQLite();
      setHomeData(syncResult.data);
      setHasLoadError(syncResult.apiFailed && !hasAnyHomeData(syncResult.data));
    } catch {
      setHasLoadError(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadHomeData();
    }, [loadHomeData]),
  );

  const q = search.trim().toLowerCase();
  const hasCachedData = hasAnyHomeData(homeData);
  const showInitialLoading = isLoading && !hasCachedData;
  const showSectionError = hasLoadError && !hasCachedData;

  const news = useMemo(() => filterHomeItems(homeData.news, q, (item) => [item.title, item.source, item.category], 3), [homeData.news, q]);
  const services = useMemo(() => filterHomeItems(homeData.services, q, (item) => [item.title, item.description, item.category, item.owner.name], 3), [homeData.services, q]);
  const ads = useMemo(() => filterHomeItems(homeData.ads, q, (item) => [item.title, item.description, item.category, item.condition], 3), [homeData.ads, q]);
  const offers = useMemo(() => filterHomeItems(homeData.offers, q, (item) => [item.name, item.offerTitle, item.location ?? '', item.type], 5), [homeData.offers, q]);
  const events = useMemo(() => filterHomeItems(homeData.events, q, (item) => [item.title, item.description, item.club, item.location], 2), [homeData.events, q]);

  const ticker = news[0] ?? homeData.news[0] ?? null;
  const showOffers = showInitialLoading || offers.length > 0;
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
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => void loadHomeData(true)}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
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
              isLoading={showInitialLoading}
              isError={showSectionError}
              news={news}
              onPressTicker={openNewsScreen}
              onPressMore={openNewsScreen}
              onPressCard={openNewsCard}
              onLayout={register('news')}
            />

            <HomeServicesSection
              isLoading={showInitialLoading}
              isError={showSectionError}
              services={services}
              onPressMore={goToServices}
              onPressCard={goToServices}
            />

            <HomeAdsSection
              isLoading={showInitialLoading}
              isError={showSectionError}
              ads={ads}
              onPressMore={goToMarketplace}
              onPressCard={goToMarketplace}
            />

            {showOffers ? (
              <HomeOffersSection
                isLoading={showInitialLoading}
                isError={showSectionError}
                offers={offers}
                onPressMore={goToOffers}
                onPressCard={openOfferCard}
                onLayout={register('offers')}
              />
            ) : null}

            <HomeEventsSection
              isLoading={showInitialLoading}
              isError={showSectionError}
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
