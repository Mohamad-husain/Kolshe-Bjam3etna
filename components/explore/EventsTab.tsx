import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useEventsQuery } from "@/hooks/queries/use-explore-queries";
import {
  Colors,
  FontFamily,
  FontSize,
  SemanticColors,
  Spacing,
} from "@/styles/ui-theme";

import { CategoryFilter, type Category } from "./CategoryFilter";
import { EventCard } from "./EventCard";
import { SearchBar } from "./SearchBar";
import { useSearchInput } from "@/hooks/explore/use-search-input";

const CATEGORIES: Category[] = [
  { id: "all", label: "الكل" },
  { id: "نادي البرمجة", label: "نادي البرمجة" },
  { id: "نادي الروبوتات", label: "نادي الروبوتات" },
  { id: "نادي ريادة الأعمال", label: "ريادة الأعمال" },
];

type EventsTabProps = {
  showFilter: boolean;
};

export function EventsTab({ showFilter }: EventsTabProps) {
  const { search, searchError, handleSearch } = useSearchInput();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { data: items = [], isLoading, error } = useEventsQuery();
  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchSearch =
        normalizedSearch === "" ||
        item.title.toLowerCase().includes(normalizedSearch) ||
        item.description.toLowerCase().includes(normalizedSearch) ||
        item.club.toLowerCase().includes(normalizedSearch);

      const matchCategory =
        selectedCategory === "all" || item.club === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [items, search, selectedCategory]);
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={SemanticColors.violet} />
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
      renderItem={({ item }) => <EventCard data={item} />}
      ListHeaderComponent={
        <View>
          <SearchBar
            placeholder="ابحث في فعاليات..."
            value={search}
            onChangeText={handleSearch}
            error={searchError}
          />
          {showFilter ? (
            <CategoryFilter
              categories={CATEGORIES}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
              accentColor={SemanticColors.violet}
              accentBg={`${SemanticColors.violet}12`}
              icon="calendar-outline"
              title="فعاليات"
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
