import { Ionicons } from '@expo/vector-icons';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  Colors,
  Dimensions,
  FontFamily,
  FontSize,
  FontWeight,
  SemanticColors,
} from '@/styles/ui-theme';

import {
  DESCRIPTION_MIN_LENGTH,
  SERVICE_REQUEST_BUDGET_PRESETS,
} from './shared';
import { ServiceRequestSectionHeader } from './service-request-section-header';

type Props = {
  budgetPresetId: string;
  customBudget: string;
  deadline: string;
  description: string;
  budgetError: string;
  deadlineError: string;
  descriptionError: string;
  canProceed: boolean;
  onBudgetPresetChange: (presetId: string) => void;
  onCustomBudgetChange: (value: string) => void;
  onOpenDatePicker: () => void;
  onDescriptionChange: (value: string) => void;
  onNext: () => void;
};

export function ServiceRequestDetailsStep({
  budgetPresetId,
  customBudget,
  deadline,
  description,
  budgetError,
  deadlineError,
  descriptionError,
  canProceed,
  onBudgetPresetChange,
  onCustomBudgetChange,
  onOpenDatePicker,
  onDescriptionChange,
  onNext,
}: Props) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 86 : 64}
      style={{ flex: 1, width: '100%' }}
    >
      <View style={styles.card}>
        <ServiceRequestSectionHeader
          step={2}
          title="تفاصيل الطلب"
          subtitle="الميزانية، الموعد، والوصف"
        />

        <View style={styles.fieldBlock}>
          <View style={styles.labelRow}>
            <Ionicons name="cash-outline" size={14} color={Colors.primary} />
            <Text style={styles.fieldLabel}>الميزانية</Text>
          </View>

          <View style={styles.chipWrap}>
            {SERVICE_REQUEST_BUDGET_PRESETS.map((item) => {
              const active = budgetPresetId === item.id;

              return (
                <Pressable
                  key={item.id}
                  onPress={() => onBudgetPresetChange(active ? '' : item.id)}
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

          <View style={[styles.fieldRow, budgetError ? styles.fieldRowError : null]}>
            <TextInput
              value={customBudget}
              onChangeText={onCustomBudgetChange}
              keyboardType="decimal-pad"
              placeholder="أو أدخل ميزانية مخصصة..."
              placeholderTextColor="rgba(142,142,147,0.65)"
              style={styles.input}
              textAlign="right"
            />
            <Ionicons name="cash-outline" size={18} color={Colors.mutedForeground} />
          </View>
          {budgetError ? <Text style={styles.errorText}>{budgetError}</Text> : null}
        </View>

        <View style={styles.fieldBlock}>
          <View style={styles.labelRow}>
            <Ionicons name="calendar-outline" size={14} color={Colors.primary} />
            <Text style={styles.fieldLabel}>الموعد النهائي</Text>
          </View>

          <Pressable
            onPress={onOpenDatePicker}
            style={({ pressed }) => [
              styles.fieldRow,
              styles.dateFieldButton,
              deadlineError ? styles.fieldRowError : null,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.dateValueText,
                deadline && styles.dateSelectedText,
                !deadline && styles.datePlaceholderText,
              ]}
            >
              {deadline || 'اختر التاريخ'}
            </Text>
            <Ionicons name="calendar-outline" size={18} color={Colors.mutedForeground} />
          </Pressable>
          {deadlineError ? <Text style={styles.errorText}>{deadlineError}</Text> : null}
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
                description.trim().length >= DESCRIPTION_MIN_LENGTH && styles.counterActive,
              ]}
            >
              {description.length}/500
            </Text>
            <View style={styles.labelRow}>
              <Ionicons name="reader-outline" size={14} color={Colors.primary} />
              <Text style={styles.fieldLabel}>الوصف التفصيلي</Text>
            </View>
          </View>

          <View style={[styles.textareaWrap, descriptionError ? styles.fieldRowError : null]}>
            <TextInput
              value={description}
              onChangeText={onDescriptionChange}
              maxLength={500}
              multiline
              textAlign="right"
              textAlignVertical="top"
              placeholder="اشرح ما تحتاجه بالتفصيل: المستوى المطلوب، الأوقات المناسبة، وأي متطلبات خاصة..."
              placeholderTextColor="rgba(142,142,147,0.65)"
              style={styles.textarea}
            />
            <View style={styles.descriptionProgressTrack}>
              <View
                style={[
                  styles.descriptionProgressFill,
                  {
                    width: `${Math.min((description.length / 500) * 100, 100)}%`,
                    backgroundColor:
                      description.trim().length >= DESCRIPTION_MIN_LENGTH
                        ? Colors.primary
                        : SemanticColors.red,
                  },
                ]}
              />
            </View>
          </View>
          {descriptionError ? <Text style={styles.errorText}>{descriptionError}</Text> : null}
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
  counterActive: { color: Colors.primary },
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
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  chipTextActive: { color: '#ffffff' },
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
  dateFieldButton: {
    justifyContent: 'space-between',
  },
  dateValueText: {
    flex: 1,
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    textAlign: 'left',
  },
  dateSelectedText: {
    color: '#111827',
  },
  datePlaceholderText: {
    color: 'rgba(142,142,147,0.75)',
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
  descriptionProgressTrack: {
    height: 4,
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: Dimensions.radiusFull,
    backgroundColor: Colors.secondary,
    overflow: 'hidden',
  },
  descriptionProgressFill: {
    height: '100%',
    borderRadius: Dimensions.radiusFull,
  },
  errorText: {
    color: SemanticColors.red,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.medium,
    textAlign: 'right',
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
