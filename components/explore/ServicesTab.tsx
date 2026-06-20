import { useMemo, useState } from "react";
import { router } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useServicesQuery } from "@/hooks/queries/use-explore-queries";
import { useAppSettings } from "@/contexts/app-settings-context";
import { useThemePreference } from "@/contexts/theme-preference-context";
import {
  FontFamily,
  FontSize,
  SemanticColors,
  Spacing,
} from "@/styles/ui-theme";

import { CategoryFilter, type Category } from "./CategoryFilter";
import { SearchBar } from "./SearchBar";
import { ServiceCard } from "./ServiceCard";
import { useSearchInput } from "@/hooks/explore/use-search-input";

type ServicesTabProps = {
  showFilter: boolean;
};

export function ServicesTab({ showFilter }: ServicesTabProps) {
  const { t } = useAppSettings();
  const { colors } = useThemePreference();
  const { search, searchError, handleSearch } = useSearchInput();
  const categories: Category[] = [
    { id: "all", label: t("common.all") },
    { id: "كتاب", label: t("explore.category.books") },
    { id: "إلكترونيات", label: t("explore.category.electronics") },
    { id: "تصميم", label: t("explore.category.design") },
  ];
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { data: items = [], isLoading, error } = useServicesQuery();
  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchSearch =
        normalizedSearch === "" ||
        item.title.toLowerCase().includes(normalizedSearch) ||
        item.description.toLowerCase().includes(normalizedSearch);

      const matchCategory =
        selectedCategory === "all" || item.category === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [items, search, selectedCategory]);

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
        <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
          {t("common.loadError")}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={filtered}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ServiceCard
          data={item}
          onPress={() => router.push({ pathname: "/service/[id]", params: { id: item.id } })}
        />
      )}
      ListHeaderComponent={
        <View>
          <SearchBar
            placeholder={t("explore.searchServices")}
            value={search}
            onChangeText={handleSearch}
            error={searchError}
          />
          {showFilter ? (
            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
              accentColor={SemanticColors.blue}
              accentBg={`${SemanticColors.blue}12`}
              icon="briefcase-outline"
              title={t("explore.services")}
              count={filtered.length}
            />
          ) : null}
        </View>
      }
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingBottom: 100,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
  },
});
