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
import { ServiceCard } from "./ServiceCard";
import { getServiceRequests } from "@src/services/services.service";

const CATEGORIES: Category[] = [
  { id: "all", label: "الكل" },
  { id: "كتاب", label: "كتب" },
  { id: "إلكترونيات", label: "إلكترونيات" },
  { id: "تصميم", label: "تصميم" },
];
interface ServicesTabProps {
  showFilter: boolean;
}

export function ServicesTab({ showFilter }: ServicesTabProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const {
    data: items = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["services"],
    queryFn: getServiceRequests,
  });

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
        <ActivityIndicator size="large" color={SemanticColors.blue} />
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
      renderItem={({ item }) => <ServiceCard data={item} />}
      ListHeaderComponent={
        <View>
          <SearchBar
            placeholder="ابحث في خدمات..."
            value={search}
            onChangeText={setSearch}
          />
          {showFilter && (
            <CategoryFilter
              categories={CATEGORIES}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
              accentColor={SemanticColors.blue}
              accentBg={SemanticColors.blue + "12"}
              icon="briefcase-outline"
              title="خدمات"
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
