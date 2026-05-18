import { Ionicons } from "@expo/vector-icons";
import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import {
  Colors,
  Dimensions,
  FontFamily,
  FontSize,
  FontWeight,
  Spacing,
} from "@/styles/ui-theme";
import { getCategoryAccent } from "./explore-colors";

import type { ExchangeCardData } from "@/types/explore";

interface ExchangeCardProps {
  data: ExchangeCardData;
  onPress?: () => void;
}

export function ExchangeCard({ data, onPress }: ExchangeCardProps) {
  const accent = getCategoryAccent(data.category);
  const hasImage = Boolean(data.imageUrl);
  const ownerImageUrl = data.owner.imageUrl?.trim();

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

      <View style={[styles.badges, hasImage && styles.badgesAfterImage]}>
        <View style={[styles.badge, { backgroundColor: accent.strongBg }]}>
          <Text style={[styles.badgeText, { color: accent.color }]}>
            {data.category}
          </Text>
        </View>
      </View>

      <View style={[styles.exchangeRow, { backgroundColor: accent.softBg }]}>
        <View style={styles.exchangeBox}>
          <Text style={styles.exchangeLabel}>أملك</Text>
          <Text style={styles.exchangeValue} numberOfLines={2}>
            {data.have}
          </Text>
        </View>

        <View
          style={[styles.exchangeIcon, { backgroundColor: accent.strongBg }]}
        >
          <Ionicons name="swap-horizontal" size={18} color={accent.color} />
        </View>

        <View style={styles.exchangeBox}>
          <Text style={styles.exchangeLabel}>أريد</Text>
          <Text style={styles.exchangeValue} numberOfLines={2}>
            {data.want}
          </Text>
        </View>
      </View>

      <Text style={styles.title}>{data.title}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {data.description}
      </Text>

      <View style={styles.footer}>
        <View
          style={[styles.exchangeBadge, { backgroundColor: accent.softBg }]}
        >
          <Ionicons name="swap-horizontal" size={13} color={accent.color} />
          <Text style={[styles.exchangeBadgeText, { color: accent.color }]}>
            تبادل
          </Text>
        </View>

        <View style={styles.owner}>
          <Text style={styles.ownerName}>{data.owner.name}</Text>
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
  badges: {
    flexDirection: "row-reverse",
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
    flexDirection: "row-reverse",
    alignItems: "center",
    borderRadius: Dimensions.radiusButton,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  exchangeBox: {
    flex: 1,
    alignItems: "flex-end",
  },
  exchangeLabel: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.cairo,
    color: Colors.mutedForeground,
    marginBottom: 2,
  },
  exchangeValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    fontFamily: FontFamily.cairo,
    color: Colors.foreground,
    textAlign: "right",
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
  exchangeBadge: {
    flexDirection: "row-reverse",
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
    color: Colors.foreground,
    fontWeight: FontWeight.medium,
  },
});
