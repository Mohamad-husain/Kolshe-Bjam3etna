import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { type ComponentProps, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import { CreateEventTab } from "@/components/coordinator/CreateEventTab";
import { MyEventsTab } from "@/components/coordinator/MyEventsTab";
import { useAuth } from "@/contexts/auth-context";
import { useMyEventsQuery } from "@/hooks/queries/use-coordinator-queries";
import type { CoordinatorEvent } from "@/services/coordinator-api";
import {
  Colors,
  Dimensions,
  FontFamily,
  FontSize,
  FontWeight,
  Spacing,
} from "@/styles/ui-theme";

type TabId = "my-events" | "create" | "stats";
type IoniconName = ComponentProps<typeof Ionicons>["name"];

const TABS: { id: TabId; label: string }[] = [
  { id: "stats", label: "الإحصائيات" },
  { id: "create", label: "إنشاء فعالية" },
  { id: "my-events", label: "فعالياتي" },
];

const HERO_STATS = [
  { value: "87%", label: "معدل الحضور" },
  { value: "345", label: "إجمالي المسجلين" },
  { value: "2", label: "فعاليات نشطة" },
];

const PERFORMANCE_FALLBACK_ROWS = [
  { label: "ورشة عمل البرمجة بالبايثون", percent: 75, color: "#3168EA" },
  { label: "معرض الكتب المستعملة", percent: 60, color: "#FF8A00" },
  { label: "محاضرة ريادة الأعمال", percent: 90, color: "#31C75B" },
];

function canAccessCoordinatorPage(roles: string[] | undefined) {
  return (
    roles?.some((role) => {
      const normalizedRole = role
        .trim()
        .toLowerCase()
        .replace(/[\s_-]+/g, "");

      return (
        normalizedRole === "coordinator" || normalizedRole === "eventowner"
      );
    }) ?? false
  );
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export default function CoordinatorDashboard() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("create");
  const { data: events = [] } = useMyEventsQuery();
  const shellWidth = Math.min(width, 456);
  const isCompact = shellWidth < 380;
  const tabBarWidth = Math.min(260, shellWidth - 40);
  const heroCurveWidth = Math.max(Math.round(shellWidth), 320);
  const statsHorizontalPadding = isCompact ? 20 : 30;
  const statsCardHeight = isCompact ? 122 : 132;

  const [editingEvent, setEditingEvent] = useState<CoordinatorEvent | null>(
    null,
  );

  const handleEdit = (event: CoordinatorEvent) => {
    setEditingEvent(event);
    setActiveTab("create");
  };

  const totalRegistered = events.reduce((sum, event) => {
    return sum + event.registeredCount;
  }, 0);

  const avgAttendance =
    events.length > 0
      ? Math.round(
          (events.reduce((sum, event) => {
            if (event.capacity <= 0) {
              return sum;
            }

            return sum + event.registeredCount / event.capacity;
          }, 0) /
            events.length) *
            100,
        )
      : 0;

  const statsCards: {
    value: string;
    label: string;
    icon: IoniconName;
    iconColor: string;
    iconBackground: string;
  }[] = [
    {
      value: String(totalRegistered),
      label: "إجمالي الحضور",
      icon: "people-outline",
      iconColor: "#25C85A",
      iconBackground: "#E7FAEC",
    },
    {
      value: String(events.length),
      label: "إجمالي الفعاليات",
      icon: "calendar-outline",
      iconColor: "#2F6DF6",
      iconBackground: "#EAF0FF",
    },
    {
      value: "4.7",
      label: "تقييم الفعاليات",
      icon: "bar-chart-outline",
      iconColor: "#D45BFF",
      iconBackground: "#F8E9FF",
    },
    {
      value: `${avgAttendance}%`,
      label: "معدل التسجيل",
      icon: "trending-up-outline",
      iconColor: "#FF9500",
      iconBackground: "#FFF2E0",
    },
  ];

  const eventPerformanceRows = events.slice(0, 3).map((event, index) => {
    const percent =
      event.capacity > 0
        ? clampPercent((event.registeredCount / event.capacity) * 100)
        : clampPercent(event.progressPercent);
    const colors = ["#3168EA", "#FF8A00", "#31C75B"];

    return {
      label: event.title,
      percent,
      color: colors[index] ?? "#3168EA",
    };
  });
  const performanceRows =
    eventPerformanceRows.length > 0
      ? eventPerformanceRows
      : PERFORMANCE_FALLBACK_ROWS;

  if (!canAccessCoordinatorPage(user?.roles)) {
    return (
      <View
        style={[styles.container, styles.center, { paddingTop: insets.top }]}
      >
        <Ionicons
          name="lock-closed-outline"
          size={48}
          color={Colors.mutedForeground}
        />
        <Text style={styles.comingSoon}>
          لا تملك صلاحية الوصول لهذه الصفحة
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.screenShell}>
        <LinearGradient
          colors={["#1F5D41", "#2A704E", "#3B8761"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Svg
            pointerEvents="none"
            width={heroCurveWidth}
            height={28}
            viewBox={`0 0 ${heroCurveWidth} 28`}
            preserveAspectRatio="none"
            style={styles.heroCurve}
          >
            <Path
              d={`M0 22 C${heroCurveWidth * 0.26} 10 ${heroCurveWidth * 0.74} 10 ${heroCurveWidth} 22 L${heroCurveWidth} 28 L0 28 Z`}
              fill="#F4F4F8"
            />
          </Svg>

          <View
            style={[
              styles.heroContent,
              {
                paddingTop: insets.top + (isCompact ? 28 : 38),
                paddingHorizontal: isCompact ? 18 : 24,
              },
            ]}
          >
            <View style={styles.headerRow}>
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.pressedButton,
                ]}
              >
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </Pressable>

              <View
                style={[
                  styles.calendarButton,
                  { right: isCompact ? 48 : 58 },
                ]}
              >
                <Ionicons name="calendar-outline" size={21} color="#FFFFFF" />
              </View>

              <View
                style={[styles.headerCopy, { right: isCompact ? 102 : 114 }]}
              >
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={styles.headerTitle}
                >
                  لوحة منسق الفعاليات
                </Text>
                <Text numberOfLines={1} style={styles.headerSubtitle}>
                  إنشاء وإدارة الفعاليات الجامعية
                </Text>
              </View>
            </View>

            <View style={[styles.statsRow, { gap: isCompact ? 8 : 12 }]}>
              {HERO_STATS.map((stat) => (
                <View key={stat.label} style={styles.statCard}>
                  <Text style={styles.statNumber}>{stat.value}</Text>
                  <Text numberOfLines={1} style={styles.statLabel}>
                    {stat.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>

        <View style={styles.tabsSection}>
          <View style={[styles.tabBar, { width: tabBarWidth }]}>
            {TABS.map((tab) => (
              <Pressable
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={({ pressed }) => [
                  styles.tabItem,
                  activeTab === tab.id && styles.tabItemActive,
                  pressed && styles.tabItemPressed,
                ]}
              >
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={[
                    styles.tabLabel,
                    activeTab === tab.id && styles.tabLabelActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.content}>
          {activeTab === "my-events" ? (
            <MyEventsTab onEdit={handleEdit} />
          ) : null}
          {activeTab === "create" ? (
            <CreateEventTab
              editingEvent={editingEvent}
              onDone={() => {
                setEditingEvent(null);
                setActiveTab("my-events");
              }}
            />
          ) : null}
          {activeTab === "stats" ? (
            <ScrollView
              style={styles.statsScroll}
              contentContainerStyle={[
                styles.statsContent,
                {
                  paddingHorizontal: statsHorizontalPadding,
                  paddingBottom: insets.bottom + 34,
                },
              ]}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <View style={styles.statsGrid}>
                <View style={styles.statsGridRow}>
                  {statsCards.slice(0, 2).map((card) => (
                    <View
                      key={card.label}
                      style={[
                        styles.statsOverviewCard,
                        { height: statsCardHeight },
                      ]}
                    >
                      <View
                        style={[
                          styles.statsIconCircle,
                          { backgroundColor: card.iconBackground },
                        ]}
                      >
                        <Ionicons
                          name={card.icon}
                          size={21}
                          color={card.iconColor}
                        />
                      </View>

                      <View style={styles.statsCardCopy}>
                        <Text style={styles.statsCardValue}>{card.value}</Text>
                        <Text numberOfLines={1} style={styles.statsCardLabel}>
                          {card.label}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                <View style={styles.statsGridRow}>
                  {statsCards.slice(2).map((card) => (
                    <View
                      key={card.label}
                      style={[
                        styles.statsOverviewCard,
                        { height: statsCardHeight },
                      ]}
                    >
                      <View
                        style={[
                          styles.statsIconCircle,
                          { backgroundColor: card.iconBackground },
                        ]}
                      >
                        <Ionicons
                          name={card.icon}
                          size={21}
                          color={card.iconColor}
                        />
                      </View>

                      <View style={styles.statsCardCopy}>
                        <Text style={styles.statsCardValue}>{card.value}</Text>
                        <Text numberOfLines={1} style={styles.statsCardLabel}>
                          {card.label}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.performanceCard}>
                <Text style={styles.performanceTitle}>أداء الفعاليات</Text>
                <View style={styles.performanceRows}>
                  {performanceRows.map((row) => (
                    <View key={row.label} style={styles.performanceRow}>
                      <Text numberOfLines={1} style={styles.performanceLabel}>
                        {row.label}
                      </Text>
                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${row.percent}%`,
                              backgroundColor: row.color,
                            },
                          ]}
                        />
                      </View>
                      <Text
                        style={[
                          styles.performancePercent,
                          { color: row.color },
                        ]}
                      >
                        {row.percent}%
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F8",
    alignItems: "center",
  },
  screenShell: {
    width: "100%",
    maxWidth: 456,
    flex: 1,
    backgroundColor: "#F4F4F8",
  },
  hero: {
    overflow: "hidden",
    paddingBottom: 27,
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
  },
  heroCurve: {
    position: "absolute",
    left: 0,
    bottom: 0,
    zIndex: 0,
  },
  headerRow: {
    height: 44,
    position: "relative",
    marginBottom: 24,
  },
  backButton: {
    position: "absolute",
    right: 0,
    top: 4,
    width: 36,
    height: 36,
    borderRadius: Dimensions.radiusFull,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  pressedButton: {
    opacity: 0.78,
    transform: [{ scale: 0.97 }],
  },
  calendarButton: {
    position: "absolute",
    top: 0,
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCopy: {
    position: "absolute",
    top: 0,
    left: 0,
    height: 44,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: FontFamily.cairo,
    fontSize: 18,
    lineHeight: 27,
    fontWeight: FontWeight.extrabold,
    color: "#FFFFFF",
    textAlign: "right",
    writingDirection: "rtl",
  },
  headerSubtitle: {
    marginTop: -1,
    fontFamily: FontFamily.cairo,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: FontWeight.semibold,
    color: "rgba(235,247,239,0.78)",
    textAlign: "right",
    writingDirection: "rtl",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statCard: {
    flex: 1,
    height: 65,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
    shadowColor: "#0C3322",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 3,
  },
  statNumber: {
    fontFamily: FontFamily.cairo,
    fontSize: 17,
    lineHeight: 25,
    fontWeight: FontWeight.extrabold,
    color: "#FFFFFF",
    textAlign: "center",
  },
  statLabel: {
    marginTop: 1,
    fontFamily: FontFamily.cairo,
    fontSize: 9,
    lineHeight: 14,
    fontWeight: FontWeight.bold,
    color: "rgba(241,250,244,0.78)",
    textAlign: "center",
    writingDirection: "rtl",
  },
  tabsSection: {
    alignItems: "flex-end",
    paddingHorizontal: 20,
    marginTop: 6,
    marginBottom: 20,
  },
  tabBar: {
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 3,
    borderRadius: 18,
    backgroundColor: "#EAEAEE",
  },
  tabItem: {
    flex: 1,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 7,
  },
  tabItemActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  tabItemPressed: {
    opacity: 0.8,
  },
  tabLabel: {
    fontFamily: FontFamily.cairo,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: FontWeight.semibold,
    color: "#9D9AA7",
    textAlign: "center",
    writingDirection: "rtl",
  },
  tabLabelActive: {
    color: "#0F172A",
    fontWeight: FontWeight.bold,
  },
  content: {
    flex: 1,
    width: "100%",
    minHeight: 0,
  },
  statsScroll: {
    flex: 1,
    width: "100%",
  },
  statsContent: {
    flexGrow: 1,
    paddingTop: 0,
    paddingBottom: 34,
    gap: 13,
  },
  statsGrid: {
    width: "100%",
    gap: 13,
  },
  statsGridRow: {
    width: "100%",
    flexDirection: "row",
    gap: 13,
  },
  statsOverviewCard: {
    flex: 1,
    minWidth: 0,
    height: 132,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(60,60,67,0.08)",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 15,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  statsIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  statsCardCopy: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  statsCardValue: {
    fontFamily: FontFamily.cairo,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: FontWeight.extrabold,
    color: "#202124",
    textAlign: "right",
  },
  statsCardLabel: {
    marginTop: -1,
    fontFamily: FontFamily.cairo,
    fontSize: 11,
    lineHeight: 17,
    fontWeight: FontWeight.semibold,
    color: "#A1A1AA",
    textAlign: "right",
    writingDirection: "rtl",
  },
  performanceCard: {
    width: "100%",
    minHeight: 151,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(60,60,67,0.08)",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  performanceTitle: {
    marginBottom: 14,
    fontFamily: FontFamily.cairo,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: FontWeight.extrabold,
    color: "#202124",
    textAlign: "right",
    writingDirection: "rtl",
  },
  performanceRows: {
    gap: 12,
  },
  performanceRow: {
    height: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  performanceLabel: {
    width: 123,
    fontFamily: FontFamily.cairo,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: FontWeight.semibold,
    color: "#3F3F46",
    textAlign: "right",
    writingDirection: "rtl",
  },
  progressTrack: {
    flex: 1,
    height: 7,
    borderRadius: 999,
    backgroundColor: "#EFEFF3",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  performancePercent: {
    width: 27,
    fontFamily: FontFamily.cairo,
    fontSize: 9,
    lineHeight: 14,
    fontWeight: FontWeight.extrabold,
    textAlign: "right",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  comingSoon: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.base,
    color: Colors.mutedForeground,
    textAlign: "center",
    writingDirection: "rtl",
  },
});
