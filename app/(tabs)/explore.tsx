import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EventsTab } from "@/components/explore/EventsTab";
import { ExchangeTab } from "@/components/explore/ExchangeTab";
import { MarketplaceTab } from "@/components/explore/MarketplaceTab";
import { ServicesTab } from "@/components/explore/ServicesTab";
import { useAppSettings, type TranslationKey } from "@/contexts/app-settings-context";
import { useThemePreference } from "@/contexts/theme-preference-context";
import {
  Dimensions,
  FontFamily,
  FontSize,
  FontWeight,
  SemanticColors,
  Spacing,
} from "@/styles/ui-theme";

type TabId = "services" | "marketplace" | "exchange" | "events";

type Tab = {
  id: TabId;
  labelKey: TranslationKey;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

const TABS: Tab[] = [
  {
    id: "services",
    labelKey: "explore.services",
    icon: "briefcase-outline",
    color: SemanticColors.blue,
  },
  {
    id: "marketplace",
    labelKey: "explore.marketplace",
    icon: "bag-outline",
    color: SemanticColors.orange,
  },
  {
    id: "exchange",
    labelKey: "explore.exchange",
    icon: "swap-horizontal-outline",
    color: SemanticColors.lightBlue,
  },
  {
    id: "events",
    labelKey: "explore.events",
    icon: "calendar-outline",
    color: SemanticColors.violet,
  },
];

function parseTabParam(value?: string | string[]): TabId | null {
  const nextValue = Array.isArray(value) ? value[0] : value;

  if (
    nextValue === "services" ||
    nextValue === "marketplace" ||
    nextValue === "exchange" ||
    nextValue === "events"
  ) {
    return nextValue;
  }

  return null;
}

export default function ExploreRoute() {
  const params = useLocalSearchParams<{ tab?: string | string[] }>();
  const { t, isRtl } = useAppSettings();
  const { colors } = useThemePreference();
  const [activeTab, setActiveTab] = useState<TabId>(
    () => parseTabParam(params.tab) ?? "services",
  );
  const [showFilter, setShowFilter] = useState(false);
  const currentTab = TABS.find((tab) => tab.id === activeTab) ?? TABS[0];
  const bubblePalette = {
    top: `${currentTab.color}0A`,
    middle: `${currentTab.color}0D`,
    bottom: `${currentTab.color}14`,
  };

  useEffect(() => {
    const requestedTab = parseTabParam(params.tab);

    if (requestedTab) {
      setActiveTab(requestedTab);
      setShowFilter(false);
    }
  }, [params.tab]);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setShowFilter(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.mobileShell}>
        <View
          style={[
            styles.topRightBubble,
            { backgroundColor: bubblePalette.top },
          ]}
        />
        <View
          style={[
            styles.topLeftBubble,
            { backgroundColor: bubblePalette.middle },
          ]}
        />
        <View
          style={[
            styles.bottomLeftBubble,
            { backgroundColor: bubblePalette.bottom },
          ]}
        />

        <View style={[styles.header, { flexDirection: isRtl ? "row-reverse" : "row" }]}>
          <Text style={[styles.title, { color: colors.foreground }]}>{t("explore.title")}</Text>

          <Pressable
            style={({ pressed }) => [
              styles.filterButton,
              { backgroundColor: colors.card, borderColor: colors.border },
              showFilter && {
                backgroundColor: colors.primary,
                borderColor: colors.primary,
              },
              pressed && styles.pressed,
            ]}
            onPress={() => setShowFilter((prev) => !prev)}
          >
            <Text style={[styles.filterText, { color: showFilter ? "#fff" : colors.foreground }]}>
              {t("explore.filter")}
            </Text>
            <Ionicons
              name="options-outline"
              size={16}
              color={showFilter ? "#fff" : colors.foreground}
            />
          </Pressable>
        </View>

        <View
          style={[
            styles.tabBar,
            { borderBottomColor: colors.border, flexDirection: isRtl ? "row-reverse" : "row" },
          ]}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <Pressable
                key={tab.id}
                onPress={() => handleTabChange(tab.id)}
                style={({ pressed }) => [
                  styles.tabItem,
                  pressed && styles.tabPressed,
                ]}
              >
                <Ionicons
                  name={tab.icon}
                  size={18}
                  color={isActive ? tab.color : colors.mutedForeground}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    { color: isActive ? tab.color : colors.mutedForeground },
                    isActive && { fontWeight: FontWeight.bold },
                  ]}
                >
                  {t(tab.labelKey)}
                </Text>
                {isActive ? (
                  <View
                    style={[
                      styles.activeIndicator,
                      { backgroundColor: tab.color },
                    ]}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.content}>
          {activeTab === "services" ? (
            <ServicesTab showFilter={showFilter} />
          ) : null}
          {activeTab === "marketplace" ? (
            <MarketplaceTab showFilter={showFilter} />
          ) : null}
          {activeTab === "exchange" ? (
            <ExchangeTab showFilter={showFilter} />
          ) : null}
          {activeTab === "events" ? (
            <EventsTab showFilter={showFilter} />
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mobileShell: {
    flex: 1,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
  },
  header: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    position: "relative",
  },
  headerSide: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.sm,
    minWidth: 72,
  },
  title: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    fontFamily: FontFamily.cairo,
  },
  trendingBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Dimensions.radiusFull,
  },
  trendingText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    fontFamily: FontFamily.cairo,
  },
  filterButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Dimensions.radiusFull,
    borderWidth: StyleSheet.hairlineWidth,
  },
  filterText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.cairo,
    fontWeight: FontWeight.medium,
  },
  tabBar: {
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabItem: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    gap: 4,
    position: "relative",
  },
  tabLabel: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.cairo,
  },
  activeIndicator: {
    position: "absolute",
    bottom: 0,
    left: 8,
    right: 8,
    height: 2,
    borderRadius: Dimensions.radiusFull,
  },
  content: {
    flex: 1,
  },
  pressed: {
    opacity: 0.8,
  },
  tabPressed: {
    opacity: 0.72,
  },
  topRightBubble: {
    position: "absolute",
    top: -110,
    right: -90,
    width: 360,
    height: 360,
    borderRadius: Dimensions.radiusFull,
  },
  topLeftBubble: {
    position: "absolute",
    top: 260,
    left: -130,
    width: 250,
    height: 250,
    borderRadius: Dimensions.radiusFull,
  },
  bottomLeftBubble: {
    position: "absolute",
    bottom: -110,
    right: -40,
    width: 210,
    height: 210,
    borderRadius: Dimensions.radiusFull,
  },
});
