import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useMarketplaceQuery } from "@/hooks/queries/use-explore-queries";
import {
  Colors,
  FontFamily,
  FontSize,
  SemanticColors,
  Spacing,
} from "@/styles/ui-theme";

import { CategoryFilter, type Category } from "./CategoryFilter";
import { MarketplaceCard } from "./MarketplaceCard";
import { SearchBar } from "./SearchBar";
import { useSearchInput } from "@/hooks/explore/use-search-input";

const CATEGORIES: Category[] = [
  { id: "all", label: "الكل" },
  { id: "كتاب", label: "كتب" },
  { id: "إلكترونيات", label: "إلكترونيات" },
  { id: "تصميم", label: "تصميم" },
];

type MarketplaceTabProps = {
  showFilter: boolean;
};

export function MarketplaceTab({ showFilter }: MarketplaceTabProps) {
  const { search, searchError, handleSearch } = useSearchInput();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { data: items = [], isLoading, error } = useMarketplaceQuery();

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        search === "" ||
        item.title.includes(search) ||
        item.description.includes(search);
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
        <Text style={styles.errorText}>تعذر تحميل البيانات</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={filtered}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <MarketplaceCard data={item} />}
      ListHeaderComponent={
        <View>
          <SearchBar
            placeholder="ابحث في متجر..."
            value={search}
            onChangeText={handleSearch}
            error={searchError}
          />
          {showFilter ? (
            <CategoryFilter
              categories={CATEGORIES}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
              accentColor={SemanticColors.orange}
              accentBg={`${SemanticColors.orange}12`}
              icon="bag-outline"
              title="متجر"
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
    color: Colors.mutedForeground,
  },
});
