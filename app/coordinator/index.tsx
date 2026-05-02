import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CreateEventTab } from "@/components/coordinator/CreateEventTab";
import { MyEventsTab } from "@/components/coordinator/MyEventsTab";
import { useAuth } from "@/contexts/auth-context";
import { useMyEventsQuery } from "@/hooks/queries/use-coordinator-queries";
import {
  Colors,
  Dimensions,
  FontFamily,
  FontSize,
  FontWeight,
  SemanticColors,
  Spacing,
} from "@/styles/ui-theme";
import type { CoordinatorEvent } from "@/services/coordinator-api";

type TabId = "my-events" | "create" | "stats";

const TABS: { id: TabId; label: string }[] = [
  { id: "my-events", label: "فعالياتي" },
  { id: "create", label: "إنشاء فعالية" },
  { id: "stats", label: "الإحصائيات" },
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

export default function CoordinatorDashboard() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("my-events");
  const { data: events = [] } = useMyEventsQuery();

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

  const activeEvents = events.filter((event) => {
    if (!event.dateTimeUtc) return false;
    return new Date(event.dateTimeUtc).getTime() > Date.now();
  }).length;

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
        <Text style={styles.comingSoon}>لا تملك صلاحية الوصول لهذه الصفحة</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="calendar-outline" size={24} color="#fff" />
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>لوحة منسق الفعاليات</Text>
          <Text style={styles.headerSubtitle}>
            إنشاء وإدارة الفعاليات الجامعية
          </Text>
        </View>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{avgAttendance}%</Text>
          <Text style={styles.statLabel}>معدل الحضور</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalRegistered}</Text>
          <Text style={styles.statLabel}>إجمالي المسجلين</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{activeEvents}</Text>
          <Text style={styles.statLabel}>فعاليات نشطة</Text>
        </View>
      </View>

      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <Pressable
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            style={[
              styles.tabItem,
              activeTab === tab.id && styles.tabItemActive,
            ]}
          >
            <Text
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

      <View style={styles.content}>
        {activeTab === "my-events" ? <MyEventsTab onEdit={handleEdit} /> : null}
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
          <View style={styles.statsContent}>
            <View style={styles.metricRow}>
              <Text style={styles.metricValue}>{events.length}</Text>
              <Text style={styles.metricLabel}>إجمالي الفعاليات</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricValue}>{activeEvents}</Text>
              <Text style={styles.metricLabel}>فعاليات قادمة</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricValue}>{totalRegistered}</Text>
              <Text style={styles.metricLabel}>إجمالي المسجلين</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricValue}>{avgAttendance}%</Text>
              <Text style={styles.metricLabel}>متوسط الإشغال</Text>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: SemanticColors.green,
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: Dimensions.radiusFull,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerLeft: {
    width: 36,
    height: 36,
    borderRadius: Dimensions.radiusButton,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "flex-end",
  },
  headerTitle: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: "#fff",
  },
  headerSubtitle: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xs,
    color: "rgba(255,255,255,0.8)",
  },
  statsRow: {
    flexDirection: "row-reverse",
    backgroundColor: SemanticColors.green,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: Dimensions.radiusButton,
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  statNumber: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: "#fff",
  },
  statLabel: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xxs,
    color: "rgba(255,255,255,0.8)",
  },
  tabBar: {
    flexDirection: "row-reverse",
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabItemActive: {
    borderBottomColor: SemanticColors.green,
  },
  tabLabel: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    color: Colors.mutedForeground,
  },
  tabLabelActive: {
    color: SemanticColors.green,
    fontWeight: FontWeight.bold,
  },
  content: {
    flex: 1,
  },
  statsContent: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  metricRow: {
    backgroundColor: "#fff",
    borderRadius: Dimensions.radiusButton,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    padding: Spacing.md,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metricValue: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: SemanticColors.green,
  },
  metricLabel: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    color: Colors.foreground,
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
  },
});
