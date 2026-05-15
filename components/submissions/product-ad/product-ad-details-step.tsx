import { Ionicons } from '@expo/vector-icons';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { ProductAdCondition } from '@/services/marketplace-api';
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
  PRODUCT_AD_CONDITIONS,
  PRODUCT_AD_CURRENCY,
  PRODUCT_AD_DESCRIPTION_MIN_LENGTH,
  PRODUCT_AD_PRICE_PRESETS,
} from './shared';

type Props = {
  pricePresetId: string;
  customPrice: string;
  condition: ProductAdCondition | '';
  description: string;
  canProceed: boolean;
  onPricePresetChange: (presetId: string) => void;
  onCustomPriceChange: (value: string) => void;
  onConditionChange: (condition: ProductAdCondition | '') => void;
  onDescriptionChange: (value: string) => void;
  onPrevious: () => void;
  onNext: () => void;
};

export function ProductAdDetailsStep({
  pricePresetId,
  customPrice,
  condition,
  description,
  canProceed,
  onPricePresetChange,
  onCustomPriceChange,
  onConditionChange,
  onDescriptionChange,
  onPrevious,
  onNext,
}: Props) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 86 : 64}
      style={{ flex: 1, width: '100%' }}
    >
      <View style={styles.card}>
        <ProductAdSectionHeader step={2} title="تفاصيل المنتج" subtitle="السعر، الحالة، والوصف" />

        <View style={styles.fieldBlock}>
          <View style={styles.labelRow}>
            <Ionicons name="cash-outline" size={14} color={PRODUCT_AD_ACCENT} />
            <Text style={styles.fieldLabel}>السعر ({PRODUCT_AD_CURRENCY})</Text>
          </View>

          <View style={styles.chipWrap}>
            {PRODUCT_AD_PRICE_PRESETS.map((item) => {
              const active = pricePresetId === item.id;

              return (
                <Pressable
                  key={item.id}
                  onPress={() => onPricePresetChange(active ? '' : item.id)}
                  style={({ pressed }) => [
                    styles.chip,
                    active && styles.chipActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.fieldRow}>
            <TextInput
              value={customPrice}
              onChangeText={onCustomPriceChange}
              keyboardType="decimal-pad"
              placeholder="أو أدخل سعراً مخصصاً..."
              placeholderTextColor="rgba(142,142,147,0.65)"
              style={styles.input}
              textAlign="right"
            />
            <Ionicons name="cash-outline" size={18} color={Colors.mutedForeground} />
          </View>
        </View>

        <View style={styles.fieldBlock}>
          <View style={styles.labelRow}>
            <Ionicons name="sparkles-outline" size={14} color={PRODUCT_AD_ACCENT} />
            <Text style={styles.fieldLabel}>حالة المنتج</Text>
          </View>

          <View style={styles.chipWrap}>
            {PRODUCT_AD_CONDITIONS.map((item) => {
              const active = condition === item.value;

              return (
                <Pressable
                  key={item.value}
                  onPress={() => onConditionChange(active ? '' : item.value)}
                  style={({ pressed }) => [
                    styles.chip,
                    active && styles.chipSoftActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextSoftActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 118 : 88}
          style={styles.fieldBlock}
        >
          <View style={styles.fieldTopRow}>
            <Text
              style={[
                styles.counter,
                description.trim().length >= PRODUCT_AD_DESCRIPTION_MIN_LENGTH && styles.counterActive,
              ]}
            >
              {description.length}/400
            </Text>
            <View style={styles.labelRow}>
              <Ionicons name="reader-outline" size={14} color={PRODUCT_AD_ACCENT} />
              <Text style={styles.fieldLabel}>وصف المنتج</Text>
            </View>
          </View>

          <View style={styles.textareaWrap}>
            <TextInput
              value={description}
              onChangeText={onDescriptionChange}
              maxLength={400}
              multiline
              textAlign="right"
              textAlignVertical="top"
              placeholder="صف المنتج بدقة: الحالة، سبب البيع، وأي ملاحظات مهمة..."
              placeholderTextColor="rgba(142,142,147,0.65)"
              style={styles.textarea}
            />
          </View>
        </KeyboardAvoidingView>

        <View style={styles.actionsRow}>
          <Pressable
            onPress={onNext}
            disabled={!canProceed}
            style={({ pressed }) => [
              styles.primaryButton,
              styles.flexButton,
              !canProceed && styles.primaryButtonDisabled,
              pressed && canProceed && styles.pressed,
            ]}
          >
            <Ionicons name="arrow-back" size={18} color={canProceed ? '#ffffff' : Colors.mutedForeground} />
            <Text style={[styles.primaryText, !canProceed && styles.primaryTextDisabled]}>
              معاينة الإعلان
            </Text>
          </Pressable>

          <Pressable onPress={onPrevious} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
            <Ionicons name="chevron-forward" size={20} color={Colors.foreground} />
          </Pressable>
        </View>
      </View>

    </KeyboardAvoidingView>
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
  counterActive: { color: PRODUCT_AD_ACCENT },
  chipWrap: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Dimensions.radiusFull,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.06)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.025,
    shadowRadius: 10,
    elevation: 1,
  },
  chipActive: {
    backgroundColor: PRODUCT_AD_ACCENT,
    borderColor: PRODUCT_AD_ACCENT,
  },
  chipSoftActive: {
    backgroundColor: 'rgba(255,149,0,0.12)',
    borderColor: 'rgba(255,149,0,0.35)',
  },
  chipText: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  chipTextActive: { color: '#ffffff' },
  chipTextSoftActive: { color: PRODUCT_AD_ACCENT },
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
  textareaWrap: {
    borderRadius: 22,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.06)',
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 14,
    elevation: 2,
  },
  textarea: {
    minHeight: 132,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
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
