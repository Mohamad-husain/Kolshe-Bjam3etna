import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import type { SwapAdPhotoInput } from '@/services/swap-api';
import {
  Colors,
  Dimensions,
  FontFamily,
  FontSize,
  FontWeight,
  SemanticColors,
} from '@/styles/ui-theme';

import { ExchangeSectionHeader } from './exchange-section-header';
import {
  EXCHANGE_ACCENT,
  EXCHANGE_ACCENT_DARK,
  EXCHANGE_DESCRIPTION_MIN_LENGTH,
  EXCHANGE_TITLE_MIN_LENGTH,
  type ExchangeCategoryOption,
  type ExchangeConditionOption,
} from './exchange-options';

type Props = {
  offerTitle: string;
  wantedTitle: string;
  description: string;
  selectedCategory: ExchangeCategoryOption | null;
  selectedCondition: ExchangeConditionOption | null;
  photos: SwapAdPhotoInput[];
  canSubmit: boolean;
  isSubmitting: boolean;
  onPrevious: () => void;
  onSubmit: () => void;
};

export function ExchangeReviewStep({
  offerTitle,
  wantedTitle,
  description,
  selectedCategory,
  selectedCondition,
  photos,
  canSubmit,
  isSubmitting,
  onPrevious,
  onSubmit,
}: Props) {
  const checklist = [
    { label: 'ما لديك', done: offerTitle.trim().length >= EXCHANGE_TITLE_MIN_LENGTH },
    { label: 'ما تريده', done: wantedTitle.trim().length >= EXCHANGE_TITLE_MIN_LENGTH },
    { label: 'التصنيف', done: Boolean(selectedCategory) },
    { label: 'الحالة', done: Boolean(selectedCondition) },
    { label: 'الوصف', done: description.trim().length >= EXCHANGE_DESCRIPTION_MIN_LENGTH },
  ];

  return (
    <View style={styles.wrap}>
      <ExchangeSectionHeader step={3} title="مراجعة ونشر" subtitle="تحقق من بيانات التبادل" />

      <View style={styles.previewCard}>
        <View style={styles.accentLine} />

        <View style={styles.exchangeRow}>
          <View style={styles.exchangeBox}>
            <Text style={styles.exchangeLabel}>لدي</Text>
            <Text style={styles.exchangeValue} numberOfLines={2}>
              {offerTitle || '-'}
            </Text>
          </View>

          <View style={styles.swapIcon}>
            <Ionicons name="swap-horizontal" size={18} color={EXCHANGE_ACCENT_DARK} />
          </View>

          <View style={styles.exchangeBox}>
            <Text style={styles.exchangeLabel}>أريد</Text>
            <Text style={styles.exchangeValue} numberOfLines={2}>
              {wantedTitle || '-'}
            </Text>
          </View>
        </View>

        <View style={styles.tagsRow}>
          {selectedCondition ? (
            <View style={styles.primaryTag}>
              <Text style={styles.primaryTagText}>{selectedCondition.label}</Text>
            </View>
          ) : null}

          {selectedCategory ? (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{selectedCategory.label}</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.description} numberOfLines={4}>
          {description || 'لا يوجد وصف'}
        </Text>

        {photos.length > 0 ? (
          <View style={styles.photoInfo}>
            <Text style={styles.photoInfoText}>{photos.length} صورة</Text>
            <Ionicons name="image-outline" size={15} color={Colors.mutedForeground} />
          </View>
        ) : null}
      </View>

      <View style={styles.checkCard}>
        <Text style={styles.checkTitle}>التحقق من البيانات</Text>

        {checklist.map((item) => (
          <View key={item.label} style={styles.checkRow}>
            <Text style={styles.checkText}>{item.label}</Text>
            <View style={[styles.checkIcon, item.done && styles.checkIconDone]}>
              {item.done ? <Ionicons name="checkmark" size={12} color={SemanticColors.green} /> : null}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          onPress={onSubmit}
          disabled={!canSubmit || isSubmitting}
          style={({ pressed }) => [
            styles.primaryButton,
            styles.flexButton,
            (!canSubmit || isSubmitting) && styles.primaryButtonDisabled,
            pressed && canSubmit && !isSubmitting && styles.pressed,
          ]}
        >
          {isSubmitting ? <ActivityIndicator color="#ffffff" size="small" /> : null}
          <Text style={[styles.primaryText, (!canSubmit || isSubmitting) && styles.primaryTextDisabled]}>
            {isSubmitting ? 'جاري النشر...' : 'نشر التبادل الآن'}
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
  wrap: {
    paddingHorizontal: 2,
    gap: 18,
  },
  previewCard: {
    overflow: 'hidden',
    borderRadius: 28,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.06)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.07,
    shadowRadius: 22,
    elevation: 3,
  },
  accentLine: {
    height: 5,
    backgroundColor: EXCHANGE_ACCENT,
  },
  exchangeRow: {
    margin: 16,
    marginBottom: 12,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
  },
  exchangeBox: {
    flex: 1,
    minHeight: 78,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    backgroundColor: 'rgba(90,200,250,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(90,200,250,0.2)',
  },
  exchangeLabel: {
    color: EXCHANGE_ACCENT_DARK,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.bold,
  },
  exchangeValue: {
    marginTop: 2,
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.extrabold,
    textAlign: 'center',
  },
  swapIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(90,200,250,0.14)',
  },
  tagsRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },
  tag: {
    borderRadius: Dimensions.radiusFull,
    paddingHorizontal: 11,
    paddingVertical: 5,
    backgroundColor: Colors.secondary,
  },
  tagText: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.semibold,
  },
  primaryTag: {
    borderRadius: Dimensions.radiusFull,
    paddingHorizontal: 11,
    paddingVertical: 5,
    backgroundColor: 'rgba(90,200,250,0.12)',
  },
  primaryTagText: {
    color: EXCHANGE_ACCENT_DARK,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.bold,
  },
  description: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    lineHeight: 22,
    textAlign: 'right',
  },
  photoInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 5,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 16,
  },
  photoInfoText: {
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.medium,
  },
  checkCard: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.06)',
    padding: 16,
    gap: 8,
  },
  checkTitle: {
    marginBottom: 2,
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    textAlign: 'right',
  },
  checkRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
  },
  checkText: {
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  checkIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
  },
  checkIconDone: {
    backgroundColor: 'rgba(52,199,89,0.15)',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  flexButton: {
    flex: 1,
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
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
