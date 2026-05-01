import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ServiceRequestBasicStep } from '@/components/submissions/service-request/service-request-basic-step';
import { ServiceRequestDetailsStep } from '@/components/submissions/service-request/service-request-details-step';
import { ServiceRequestHeader } from '@/components/submissions/service-request/service-request-header';
import { ServiceRequestReviewStep } from '@/components/submissions/service-request/service-request-review-step';
import { ServiceRequestSuccess } from '@/components/submissions/service-request/service-request-success';
import { useCreateServiceRequestMutation } from '@/hooks/mutations/use-service-request-mutations';
import {
  createDateFromInput,
  DESCRIPTION_MIN_LENGTH,
  formatDateInputValue,
  getBudgetLabel,
  parseBudgetValue,
  SERVICE_REQUEST_BUDGET_PRESETS,
  SERVICE_REQUEST_CATEGORIES,
  serviceRequestStyles as styles,
  startOfDay,
  type ServiceRequestStep,
  TITLE_MIN_LENGTH,
  isValidDateInput,
} from '@/components/submissions/service-request/shared';

export function NewServiceScreen() {
  const insets = useSafeAreaInsets();
  const mutation = useCreateServiceRequestMutation();
  const [activeStep, setActiveStep] = useState<ServiceRequestStep>(1);
  const [submitted, setSubmitted] = useState(false);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [budgetPresetId, setBudgetPresetId] = useState('');
  const [customBudget, setCustomBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(() => startOfDay(new Date()));
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!submitted) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      router.replace('/(tabs)/profile');
    }, 1600);

    return () => clearTimeout(timeoutId);
  }, [submitted]);

  const selectedCategory = SERVICE_REQUEST_CATEGORIES.find((item) => item.id === categoryId) ?? null;
  const selectedBudgetPreset = SERVICE_REQUEST_BUDGET_PRESETS.find(
    (item) => item.id === budgetPresetId,
  );
  const selectedDeadlineDate = createDateFromInput(deadline);
  const today = startOfDay(new Date());
  const budgetValue = customBudget.trim()
    ? parseBudgetValue(customBudget)
    : selectedBudgetPreset?.value ?? null;
  const budgetLabel = getBudgetLabel(customBudget, selectedBudgetPreset?.label);

  const titleError =
    title.trim().length > 0 && title.trim().length < TITLE_MIN_LENGTH ? 'العنوان قصير جداً' : '';
  const descriptionError =
    description.trim().length > 0 && description.trim().length < DESCRIPTION_MIN_LENGTH
      ? 'الوصف قصير جداً، اكتب 20 حرفاً على الأقل'
      : '';
  const budgetError =
    customBudget.trim().length > 0 && budgetValue === null ? 'أدخل رقماً صحيحاً' : '';
  const deadlineError =
    deadline.trim().length > 0 && !isValidDateInput(deadline)
      ? 'اكتب التاريخ بصيغة YYYY-MM-DD'
      : '';

  const step1Done = title.trim().length >= TITLE_MIN_LENGTH && selectedCategory !== null;
  const step2Done =
    budgetValue !== null &&
    deadline.trim().length > 0 &&
    !deadlineError &&
    description.trim().length >= DESCRIPTION_MIN_LENGTH;
  const canSubmit = step1Done && step2Done && !mutation.isPending;

  const handleBack = () => {
    if (mutation.isPending) {
      return;
    }

    if (activeStep === 3) {
      setActiveStep(2);
      return;
    }

    if (activeStep === 2) {
      setActiveStep(1);
      return;
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)/add-menu');
  };

  const openDatePicker = () => {
    setPickerDate(selectedDeadlineDate ?? today);
    setShowDatePicker(true);
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (event.type !== 'set' || !selectedDate) {
      return;
    }

    const normalizedDate = startOfDay(selectedDate);

    if (normalizedDate.getTime() < today.getTime()) {
      return;
    }

    if (Platform.OS === 'ios') {
      setPickerDate(normalizedDate);
      return;
    }

    setDeadline(formatDateInputValue(normalizedDate));
  };

  const handleSubmit = () => {
    if (!selectedCategory || budgetValue === null || !canSubmit) {
      return;
    }

    mutation.mutate(
      {
        title,
        categoryId: selectedCategory.id,
        budget: budgetValue,
        deadline,
        description,
      },
      {
        onSuccess: () => setSubmitted(true),
        onError: (error) => {
          const message = error instanceof Error ? error.message : 'تعذر نشر طلب الخدمة';
          Alert.alert('تعذر نشر الطلب', message);
        },
      },
    );
  };

  if (submitted) {
    return <ServiceRequestSuccess />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.screen}>
        <View style={styles.topBubble} pointerEvents="none" />
        <View style={styles.bottomBubble} pointerEvents="none" />

        <ServiceRequestHeader
          activeStep={activeStep}
          step1Done={step1Done}
          step2Done={step2Done}
          onBack={handleBack}
          onStepPress={setActiveStep}
        />

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 28 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {activeStep === 1 ? (
            <ServiceRequestBasicStep
              title={title}
              titleError={titleError}
              selectedCategoryId={categoryId}
              canProceed={step1Done}
              onTitleChange={setTitle}
              onCategoryChange={setCategoryId}
              onNext={() => setActiveStep(2)}
            />
          ) : null}

          {activeStep === 2 ? (
            <ServiceRequestDetailsStep
              budgetPresetId={budgetPresetId}
              customBudget={customBudget}
              deadline={deadline}
              description={description}
              budgetError={budgetError}
              deadlineError={deadlineError}
              descriptionError={descriptionError}
              canProceed={step2Done}
              onBudgetPresetChange={(presetId) => {
                setBudgetPresetId(presetId);
                setCustomBudget('');
              }}
              onCustomBudgetChange={(value) => {
                setCustomBudget(value);

                if (value.trim()) {
                  setBudgetPresetId('');
                }
              }}
              onOpenDatePicker={openDatePicker}
              onDescriptionChange={setDescription}
              onNext={() => setActiveStep(3)}
            />
          ) : null}

          {activeStep === 3 ? (
            <ServiceRequestReviewStep
              title={title}
              description={description}
              deadline={deadline}
              budgetLabel={budgetLabel}
              selectedCategory={selectedCategory}
              canSubmit={canSubmit}
              isSubmitting={mutation.isPending}
              onSubmit={handleSubmit}
            />
          ) : null}
        </ScrollView>

        <Modal
          visible={showDatePicker && Platform.OS === 'ios'}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <Pressable style={styles.modalBackdrop} onPress={() => setShowDatePicker(false)} />

            <View style={styles.pickerSheet}>
              <View style={styles.calendarHandle} />
              <Text style={styles.pickerSheetTitle}>اختر الموعد النهائي</Text>

              <DateTimePicker
                value={pickerDate}
                mode="date"
                display="spinner"
                minimumDate={today}
                onChange={handleDateChange}
                locale="ar"
                textColor="#111827"
                themeVariant="light"
                style={styles.iosDatePicker}
              />

              <View style={styles.pickerActions}>
                <Pressable
                  onPress={() => setShowDatePicker(false)}
                  style={({ pressed }) => [
                    styles.pickerActionButton,
                    styles.pickerSecondaryAction,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.pickerSecondaryActionText}>إلغاء</Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setDeadline(formatDateInputValue(pickerDate));
                    setShowDatePicker(false);
                  }}
                  style={({ pressed }) => [
                    styles.pickerActionButton,
                    styles.pickerPrimaryAction,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.pickerPrimaryActionText}>تم</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {showDatePicker && Platform.OS === 'android' ? (
          <DateTimePicker
            value={selectedDeadlineDate ?? today}
            mode="date"
            minimumDate={today}
            onChange={handleDateChange}
            positiveButton={{ label: 'تم' }}
            negativeButton={{ label: 'إلغاء' }}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
}
