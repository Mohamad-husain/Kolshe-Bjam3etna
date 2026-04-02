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

export interface ExchangeCardData {
  id: string;
  title: string;
  description: string;
  category: string;
  have: string;
  want: string;
  owner: {
    name: string;
    rating: number;
    initials: string;
  };
}

interface ExchangeCardProps {
  data: ExchangeCardData;
  onPress?: () => void;
}

export function ExchangeCard({ data, onPress }: ExchangeCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={styles.card}
    >
      <View style={styles.accentBar} />

      <View style={styles.badges}>
        <View
          style={[
            styles.badge,
            { backgroundColor: SemanticColors.lightBlue + "25" },
          ]}
        >
          <Text style={[styles.badgeText, { color: SemanticColors.lightBlue }]}>
            {data.category}
          </Text>
        </View>
      </View>

      <View style={styles.exchangeRow}>
        <View style={styles.exchangeBox}>
          <Text style={styles.exchangeLabel}>أملك</Text>
          <Text style={styles.exchangeValue} numberOfLines={2}>
            {data.have}
          </Text>
        </View>

        <View style={styles.exchangeIcon}>
          <Ionicons
            name="swap-horizontal"
            size={18}
            color={SemanticColors.lightBlue}
          />
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
        <View style={styles.exchangeBadge}>
          <Ionicons
            name="swap-horizontal"
            size={13}
            color={SemanticColors.lightBlue}
          />
          <Text style={styles.exchangeBadgeText}>تبادل</Text>
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
    backgroundColor: SemanticColors.lightBlue,
  },
  badges: {
    flexDirection: "row-reverse",
    marginBottom: Spacing.sm,
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
    backgroundColor: SemanticColors.lightBlue + "12",
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
    backgroundColor: SemanticColors.lightBlue + "25",
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
    backgroundColor: SemanticColors.lightBlue + "15",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Dimensions.radiusButton,
  },
  exchangeBadgeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    fontFamily: FontFamily.cairo,
    color: SemanticColors.lightBlue,
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
    backgroundColor: SemanticColors.lightBlue,
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
