import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemePreference } from '@/contexts/theme-preference-context';
import { usePartnerOffersQuery } from '@/hooks/queries/use-explore-queries';
import type { PartnerOffer } from '@/services/partner-offers-api';
import {
  Colors,
  Dimensions,
  FontFamily,
  FontSize,
  FontWeight,
  SemanticColors,
  Spacing,
} from '@/styles/ui-theme';

type FilterType = 'all' | 'academy' | 'store';

const FILTERS: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'academy', label: 'أكاديميات' },
  { id: 'store', label: 'متاجر' },
];

function getOfferPalette(type: PartnerOffer['type']) {
  return type === 'academy'
    ? {
      color: SemanticColors.violet,
      secondColor: Colors.primary,
      icon: 'ribbon-outline' as const,
      label: 'أكاديمية',
      gradient: ['rgba(175,82,222,0.22)', 'rgba(37,99,235,0.14)'] as const,
    }
    : {
      color: SemanticColors.orange,
      secondColor: SemanticColors.red,
      icon: 'business-outline' as const,
      label: 'متجر',
      gradient: ['rgba(255,149,0,0.22)', 'rgba(255,59,48,0.12)'] as const,
    };
}

export default function SponsoredListingsRoute() {
  const insets = useSafeAreaInsets();
  const { colors, effectiveTheme } = useThemePreference();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const offersQuery = usePartnerOffersQuery();
  const offers = offersQuery.data;

  const filteredListings = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();

    return (offers ?? []).filter((item) => {
      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search) ||
        item.offerTitle.toLowerCase().includes(search) ||
        item.category.toLowerCase().includes(search);
      const matchesType = filterType === 'all' || item.type === filterType;

      return matchesSearch && matchesType;
    });
  }, [filterType, offers, searchQuery]);

  const openDetails = (item: PartnerOffer) => {
    router.push({ pathname: '/sponsored/[id]', params: { id: item.id } });
  };

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar style={effectiveTheme === 'dark' ? 'light' : 'dark'} />
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Pressable onPress={goBack} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
          <Text style={[styles.backText, { color: colors.primary }]}>الرجوع</Text>
        </Pressable>

        <View style={styles.headerTitleRow}>
          <View style={[styles.filterIcon, { backgroundColor: colors.secondary }]}>
            <Ionicons name="options-outline" size={16} color={colors.mutedForeground} />
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>الشركاء والعروض</Text>
          <View style={styles.headerSideSpacer} />
        </View>
      </View>

      <View style={[styles.searchWrap, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="ابحث عن الأكاديميات والمتاجر..."
            placeholderTextColor={`${colors.mutedForeground}AA`}
            style={[styles.searchInput, { color: colors.foreground }]}
            textAlign="right"
          />
          <Ionicons name="search-outline" size={17} color={`${colors.mutedForeground}80`} />
        </View>
      </View>

      <View style={[styles.filters, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        {FILTERS.map((filter) => {
          const active = filterType === filter.id;

          return (
            <Pressable
              key={filter.id}
              onPress={() => setFilterType(filter.id)}
              style={({ pressed }) => [
                styles.filterButton,
                { backgroundColor: active ? colors.primary : colors.secondary },
                active && styles.filterButtonActive,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.filterText, { color: active ? '#fff' : colors.mutedForeground }]}>
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {offersQuery.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : offersQuery.isError ? (
        <View style={styles.center}>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>تعذر تحميل العروض</Text>
          <Pressable
            style={({ pressed }) => [
              styles.retryButton,
              { backgroundColor: colors.primary },
              pressed && styles.pressed,
            ]}
            onPress={() => offersQuery.refetch()}
          >
            <Text style={styles.retryText}>إعادة المحاولة</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filteredListings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <SponsoredListingCard item={item} onPress={() => openDetails(item)} />}
          ListEmptyComponent={<EmptyState />}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 28 }]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

function SponsoredListingCard({ item, onPress }: { item: PartnerOffer; onPress: () => void }) {
  const { colors } = useThemePreference();
  const palette = getOfferPalette(item.type);
  const hasDiscount = typeof item.discount === 'number' && item.discount > 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && styles.cardPressed,
      ]}
    >
      <LinearGradient colors={palette.gradient} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} style={styles.cardHero}>
        {hasDiscount ? (
          <View style={styles.discountBadge}>
            <Ionicons name="pricetag-outline" size={12} color="#fff" />
            <Text style={styles.discountText}>خصم {item.discount}%</Text>
          </View>
        ) : null}

        <View style={[styles.typeBadge, { backgroundColor: colors.card }]}>
          <Ionicons name={palette.icon} size={13} color={palette.color} />
          <Text style={[styles.typeText, { color: colors.foreground }]}>{palette.label}</Text>
        </View>

        {item.category ? (
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        ) : null}
      </LinearGradient>

      <View style={styles.cardBody}>
        <View style={styles.nameRow}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={SemanticColors.orange} />
            <Text style={[styles.ratingText, { color: colors.foreground }]}>{item.rating ?? 0}</Text>
            <Text style={[styles.reviewsText, { color: `${colors.mutedForeground}AA` }]}>({item.reviews ?? 0})</Text>
          </View>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>{item.name}</Text>
        </View>

        <Text style={[styles.offerTitle, { color: palette.color }]} numberOfLines={1}>
          {item.offerTitle}
        </Text>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={13} color={colors.mutedForeground} />
          <Text style={[styles.locationText, { color: colors.mutedForeground }]} numberOfLines={1}>
            {item.location ?? 'غير محدد'}
          </Text>
        </View>

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <View style={styles.expiryRow}>
            <Ionicons name="time-outline" size={13} color={`${palette.color}BB`} />
            <Text style={[styles.expiryText, { color: `${palette.color}CC` }]}>
              ينتهي {item.expiryDate ?? 'غير محدد'}
            </Text>
          </View>
          <View style={[styles.moreButton, { backgroundColor: `${palette.color}12` }]}>
            <Text style={[styles.moreText, { color: palette.color }]}>اعرف المزيد</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function EmptyState() {
  const { colors } = useThemePreference();

  return (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
        <Ionicons name="flash-outline" size={34} color={`${colors.mutedForeground}66`} />
      </View>
      <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>لا توجد عروض متطابقة</Text>
    </View>
  );
}

const cardShadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.07,
  shadowRadius: 16,
  elevation: 4,
} as const;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: 8,
    paddingBottom: Spacing.md,
    backgroundColor: 'rgba(242,242,247,0.96)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  backButton: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    minHeight: 34,
  },
  backText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  headerTitleRow: {
    marginTop: 4,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
  },
  title: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.foreground,
    textAlign: 'center',
  },
  headerSideSpacer: { width: 38 },
  searchWrap: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  searchBox: {
    minHeight: 50,
    borderRadius: 18,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    color: Colors.foreground,
  },
  filters: {
    flexDirection: 'row-reverse',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  filterButton: {
    minHeight: 36,
    borderRadius: Dimensions.radiusFull,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    ...cardShadow,
  },
  filterText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.mutedForeground,
  },
  filterTextActive: { color: '#fff' },
  list: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  card: {
    marginBottom: Spacing.md,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: Colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    ...cardShadow,
  },
  cardPressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
  cardHero: {
    height: 96,
    overflow: 'hidden',
  },
  discountBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    borderRadius: Dimensions.radiusFull,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    backgroundColor: SemanticColors.red,
  },
  discountText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
  typeBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    borderRadius: Dimensions.radiusFull,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.84)',
  },
  typeText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.foreground,
  },
  categoryPill: {
    position: 'absolute',
    bottom: Spacing.sm,
    alignSelf: 'center',
    borderRadius: Dimensions.radiusFull,
    paddingHorizontal: Spacing.md,
    paddingVertical: 3,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  categoryText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: 'rgba(28,28,30,0.78)',
  },
  cardBody: { padding: Spacing.md },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x13,
    fontWeight: FontWeight.bold,
    color: Colors.foreground,
  },
  reviewsText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xs,
    color: `${Colors.mutedForeground}AA`,
  },
  name: {
    flex: 1,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.foreground,
    textAlign: 'right',
  },
  offerTitle: {
    marginBottom: Spacing.xs,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    textAlign: 'right',
  },
  locationRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 5,
    marginBottom: Spacing.sm,
  },
  locationText: {
    flex: 1,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    color: Colors.mutedForeground,
    textAlign: 'right',
  },
  footer: {
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  expiryRow: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  expiryText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    textAlign: 'right',
  },
  moreButton: {
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
  },
  moreText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.bold,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  retryButton: {
    marginTop: Spacing.md,
    borderRadius: Dimensions.radiusButton,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primary,
  },
  retryText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 72,
    gap: Spacing.sm,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
  },
  emptyText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.mutedForeground,
    textAlign: 'center',
  },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
});
