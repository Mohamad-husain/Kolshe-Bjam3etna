import { useState, useMemo } from "react";
import {
  FlatList,
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import {
  SemanticColors,
  Spacing,
  Colors,
  FontFamily,
  FontSize,
} from "@src/styles/ui-theme";
import { SearchBar } from "./SearchBar";
import { CategoryFilter, Category } from "./CategoryFilter";
import { ExchangeCard } from "./ExchangeCard";
import { getSwapAds } from "@src/services/swap.service";
const CATEGORIES: Category[] = [
  { id: "all", label: "الكل" },
  { id: "إلكترونيات", label: "إلكترونيات" },
  { id: "كتب", label: "كتب" },
  { id: "تصميم", label: "تصميم" },
];
interface ExchangeTabProps {
  showFilter: boolean;
}
export function ExchangeTab({ showFilter }: ExchangeTabProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const {
    data: items = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["swaps"],
    queryFn: getSwapAds,
  });
  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        search === "" ||
        item.title.includes(search) ||
        item.have.includes(search) ||
        item.want.includes(search);
      const matchCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [items, search, selectedCategory]);
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={SemanticColors.lightBlue} />
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
      renderItem={({ item }) => <ExchangeCard data={item} />}
      ListHeaderComponent={
        <View>
          <SearchBar
            placeholder="ابحث في تبادل..."
            value={search}
            onChangeText={setSearch}
          />
          {showFilter && (
            <CategoryFilter
              categories={CATEGORIES}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
              accentColor={SemanticColors.lightBlue}
              accentBg={SemanticColors.lightBlue + "12"}
              icon="swap-horizontal-outline"
              title="تبادل"
              count={filtered.length}
            />
          )}
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
