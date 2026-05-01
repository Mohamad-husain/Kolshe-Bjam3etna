import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { Colors } from '@/styles/ui-theme';

import {
  serviceRequestStyles as styles,
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
