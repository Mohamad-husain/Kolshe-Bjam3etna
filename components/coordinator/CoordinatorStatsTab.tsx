import { Ionicons } from "@expo/vector-icons";
import { type ComponentProps } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useThemePreference } from "@/contexts/theme-preference-context";
import { useMyEventsQuery } from "@/hooks/queries/use-coordinator-queries";
import { FontFamily, FontWeight } from "@/styles/ui-theme";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

const PERFORMANCE_FALLBACK_ROWS = [
  {
    label: "ورشة عمل البرمجة بالبايثون",
    percent: 75,
    color: "#3168EA",
  },
  {
    label: "معرض الكتب المستعملة",
    percent: 60,
    color: "#FF8A00",
  },
  {
    label: "محاضرة ريادة الأعمال",
    percent: 90,
    color: "#31C75B",
  },
];

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function CoordinatorStatsTab() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { colors } = useThemePreference();
  const { data: events = [] } = useMyEventsQuery();
  const shellWidth = Math.min(width, 456);
  const isCompact = shellWidth < 380;
  const statsHorizontalPadding = isCompact ? 20 : 30;
  const statsCardHeight = isCompact ? 122 : 132;

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

  return (
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
                { backgroundColor: colors.card, borderColor: colors.border },
                { height: statsCardHeight },
              ]}
            >
              <View
                style={[
                  styles.statsIconCircle,
                  { backgroundColor: card.iconBackground },
                ]}
              >
                <Ionicons name={card.icon} size={21} color={card.iconColor} />
              </View>

              <View style={styles.statsCardCopy}>
                <Text style={[styles.statsCardValue, { color: colors.foreground }]}>{card.value}</Text>
                <Text numberOfLines={1} style={[styles.statsCardLabel, { color: colors.mutedForeground }]}>
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
                { backgroundColor: colors.card, borderColor: colors.border },
                { height: statsCardHeight },
              ]}
            >
              <View
                style={[
                  styles.statsIconCircle,
                  { backgroundColor: card.iconBackground },
                ]}
              >
                <Ionicons name={card.icon} size={21} color={card.iconColor} />
              </View>

              <View style={styles.statsCardCopy}>
                <Text style={[styles.statsCardValue, { color: colors.foreground }]}>{card.value}</Text>
                <Text numberOfLines={1} style={[styles.statsCardLabel, { color: colors.mutedForeground }]}>
                  {card.label}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.performanceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.performanceTitle, { color: colors.foreground }]}>أداء الفعاليات</Text>
        <View style={styles.performanceRows}>
          {performanceRows.map((row) => (
            <View key={row.label} style={styles.performanceRow}>
              <Text numberOfLines={1} style={[styles.performanceLabel, { color: colors.foreground }]}>
                {row.label}
              </Text>
              <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
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
  );
}

const styles = StyleSheet.create({
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
});
