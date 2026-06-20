import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import { CoordinatorStatsTab } from "@/components/coordinator/CoordinatorStatsTab";
import { CreateEventTab } from "@/components/coordinator/CreateEventTab";
import { MyEventsTab } from "@/components/coordinator/MyEventsTab";
import { useAuth } from "@/contexts/auth-context";
import { useThemePreference } from "@/contexts/theme-preference-context";
import { canAccessCoordinatorDashboard } from "@/lib/auth/admin-access";
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

export default function CoordinatorDashboard() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const { colors } = useThemePreference();
  const [activeTab, setActiveTab] = useState<TabId>("create");
  const shellWidth = Math.min(width, 456);
  const isCompact = shellWidth < 380;
  const tabBarWidth = Math.min(260, shellWidth - 40);
  const heroCurveWidth = Math.max(Math.round(shellWidth), 320);

  const [editingEvent, setEditingEvent] = useState<CoordinatorEvent | null>(
    null,
  );

  const handleEdit = (event: CoordinatorEvent) => {
    setEditingEvent(event);
    setActiveTab("create");
  };

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)/profile");
  };

  if (!canAccessCoordinatorDashboard(user?.roles ?? [])) {
    return (
      <View
        style={[
          styles.container,
          styles.center,
          { backgroundColor: colors.background, paddingTop: insets.top },
        ]}
      >
        <Ionicons
          name="lock-closed-outline"
          size={48}
          color={colors.mutedForeground}
        />
        <Text style={[styles.comingSoon, { color: colors.mutedForeground }]}>
          لا تملك صلاحية الوصول لهذه الصفحة
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <View style={[styles.screenShell, { backgroundColor: colors.background }]}>
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
              fill={colors.background}
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
                onPress={goBack}
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
          <View style={[styles.tabBar, { width: tabBarWidth, backgroundColor: colors.secondary }]}>
            {TABS.map((tab) => (
              <Pressable
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={({ pressed }) => [
                  styles.tabItem,
                  activeTab === tab.id && [styles.tabItemActive, { backgroundColor: colors.card }],
                  pressed && styles.tabItemPressed,
                ]}
              >
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={[
                    styles.tabLabel,
                    { color: colors.mutedForeground },
                    activeTab === tab.id && [styles.tabLabelActive, { color: colors.foreground }],
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={[styles.content, { backgroundColor: colors.background }]}>
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
          {activeTab === "stats" ? <CoordinatorStatsTab /> : null}
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
