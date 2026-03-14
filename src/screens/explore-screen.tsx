import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Colors,
  SemanticColors,
  Dimensions,
  FontFamily,
  FontSize,
  FontWeight,
  Spacing,
} from "@src/styles/ui-theme";
import { ServicesTab } from "@src/components/explore/ServicesTab";
import { MarketplaceTab } from "@src/components/explore/MarketplaceTab";
import { ExchangeTab } from "@src/components/explore/ExchangeTab";
import { EventsTab } from "@src/components/explore/EventsTab";

type TabId = "services" | "marketplace" | "exchange" | "events";

interface Tab {
  id: TabId;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  trendingCount?: number;
}

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

export default function ExploreScreen() {
  const [activeTab, setActiveTab] = useState<TabId>("services");
  const [showFilter, setShowFilter] = useState(false);
  const currentTab = TABS.find((t) => t.id === activeTab)!;

  // ① لما تتغير التاب، أخفي الفلتر
  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setShowFilter(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRight}>
          {currentTab.trendingCount && (
            <TouchableOpacity
              style={[
                styles.trendingBadge,
                { backgroundColor: currentTab.color + "15" },
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
          )}
          <Text style={styles.title}>استكشف</Text>
        </View>

        {/* ② زر الفلتر مع toggle ولون يتغير */}
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

      {/* ③ Tab Bar — استخدم handleTabChange */}
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
              {isActive && (
                <View
                  style={[
                    styles.activeIndicator,
                    { backgroundColor: tab.color },
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.content}>
        {activeTab === "services" && <ServicesTab showFilter={showFilter} />}
        {activeTab === "marketplace" && (
          <MarketplaceTab showFilter={showFilter} />
        )}
        {activeTab === "exchange" && <ExchangeTab showFilter={showFilter} />}
        {activeTab === "events" && <EventsTab showFilter={showFilter} />}
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
