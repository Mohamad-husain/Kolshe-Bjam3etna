import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { HomeHero } from "@/components/home/home-hero";
import { HomeQuickAccess } from "@/components/home/home-quick-access";
import {
  HomeAdsSection,
  HomeEventsSection,
  HomeNewsSection,
  HomeOffersSection,
  HomeServicesSection,
} from "@/components/home/home-sections";
import { styles } from "@/components/home/home-styles";
import type { ExploreTab, SectionKey } from "@/components/home/home-types";
import { hasText } from "@/components/home/home-utils";
import { useAuth } from "@/contexts/auth-context";
import { useProfileQuery } from "@/hooks/queries/use-auth-queries";
import {
  useEventsQuery,
  useMarketplaceQuery,
  useServicesQuery,
} from "@/hooks/queries/use-explore-queries";
import {
  useNewsQuery,
  usePartnerOffersQuery,
} from "@/hooks/queries/use-home-queries";
import type { NewsItem } from "@/services/news-api";
import type { PartnerOffer } from "@/services/partner-offers-api";

export default function HomeRoute() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const positions = useRef<Record<SectionKey, number>>({ news: 0, offers: 0 });
  const [search, setSearch] = useState("");

  const newsQuery = useNewsQuery();
  const servicesQuery = useServicesQuery();
  const adsQuery = useMarketplaceQuery();
  const offersQuery = usePartnerOffersQuery();
  const eventsQuery = useEventsQuery();
  const profileQuery = useProfileQuery(!!user);

  const q = search.trim().toLowerCase();

  const news = useMemo(
    () =>
      (newsQuery.data ?? [])
        .filter(
          (item) =>
            !q ||
            [item.title, item.source, item.category].some((value) =>
              hasText(value, q),
            ),
        )
        .slice(0, 3),
    [newsQuery.data, q],
  );
  const services = useMemo(
    () =>
      (servicesQuery.data ?? [])
        .filter(
          (item) =>
            !q ||
            [item.title, item.description, item.category, item.owner.name].some(
              (value) => hasText(value, q),
            ),
        )
        .slice(0, 3),
    [servicesQuery.data, q],
  );
  const ads = useMemo(
    () =>
      (adsQuery.data ?? [])
        .filter(
          (item) =>
            !q ||
            [item.title, item.description, item.category, item.condition].some(
              (value) => hasText(value, q),
            ),
        )
        .slice(0, 3),
    [adsQuery.data, q],
  );
  const offers = useMemo(
    () =>
      (offersQuery.data ?? [])
        .filter(
          (item) =>
            !q ||
            [item.name, item.offerTitle, item.location ?? "", item.type].some(
              (value) => hasText(value, q),
            ),
        )
        .slice(0, 5),
    [offersQuery.data, q],
  );
  const events = useMemo(
    () =>
      (eventsQuery.data ?? [])
        .filter(
          (item) =>
            !q ||
            [item.title, item.description, item.club, item.location].some(
              (value) => hasText(value, q),
            ),
        )
        .slice(0, 2),
    [eventsQuery.data, q],
  );

  const ticker = news[0] ?? newsQuery.data?.[0] ?? null;
  const showOffers = offersQuery.isLoading || offers.length > 0;
  const universityName =
    profileQuery.data?.universityName?.trim() || "المجتمع الجامعي";
  const universityNumber = profileQuery.data?.universityNumber?.trim() || "";
  const fullName = profileQuery.data?.fullName?.trim() || user?.name || "";

  const toExplore = (tab: ExploreTab) => {
    router.push({ pathname: "/(tabs)/explore", params: { tab } });
  };

  const openNewsScreen = () => {
    router.push("/news");
  };

  const onSection = (key: SectionKey) => {
    scrollRef.current?.scrollTo({
      y: Math.max(positions.current[key] - 8, 0),
      animated: true,
    });
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
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar style="light" />
      <View style={styles.root}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 118 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <HomeHero
            universityNumber={universityNumber}
            universityName={universityName}
            fullName={fullName}
            search={search}
            onChangeSearch={setSearch}
          />

          <HomeQuickAccess
            showOffers={showOffers}
            onExplore={toExplore}
            onSection={onSection}
          />

          <View style={styles.body}>
            <HomeNewsSection
              tickerTitle={ticker?.title ?? "لا توجد أخبار جديدة حالياً"}
              isLoading={newsQuery.isLoading}
              isError={newsQuery.isError}
              news={news}
              onPressTicker={openNewsScreen}
              onPressMore={openNewsScreen}
              onPressCard={openNewsCard}
              onLayout={register("news")}
            />

            <HomeServicesSection
              isLoading={servicesQuery.isLoading}
              isError={servicesQuery.isError}
              services={services}
              onPressMore={() => toExplore("services")}
              onPressCard={() => toExplore("services")}
            />

            <HomeAdsSection
              isLoading={adsQuery.isLoading}
              isError={adsQuery.isError}
              ads={ads}
              onPressMore={() => toExplore("marketplace")}
              onPressCard={() => toExplore("marketplace")}
            />

            {showOffers ? (
              <HomeOffersSection
                isLoading={offersQuery.isLoading}
                isError={offersQuery.isError}
                offers={offers}
                onPressMore={() => onSection("offers")}
                onPressCard={openOfferCard}
                onLayout={register("offers")}
              />
            ) : null}

            <HomeEventsSection
              isLoading={eventsQuery.isLoading}
              isError={eventsQuery.isError}
              events={events}
              onPressMore={() => toExplore("events")}
              onPressCard={() => toExplore("events")}
            />
          </View>
        </ScrollView>

        <Pressable
          accessibilityLabel="المساعد الذكي"
          onPress={() => router.push("/ai-assistant")}
          style={({ pressed }) => [
            styles.fab,
            { bottom: insets.bottom + 86 },
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="sparkles-outline" size={23} color="#ffffff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
