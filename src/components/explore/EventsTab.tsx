import { useState, useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { SemanticColors, Spacing } from "@src/styles/ui-theme";
import { SearchBar } from "./SearchBar";
import { CategoryFilter, Category } from "./CategoryFilter";
import { EventCard, EventCardData } from "./EventCard";

const CATEGORIES: Category[] = [
  { id: "all", label: "الكل" },
  { id: "نادي البرمجة", label: "نادي البرمجة" },
  { id: "نادي الروبوتات", label: "نادي الروبوتات" },
  { id: "نادي ريادة الأعمال", label: "ريادة الأعمال" },
];

const MOCK_EVENTS: EventCardData[] = [
  {
    id: "1",
    title: "ورشة عمل البرمجة بالبايثون",
    description:
      "ورشة تفاعلية لتعلم أساسيات البايثون وتطبيقاتها في الذكاء الاصطناعي.",
    club: "نادي البرمجة",
    date: "28 فبراير 2026",
    time: "10:00 - 12:00 صباحاً",
    location: "قاعة الحاسوب - كلية الهندسة",
    registeredCount: 45,
    maxCount: 60,
  },
  {
    id: "2",
    title: "معرض مشاريع الروبوتات",
    description:
      "معرض سنوي لعرض مشاريع نادي الروبوتات أمام الطلاب وأعضاء الهيئة التدريسية.",
    club: "نادي الروبوتات",
    date: "5 مارس 2026",
    time: "09:00 - 02:00 مساءً",
    location: "القاعة الرئيسية",
    registeredCount: 60,
    maxCount: 60,
  },
];
interface EventsTabProps {
  showFilter: boolean;
}
export function EventsTab({ showFilter }: EventsTabProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filtered = useMemo(() => {
    return MOCK_EVENTS.filter((item) => {
      const matchSearch =
        search === "" ||
        item.title.includes(search) ||
        item.club.includes(search);
      const matchCategory =
        selectedCategory === "all" || item.club === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [search, selectedCategory]);

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
});
