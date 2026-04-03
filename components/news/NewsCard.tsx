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
import { getNewsAccent } from "./news_colors";

interface NewsCardData {
  id: string;
  title: string;
  category: string;
  isImportant: boolean;
  source: string;
  timeAgo: string;
}

interface NewsCardProps {
  data: NewsCardData;
  onPress?: () => void;
}

export function NewsCard({ data, onPress }: NewsCardProps) {
  const accent = getNewsAccent(data.category);
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={styles.card}
    >
      <View style={[styles.accentBar, { backgroundColor: accent.color }]} />

      <View style={styles.badges}>
        {data.isImportant && (
          <View
            style={[
              styles.badge,
              { backgroundColor: SemanticColors.red + "18" },
            ]}
          >
            <Ionicons name="flash" size={11} color={SemanticColors.red} />
            <Text style={[styles.badgeText, { color: SemanticColors.red }]}>
              مهم
            </Text>
          </View>
        )}
        <View style={[styles.badge, { backgroundColor: accent.softBg }]}>
          <Text style={[styles.badgeText, { color: accent.color }]}>
            {data.category}
          </Text>
        </View>
      </View>
      <Text style={styles.title}>{data.title}</Text>

      <View style={styles.footer}>
        <View style={styles.meta}>
          <View style={styles.metaRow}>
            <Ionicons
              name="business-outline"
              size={13}
              color={Colors.mutedForeground}
            />
            <Text style={styles.metaText}>{data.source}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons
              name="time-outline"
              size={13}
              color={Colors.mutedForeground}
            />
            <Text style={styles.metaText}>{data.timeAgo}</Text>
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
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: "row-reverse",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  meta: {
    gap: 4,
    alignItems: "flex-end",
  },
  metaRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.cairo,
    color: Colors.mutedForeground,
  },
});
