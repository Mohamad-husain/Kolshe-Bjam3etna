import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { ProfileAdCard } from "@/components/profile/cards/profile-ad-card";
import { ProfileEventCard } from "@/components/profile/cards/profile-event-card";
import { ProfileExchangeCard } from "@/components/profile/cards/profile-exchange-card";
import { ProfileIncomingOfferCard } from "@/components/profile/cards/profile-incoming-offer-card";
import { ProfileOutgoingOfferCard } from "@/components/profile/cards/profile-outgoing-offer-card";
import { ProfileServiceCard } from "@/components/profile/cards/profile-service-card";
import { ProfileHero } from "@/components/profile/profile-hero";
import { ProfileLoadingBanner } from "@/components/profile/profile-loading-banner";
import { ProfileTabsBar, type ProfileTab } from "@/components/profile/profile-tabs-bar";
import { useAppSettings } from "@/contexts/app-settings-context";
import { useAuth } from "@/contexts/auth-context";
import { useThemePreference } from "@/contexts/theme-preference-context";
import {
  useAcceptOfferMutation,
  useRejectOfferMutation,
} from "@/hooks/mutations/use-profile-mutations";
import { useProfileQuery } from "@/hooks/queries/use-auth-queries";
import {
  useIncomingOffersQuery,
  useMyProductAdsQuery,
  useMyServiceRequestsQuery,
  useMySwapAdsQuery,
  useOutgoingOffersQuery,
} from '@/hooks/queries/use-profile-queries';
import {
  hasCoordinatorDashboardRole,
  hasCoreAdminRole,
} from '@/lib/auth/admin-access';
import type { IncomingOffer } from '@/services/profile-api';
import { FontFamily, FontSize, FontWeight, SemanticColors } from '@/styles/ui-theme';

type OfferView = "incoming" | "outgoing";
type ExploreTarget = "services" | "marketplace" | "exchange" | "events";

const CHAT_AVATAR_COLORS = [
  "#2563EB",
  "#22C55E",
  "#38BDF8",
  "#F59E0B",
  "#A855F7",
  "#F97316",
] as const;

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? "").trim().replace(/\/$/, "");

function getAvatarColor(seed?: string | null) {
  const value = (seed ?? "").trim();

  if (!value) {
    return CHAT_AVATAR_COLORS[0];
  }

  const index =
    value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % CHAT_AVATAR_COLORS.length;

  return CHAT_AVATAR_COLORS[index];
}

function getAvatarInitial(name?: string | null) {
  const value = (name ?? "").trim();
  return value[0]?.toUpperCase() ?? "U";
}

function getValidImageUri(value?: string | null) {
  const uri = value?.trim();

  if (!uri) {
    return null;
  }

  if (
    uri.startsWith("http://") ||
    uri.startsWith("https://") ||
    uri.startsWith("data:") ||
    uri.startsWith("file:") ||
    uri.startsWith("blob:") ||
    uri.startsWith("content:")
  ) {
    return uri;
  }

  if (!API_BASE_URL) {
    return null;
  }

  if (uri.startsWith("/")) {
    return `${API_BASE_URL}${uri}`;
  }

  return `${API_BASE_URL}/${uri.replace(/^\/+/, "")}`;
}

function normalizeProfileText(value: string | number | null | undefined) {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value).trim();
  }

  return '';
}

type RegisteredEventItem = {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  color: string;
};

const registeredEvents: RegisteredEventItem[] = [];

function SectionBanner({
  message,
  tone = "info",
}: {
  message: string;
  tone?: "info" | "error";
}) {
  const { colors } = useThemePreference();

  return (
    <View
      style={[
        styles.sectionBanner,
        { backgroundColor: colors.secondary },
        tone === "error" && styles.sectionBannerError,
      ]}
    >
      <Text
        style={[
          styles.sectionBannerText,
          { color: colors.primary },
          tone === "error" && styles.sectionBannerErrorText,
        ]}
      >
        {message}
      </Text>
    </View>
  );
}

function SectionEmptyState({
  icon,
  title,
  description,
  actionLabel,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onPress?: () => void;
}) {
  const { colors } = useThemePreference();

  return (
    <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.emptyIconWrap, { backgroundColor: colors.secondary }]}>
        <Ionicons name={icon} size={22} color={colors.mutedForeground} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.emptyDescription, { color: colors.mutedForeground }]}>{description}</Text>
      {actionLabel && onPress ? (
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [
            styles.emptyAction,
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.emptyActionText, { color: colors.primary }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function ProfileRoute() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { t } = useAppSettings();
  const { colors } = useThemePreference();
  const [activeTab, setActiveTab] = useState<ProfileTab>("offers");
  const [offersView, setOffersView] = useState<OfferView>("incoming");

  const profileQuery = useProfileQuery(!!user);
  const incomingOffersQuery = useIncomingOffersQuery(!!user);
  const outgoingOffersQuery = useOutgoingOffersQuery(
    !!user && activeTab === "offers",
  );
  const servicesQuery = useMyServiceRequestsQuery(
    !!user && activeTab === "services",
  );
  const adsQuery = useMyProductAdsQuery(!!user && activeTab === "ads");
  const swapsQuery = useMySwapAdsQuery(!!user && activeTab === "exchange");
  const acceptOfferMutation = useAcceptOfferMutation();
  const rejectOfferMutation = useRejectOfferMutation();

  const profile = profileQuery.data;
  const incomingOffers = (incomingOffersQuery.data ?? []).filter(
    (item) => item.status === 'pending',
  );
  const outgoingOffers = outgoingOffersQuery.data ?? [];
  const services = servicesQuery.data ?? [];
  const ads = adsQuery.data ?? [];
  const swaps = swapsQuery.data ?? [];

  const fullName = profile?.fullName?.trim() || user?.name || t('profile.defaultName');
  const major = profile?.major?.trim() || t('profile.defaultMajor');
  const universityName = profile?.universityName?.trim() || t('profile.defaultUniversity');
  const studyYear = normalizeProfileText(profile?.studyYear);
  const detailText = profile?.universityNumber?.trim()
    ? t('profile.universityNumber', { number: profile.universityNumber })
    : t('profile.defaultDetail');
  const profileImageUri = getValidImageUri(normalizeProfileText(profile?.profileImageUrl) || null);
  const pendingOffers = incomingOffers.length;
  const acceptingOfferId = acceptOfferMutation.isPending ? acceptOfferMutation.variables ?? null : null;
  const rejectingOfferId = rejectOfferMutation.isPending ? rejectOfferMutation.variables ?? null : null;

  const openMessages = () => {
    router.push("/(tabs)/messages");
  };

  const openExploreTab = (tab: ExploreTarget) => {
    router.push({ pathname: "/(tabs)/explore", params: { tab } });
  };
  const openCoordinator = () => {
    router.push("/coordinator");
  };
  const showIncomingOffers = () => {
    setActiveTab("offers");
    setOffersView("incoming");
  };

  const handleAcceptOffer = (offer: IncomingOffer) => {
    if (acceptOfferMutation.isPending || rejectOfferMutation.isPending) {
      return;
    }

    acceptOfferMutation.mutate(offer.id, {
      onSuccess: () => {
        Alert.alert(t("profile.acceptOfferSuccess"), `${offer.from}`, [
          { text: t("nav.messages"), onPress: openMessages },
          { text: t("common.cancel"), style: "cancel" },
        ]);
      },
      onError: (error) => {
        const message =
          error instanceof Error ? error.message : t("profile.acceptOfferError");
        Alert.alert(t("profile.acceptOfferError"), message);
      },
    });
  };

  const handleRejectOffer = (offer: IncomingOffer) => {
    if (acceptOfferMutation.isPending || rejectOfferMutation.isPending) {
      return;
    }

    rejectOfferMutation.mutate(offer.id, {
      onSuccess: () => {
        Alert.alert(t("profile.rejected"), offer.from);
      },
      onError: (error) => {
        const message =
          error instanceof Error ? error.message : t("profile.rejected");
        Alert.alert(t("profile.rejected"), message);
      },
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.primary }]} edges={["top"]}>
      <StatusBar style="light" />

      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { backgroundColor: colors.background, paddingBottom: insets.bottom + 110 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <ProfileHero
            topInset={insets.top}
            summary={{
              fullName,
              major,
              universityName,
              studyYear,
              detailText,
              profileImageUri,
              avatarInitial: getAvatarInitial(fullName),
              avatarColor: getAvatarColor(fullName),
            }}
            onOpenCoordinator={openCoordinator}
            showCoordinatorAction={hasCoordinatorDashboardRole(
              user?.roles ?? [],
            )}
            showAdminAction={hasCoreAdminRole(user?.roles ?? [])}
            onOpenAdmin={() => router.push("/admin-dashboard")}
            onOpenSettings={() => router.push("/settings")}
            onEditProfile={() =>
              router.push({ pathname: '/edit-profile', params: { tab: 'personal' } })
            }
            onOpenExploreTab={openExploreTab}
          />

          <ProfileTabsBar
            activeTab={activeTab}
            pendingOffers={pendingOffers}
            onChangeTab={setActiveTab}
          />

          {profileQuery.isLoading ? <ProfileLoadingBanner /> : null}

          {activeTab === "offers" ? (
            <View style={styles.sectionStack}>
              <View style={[styles.toggleWrap, { backgroundColor: colors.secondary }]}>
                <Pressable
                  onPress={() => setOffersView("incoming")}
                  style={({ pressed }) => [
                    styles.toggleButton,
                    offersView === "incoming" && [
                      styles.toggleButtonActive,
                      { backgroundColor: colors.card, borderColor: colors.border },
                    ],
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="mail-open-outline"
                    size={14}
                    color={
                      offersView === "incoming"
                        ? colors.foreground
                        : colors.mutedForeground
                    }
                  />
                  <Text
                    style={[
                      styles.toggleText,
                      { color: colors.mutedForeground },
                      offersView === "incoming" && styles.toggleTextActive,
                      offersView === "incoming" && { color: colors.foreground },
                    ]}
                  >
                    {t("profile.incoming")} ({incomingOffers.length})
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setOffersView("outgoing")}
                  style={({ pressed }) => [
                    styles.toggleButton,
                    offersView === "outgoing" && [
                      styles.toggleButtonActive,
                      { backgroundColor: colors.card, borderColor: colors.border },
                    ],
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="paper-plane-outline"
                    size={14}
                    color={
                      offersView === "outgoing"
                        ? colors.foreground
                        : colors.mutedForeground
                    }
                  />
                  <Text
                    style={[
                      styles.toggleText,
                      { color: colors.mutedForeground },
                      offersView === "outgoing" && styles.toggleTextActive,
                      offersView === "outgoing" && { color: colors.foreground },
                    ]}
                  >
                    {t("profile.outgoing")} ({outgoingOffers.length})
                  </Text>
                </Pressable>
              </View>

              {offersView === "incoming" ? (
                incomingOffersQuery.isLoading ? (
                  <SectionBanner message={t("profile.incomingLoading")} />
                ) : incomingOffersQuery.isError ? (
                  <SectionBanner
                    tone="error"
                    message={
                      incomingOffersQuery.error instanceof Error
                        ? incomingOffersQuery.error.message
                        : t("profile.incomingLoading")
                    }
                  />
                ) : incomingOffers.length ? (
                  incomingOffers.map((offer) => (
                    <ProfileIncomingOfferCard
                      key={offer.id}
                      offer={offer}
                      onOpenMessages={openMessages}
                      onRejectOffer={handleRejectOffer}
                      onAcceptOffer={handleAcceptOffer}
                      isAccepting={acceptingOfferId === offer.id}
                      isRejecting={rejectingOfferId === offer.id}
                    />
                  ))
                ) : (
                  <SectionEmptyState
                    icon="mail-open-outline"
                    title={t("profile.noIncomingOffers")}
                    description={t("profile.noIncomingOffersBody")}
                  />
                )
              ) : outgoingOffersQuery.isLoading ? (
                <SectionBanner message={t("profile.outgoingLoading")} />
              ) : outgoingOffersQuery.isError ? (
                <SectionBanner
                  tone="error"
                  message={
                    outgoingOffersQuery.error instanceof Error
                      ? outgoingOffersQuery.error.message
                      : t("profile.outgoingLoading")
                  }
                />
              ) : outgoingOffers.length ? (
                outgoingOffers.map((offer) => (
                  <ProfileOutgoingOfferCard key={offer.id} offer={offer} />
                ))
              ) : (
                <SectionEmptyState
                  icon="paper-plane-outline"
                  title={t("profile.noOutgoingOffers")}
                  description={t("profile.noOutgoingOffersBody")}
                />
              )}
            </View>
          ) : null}

          {activeTab === "ads" ? (
            <View style={styles.sectionStack}>
              {adsQuery.isLoading ? (
                <SectionBanner message={t("common.loading")} />
              ) : null}
              {adsQuery.isError ? (
                <SectionBanner
                  tone="error"
                  message={
                    adsQuery.error instanceof Error
                      ? adsQuery.error.message
                      : t("common.loading")
                  }
                />
              ) : null}
              {!adsQuery.isLoading && !adsQuery.isError && !ads.length ? (
                <SectionEmptyState
                  icon="bag-outline"
                  title={t("profile.noAds")}
                  description={t("profile.noAdsBody")}
                  actionLabel={t("explore.marketplace")}
                  onPress={() => openExploreTab("marketplace")}
                />
              ) : null}
              {ads.map((item) => (
                <ProfileAdCard
                  key={item.id}
                  item={item}
                  onOpenStore={() => openExploreTab("marketplace")}
                />
              ))}
              <Pressable
                onPress={() => router.push('/new-ad')}
                style={({ pressed }) => [
                  styles.addButton,
                  { backgroundColor: colors.card, borderColor: colors.primary },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.addButtonText, { color: colors.primary }]}>{t("profile.addAd")}</Text>
              </Pressable>
            </View>
          ) : null}

          {activeTab === "services" ? (
            <View style={styles.sectionStack}>
              {servicesQuery.isLoading ? (
                <SectionBanner message={t("common.loading")} />
              ) : null}
              {servicesQuery.isError ? (
                <SectionBanner
                  tone="error"
                  message={
                    servicesQuery.error instanceof Error
                      ? servicesQuery.error.message
                      : t("common.loading")
                  }
                />
              ) : null}
              {!servicesQuery.isLoading &&
              !servicesQuery.isError &&
              !services.length ? (
                <SectionEmptyState
                  icon="briefcase-outline"
                  title={t("profile.noServices")}
                  description={t("profile.noServicesBody")}
                  actionLabel={t("explore.services")}
                  onPress={() => openExploreTab("services")}
                />
              ) : null}
              {services.map((service) => (
                <ProfileServiceCard
                  key={service.id}
                  service={service}
                  onShowOffers={showIncomingOffers}
                />
              ))}
              <Pressable
                onPress={() => router.push('/new-service')}
                style={({ pressed }) => [
                  styles.addButton,
                  { backgroundColor: colors.card, borderColor: colors.primary },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.addButtonText, { color: colors.primary }]}>{t("profile.addService")}</Text>
              </Pressable>
            </View>
          ) : null}

          {activeTab === "exchange" ? (
            <View style={styles.sectionStack}>
              {swapsQuery.isLoading ? (
                <SectionBanner message={t("common.loading")} />
              ) : null}
              {swapsQuery.isError ? (
                <SectionBanner
                  tone="error"
                  message={
                    swapsQuery.error instanceof Error
                      ? swapsQuery.error.message
                      : t("common.loading")
                  }
                />
              ) : null}
              {!swapsQuery.isLoading && !swapsQuery.isError && !swaps.length ? (
                <SectionEmptyState
                  icon="swap-horizontal-outline"
                  title={t("profile.noExchanges")}
                  description={t("profile.noExchangesBody")}
                  actionLabel={t("explore.exchange")}
                  onPress={() => openExploreTab("exchange")}
                />
              ) : null}
              {swaps.map((exchange) => (
                <ProfileExchangeCard
                  key={exchange.id}
                  exchange={exchange}
                  onOpenResponses={() => openExploreTab("exchange")}
                />
              ))}
              <Pressable
                onPress={() => router.push('/new-exchange')}
                style={({ pressed }) => [
                  styles.addButton,
                  { backgroundColor: colors.card, borderColor: colors.primary },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.addButtonText, { color: colors.primary }]}>{t("profile.addExchange")}</Text>
              </Pressable>
            </View>
          ) : null}

          {activeTab === "events" ? (
            <View style={styles.sectionStack}>
              {registeredEvents.length ? (
                registeredEvents.map((event) => (
                  <ProfileEventCard
                    key={event.id}
                    event={event}
                  />
                ))
              ) : (
                <SectionEmptyState
                  icon="calendar-outline"
                  title={t("profile.noEvents")}
                  description={t("profile.noEventsBody")}
                  actionLabel={t("explore.events")}
                  onPress={() => openExploreTab("events")}
                />
              )}
            </View>
          ) : null}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
  },
  sectionStack: {
    gap: 12,
    marginTop: 16,
    paddingHorizontal: 18,
  },
  toggleWrap: {
    flexDirection: "row-reverse",
    gap: 8,
    borderRadius: 22,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 18,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  toggleButtonActive: {
    borderWidth: 1,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  toggleText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  toggleTextActive: {
  },
  sectionBanner: {
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  sectionBannerError: {
    backgroundColor: "rgba(255,59,48,0.10)",
  },
  sectionBannerText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    textAlign: "center",
  },
  sectionBannerErrorText: {
    color: SemanticColors.red,
  },
  emptyCard: {
    borderRadius: 28,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 4,
  },
  emptyIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    marginTop: 12,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    textAlign: "center",
  },
  emptyDescription: {
    marginTop: 6,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    lineHeight: 22,
    textAlign: "center",
  },
  emptyAction: {
    minHeight: 38,
    marginTop: 14,
    borderRadius: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(37,99,235,0.10)",
  },
  emptyActionText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  addButton: {
    minHeight: 54,
    borderRadius: 22,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});


