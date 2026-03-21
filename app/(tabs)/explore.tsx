import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EventsTab } from "@/components/explore/EventsTab";
import { ExchangeTab } from "@/components/explore/ExchangeTab";
import { MarketplaceTab } from "@/components/explore/MarketplaceTab";
import { ServicesTab } from "@/components/explore/ServicesTab";
import {
  Colors,
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
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  trendingCount?: number;
};

const TABS: Tab[] = [
  {
    id: "services",
    label: "خدمات",
    icon: "briefcase-outline",
    color: SemanticColors.blue,
    trendingCount: 3,
  },
  {
    id: "marketplace",
    label: "متجر",
    icon: "bag-outline",
    color: SemanticColors.orange,
    trendingCount: 1,
  },
  {
    id: "exchange",
    label: "تبادل",
    icon: "swap-horizontal-outline",
    color: SemanticColors.lightBlue,
  },
  {
    id: "events",
    label: "فعاليات",
    icon: "calendar-outline",
    color: SemanticColors.violet,
  },
];

export default function ExploreRoute() {
  const [activeTab, setActiveTab] = useState<TabId>("services");
  const [showFilter, setShowFilter] = useState(false);
  const currentTab = TABS.find((tab) => tab.id === activeTab) ?? TABS[0];

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setShowFilter(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRight}>
          {currentTab?.trendingCount ? (
            <TouchableOpacity
              style={[
                styles.trendingBadge,
                { backgroundColor: `${currentTab.color}15` },
              ]}
            >
              <Ionicons
                name="flame-outline"
                size={13}
                color={currentTab.color}
              />
              <Text style={[styles.trendingText, { color: currentTab.color }]}>
                trending {currentTab.trendingCount}
              </Text>
            </TouchableOpacity>
          ) : null}
          <Text style={styles.title}>استكشف</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.filterButton,
            showFilter && {
              backgroundColor: Colors.primary,
              borderColor: Colors.primary,
            },
          ]}
          onPress={() => setShowFilter((prev) => !prev)}
        >
          <Text style={[styles.filterText, showFilter && { color: "#fff" }]}>
            فلتر
          </Text>
          <Ionicons
            name="options-outline"
            size={16}
            color={showFilter ? "#fff" : Colors.foreground}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => handleTabChange(tab.id)}
              style={styles.tabItem}
            >
              <Ionicons
                name={tab.icon}
                size={18}
                color={isActive ? tab.color : Colors.mutedForeground}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? tab.color : Colors.mutedForeground },
                  isActive && { fontWeight: FontWeight.bold },
                ]}
              >
                {tab.label}
              </Text>
              {isActive ? (
                <View
                  style={[
                    styles.activeIndicator,
                    { backgroundColor: tab.color },
                  ]}
                />
              ) : null}
            </TouchableOpacity>
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
        {activeTab === "events" ? <EventsTab showFilter={showFilter} /> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  headerRight: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    fontFamily: FontFamily.cairo,
    color: Colors.foreground,
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
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Dimensions.radiusFull,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  filterText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.cairo,
    fontWeight: FontWeight.medium,
    color: Colors.foreground,
  },
  tabBar: {
    flexDirection: "row-reverse",
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
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
});
