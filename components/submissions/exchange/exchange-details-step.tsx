import { Ionicons } from '@expo/vector-icons';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useThemePreference } from '@/contexts/theme-preference-context';
import type { SwapAdCondition } from '@/services/swap-api';
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
  EXCHANGE_CONDITIONS,
  EXCHANGE_DESCRIPTION_MIN_LENGTH,
} from './exchange-options';

type Props = {
  condition: SwapAdCondition | '';
  description: string;
  descriptionError: string;
  canProceed: boolean;
  onConditionChange: (condition: SwapAdCondition | '') => void;
  onDescriptionChange: (value: string) => void;
  onPrevious: () => void;
  onNext: () => void;
};

export function ExchangeDetailsStep({
  condition,
  description,
  descriptionError,
  canProceed,
  onConditionChange,
  onDescriptionChange,
  onPrevious,
  onNext,
}: Props) {
  const { colors } = useThemePreference();
  const progress = Math.min((description.length / 350) * 100, 100);

  return (
    <View style={styles.wrap}>
      <ExchangeSectionHeader step={2} title="تفاصيل إضافية" subtitle="الحالة والوصف" />

      <View style={styles.fieldBlock}>
        <View style={styles.labelRow}>
          <Ionicons name="sparkles-outline" size={14} color={EXCHANGE_ACCENT_DARK} />
          <Text style={[styles.fieldLabel, { color: colors.foreground }]}>حالة عنصرك</Text>
        </View>

        <View style={styles.chipWrap}>
          {EXCHANGE_CONDITIONS.map((item) => {
            const active = condition === item.value;

            return (
              <Pressable
                key={item.value}
                onPress={() => onConditionChange(active ? '' : item.value)}
                style={({ pressed }) => [
                  styles.chip,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  active && styles.chipActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.chipText, { color: colors.foreground }, active && styles.chipTextActive]}>
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
        <View style={styles.topRow}>
          <Text
            style={[
              styles.counter,
              { color: colors.mutedForeground },
              description.trim().length >= EXCHANGE_DESCRIPTION_MIN_LENGTH && styles.counterActive,
            ]}
          >
            {description.length}/350
          </Text>

          <View style={styles.labelRow}>
            <Ionicons name="reader-outline" size={14} color={EXCHANGE_ACCENT_DARK} />
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>وصف التبادل</Text>
          </View>
        </View>

        <View
          style={[
            styles.textareaWrap,
            { backgroundColor: colors.card, borderColor: colors.border },
            descriptionError ? styles.textareaError : null,
          ]}
        >
          <TextInput
            value={description}
            onChangeText={onDescriptionChange}
            maxLength={350}
            multiline
            textAlign="right"
            textAlignVertical="top"
            placeholder="صف حالة عنصرك بدقة، وأي شروط للتبادل التي تريدها..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.textarea, { color: colors.foreground }]}
          />
          <View style={[styles.progressTrack, { backgroundColor: colors.secondary }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                  backgroundColor:
                    description.trim().length >= EXCHANGE_DESCRIPTION_MIN_LENGTH
                      ? EXCHANGE_ACCENT_DARK
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
            !canProceed && [styles.primaryButtonDisabled, { backgroundColor: colors.secondary }],
            pressed && canProceed && styles.pressed,
          ]}
        >
          <Ionicons name="arrow-back" size={18} color={canProceed ? '#ffffff' : colors.mutedForeground} />
          <Text style={[styles.primaryText, !canProceed && { color: colors.mutedForeground }]}>
            معاينة التبادل
          </Text>
        </Pressable>

        <Pressable
          onPress={onPrevious}
          style={({ pressed }) => [
            styles.secondaryButton,
            { backgroundColor: colors.card, borderColor: colors.border },
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="chevron-forward" size={20} color={colors.foreground} />
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
  fieldBlock: {
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
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
  counterActive: {
    color: EXCHANGE_ACCENT_DARK,
  },
  chipWrap: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
  },
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
    backgroundColor: 'rgba(90,200,250,0.14)',
    borderColor: 'rgba(90,200,250,0.42)',
  },
  chipText: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  chipTextActive: {
    color: EXCHANGE_ACCENT_DARK,
  },
  textareaWrap: {
    overflow: 'hidden',
    borderRadius: 22,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.06)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 14,
    elevation: 2,
  },
  textareaError: {
    borderColor: 'rgba(255,59,48,0.38)',
    borderWidth: 1.4,
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
  progressTrack: {
    height: 4,
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: Dimensions.radiusFull,
    backgroundColor: Colors.secondary,
    overflow: 'hidden',
  },
  progressFill: {
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
