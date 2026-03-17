import { Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  Colors,
  SemanticColors,
  Dimensions,
  FontFamily,
  FontSize,
  FontWeight,
  Spacing,
} from "@/styles/ui-theme";

export interface EventCardData {
  id: string;
  title: string;
  description: string;
  club: string;
  date: string;
  time: string;
  location: string;
  registeredCount: number;
  maxCount: number;
}

interface EventCardProps {
  data: EventCardData;
  onPress?: () => void;
}

export function EventCard({ data, onPress }: EventCardProps) {
  const progress = data.registeredCount / data.maxCount;
  const isFull = data.registeredCount >= data.maxCount;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={styles.card}
    >
      <View style={styles.accentBar} />

      <View style={styles.header}>
        <Text style={styles.club}>{data.club}</Text>
        <View style={styles.calendarIcon}>
          <Ionicons
            name="calendar-outline"
            size={20}
            color={SemanticColors.violet}
          />
        </View>
      </View>

      <Text style={styles.title}>{data.title}</Text>

      {/* Description */}
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
              { color: isFull ? SemanticColors.red : SemanticColors.violet },
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
                backgroundColor: isFull
                  ? SemanticColors.red
                  : SemanticColors.violet,
              },
            ]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: Dimensions.radiusCard,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
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
  accentBar: {
    position: "absolute",
    right: 0,
    top: 16,
    bottom: 16,
    width: 3,
    borderRadius: 2,
    backgroundColor: SemanticColors.violet,
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  calendarIcon: {
    width: 36,
    height: 36,
    borderRadius: Dimensions.radiusButton,
    backgroundColor: SemanticColors.violet + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  club: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.cairo,
    color: Colors.mutedForeground,
    backgroundColor: Colors.secondary,
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
