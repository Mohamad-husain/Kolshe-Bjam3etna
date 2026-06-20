import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useThemePreference } from '@/contexts/theme-preference-context';
import type { SwapAdPhotoInput } from '@/services/swap-api';
import {
  Colors,
  FontFamily,
  FontSize,
  FontWeight,
} from '@/styles/ui-theme';

import { ExchangeSectionHeader } from './exchange-section-header';
import {
  EXCHANGE_ACCENT,
  EXCHANGE_ACCENT_DARK,
  EXCHANGE_CATEGORIES,
  EXCHANGE_MAX_PHOTOS,
  type ExchangeCategoryOption,
} from './exchange-options';

type Props = {
  offerTitle: string;
  wantedTitle: string;
  selectedCategoryId: number | null;
  photos: SwapAdPhotoInput[];
  canProceed: boolean;
  onOfferTitleChange: (value: string) => void;
  onWantedTitleChange: (value: string) => void;
  onCategoryChange: (categoryId: number | null) => void;
  onPickPhotos: () => void;
  onRemovePhoto: (index: number) => void;
  onNext: () => void;
};

function getCategoryStyle(active: boolean, item: ExchangeCategoryOption) {
  if (!active) {
    return null;
  }

  return {
    backgroundColor: `${item.color}12`,
    borderColor: `${item.color}50`,
    shadowColor: item.color,
    shadowOpacity: 0.12,
  };
}

export function ExchangeItemsStep({
  offerTitle,
  wantedTitle,
  selectedCategoryId,
  photos,
  canProceed,
  onOfferTitleChange,
  onWantedTitleChange,
  onCategoryChange,
  onPickPhotos,
  onRemovePhoto,
  onNext,
}: Props) {
  const { colors } = useThemePreference();

  return (
    <View style={styles.wrap}>
      <ExchangeSectionHeader step={1} title="عناصر التبادل" subtitle="ما لديك وما تريده" />

      <View style={[styles.exchangeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.accentLine} />

        <View style={styles.fieldBlock}>
          <View style={styles.labelRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>عرض</Text>
            </View>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>ما لديك</Text>
          </View>

          <View style={[styles.inputRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <TextInput
              value={offerTitle}
              onChangeText={onOfferTitleChange}
              placeholder="مثال: آلة حاسبة علمية"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground }]}
              textAlign="right"
            />
          </View>
        </View>

        <View style={styles.swapWrap}>
          <View style={styles.swapIcon}>
            <Ionicons name="swap-horizontal" size={18} color={EXCHANGE_ACCENT_DARK} />
          </View>
        </View>

        <View style={styles.fieldBlock}>
          <View style={styles.labelRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>طلب</Text>
            </View>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>تبحث عن</Text>
          </View>

          <View style={[styles.inputRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <TextInput
              value={wantedTitle}
              onChangeText={onWantedTitleChange}
              placeholder="مثال: معطف مختبر مقاس L"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground }]}
              textAlign="right"
            />
          </View>
        </View>
      </View>

      <View style={styles.fieldBlock}>
        <View style={styles.labelRow}>
          <Ionicons name="grid-outline" size={14} color={EXCHANGE_ACCENT_DARK} />
          <Text style={[styles.fieldLabel, { color: colors.foreground }]}>تصنيف ما لديك</Text>
        </View>

        <View style={styles.grid}>
          {EXCHANGE_CATEGORIES.map((item) => {
            const active = selectedCategoryId === item.id;

            return (
              <Pressable
                key={item.id}
                onPress={() => onCategoryChange(active ? null : item.id)}
                style={({ pressed }) => [
                  styles.categoryButton,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  getCategoryStyle(active, item),
                  pressed && styles.pressed,
                ]}
              >
                <View style={[styles.categoryIcon, { backgroundColor: colors.secondary }, active && { backgroundColor: `${item.color}18` }]}>
                  <Ionicons
                    name={item.icon}
                    size={22}
                    color={active ? item.color : colors.mutedForeground}
                  />
                </View>
                <Text style={[styles.categoryText, { color: colors.mutedForeground }, active && { color: item.color }]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable
        onPress={onPickPhotos}
        style={({ pressed }) => [
          styles.uploadCard,
          { backgroundColor: colors.card, borderColor: `${EXCHANGE_ACCENT}66` },
          pressed && styles.pressed,
        ]}
      >
        {photos.length > 0 ? (
          <>
            <View style={styles.photoGrid}>
              {photos.map((photo, index) => (
                <View key={`${photo.uri}-${index}`} style={styles.photoItem}>
                  <View style={styles.photoThumb}>
                    <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="إزالة الصورة"
                      onPress={(event) => {
                        event.stopPropagation();
                        onRemovePhoto(index);
                      }}
                      style={styles.photoRemoveButton}
                    >
                      <Ionicons name="close" size={14} color={EXCHANGE_ACCENT_DARK} />
                    </Pressable>
                  </View>
                  <Text numberOfLines={1} style={styles.photoFilename}>
                    {photo.name}
                  </Text>
                </View>
              ))}
            </View>
            <Text style={[styles.photoCounter, { color: colors.mutedForeground }]}>
              {photos.length}/{EXCHANGE_MAX_PHOTOS} صور مرفقة
            </Text>
          </>
        ) : (
          <>
            <View style={styles.uploadIcon}>
              <Ionicons name="image-outline" size={25} color={EXCHANGE_ACCENT_DARK} />
            </View>
            <View>
              <Text style={[styles.uploadTitle, { color: colors.foreground }]}>أضف صوراً لعنصرك</Text>
              <Text style={[styles.uploadHint, { color: colors.mutedForeground }]}>اختياري - حتى {EXCHANGE_MAX_PHOTOS} صور</Text>
            </View>
          </>
        )}
      </Pressable>

      <Pressable
        onPress={onNext}
        disabled={!canProceed}
        style={({ pressed }) => [
          styles.primaryButton,
          !canProceed && [styles.primaryButtonDisabled, { backgroundColor: colors.secondary }],
          pressed && canProceed && styles.pressed,
        ]}
      >
        <Ionicons name="arrow-back" size={18} color={canProceed ? '#ffffff' : colors.mutedForeground} />
        <Text style={[styles.primaryText, !canProceed && { color: colors.mutedForeground }]}>التالي</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 2,
    gap: 18,
  },
  exchangeCard: {
    overflow: 'hidden',
    borderRadius: 28,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.06)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
  },
  accentLine: {
    height: 4,
    backgroundColor: EXCHANGE_ACCENT,
  },
  fieldBlock: {
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  labelRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  fieldLabel: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: 15,
    fontWeight: FontWeight.semibold,
    textAlign: 'right',
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 2,
    backgroundColor: 'rgba(90,200,250,0.12)',
  },
  badgeText: {
    color: EXCHANGE_ACCENT_DARK,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  inputRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(90,200,250,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(90,200,250,0.22)',
  },
  input: {
    flex: 1,
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  swapWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  swapIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(90,200,250,0.14)',
  },
  grid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  categoryButton: {
    width: '31.2%',
    minHeight: 106,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.06)',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 14,
    marginBottom: 12,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: 'rgba(120,120,128,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    marginTop: 10,
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
  },
  uploadCard: {
    minHeight: 148,
    borderRadius: 28,
    borderWidth: 1.6,
    borderStyle: 'dashed',
    borderColor: 'rgba(90,200,250,0.35)',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 12,
  },
  uploadIcon: {
    width: 54,
    height: 54,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(90,200,250,0.12)',
  },
  uploadTitle: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
  },
  uploadHint: {
    marginTop: 1,
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
  photoGrid: {
    width: '100%',
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  photoItem: {
    width: 78,
    gap: 5,
    alignItems: 'center',
  },
  photoThumb: {
    width: 78,
    height: 78,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: Colors.secondary,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoRemoveButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(90,200,250,0.2)',
  },
  photoFilename: {
    maxWidth: 78,
    color: EXCHANGE_ACCENT_DARK,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
  },
  photoCounter: {
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: 20,
    backgroundColor: EXCHANGE_ACCENT_DARK,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: EXCHANGE_ACCENT,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 4,
  },
  primaryButtonDisabled: {
    backgroundColor: '#e7e8ef',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryText: {
    color: '#ffffff',
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
  },
  primaryTextDisabled: {
    color: Colors.mutedForeground,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
