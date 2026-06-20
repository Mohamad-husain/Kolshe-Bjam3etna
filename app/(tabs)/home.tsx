import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View, type LayoutChangeEvent, } from 'react-native';
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
import { useAppSettings } from '@/contexts/app-settings-context';
import { useAuth } from '@/contexts/auth-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import { useProfileQuery } from '@/hooks/queries/use-auth-queries';
import { useNotificationsQuery } from '@/hooks/queries/use-notification-queries';
import { subscribeHomeScrollToTop } from '@/lib/navigation-events';
import { getCachedHomeDataFromSQLite, syncHomeDataFromApiToSQLite, type HomeData, } from '@/services/home-sqlite';
import type { ServiceCardData } from '@/types/explore';
import type { NewsItem } from '@/services/news-api';
import type { PartnerOffer } from '@/services/partner-offers-api';

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

function isNotificationTypeEnabled(
  type: string,
  notifications: ReturnType<typeof useAppSettings>['notifications'],
) {
  if (!notifications.notificationsEnabled) {
    return false;
  }

  const normalized = type.toLowerCase();

  if (normalized.includes('message')) {
    return notifications.messageNotifications;
  }

  if (normalized.includes('offer')) {
    return notifications.offerNotifications;
  }

  if (normalized.includes('announcement') || normalized.includes('event') || normalized.includes('deadline')) {
    return notifications.newsNotifications;
  }

  return true;
}

export default function HomeRoute() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { colors } = useThemePreference();
  const { notifications, t } = useAppSettings();
  const scrollRef = useRef<ScrollView>(null);
  const positions = useRef<Record<SectionKey, number>>({ news: 0, offers: 0 });
  const [search, setSearch] = useState('');
  const [homeData, setHomeData] = useState<HomeData>(emptyHomeData);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoadError, setHasLoadError] = useState(false);

  const profileQuery = useProfileQuery(!!user);
  const notificationsQuery = useNotificationsQuery();

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

  useFocusEffect(
    useCallback(
      () =>
        subscribeHomeScrollToTop(() => {
          scrollRef.current?.scrollTo({ y: 0, animated: true });
        }),
      [],
    ),
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
  const universityName = profileQuery.data?.universityName?.trim() || t('home.universityFallback');
  const fullName = profileQuery.data?.fullName?.trim() || user?.name || '';
  const scrollBottomPadding = insets.bottom + 118;
  const unreadNotifications = useMemo(
    () =>
      (notificationsQuery.data?.items ?? []).filter(
        (item) =>
          !item.isRead &&
          isNotificationTypeEnabled(item.type, notifications),
      ).length,
    [notifications, notificationsQuery.data?.items],
  );

  const toExplore = (tab: ExploreTab) => {
    router.push({ pathname: '/(tabs)/explore', params: { tab } });
  };

  const openNewsScreen = () => {
    router.push('/news');
  };

  const openAiAssistant = () => router.push('/ai-assistant');
  const openNotifications = () => router.push('/notifications');
  const openSponsoredListings = () => router.push('/sponsored');
  const goToServices = () => toExplore('services');
  const goToMarketplace = () => toExplore('marketplace');
  const goToEvents = () => toExplore('events');
  const goToNewService = () => router.push('/new-service');
  const openAdCard = (item: { id: string }) => {
    router.push({ pathname: '/ad/[id]', params: { id: item.id } });
  };
  const openEventCard = (item: { id: string }) => {
    router.push({ pathname: '/event/[id]', params: { id: item.id } });
  };

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
    router.push({ pathname: '/sponsored/[id]', params: { id: item.id } });
  };

  const openServiceCard = (item: ServiceCardData) => {
    router.push({ pathname: '/service/[id]', params: { id: item.id } });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.primary }]} edges={['top']}>
      <StatusBar style="light" />
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.content,
            { backgroundColor: colors.background, paddingBottom: scrollBottomPadding },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => void loadHomeData(true)}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <HomeHero
            universityName={universityName}
            fullName={fullName}
            search={search}
            unreadNotifications={unreadNotifications}
            onChangeSearch={setSearch}
            onOpenNotifications={openNotifications}
          />

          <HomeQuickAccess
            showOffers={showOffers}
            onExplore={toExplore}
            onSection={onSection}
            onNewService={goToNewService}
          />

          <View style={styles.body}>
            <HomeNewsSection
              tickerTitle={ticker?.title ?? t('home.noLatestNews')}
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
              onPressCard={openServiceCard}
            />

            <HomeAdsSection
              isLoading={showInitialLoading}
              isError={showSectionError}
              ads={ads}
              onPressMore={goToMarketplace}
              onPressCard={openAdCard}
            />

            {showOffers ? (
              <HomeOffersSection
                isLoading={showInitialLoading}
                isError={showSectionError}
                offers={offers}
                onPressMore={openSponsoredListings}
                onPressCard={openOfferCard}
                onLayout={register('offers')}
              />
            ) : null}

            <HomeEventsSection
              isLoading={showInitialLoading}
              isError={showSectionError}
              events={events}
              onPressMore={goToEvents}
              onPressCard={openEventCard}
            />
          </View>
        </ScrollView>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="المساعد الذكي"
          onPress={openAiAssistant}
          style={({ pressed }) => [
            styles.aiButton,
            { backgroundColor: colors.primary, bottom: insets.bottom + 92 },
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="sparkles-outline" size={24} color="#ffffff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  root: { flex: 1 },
  content: {},
  body: { paddingTop: 18, paddingHorizontal: 16 },
  aiButton: {
    position: 'absolute',
    right: 18,
    width: 58,
    height: 58,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
