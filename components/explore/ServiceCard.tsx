import { Ionicons } from "@expo/vector-icons";
import { View, Text, Pressable, StyleSheet } from "react-native";
import {
  Colors,
  SemanticColors,
  Dimensions,
  FontFamily,
  FontSize,
  FontWeight,
  Spacing,
} from "@/styles/ui-theme";
import { getCategoryAccent } from "./explore-colors";
import type { ServiceCardData } from "@/types/explore";

interface ServiceCardProps {
  data: ServiceCardData;
  onPress?: () => void;
}

export function ServiceCard({ data, onPress }: ServiceCardProps) {
  const accent = getCategoryAccent(data.category);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={[styles.accentBar, { backgroundColor: accent.color }]} />

      <View style={styles.badges}>
        <View style={[styles.badge, { backgroundColor: accent.strongBg }]}>
          <Text style={[styles.badgeText, { color: accent.color }]}>
            {data.category}
          </Text>
        </View>

        {data.isTrending && (
          <View
            style={[
              styles.badge,
              { backgroundColor: SemanticColors.orange + "18" },
            ]}
          >
            <Ionicons
              name="trending-up"
              size={11}
              color={SemanticColors.orange}
            />
            <Text style={[styles.badgeText, { color: SemanticColors.orange }]}>
              رائج
            </Text>
          </View>
        )}

        {data.isUrgent && (
          <View
            style={[
              styles.badge,
              { backgroundColor: SemanticColors.red + "18" },
            ]}
          >
            <Ionicons name="flash" size={11} color={SemanticColors.red} />
            <Text style={[styles.badgeText, { color: SemanticColors.red }]}>
              عاجل
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.title}>{data.title}</Text>

      <Text style={styles.description} numberOfLines={2}>
        {data.description}
      </Text>

      <View style={styles.footer}>
        {/* Price */}
        <View style={[styles.priceBadge, { backgroundColor: accent.softBg }]}>
          <Text style={[styles.priceText, { color: accent.color }]}>
            {data.pricePerHour} شيقل/ساعة
          </Text>
        </View>

        <View style={styles.deadlineBox}>
          <Ionicons
            name="time-outline"
            size={13}
            color={SemanticColors.green}
          />
          <Text style={styles.deadlineText}>{data.deadline}</Text>
        </View>

        {/* Owner */}
        <View style={styles.owner}>
          <Text style={styles.ownerName}>{data.owner.name}</Text>

          <View style={[styles.avatar, { backgroundColor: accent.color }]}>
            <Text style={styles.avatarText}>{data.owner.initials}</Text>
          </View>
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
    elevation: 7,
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
  badges: {
    flexDirection: "row-reverse",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  badge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Dimensions.radiusFull,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    fontFamily: FontFamily.cairo,
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
  footer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.sm,
  },
  priceBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Dimensions.radiusButton,
  },
  priceText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    fontFamily: FontFamily.cairo,
  },
  deadlineBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 3,
    backgroundColor: SemanticColors.green + "15",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Dimensions.radiusButton,
  },
  deadlineText: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.cairo,
    color: SemanticColors.green,
    fontWeight: FontWeight.medium,
  },
  owner: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.xs,
    flex: 1,
    justifyContent: "flex-end",
  },
  avatar: {
    width: Dimensions.avatarSm,
    height: Dimensions.avatarSm,
    borderRadius: Dimensions.radiusFull,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    fontFamily: FontFamily.cairo,
    color: "#fff",
  },
  ownerName: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.cairo,
    color: Colors.foreground,
    fontWeight: FontWeight.medium,
  },
});
