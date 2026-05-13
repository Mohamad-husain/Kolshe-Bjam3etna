import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  Colors,
  Dimensions,
  FontFamily,
  FontSize,
  FontWeight,
} from '@/styles/ui-theme';

import {
  type ServiceRequestCategoryOption,
} from './shared';
import { ServiceRequestSectionHeader } from './service-request-section-header';

type Props = {
  title: string;
  description: string;
  deadline: string;
  budgetLabel: string;
  selectedCategory: ServiceRequestCategoryOption | null;
  canSubmit: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
};

export function ServiceRequestReviewStep({
  title,
  description,
  deadline,
  budgetLabel,
  selectedCategory,
  canSubmit,
  isSubmitting,
  onSubmit,
}: Props) {
  return (
    <View style={styles.card}>
      <ServiceRequestSectionHeader
        step={3}
        title="المراجعة والنشر"
        subtitle="راجع طلبك ثم انشره"
      />

      <View style={styles.previewCard}>
        <View style={styles.previewTop}>
          <View
            style={[
              styles.previewBadge,
              selectedCategory && { backgroundColor: `${selectedCategory.color}12` },
            ]}
          >
            <Text
              style={[
                styles.previewBadgeText,
                { color: selectedCategory?.color ?? Colors.primary },
              ]}
            >
              {selectedCategory?.label ?? '—'}
            </Text>
          </View>
          <Text style={styles.previewLabel}>معاينة الطلب</Text>
        </View>

        <Text style={styles.previewTitle}>{title.trim() || 'عنوان الطلب سيظهر هنا'}</Text>
        <Text style={styles.previewDesc} numberOfLines={2}>
          {description.trim() || 'وصف الطلب سيظهر هنا...'}
        </Text>

        <View style={styles.previewFooter}>
          <View style={styles.previewInfo}>
            <Ionicons name="calendar-outline" size={13} color={Colors.mutedForeground} />
            <Text style={styles.previewInfoText}>{deadline || '—'}</Text>
          </View>

          <View style={[styles.previewInfo, styles.previewInfoPrimary]}>
            <Ionicons name="cash-outline" size={13} color={Colors.primary} />
            <Text style={styles.previewInfoPrimaryText}>{budgetLabel}</Text>
          </View>
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
            <Ionicons name="cloud-upload-outline" size={18} color="#ffffff" />
          )}
          <Text style={[styles.primaryText, !canSubmit && styles.primaryTextDisabled]}>
            {isSubmitting ? 'جارٍ النشر...' : 'نشر الطلب'}
          </Text>
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
    padding: 18,
    gap: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 2,
  },
  previewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  previewBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Dimensions.radiusFull,
    backgroundColor: 'rgba(37,99,235,0.08)',
  },
  previewBadgeText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.bold,
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
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: Dimensions.radiusFull,
    backgroundColor: Colors.secondary,
  },
  previewInfoPrimary: { backgroundColor: 'rgba(37,99,235,0.08)' },
  previewInfoText: {
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.medium,
  },
  previewInfoPrimaryText: {
    color: Colors.primary,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.bold,
  },
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  flexButton: { flex: 1 },
  primaryButton: {
    minHeight: 56,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.primary,
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
