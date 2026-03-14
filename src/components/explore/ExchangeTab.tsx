import { useState, useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { SemanticColors, Spacing } from "@src/styles/ui-theme";
import { SearchBar } from "./SearchBar";
import { CategoryFilter, Category } from "./CategoryFilter";
import { ExchangeCard, ExchangeCardData } from "./ExchangeCard";

const CATEGORIES: Category[] = [
  { id: "all", label: "الكل" },
  { id: "إلكترونيات", label: "إلكترونيات" },
  { id: "كتب", label: "كتب" },
  { id: "تصميم", label: "تصميم" },
];

const MOCK_EXCHANGE: ExchangeCardData[] = [
  {
    id: "1",
    title: "آلة حاسبة علمية",
    description: "أريد تبادل آلة حاسبة Casio FX-991 بكتاب رياضيات متقدمة.",
    category: "إلكترونيات",
    have: "آلة حاسبة Casio FX-991",
    want: "كتاب رياضيات",
    owner: { name: "يوسف نمر", rating: 4.6, initials: "ي" },
  },
  {
    id: "2",
    title: "كتاب تحليل رياضي",
    description: "معي كتاب تحليل رياضي للسنة الثانية أريد تبادله بكتاب فيزياء.",
    category: "كتب",
    have: "كتاب تحليل رياضي",
    want: "كتاب فيزياء عامة",
    owner: { name: "رنا سالم", rating: 4.3, initials: "ر" },
  },
];
interface ExchangeTabProps {
  showFilter: boolean;
}
export function ExchangeTab({ showFilter }: ExchangeTabProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filtered = useMemo(() => {
    return MOCK_EXCHANGE.filter((item) => {
      const matchSearch =
        search === "" ||
        item.title.includes(search) ||
        item.have.includes(search) ||
        item.want.includes(search);
      const matchCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [search, selectedCategory]);

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
});
