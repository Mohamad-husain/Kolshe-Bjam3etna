import { useMemo, useState } from "react";
import { router } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useMarketplaceQuery } from "@/hooks/queries/use-explore-queries";
import { useAppSettings } from "@/contexts/app-settings-context";
import { useThemePreference } from "@/contexts/theme-preference-context";
import {
  FontFamily,
  FontSize,
  SemanticColors,
  Spacing,
} from "@/styles/ui-theme";

import { CategoryFilter, type Category } from "./CategoryFilter";
import { MarketplaceCard } from "./MarketplaceCard";
import { SearchBar } from "./SearchBar";
import { useSearchInput } from "@/hooks/explore/use-search-input";

type MarketplaceTabProps = {
  showFilter: boolean;
};

export function MarketplaceTab({ showFilter }: MarketplaceTabProps) {
  const { t } = useAppSettings();
  const { colors } = useThemePreference();
  const { search, searchError, handleSearch } = useSearchInput();
  const categories: Category[] = [
    { id: "all", label: t("common.all") },
    { id: "كتاب", label: t("explore.category.books") },
    { id: "الكترونيات", label: t("explore.category.electronics") },
    { id: "تصميم", label: t("explore.category.design") },
    { id: "برمجة", label: t("explore.category.programming") },
  ];
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { data: items = [], isLoading, error } = useMarketplaceQuery();

  const openAdDetails = (id: string) => {
    router.push({ pathname: "/ad/[id]", params: { id } });
  };

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
        <ActivityIndicator size="large" color={SemanticColors.orange} />
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
        <MarketplaceCard data={item} onPress={() => openAdDetails(item.id)} />
      )}
      ListHeaderComponent={
        <View>
          <SearchBar
            placeholder={t("explore.searchMarketplace")}
            value={search}
            onChangeText={handleSearch}
            error={searchError}
          />
          {showFilter ? (
            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
              accentColor={SemanticColors.orange}
              accentBg={`${SemanticColors.orange}12`}
              icon="bag-outline"
              title={t("explore.marketplace")}
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
