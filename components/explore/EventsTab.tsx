import { useMemo, useState } from "react";
import { router } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useEventsQuery } from "@/hooks/queries/use-explore-queries";
import { useAppSettings } from "@/contexts/app-settings-context";
import { useThemePreference } from "@/contexts/theme-preference-context";
import {
  FontFamily,
  FontSize,
  SemanticColors,
  Spacing,
} from "@/styles/ui-theme";

import { CategoryFilter, type Category } from "./CategoryFilter";
import { EventCard } from "./EventCard";
import { SearchBar } from "./SearchBar";
import { useSearchInput } from "@/hooks/explore/use-search-input";

type EventsTabProps = {
  showFilter: boolean;
};

export function EventsTab({ showFilter }: EventsTabProps) {
  const { t } = useAppSettings();
  const { colors } = useThemePreference();
  const { search, searchError, handleSearch } = useSearchInput();
  const categories: Category[] = [
    { id: "all", label: t("common.all") },
    { id: "نادي البرمجة", label: t("explore.category.programmingClub") },
    { id: "نادي الروبوتات", label: t("explore.category.roboticsClub") },
    { id: "نادي ريادة الأعمال", label: t("explore.category.entrepreneurship") },
  ];
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { data: items = [], isLoading, error } = useEventsQuery();
  const openEventDetails = (id: string) => {
    router.push({ pathname: "/event/[id]", params: { id } });
  };

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
        <EventCard data={item} onPress={() => openEventDetails(item.id)} />
      )}
      ListHeaderComponent={
        <View>
          <SearchBar
            placeholder={t("explore.searchEvents")}
            value={search}
            onChangeText={handleSearch}
            error={searchError}
          />
          {showFilter ? (
            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
              accentColor={SemanticColors.violet}
              accentBg={`${SemanticColors.violet}12`}
              icon="calendar-outline"
              title={t("explore.events")}
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
