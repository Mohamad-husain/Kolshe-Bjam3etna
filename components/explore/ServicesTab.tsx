import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import { useServicesQuery } from '@/hooks/queries/use-explore-queries';
import {
  Colors,
  FontFamily,
  FontSize,
  SemanticColors,
  Spacing,
} from '@/styles/ui-theme';

import { CategoryFilter, type Category } from './CategoryFilter';
import { SearchBar } from './SearchBar';
import { ServiceCard } from './ServiceCard';

const CATEGORIES: Category[] = [
  { id: 'all', label: 'الكل' },
  { id: 'كتاب', label: 'كتب' },
  { id: 'إلكترونيات', label: 'إلكترونيات' },
  { id: 'تصميم', label: 'تصميم' },
];

type ServicesTabProps = {
  showFilter: boolean;
};

export function ServicesTab({ showFilter }: ServicesTabProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { data: items = [], isLoading, error } = useServicesQuery();

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        search === '' || item.title.includes(search) || item.description.includes(search);
      const matchCategory =
        selectedCategory === 'all' || item.category === selectedCategory;

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
          <SearchBar placeholder="ابحث في خدمات..." value={search} onChangeText={setSearch} />
          {showFilter ? (
            <CategoryFilter
              categories={CATEGORIES}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
              accentColor={SemanticColors.blue}
              accentBg={`${SemanticColors.blue}12`}
              icon="briefcase-outline"
              title="خدمات"
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    color: Colors.mutedForeground,
  },
});
