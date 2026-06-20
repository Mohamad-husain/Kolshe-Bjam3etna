import { Ionicons } from "@expo/vector-icons";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import {
  Dimensions,
  FontFamily,
  FontSize,
  FontWeight,
  Spacing,
} from "@/styles/ui-theme";
import { useAppSettings } from "@/contexts/app-settings-context";
import { useThemePreference } from "@/contexts/theme-preference-context";

export interface Category {
  id: string;
  label: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selected: string;
  onSelect: (id: string) => void;
  accentColor: string;
  accentBg: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  count: number;
}

export function CategoryFilter({
  categories,
  selected,
  onSelect,
  accentColor,
  accentBg,
  icon,
  title,
  count,
}: CategoryFilterProps) {
  const { t, isRtl } = useAppSettings();
  const { colors } = useThemePreference();

  return (
    <View style={[styles.wrapper, { backgroundColor: accentBg }]}>
      <View style={[styles.header, { flexDirection: isRtl ? "row-reverse" : "row" }]}>
        <View style={[styles.iconBox, { backgroundColor: accentColor }]}>
          <Ionicons name={icon} size={16} color="#fff" />
        </View>
        <View style={[styles.titleBox, { alignItems: isRtl ? "flex-end" : "flex-start" }]}>
          <Text style={[styles.title, { color: accentColor }]}>{title}</Text>
          <Text style={[styles.count, { color: colors.mutedForeground }]}>
            {t("common.results", { count })}
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.chips,
          { flexDirection: isRtl ? "row-reverse" : "row" },
        ]}
      >
        {categories.map((cat) => {
          const isSelected = selected === cat.id;
          return (
            <Pressable
              key={cat.id}
              onPress={() => onSelect(cat.id)}
              style={({ pressed }) => [
                styles.chip,
                { backgroundColor: isSelected ? accentColor : colors.card },
                pressed && styles.chipPressed,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: isSelected ? "#fff" : colors.mutedForeground },
                ]}
              >
                {cat.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: Dimensions.radiusCard,
    padding: Spacing.md,
    alignSelf: "center",
    maxWidth: 500,
    width: "100%",
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: Dimensions.radiusFull,
    alignItems: "center",
    justifyContent: "center",
  },
  titleBox: {
  },
  title: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    fontFamily: FontFamily.cairo,
  },
  count: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.cairo,
  },
  chips: {
    gap: Spacing.xs,
    paddingHorizontal: 2,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Dimensions.radiusFull,
  },
  chipPressed: {
    opacity: 0.85,
  },
  chipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    fontFamily: FontFamily.cairo,
  },
});
