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

export interface MarketplaceCardData {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  condition: string;
  isTrending?: boolean;
  isSold?: boolean;
  owner: {
    name: string;
    rating: number;
    initials: string;
  };
}

interface MarketplaceCardProps {
  data: MarketplaceCardData;
  onPress?: () => void;
}

export function MarketplaceCard({ data, onPress }: MarketplaceCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={styles.card}
    >
      <View style={styles.accentBar} />

      {/* Badges */}
      <View style={styles.badges}>
        <View
          style={[
            styles.badge,
            { backgroundColor: SemanticColors.orange + "18" },
          ]}
        >
          <Text style={[styles.badgeText, { color: SemanticColors.orange }]}>
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

        {data.isSold && (
          <View
            style={[
              styles.badge,
              { backgroundColor: SemanticColors.red + "18" },
            ]}
          >
            <Text style={[styles.badgeText, { color: SemanticColors.red }]}>
              مباع
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.title}>{data.title}</Text>

      <Text style={styles.description} numberOfLines={2}>
        {data.description}
      </Text>

      <View style={styles.footer}>
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>{data.price} د.أ</Text>
        </View>

        <View style={styles.conditionBox}>
          <Ionicons
            name="checkmark-circle-outline"
            size={13}
            color={SemanticColors.green}
          />
          <Text style={styles.conditionText}>{data.condition}</Text>
        </View>

        <View style={styles.owner}>
          <Text style={styles.ownerName}>{data.owner.name}</Text>
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={12} color={SemanticColors.orange} />
            <Text style={styles.ratingText}>{data.owner.rating}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{data.owner.initials}</Text>
          </View>
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
    top: 0,
    bottom: 0,
    width: 3,
    borderRadius: 2,
    backgroundColor: SemanticColors.orange,
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
    backgroundColor: SemanticColors.orange + "15",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Dimensions.radiusButton,
  },
  priceText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    fontFamily: FontFamily.cairo,
    color: SemanticColors.orange,
  },
  conditionBox: {
    flexDirection: "row-reverse",
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
    // أورانج بدل أزرق للأفاتار
    backgroundColor: SemanticColors.orange,
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
  ratingBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 2,
  },
  ratingText: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.cairo,
    color: Colors.mutedForeground,
  },
});
