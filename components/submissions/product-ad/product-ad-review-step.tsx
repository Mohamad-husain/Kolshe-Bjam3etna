import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { ProductAdPhotoInput } from '@/services/marketplace-api';
import {
  Colors,
  Dimensions,
  FontFamily,
  FontSize,
  FontWeight,
} from '@/styles/ui-theme';

import { ProductAdSectionHeader } from './product-ad-section-header';
import {
  PRODUCT_AD_ACCENT,
  type ProductAdCategoryOption,
  type ProductAdConditionOption,
} from './shared';

type Props = {
  title: string;
  description: string;
  priceLabel: string;
  selectedCategory: ProductAdCategoryOption | null;
  selectedCondition: ProductAdConditionOption | null;
  photos: ProductAdPhotoInput[];
  canSubmit: boolean;
  isSubmitting: boolean;
  onPrevious: () => void;
  onSubmit: () => void;
};

export function ProductAdReviewStep({
  title,
  description,
  priceLabel,
  selectedCategory,
  selectedCondition,
  photos,
  canSubmit,
  isSubmitting,
  onPrevious,
  onSubmit,
}: Props) {
  const coverPhoto = photos[0] ?? null;

  return (
    <View style={styles.card}>
      <ProductAdSectionHeader step={3} title="مراجعة ونشر" subtitle="تحقق من البيانات قبل النشر" />

      <View style={styles.previewCard}>
        <View style={styles.previewStripe} />
        {coverPhoto ? <Image source={{ uri: coverPhoto.uri }} style={styles.previewMedia} /> : null}

        <View style={styles.previewBody}>
          <View style={styles.previewTop}>
            <View style={styles.previewBadges}>
              {selectedCondition ? (
                <View style={styles.previewBadge}>
                  <Text style={styles.previewBadgeText}>{selectedCondition.label}</Text>
                </View>
              ) : null}

              {selectedCategory ? (
                <View style={[styles.previewBadge, styles.previewBadgeMuted]}>
                  <Text style={[styles.previewBadgeText, styles.previewBadgeMutedText]}>
                    {selectedCategory.label}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.previewLabel}>معاينة الإعلان</Text>
          </View>

          <Text style={styles.previewTitle}>{title.trim() || 'عنوان الإعلان'}</Text>
          <Text style={styles.previewDesc} numberOfLines={3}>
            {description.trim() || 'وصف المنتج سيظهر هنا...'}
          </Text>

          <View style={styles.previewFooter}>
            <View style={styles.previewInfo}>
              <Ionicons name="person-outline" size={13} color={Colors.mutedForeground} />
              <Text style={styles.previewInfoText}>أنت</Text>
            </View>

            <View style={[styles.previewInfo, styles.previewInfoPrimary]}>
              <Ionicons name="cash-outline" size={13} color={PRODUCT_AD_ACCENT} />
              <Text style={styles.previewInfoPrimaryText}>{priceLabel}</Text>
            </View>
          </View>

          {photos.length > 0 ? (
            <View style={styles.previewInfo}>
              <Ionicons name="images-outline" size={13} color={Colors.mutedForeground} />
              <Text style={styles.previewInfoText}>{photos.length} صورة مرفقة</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          onPress={onSubmit}
          disabled={!canSubmit}
          style={({ pressed }) => [
            styles.primaryButton,
            styles.flexButton,
            !canSubmit && styles.primaryButtonDisabled,
            pressed && canSubmit && styles.pressed,
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Ionicons
              name="cloud-upload-outline"
              size={18}
              color={canSubmit ? '#ffffff' : Colors.mutedForeground}
            />
          )}
          <Text style={[styles.primaryText, !canSubmit && styles.primaryTextDisabled]}>
            {isSubmitting ? 'جارٍ النشر...' : 'نشر الإعلان الآن'}
          </Text>
        </Pressable>

        <Pressable onPress={onPrevious} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
          <Ionicons name="chevron-forward" size={20} color={Colors.foreground} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'transparent',
    paddingHorizontal: 2,
    gap: 18,
  },
  previewCard: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.06)',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 2,
  },
  previewStripe: {
    height: 6,
    backgroundColor: PRODUCT_AD_ACCENT,
  },
  previewMedia: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: Colors.secondary,
  },
  previewBody: {
    padding: 18,
    gap: 12,
  },
  previewTop: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewBadges: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  previewBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Dimensions.radiusFull,
    backgroundColor: 'rgba(255,149,0,0.1)',
  },
  previewBadgeMuted: {
    backgroundColor: Colors.secondary,
  },
  previewBadgeText: {
    color: PRODUCT_AD_ACCENT,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.bold,
  },
  previewBadgeMutedText: {
    color: Colors.foreground,
  },
  previewLabel: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  previewTitle: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.base,
    fontWeight: FontWeight.extrabold,
    textAlign: 'right',
  },
  previewDesc: {
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    textAlign: 'right',
    lineHeight: 22,
  },
  previewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(60,60,67,0.12)',
  },
  previewInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: Dimensions.radiusFull,
    backgroundColor: Colors.secondary,
  },
  previewInfoPrimary: { backgroundColor: 'rgba(255,149,0,0.1)' },
  previewInfoText: {
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.medium,
  },
  previewInfoPrimaryText: {
    color: PRODUCT_AD_ACCENT,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.bold,
  },
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  flexButton: { flex: 1 },
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
  secondaryButton: {
    width: 56,
    minHeight: 56,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.06)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 14,
    elevation: 2,
  },
  pressed: { transform: [{ scale: 0.98 }] },
});
