import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { SearchBar } from "@/components/explore/SearchBar";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CategoryFilter,
  type Category,
} from "@/components/explore/CategoryFilter";

import { NewsCard } from "@/components/news/NewsCard";
import { getNews } from "@/services/news-api";
import {
  Colors,
  Dimensions,
  FontFamily,
  FontSize,
  FontWeight,
  SemanticColors,
  Spacing,
} from "@/styles/ui-theme";

const NEWS_CATEGORIES: Category[] = [
  { id: "الكل", label: "الكل" },
  { id: "أكاديمي", label: "أكاديمي" },
  { id: "تسجيل", label: "تسجيل" },
  { id: "منح", label: "منح" },
  { id: "إدارة", label: "إدارة" },
  { id: "تقنية", label: "تقنية" },
];

export default function NewsScreen() {
  const [searchError, setSearchError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const {
    data: items = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["news"],
    queryFn: getNews,
  });
  const handleSearch = (text: string) => {
    setSearch(text);
    if (text.length > 0 && text.trim() === "") {
      setSearchError("لا يمكن البحث بمسافات فارغة");
    } else {
      setSearchError("");
    }
  };
  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        search === "" ||
        item.title.includes(search) ||
        item.source.includes(search);
      const matchCategory =
        selectedCategory === "الكل" || item.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [items, search, selectedCategory]);

  const importantNews = filtered.filter((item) => item.isImportant);
  const otherNews = filtered.filter((item) => !item.isImportant);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)/home");
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={SemanticColors.blue} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>تعذر تحميل الأخبار</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.container]}>
        <FlatList
          data={otherNews}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <NewsCard data={item} />}
          ListHeaderComponent={
            <View>
              <View style={styles.header}>
                <Pressable
                  accessibilityLabel="back-to-home"
                  onPress={handleBack}
                  style={({ pressed }) => [
                    styles.headerAction,
                    pressed && styles.headerActionPressed,
                  ]}
                >
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color={Colors.foreground}
                  />
                </Pressable>
                <Text style={styles.title}>الأخبار</Text>
                <Ionicons
                  name="newspaper-outline"
                  size={24}
                  color={Colors.foreground}
                />
              </View>
              <View style={styles.statsRow}>
                <View
                  style={[
                    styles.statCard,
                    { backgroundColor: SemanticColors.blue + "15" },
                  ]}
                >
                  <Text
                    style={[styles.statNumber, { color: SemanticColors.blue }]}
                  >
                    {items.length}
                  </Text>
                  <Text style={styles.statLabel}>إجمالي الأخبار</Text>
                </View>
                <View
                  style={[
                    styles.statCard,
                    { backgroundColor: SemanticColors.red + "15" },
                  ]}
                >
                  <Text
                    style={[styles.statNumber, { color: SemanticColors.red }]}
                  >
                    {items.filter((i) => i.isImportant).length}
                  </Text>
                  <Text style={styles.statLabel}>أخبار مهمة</Text>
                </View>
              </View>
              <View>
                <SearchBar
                  placeholder="ابحث في الأخبار..."
                  value={search}
                  onChangeText={handleSearch}
                  error={searchError}
                />
              </View>
              <CategoryFilter
                categories={NEWS_CATEGORIES}
                selected={selectedCategory}
                onSelect={setSelectedCategory}
                accentColor={SemanticColors.blue}
                accentBg={SemanticColors.blue + "12"}
                icon="newspaper-outline"
                title="الأخبار"
                count={filtered.length}
              />

              <View style={styles.resultsRow}>
                <Ionicons
                  name="funnel-outline"
                  size={14}
                  color={Colors.mutedForeground}
                />
                <Text style={styles.resultsText}>{filtered.length} نتيجة</Text>
              </View>
              {importantNews.length > 0 && (
                <View>
                  <View style={styles.sectionHeader}>
                    <Ionicons
                      name="flash"
                      size={16}
                      color={SemanticColors.red}
                    />
                    <Text
                      style={[
                        styles.sectionTitle,
                        { color: SemanticColors.red },
                      ]}
                    >
                      أخبار مهمة
                    </Text>
                  </View>
                  {importantNews.map((item) => (
                    <NewsCard key={item.id} data={item} />
                  ))}
                  {otherNews.length > 0 && (
                    <View style={styles.sectionHeader}>
                      <Ionicons
                        name="newspaper-outline"
                        size={16}
                        color={Colors.foreground}
                      />
                      <Text style={styles.sectionTitle}>أخبار أخرى</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          }
          contentContainerStyle={[styles.list]}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  headerAction: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  headerActionPressed: {
    opacity: 0.8,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    fontFamily: FontFamily.cairo,
    color: Colors.foreground,
  },
  statsRow: {
    flexDirection: "row-reverse",
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderRadius: Dimensions.radiusCard,
  },
  statNumber: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    fontFamily: FontFamily.cairo,
  },
  statLabel: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.cairo,
    color: Colors.mutedForeground,
  },
  resultsRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    gap: 4,
    marginBottom: Spacing.sm,
  },
  resultsText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.cairo,
    color: Colors.mutedForeground,
  },
  sectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    fontFamily: FontFamily.cairo,
    color: Colors.foreground,
  },
  list: {
    paddingTop: Spacing.sm,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
  },
  errorText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    color: Colors.mutedForeground,
  },
});
