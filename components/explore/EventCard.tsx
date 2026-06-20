import { Ionicons } from "@expo/vector-icons";
import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import {
  SemanticColors,
  Dimensions,
  FontFamily,
  FontSize,
  FontWeight,
  Spacing,
} from "@/styles/ui-theme";
import { getEventAccent } from "./explore-colors";
import { useAppSettings } from "@/contexts/app-settings-context";
import { useThemePreference } from "@/contexts/theme-preference-context";
import type { EventCardData } from "@/types/explore";
interface EventCardProps {
  data: EventCardData;
  onPress?: () => void;
}

export function EventCard({ data, onPress }: EventCardProps) {
  const { isRtl, t } = useAppSettings();
  const { colors } = useThemePreference();
  const hasValidCapacity = data.maxCount > 0;
  const hasImage = Boolean(data.imageUrl);
  const progress = hasValidCapacity
    ? Math.min(data.registeredCount / data.maxCount, 1)
    : 0;
  const isFull = data.registeredCount >= data.maxCount;
  const accent = getEventAccent(data.eventType);
  const rowDirection = isRtl ? "row-reverse" : "row";
  const textAlign = isRtl ? "right" : "left";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && styles.cardPressed,
      ]}
    >
      {data.imageUrl ? (
        <View style={[styles.mediaWrapper, { backgroundColor: colors.secondary }]}>
          <Image source={{ uri: data.imageUrl }} style={styles.image} />
        </View>
      ) : null}

      <View
        style={[
          styles.accentBar,
          isRtl ? styles.accentBarRtl : styles.accentBarLtr,
          { backgroundColor: accent.color },
        ]}
      />

      <View style={[styles.header, { flexDirection: rowDirection }, hasImage && styles.headerAfterImage]}>
        <View style={[styles.headerText, { alignItems: isRtl ? "flex-end" : "flex-start" }]}>
          <Text
            style={[
              styles.eventTypeBadge,
              { color: accent.color, backgroundColor: accent.softBg },
            ]}
          >
            {data.eventType}
          </Text>
          <Text style={[styles.club, { color: colors.mutedForeground }]}>{data.club}</Text>
        </View>
        <View style={[styles.calendarIcon, { backgroundColor: accent.softBg }]}>
          <Ionicons name="calendar-outline" size={20} color={accent.color} />
        </View>
      </View>

      <Text style={[styles.title, { color: colors.foreground, textAlign }]}>
        {data.title}
      </Text>

      <Text
        style={[
          styles.description,
          { color: colors.mutedForeground, textAlign },
        ]}
        numberOfLines={2}
      >
        {data.description}
      </Text>

      <View style={styles.details}>
        <View style={[styles.detailRow, { flexDirection: rowDirection }]}>
          <Ionicons
            name="calendar-outline"
            size={13}
            color={colors.mutedForeground}
          />
          <Text style={[styles.detailText, { color: colors.mutedForeground }]}>{data.date}</Text>
        </View>

        <View style={[styles.detailRow, { flexDirection: rowDirection }]}>
          <Ionicons
            name="time-outline"
            size={13}
            color={colors.mutedForeground}
          />
          <Text style={[styles.detailText, { color: colors.mutedForeground }]}>{data.time}</Text>
        </View>

        <View style={[styles.detailRow, { flexDirection: rowDirection }]}>
          <Ionicons
            name="location-outline"
            size={13}
            color={colors.mutedForeground}
          />
          <Text style={[styles.detailText, { color: colors.mutedForeground }]}>{data.location}</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={[styles.progressHeader, { flexDirection: rowDirection }]}>
          <Text
            style={[
              styles.progressCount,
              { color: isFull ? SemanticColors.red : accent.color },
            ]}
          >
            {data.registeredCount}/{data.maxCount}
          </Text>
          <View style={[styles.progressLabel, { flexDirection: rowDirection }]}>
            <Ionicons
              name="people-outline"
              size={13}
              color={colors.mutedForeground}
            />
            <Text style={[styles.progressLabelText, { color: colors.mutedForeground }]}>
              {t("explore.registered")}
            </Text>
          </View>
        </View>

        <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
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
    top: 0,
    bottom: 0,
    width: 3,
    borderRadius: 2,
  },
  accentBarRtl: {
    right: 0,
  },
  accentBarLtr: {
    left: 0,
  },
  mediaWrapper: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderTopLeftRadius: Dimensions.baseRadius,
    borderTopRightRadius: Dimensions.baseRadius,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  header: {
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  headerAfterImage: {
    marginTop: Spacing.sm,
  },
  headerText: {
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
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.cairo,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  details: {
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  detailRow: {
    alignItems: "center",
    gap: Spacing.xs,
  },
  detailText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.cairo,
  },
  progressSection: {
    gap: Spacing.xs,
  },
  progressHeader: {
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: {
    alignItems: "center",
    gap: 3,
  },
  progressLabelText: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.cairo,
  },
  progressCount: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    fontFamily: FontFamily.cairo,
  },

  progressTrack: {
    height: 6,
    borderRadius: Dimensions.radiusFull,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: Dimensions.radiusFull,
  },
});
