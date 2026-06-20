import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useThemePreference } from '@/contexts/theme-preference-context';
import type { ProductAdPhotoInput } from '@/services/marketplace-api';
import {
  Colors,
  FontFamily,
  FontSize,
  FontWeight,
} from '@/styles/ui-theme';

import { ProductAdSectionHeader } from './product-ad-section-header';
import {
  PRODUCT_AD_ACCENT,
  PRODUCT_AD_CATEGORIES,
  PRODUCT_AD_MAX_PHOTOS,
  type ProductAdCategoryOption,
} from './shared';

type Props = {
  title: string;
  selectedCategoryId: number | null;
  photos: ProductAdPhotoInput[];
  canProceed: boolean;
  onTitleChange: (value: string) => void;
  onCategoryChange: (categoryId: number | null) => void;
  onPickPhotos: () => void;
  onRemovePhoto: (index: number) => void;
  onNext: () => void;
};

function getCategoryButtonStyle(active: boolean, category: ProductAdCategoryOption) {
  if (!active) {
    return null;
  }

  return {
    backgroundColor: `${category.color}10`,
    borderColor: `${category.color}45`,
    shadowColor: category.color,
    shadowOpacity: 0.1,
  };
}

export function ProductAdBasicStep({
  title,
  selectedCategoryId,
  photos,
  canProceed,
  onTitleChange,
  onCategoryChange,
  onPickPhotos,
  onRemovePhoto,
  onNext,
}: Props) {
  const { colors } = useThemePreference();

  return (
    <View style={styles.card}>
      <ProductAdSectionHeader step={1} title="معلومات المنتج" subtitle="الصور، العنوان، والتصنيف" />

      <Pressable
        onPress={onPickPhotos}
        style={({ pressed }) => [
          styles.uploadCard,
          { backgroundColor: colors.card, borderColor: `${PRODUCT_AD_ACCENT}55` },
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
                      onPress={() => onRemovePhoto(index)}
                      style={styles.photoRemoveButton}
                    >
                      <Ionicons name="close" size={14} color={PRODUCT_AD_ACCENT} />
                    </Pressable>
                  </View>
                  <Text numberOfLines={1} style={styles.photoFilename}>
                    {photo.name}
                  </Text>
                </View>
              ))}
            </View>
            <Text style={[styles.photoCounter, { color: colors.mutedForeground }]}>
              {photos.length}/{PRODUCT_AD_MAX_PHOTOS} صور مرفقة
            </Text>
          </>
        ) : (
          <>
            <View style={styles.uploadIcon}>
              <Ionicons name="image-outline" size={25} color={PRODUCT_AD_ACCENT} />
            </View>
            <View>
              <Text style={[styles.uploadTitle, { color: colors.foreground }]}>أضف صور المنتج</Text>
              <Text style={[styles.uploadHint, { color: colors.mutedForeground }]}>PNG, JPG - حتى {PRODUCT_AD_MAX_PHOTOS} صور</Text>
            </View>
          </>
        )}
      </Pressable>

      <View style={styles.fieldBlock}>
        <View style={styles.fieldTopRow}>
          <Text style={[styles.counter, { color: colors.mutedForeground }]}>{title.length}/60</Text>
          <View style={styles.labelRow}>
            <Ionicons name="pricetag-outline" size={14} color={PRODUCT_AD_ACCENT} />
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>عنوان الإعلان</Text>
          </View>
        </View>
        <View style={[styles.fieldRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            value={title}
            onChangeText={onTitleChange}
            maxLength={60}
            placeholder="مثال: كتاب تفاضل وتكامل - الطبعة العاشرة"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground }]}
            textAlign="right"
          />
          <Ionicons name="document-text-outline" size={18} color={colors.mutedForeground} />
        </View>
      </View>

      <View style={styles.fieldBlock}>
        <View style={styles.labelRow}>
          <Ionicons name="grid-outline" size={14} color={PRODUCT_AD_ACCENT} />
          <Text style={[styles.fieldLabel, { color: colors.foreground }]}>التصنيف</Text>
        </View>

        <View style={styles.grid}>
          {PRODUCT_AD_CATEGORIES.map((item) => {
            const active = selectedCategoryId === item.id;

            return (
              <Pressable
                key={item.id}
                onPress={() => onCategoryChange(active ? null : item.id)}
                style={({ pressed }) => [
                  styles.categoryButton,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  getCategoryButtonStyle(active, item),
                  pressed && styles.pressed,
                ]}
              >
                <View style={[styles.categoryIcon, { backgroundColor: colors.secondary }, active && { backgroundColor: `${item.color}12` }]}>
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
  card: {
    backgroundColor: 'transparent',
    paddingHorizontal: 2,
    gap: 18,
  },
  uploadCard: {
    minHeight: 156,
    borderRadius: 28,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,149,0,0.25)',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  uploadIcon: {
    width: 54,
    height: 54,
    borderRadius: 19,
    backgroundColor: 'rgba(255,149,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTitle: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
  },
  uploadHint: {
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
    marginTop: 1,
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
    borderColor: 'rgba(255,149,0,0.18)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  photoFilename: {
    maxWidth: 78,
    color: PRODUCT_AD_ACCENT,
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
  fieldBlock: { gap: 10 },
  fieldTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  labelRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  fieldLabel: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: 15,
    fontWeight: FontWeight.semibold,
    textAlign: 'right',
  },
  counter: {
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.medium,
  },
  fieldRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.06)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 14,
    elevation: 2,
  },
  input: {
    flex: 1,
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  grid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  categoryButton: {
    width: '31.2%',
    minHeight: 112,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.06)',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 15,
    marginBottom: 12,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(120,120,128,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    marginTop: 12,
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: 12,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
    lineHeight: 18,
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: 20,
    backgroundColor: PRODUCT_AD_ACCENT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: PRODUCT_AD_ACCENT,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 4,
  },
  primaryButtonDisabled: { backgroundColor: '#e7e8ef', shadowOpacity: 0, elevation: 0 },
  primaryText: {
    color: '#ffffff',
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
  },
  primaryTextDisabled: { color: Colors.mutedForeground },
  pressed: { transform: [{ scale: 0.98 }] },
});
