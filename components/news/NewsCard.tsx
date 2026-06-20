import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet, Image } from "react-native";
import {
  SemanticColors,
  Dimensions,
  FontFamily,
  FontSize,
  FontWeight,
  Spacing,
} from "@/styles/ui-theme";
import { useThemePreference } from "@/contexts/theme-preference-context";
import { getNewsAccent } from "./news_colors";

interface NewsCardData {
  imageUrl: string | null;
  id: string;
  title: string;
  category: string;
  isImportant: boolean;
  source: string;
  timeAgo: string;
}

interface NewsCardProps {
  data: NewsCardData;
}

const IMPORTANT_LABEL = "هام";

export function NewsCard({ data }: NewsCardProps) {
  const { colors } = useThemePreference();
  const accent = getNewsAccent(data.category);
  const topbarColor = data.isImportant ? SemanticColors.red : accent.color;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {data.imageUrl ? (
        <View style={[styles.mediaWrapper, { backgroundColor: colors.secondary }]}>
          <Image source={{ uri: data.imageUrl }} style={styles.image} />
        </View>
      ) : null}
      <View style={[styles.accentBar, { backgroundColor: topbarColor }]} />
      <View style={styles.content}>
        <View style={styles.badges}>
          {data.isImportant && (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: colors.secondary,
                  borderColor: SemanticColors.red + "20",
                },
              ]}
            >
              <Ionicons name="flash" size={11} color={SemanticColors.red} />
              <Text style={[styles.badgeText, { color: SemanticColors.red }]}>
                {IMPORTANT_LABEL}
              </Text>
            </View>
          )}

          <View
            style={[
              styles.badge,
              {
                backgroundColor: colors.secondary,
                borderColor: accent.softBg,
              },
            ]}
          >
            <Text style={[styles.badgeText, { color: accent.color }]}>
              {data.category}
            </Text>
          </View>
        </View>

        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={3}>
          {data.title}
        </Text>

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <View
            style={[
              styles.metaChip,
              { backgroundColor: colors.secondary, borderColor: colors.border },
            ]}
          >
            <Ionicons
              name="business-outline"
              size={13}
              color={colors.mutedForeground}
            />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]} numberOfLines={1}>
              {data.source}
            </Text>
          </View>

          <View
            style={[
              styles.metaChip,
              { backgroundColor: colors.secondary, borderColor: colors.border },
            ]}
          >
            <Ionicons
              name="time-outline"
              size={13}
              color={colors.mutedForeground}
            />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{data.timeAgo}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Dimensions.radiusCard,
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
    marginBottom: Spacing.md,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 20,
    elevation: 7,
    overflow: "hidden",
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
    height: 2,
    width: "100%",
    borderRadius: Dimensions.radiusFull,
  },
  content: {
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  badges: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  badge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: Dimensions.baseRadius,
    borderWidth: 1,
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
    textAlign: "right",
    lineHeight: 28,
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.sm,
  },
  metaChip: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
    maxWidth: "100%",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Dimensions.radiusFull,
    borderWidth: 1,
  },
  metaText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.cairo,
    textAlign: "right",
  },
});
