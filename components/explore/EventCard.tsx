import { Ionicons } from "@expo/vector-icons";
import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import {
  Colors,
  SemanticColors,
  Dimensions,
  FontFamily,
  FontSize,
  FontWeight,
  Spacing,
} from "@/styles/ui-theme";
import { getEventAccent } from "./explore-colors";
import type { EventCardData } from "@/types/explore";
interface EventCardProps {
  data: EventCardData;
  onPress?: () => void;
}

export function EventCard({ data, onPress }: EventCardProps) {
  // devide by zero guard for capacity progress calculation
  const hasValidCapacity = data.maxCount > 0;
  const progress = hasValidCapacity
    ? Math.min(data.registeredCount / data.maxCount, 1)
    : 0;
  const isFull = data.registeredCount >= data.maxCount;
  const accent = getEventAccent(data.eventType);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      {data.imageUrl ? (
        <View style={styles.mediaWrapper}>
          <Image source={{ uri: data.imageUrl }} style={styles.image} />
        </View>
      ) : null}

      <View style={[styles.accentBar, { backgroundColor: accent.color }]} />

      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text
            style={[
              styles.eventTypeBadge,
              { color: accent.color, backgroundColor: accent.softBg },
            ]}
          >
            {data.eventType}
          </Text>
          <Text style={styles.club}>{data.club}</Text>
        </View>
        <View style={[styles.calendarIcon, { backgroundColor: accent.softBg }]}>
          <Ionicons name="calendar-outline" size={20} color={accent.color} />
        </View>
      </View>

      <Text style={styles.title}>{data.title}</Text>

      <Text style={styles.description} numberOfLines={2}>
        {data.description}
      </Text>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Ionicons
            name="calendar-outline"
            size={13}
            color={Colors.mutedForeground}
          />
          <Text style={styles.detailText}>{data.date}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons
            name="time-outline"
            size={13}
            color={Colors.mutedForeground}
          />
          <Text style={styles.detailText}>{data.time}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons
            name="location-outline"
            size={13}
            color={Colors.mutedForeground}
          />
          <Text style={styles.detailText}>{data.location}</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text
            style={[
              styles.progressCount,
              { color: isFull ? SemanticColors.red : accent.color },
            ]}
          >
            {data.registeredCount}/{data.maxCount}
          </Text>
          <View style={styles.progressLabel}>
            <Ionicons
              name="people-outline"
              size={13}
              color={Colors.mutedForeground}
            />
            <Text style={styles.progressLabelText}>المسجلين</Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress * 100}%`,
                backgroundColor: isFull ? SemanticColors.red : accent.color,
              },
            ]}
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: Dimensions.radiusCard,
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  cardPressed: {
    opacity: 0.85,
  },
  accentBar: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderRadius: 2,
  },
  mediaWrapper: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderTopLeftRadius: Dimensions.baseRadius,
    borderTopRightRadius: Dimensions.baseRadius,
    overflow: "hidden",
    backgroundColor: Colors.secondary,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  headerText: {
    alignItems: "flex-end",
    gap: Spacing.xs,
  },
  calendarIcon: {
    width: 36,
    height: 36,
    borderRadius: Dimensions.radiusButton,
    alignItems: "center",
    justifyContent: "center",
  },
  club: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.cairo,
    color: Colors.mutedForeground,
  },
  eventTypeBadge: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.cairo,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Dimensions.radiusFull,
  },
  title: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    fontFamily: FontFamily.cairo,
    color: Colors.foreground,
    textAlign: "right",
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.cairo,
    color: Colors.mutedForeground,
    textAlign: "right",
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  details: {
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.xs,
  },
  detailText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.cairo,
    color: Colors.mutedForeground,
  },
  progressSection: {
    gap: Spacing.xs,
  },
  progressHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 3,
  },
  progressLabelText: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.cairo,
    color: Colors.mutedForeground,
  },
  progressCount: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    fontFamily: FontFamily.cairo,
  },

  progressTrack: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: Dimensions.radiusFull,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: Dimensions.radiusFull,
  },
});
