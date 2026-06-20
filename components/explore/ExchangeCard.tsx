import { Ionicons } from "@expo/vector-icons";
import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import {
  Dimensions,
  FontFamily,
  FontSize,
  FontWeight,
  Spacing,
} from "@/styles/ui-theme";
import { getCategoryAccent } from "./explore-colors";
import { useAppSettings } from "@/contexts/app-settings-context";
import { useThemePreference } from "@/contexts/theme-preference-context";

import type { ExchangeCardData } from "@/types/explore";

interface ExchangeCardProps {
  data: ExchangeCardData;
  onPress?: () => void;
}

export function ExchangeCard({ data, onPress }: ExchangeCardProps) {
  const { isRtl, t } = useAppSettings();
  const { colors } = useThemePreference();
  const accent = getCategoryAccent(data.category);
  const hasImage = Boolean(data.imageUrl);
  const ownerImageUrl = data.owner.imageUrl?.trim();
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
      </View>

      <View style={[styles.exchangeRow, { backgroundColor: accent.softBg, flexDirection: rowDirection }]}>
        <View style={[styles.exchangeBox, { alignItems: isRtl ? "flex-end" : "flex-start" }]}>
          <Text style={[styles.exchangeLabel, { color: colors.mutedForeground }]}>
            {t("explore.have")}
          </Text>
          <Text style={[styles.exchangeValue, { color: colors.foreground, textAlign }]} numberOfLines={2}>
            {data.have}
          </Text>
        </View>

        <View
          style={[styles.exchangeIcon, { backgroundColor: accent.strongBg }]}
        >
          <Ionicons name="swap-horizontal" size={18} color={accent.color} />
        </View>

        <View style={[styles.exchangeBox, { alignItems: isRtl ? "flex-end" : "flex-start" }]}>
          <Text style={[styles.exchangeLabel, { color: colors.mutedForeground }]}>
            {t("explore.want")}
          </Text>
          <Text style={[styles.exchangeValue, { color: colors.foreground, textAlign }]} numberOfLines={2}>
            {data.want}
          </Text>
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

      <View style={[styles.footer, { flexDirection: rowDirection }]}>
        <View
          style={[styles.exchangeBadge, { backgroundColor: accent.softBg, flexDirection: rowDirection }]}
        >
          <Ionicons name="swap-horizontal" size={13} color={accent.color} />
          <Text style={[styles.exchangeBadgeText, { color: accent.color }]}>
            {t("explore.exchangeBadge")}
          </Text>
        </View>

        <View style={[styles.owner, { flexDirection: rowDirection }]}>
          <Text style={[styles.ownerName, { color: colors.foreground }]}>
            {data.owner.name}
          </Text>
          <View style={[styles.avatar, { backgroundColor: accent.color }]}>
            {ownerImageUrl ? (
              <Image
                source={{ uri: ownerImageUrl }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.avatarText}>{data.owner.initials}</Text>
            )}
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
  badges: {
    marginBottom: Spacing.sm,
  },
  badgesAfterImage: {
    marginTop: Spacing.sm,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Dimensions.radiusFull,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    fontFamily: FontFamily.cairo,
  },
  exchangeRow: {
    alignItems: "center",
    borderRadius: Dimensions.radiusButton,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  exchangeBox: {
    flex: 1,
  },
  exchangeLabel: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.cairo,
    marginBottom: 2,
  },
  exchangeValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    fontFamily: FontFamily.cairo,
  },
  exchangeIcon: {
    width: 32,
    height: 32,
    borderRadius: Dimensions.radiusFull,
    alignItems: "center",
    justifyContent: "center",
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
  exchangeBadge: {
    alignItems: "center",
    gap: 3,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Dimensions.radiusButton,
  },
  exchangeBadgeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    fontFamily: FontFamily.cairo,
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
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
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
