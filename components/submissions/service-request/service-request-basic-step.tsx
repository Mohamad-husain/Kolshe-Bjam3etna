import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  Colors,
  FontFamily,
  FontSize,
  FontWeight,
  SemanticColors,
} from '@/styles/ui-theme';

import {
  SERVICE_REQUEST_CATEGORIES,
  type ServiceRequestCategoryOption,
} from './shared';
import { ServiceRequestSectionHeader } from './service-request-section-header';

type Props = {
  title: string;
  titleError: string;
  selectedCategoryId: number | null;
  canProceed: boolean;
  onTitleChange: (value: string) => void;
  onCategoryChange: (categoryId: number | null) => void;
  onNext: () => void;
};

function getCategoryButtonStyle(
  active: boolean,
  category: ServiceRequestCategoryOption,
) {
  if (!active) {
    return null;
  }

  return {
    borderColor: `${category.color}45`,
    shadowColor: category.color,
    shadowOpacity: 0.1 as const,
  };
}

export function ServiceRequestBasicStep({
  title,
  titleError,
  selectedCategoryId,
  canProceed,
  onTitleChange,
  onCategoryChange,
  onNext,
}: Props) {
  return (
    <View style={styles.card}>
      <ServiceRequestSectionHeader
        step={1}
        title="المعلومات الأساسية"
        subtitle="العنوان والتصنيف"
      />

      <View style={styles.fieldBlock}>
        <View style={styles.fieldTopRow}>
          <Text style={styles.counter}>{title.length}/80</Text>
          <View style={styles.labelRow}>
            <Ionicons name="pricetag-outline" size={14} color={Colors.primary} />
            <Text style={styles.fieldLabel}>عنوان الطلب</Text>
          </View>
        </View>
        <View style={[styles.fieldRow, titleError ? styles.fieldRowError : null]}>
          <TextInput
            value={title}
            onChangeText={onTitleChange}
            maxLength={80}
            placeholder="مثال: مطلوب مدرس تفاضل وتكامل"
            placeholderTextColor="rgba(142,142,147,0.65)"
            style={styles.input}
            textAlign="right"
          />
          <Ionicons name="search-outline" size={18} color={Colors.mutedForeground} />
        </View>
        {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}
      </View>

      <View style={styles.fieldBlock}>
        <View style={styles.labelRow}>
          <Ionicons name="grid-outline" size={14} color={Colors.primary} />
          <Text style={styles.fieldLabel}>التصنيف</Text>
        </View>

        <View style={styles.grid}>
          {SERVICE_REQUEST_CATEGORIES.map((item) => {
            const active = selectedCategoryId === item.id;

            return (
              <Pressable
                key={item.id}
                onPress={() => onCategoryChange(active ? null : item.id)}
                style={({ pressed }) => [
                  styles.categoryButton,
                  getCategoryButtonStyle(active, item),
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.categoryIcon,
                    active && { backgroundColor: `${item.color}12` },
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={22}
                    color={active ? item.color : Colors.mutedForeground}
                  />
                </View>
                <Text style={[styles.categoryText, active && { color: item.color }]}>
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
          !canProceed && styles.primaryButtonDisabled,
          pressed && canProceed && styles.pressed,
        ]}
      >
        <Ionicons
          name="arrow-back"
          size={18}
          color={canProceed ? '#ffffff' : Colors.mutedForeground}
        />
        <Text style={[styles.primaryText, !canProceed && styles.primaryTextDisabled]}>
          التالي
        </Text>
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
  fieldRowError: {
    borderColor: 'rgba(255,59,48,0.38)',
    borderWidth: 1.4,
  },
  input: {
    flex: 1,
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  errorText: {
    color: SemanticColors.red,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.medium,
    textAlign: 'right',
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
