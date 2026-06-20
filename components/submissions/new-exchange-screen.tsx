import * as ImagePicker from 'expo-image-picker';
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

import { ExchangeDetailsStep } from '@/components/submissions/exchange/exchange-details-step';
import { ExchangeHeader } from '@/components/submissions/exchange/exchange-header';
import { ExchangeItemsStep } from '@/components/submissions/exchange/exchange-items-step';
import {
  EXCHANGE_CATEGORIES,
  EXCHANGE_CONDITIONS,
  EXCHANGE_DESCRIPTION_MIN_LENGTH,
  EXCHANGE_MAX_PHOTOS,
  EXCHANGE_TITLE_MIN_LENGTH,
  type ExchangeStep,
} from '@/components/submissions/exchange/exchange-options';
import { ExchangeReviewStep } from '@/components/submissions/exchange/exchange-review-step';
import { ExchangeSuccess } from '@/components/submissions/exchange/exchange-success';
import { useThemePreference } from '@/contexts/theme-preference-context';
import { useCreateSwapAdMutation } from '@/hooks/mutations/use-swap-ad-mutations';
import type { SwapAdCondition, SwapAdPhotoInput } from '@/services/swap-api';
import { Spacing } from '@/styles/ui-theme';

type ExchangeFormValues = {
  offerTitle: string;
  wantedTitle: string;
  categoryId: number | null;
  condition: SwapAdCondition | '';
  description: string;
  photos: SwapAdPhotoInput[];
};

const formUpdateOptions = {
  shouldDirty: true,
  shouldTouch: true,
  shouldValidate: true,
} as const;

function mapAssetToPhoto(asset: ImagePicker.ImagePickerAsset, index: number): SwapAdPhotoInput {
  return {
    uri: asset.uri,
    name: asset.fileName ?? `swap-photo-${Date.now()}-${index + 1}.jpg`,
    type: asset.mimeType ?? 'image/jpeg',
  };
}

export function NewExchangeScreen() {
  const insets = useSafeAreaInsets();
  const { colors, effectiveTheme } = useThemePreference();
  const mutation = useCreateSwapAdMutation();
  const [activeStep, setActiveStep] = useState<ExchangeStep>(1);
  const [submitted, setSubmitted] = useState(false);
  const {
    getValues,
    handleSubmit: handleFormSubmit,
    setValue,
    watch,
  } = useForm<ExchangeFormValues>({
    defaultValues: {
      offerTitle: '',
      wantedTitle: '',
      categoryId: null,
      condition: '',
      description: '',
      photos: [],
    },
    mode: 'onChange',
  });

  const {
    offerTitle,
    wantedTitle,
    categoryId,
    condition,
    description,
    photos,
  } = watch();

  useEffect(() => {
    if (!submitted) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      router.replace('/(tabs)/profile');
    }, 1700);

    return () => clearTimeout(timeoutId);
  }, [submitted]);

  const selectedCategory = EXCHANGE_CATEGORIES.find((item) => item.id === categoryId) ?? null;
  const selectedCondition = EXCHANGE_CONDITIONS.find((item) => item.value === condition) ?? null;
  const descriptionError =
    description.trim().length > 0 && description.trim().length < EXCHANGE_DESCRIPTION_MIN_LENGTH
      ? 'الوصف قصير جداً'
      : '';
  const step1Done =
    offerTitle.trim().length >= EXCHANGE_TITLE_MIN_LENGTH &&
    wantedTitle.trim().length >= EXCHANGE_TITLE_MIN_LENGTH &&
    selectedCategory !== null;
  const step2Done =
    condition !== '' && description.trim().length >= EXCHANGE_DESCRIPTION_MIN_LENGTH;
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

  const handlePickPhotos = async () => {
    const currentPhotos = getValues('photos');
    const remainingSlots = EXCHANGE_MAX_PHOTOS - currentPhotos.length;

    if (remainingSlots <= 0) {
      Alert.alert('تم الوصول للحد الأقصى', `يمكنك إضافة ${EXCHANGE_MAX_PHOTOS} صور فقط`);
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('إذن مطلوب', 'اسمح للتطبيق بالوصول للصور حتى تتمكن من إضافة صور العنصر');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: remainingSlots,
      quality: 0.82,
    });

    if (result.canceled) {
      return;
    }

    const selectedPhotos = result.assets
      .slice(0, remainingSlots)
      .map((asset, index) => mapAssetToPhoto(asset, index));

    setValue(
      'photos',
      [...getValues('photos'), ...selectedPhotos].slice(0, EXCHANGE_MAX_PHOTOS),
      formUpdateOptions,
    );
  };

  const submitExchange: SubmitHandler<ExchangeFormValues> = (values) => {
    const category = EXCHANGE_CATEGORIES.find((item) => item.id === values.categoryId);
    const selectedConditionValue = EXCHANGE_CONDITIONS.find(
      (item) => item.value === values.condition,
    );

    if (!category || !values.condition || !canSubmit) {
      return;
    }

    mutation.mutate(
      {
        offerTitle: values.offerTitle,
        wantedTitle: values.wantedTitle,
        categoryId: category.id,
        categoryName: category.label,
        condition: values.condition,
        conditionLabel: selectedConditionValue?.label,
        description: values.description,
        photos: values.photos,
      },
      {
        onSuccess: () => setSubmitted(true),
        onError: (error) => {
          const message = error instanceof Error ? error.message : 'تعذر نشر طلب التبادل';
          Alert.alert('تعذر نشر الطلب', message);
        },
      },
    );
  };

  const handleSubmit = () => {
    void handleFormSubmit(submitExchange)();
  };

  if (submitted) {
    return <ExchangeSuccess />;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar style={effectiveTheme === 'dark' ? 'light' : 'dark'} />

      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.topBubble} pointerEvents="none" />
        <View style={styles.bottomBubble} pointerEvents="none" />

        <ExchangeHeader
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
              <ExchangeItemsStep
                offerTitle={offerTitle}
                wantedTitle={wantedTitle}
                selectedCategoryId={categoryId}
                photos={photos}
                canProceed={step1Done}
                onOfferTitleChange={(value) => setValue('offerTitle', value, formUpdateOptions)}
                onWantedTitleChange={(value) => setValue('wantedTitle', value, formUpdateOptions)}
                onCategoryChange={(value) => setValue('categoryId', value, formUpdateOptions)}
                onPickPhotos={handlePickPhotos}
                onRemovePhoto={(index) =>
                  setValue(
                    'photos',
                    getValues('photos').filter((_, itemIndex) => itemIndex !== index),
                    formUpdateOptions,
                  )
                }
                onNext={() => setActiveStep(2)}
              />
            ) : null}

            {activeStep === 2 ? (
              <ExchangeDetailsStep
                condition={condition}
                description={description}
                descriptionError={descriptionError}
                canProceed={step2Done}
                onConditionChange={(value) => setValue('condition', value, formUpdateOptions)}
                onDescriptionChange={(value) => setValue('description', value, formUpdateOptions)}
                onPrevious={() => setActiveStep(1)}
                onNext={() => setActiveStep(3)}
              />
            ) : null}

            {activeStep === 3 ? (
              <ExchangeReviewStep
                offerTitle={offerTitle}
                wantedTitle={wantedTitle}
                description={description}
                selectedCategory={selectedCategory}
                selectedCondition={selectedCondition}
                photos={photos}
                canSubmit={canSubmit}
                isSubmitting={mutation.isPending}
                onPrevious={() => setActiveStep(2)}
                onSubmit={handleSubmit}
              />
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f6f7fb',
  },
  screen: {
    flex: 1,
    backgroundColor: '#f6f7fb',
  },
  keyboardAvoiding: {
    flex: 1,
  },
  topBubble: {
    position: 'absolute',
    top: 105,
    right: -85,
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: 'rgba(90,200,250,0.08)',
  },
  bottomBubble: {
    position: 'absolute',
    left: -100,
    bottom: 36,
    width: 270,
    height: 270,
    borderRadius: 135,
    backgroundColor: 'rgba(0,122,255,0.05)',
  },
  content: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: 18,
  },
});
