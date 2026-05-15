import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ServiceRequestBasicStep } from '@/components/submissions/service-request/service-request-basic-step';
import { ServiceRequestDatePicker } from '@/components/submissions/service-request/service-request-date-picker';
import { ServiceRequestDetailsStep } from '@/components/submissions/service-request/service-request-details-step';
import { ServiceRequestHeader } from '@/components/submissions/service-request/service-request-header';
import { ServiceRequestReviewStep } from '@/components/submissions/service-request/service-request-review-step';
import { ServiceRequestSuccess } from '@/components/submissions/service-request/service-request-success';
import {
  createDateFromInput,
  DESCRIPTION_MIN_LENGTH,
  formatDateInputValue,
  getBudgetLabel,
  isValidDateInput,
  parseBudgetValue,
  SERVICE_REQUEST_BUDGET_PRESETS,
  SERVICE_REQUEST_CATEGORIES,
  startOfDay,
  TITLE_MIN_LENGTH,
  type ServiceRequestStep,
} from '@/components/submissions/service-request/shared';
import { useCreateServiceRequestMutation } from '@/hooks/mutations/use-service-request-mutations';
import { Spacing } from '@/styles/ui-theme';

type ServiceRequestFormValues = {
  title: string;
  categoryId: number | null;
  budgetPresetId: string;
  customBudget: string;
  deadline: string;
  description: string;
};

const formUpdateOptions = {
  shouldDirty: true,
  shouldTouch: true,
  shouldValidate: true,
} as const;

export function NewServiceScreen() {
  const insets = useSafeAreaInsets();
  const mutation = useCreateServiceRequestMutation();
  const [activeStep, setActiveStep] = useState<ServiceRequestStep>(1);
  const [submitted, setSubmitted] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(() => startOfDay(new Date()));
  const {
    handleSubmit: handleFormSubmit,
    setValue,
    watch,
  } = useForm<ServiceRequestFormValues>({
    defaultValues: {
      title: '',
      categoryId: null,
      budgetPresetId: '',
      customBudget: '',
      deadline: '',
      description: '',
    },
    mode: 'onChange',
  });

  const {
    title,
    categoryId,
    budgetPresetId,
    customBudget,
    deadline,
    description,
  } = watch();

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

  const confirmDate = (date = pickerDate) => {
    setValue('deadline', formatDateInputValue(date), formUpdateOptions);
    setShowDatePicker(false);
  };

  const submitServiceRequest: SubmitHandler<ServiceRequestFormValues> = (values) => {
    const category = SERVICE_REQUEST_CATEGORIES.find((item) => item.id === values.categoryId);
    const budgetPreset = SERVICE_REQUEST_BUDGET_PRESETS.find(
      (item) => item.id === values.budgetPresetId,
    );
    const parsedBudget = values.customBudget.trim()
      ? parseBudgetValue(values.customBudget)
      : budgetPreset?.value ?? null;

    if (!category || parsedBudget === null || !canSubmit) {
      return;
    }

    mutation.mutate(
      {
        title: values.title,
        categoryId: category.id,
        budget: parsedBudget,
        deadline: values.deadline,
        description: values.description,
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

  const handleSubmit = () => {
    void handleFormSubmit(submitServiceRequest)();
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

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
          style={styles.keyboardAvoiding}
        >
          <ScrollView
            contentContainerStyle={[styles.content, { flexGrow: 1, paddingBottom: insets.bottom + 96 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          >
            {activeStep === 1 ? (
              <ServiceRequestBasicStep
                title={title}
                titleError={titleError}
                selectedCategoryId={categoryId}
                canProceed={step1Done}
                onTitleChange={(value) => setValue('title', value, formUpdateOptions)}
                onCategoryChange={(value) => setValue('categoryId', value, formUpdateOptions)}
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
                  setValue('budgetPresetId', presetId, formUpdateOptions);
                  setValue('customBudget', '', formUpdateOptions);
                }}
                onCustomBudgetChange={(value) => {
                  setValue('customBudget', value, formUpdateOptions);

                  if (value.trim()) {
                    setValue('budgetPresetId', '', formUpdateOptions);
                  }
                }}
                onOpenDatePicker={openDatePicker}
                onDescriptionChange={(value) => setValue('description', value, formUpdateOptions)}
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
        </KeyboardAvoidingView>

        <ServiceRequestDatePicker
          visible={showDatePicker}
          value={pickerDate}
          minimumDate={today}
          onChange={setPickerDate}
          onConfirm={confirmDate}
          onCancel={() => setShowDatePicker(false)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f6f7fb' },
  screen: { flex: 1, backgroundColor: '#f6f7fb' },
  keyboardAvoiding: { flex: 1 },
  topBubble: {
    position: 'absolute',
    top: 110,
    left: -90,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(37,99,235,0.05)',
  },
  bottomBubble: {
    position: 'absolute',
    right: -100,
    bottom: 26,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(90,200,250,0.06)',
  },
  content: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: 18,
  },
});
