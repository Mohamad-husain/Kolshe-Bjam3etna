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
import { EventCard } from "./EventCard";
import { getEvents } from "@src/services/events.service";

const CATEGORIES: Category[] = [
  { id: "all", label: "الكل" },
  { id: "نادي البرمجة", label: "نادي البرمجة" },
  { id: "نادي الروبوتات", label: "نادي الروبوتات" },
  { id: "نادي ريادة الأعمال", label: "ريادة الأعمال" },
];
interface EventsTabProps {
  showFilter: boolean;
}
export function EventsTab({ showFilter }: EventsTabProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const {
    data: items = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
  });
  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        search === "" ||
        item.title.includes(search) ||
        item.club.includes(search);
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
            onChangeText={setSearch}
          />
          {showFilter && (
            <CategoryFilter
              categories={CATEGORIES}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
              accentColor={SemanticColors.violet}
              accentBg={SemanticColors.violet + "12"}
              icon="calendar-outline"
              title="فعاليات"
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
