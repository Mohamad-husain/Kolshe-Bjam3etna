import { Ionicons } from '@expo/vector-icons';
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';

import { Colors, SemanticColors } from '@/styles/ui-theme';

import {
  DESCRIPTION_MIN_LENGTH,
  SERVICE_REQUEST_BUDGET_PRESETS,
  serviceRequestStyles as styles,
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

        <View style={styles.fieldBlock}>
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
        </View>

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
