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
import { getCategoryAccent } from "./explore-colors";
import { useAppSettings } from "@/contexts/app-settings-context";
import { useThemePreference } from "@/contexts/theme-preference-context";

import type { MarketplaceCardData } from "@/types/explore";

interface MarketplaceCardProps {
  data: MarketplaceCardData;
  onPress?: () => void;
}

export function MarketplaceCard({ data, onPress }: MarketplaceCardProps) {
  const { isRtl, t } = useAppSettings();
  const { colors } = useThemePreference();
  const accent = getCategoryAccent(data.category);
  const hasImage = Boolean(data.imageUrl);
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

      <View style={[styles.badges, { flexDirection: rowDirection }, hasImage && styles.badgesAfterImage]}>
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
              {t("explore.trending")}
            </Text>
          </View>
        )}

        {data.isSold && (
          <View
            style={[
              styles.badge,
              { backgroundColor: SemanticColors.red + "18" },
            ]}
          >
            <Text style={[styles.badgeText, { color: SemanticColors.red }]}>
              {t("explore.sold")}
            </Text>
          </View>
        )}
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

      <View style={[styles.footer, { flexDirection: rowDirection }]}>
        <View style={[styles.priceBadge, { backgroundColor: accent.softBg }]}>
          <Text style={[styles.priceText, { color: accent.color }]}>
            {data.price} {t("explore.shekel")}
          </Text>
        </View>

        <View style={[styles.conditionBox, { flexDirection: rowDirection }]}>
          <Ionicons
            name="checkmark-circle-outline"
            size={13}
            color={SemanticColors.green}
          />
          <Text style={styles.conditionText}>{data.condition}</Text>
        </View>

        <View style={[styles.owner, { flexDirection: rowDirection }]}>
          <Text style={[styles.ownerName, { color: colors.foreground }]}>
            {data.owner.name}
          </Text>

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
  badges: {
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  badgesAfterImage: {
    marginTop: Spacing.sm,
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
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.cairo,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  footer: {
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
  conditionBox: {
    alignItems: "center",
    gap: 3,
    backgroundColor: SemanticColors.green + "15",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Dimensions.radiusButton,
  },
  conditionText: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.cairo,
    color: SemanticColors.green,
    fontWeight: FontWeight.medium,
  },
  owner: {
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
    fontWeight: FontWeight.medium,
  },
});
