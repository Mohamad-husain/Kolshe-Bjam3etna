import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useExchangeQuery } from "@/hooks/queries/use-explore-queries";
import {
  Colors,
  FontFamily,
  FontSize,
  SemanticColors,
  Spacing,
} from "@/styles/ui-theme";

import { CategoryFilter, type Category } from "./CategoryFilter";
import { ExchangeCard } from "./ExchangeCard";
import { SearchBar } from "./SearchBar";

const CATEGORIES: Category[] = [
  { id: "all", label: "الكل" },
  { id: "إلكترونيات", label: "إلكترونيات" },
  { id: "كتب", label: "كتب" },
  { id: "تصميم", label: "تصميم" },
];

type ExchangeTabProps = {
  showFilter: boolean;
};

export function ExchangeTab({ showFilter }: ExchangeTabProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { data: items = [], isLoading, error } = useExchangeQuery();
  const [searchError, setSearchError] = useState("");
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
            placeholder="ابحث في خدمات..."
            value={search}
            onChangeText={handleSearch}
            error={searchError}
          />
          {showFilter ? (
            <CategoryFilter
              categories={CATEGORIES}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
              accentColor={SemanticColors.lightBlue}
              accentBg={`${SemanticColors.lightBlue}12`}
              icon="swap-horizontal-outline"
              title="تبادل"
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
