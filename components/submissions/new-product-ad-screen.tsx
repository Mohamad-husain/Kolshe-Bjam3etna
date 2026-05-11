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

import { ProductAdBasicStep } from '@/components/submissions/product-ad/product-ad-basic-step';
import { ProductAdDetailsStep } from '@/components/submissions/product-ad/product-ad-details-step';
import { ProductAdHeader } from '@/components/submissions/product-ad/product-ad-header';
import { ProductAdReviewStep } from '@/components/submissions/product-ad/product-ad-review-step';
import { ProductAdSuccess } from '@/components/submissions/product-ad/product-ad-success';
import {
  getPriceLabel,
  parsePriceValue,
  PRODUCT_AD_CATEGORIES,
  PRODUCT_AD_CONDITIONS,
  PRODUCT_AD_DESCRIPTION_MIN_LENGTH,
  PRODUCT_AD_MAX_PHOTOS,
  PRODUCT_AD_PRICE_PRESETS,
  PRODUCT_AD_TITLE_MIN_LENGTH,
  type ProductAdStep,
} from '@/components/submissions/product-ad/shared';
import { useCreateProductAdMutation } from '@/hooks/mutations/use-product-ad-mutations';
import type { ProductAdCondition, ProductAdPhotoInput } from '@/services/marketplace-api';
import { Spacing } from '@/styles/ui-theme';

type ProductAdFormValues = {
  title: string;
  categoryId: number | null;
  pricePresetId: string;
  customPrice: string;
  condition: ProductAdCondition | '';
  description: string;
  photos: ProductAdPhotoInput[];
};

const formUpdateOptions = {
  shouldDirty: true,
  shouldTouch: true,
  shouldValidate: true,
} as const;

function mapAssetToPhoto(asset: ImagePicker.ImagePickerAsset, index: number): ProductAdPhotoInput {
  return {
    uri: asset.uri,
    name: asset.fileName ?? `product-photo-${Date.now()}-${index + 1}.jpg`,
    type: asset.mimeType ?? 'image/jpeg',
  };
}

export function NewProductAdScreen() {
  const insets = useSafeAreaInsets();
  const mutation = useCreateProductAdMutation();
  const [activeStep, setActiveStep] = useState<ProductAdStep>(1);
  const [submitted, setSubmitted] = useState(false);
  const {
    getValues,
    handleSubmit: handleFormSubmit,
    setValue,
    watch,
  } = useForm<ProductAdFormValues>({
    defaultValues: {
      title: '',
      categoryId: null,
      pricePresetId: '',
      customPrice: '',
      condition: '',
      description: '',
      photos: [],
    },
    mode: 'onChange',
  });

  const {
    title,
    categoryId,
    pricePresetId,
    customPrice,
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
    }, 1600);

    return () => clearTimeout(timeoutId);
  }, [submitted]);

  const selectedCategory = PRODUCT_AD_CATEGORIES.find((item) => item.id === categoryId) ?? null;
  const selectedPricePreset = PRODUCT_AD_PRICE_PRESETS.find((item) => item.id === pricePresetId);
  const selectedCondition = PRODUCT_AD_CONDITIONS.find((item) => item.value === condition) ?? null;
  const priceValue = customPrice.trim()
    ? parsePriceValue(customPrice)
    : selectedPricePreset?.value ?? null;
  const priceLabel = getPriceLabel(customPrice, selectedPricePreset?.label);

  const step1Done =
    title.trim().length >= PRODUCT_AD_TITLE_MIN_LENGTH && selectedCategory !== null;
  const step2Done =
    priceValue !== null &&
    condition !== '' &&
    description.trim().length >= PRODUCT_AD_DESCRIPTION_MIN_LENGTH;
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
    const remainingSlots = PRODUCT_AD_MAX_PHOTOS - currentPhotos.length;

    if (remainingSlots <= 0) {
      Alert.alert('تم الوصول للحد الأقصى', `يمكنك إضافة ${PRODUCT_AD_MAX_PHOTOS} صور فقط`);
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('إذن مطلوب', 'اسمح للتطبيق بالوصول للصور حتى تتمكن من إضافة صور المنتج');
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
      [...getValues('photos'), ...selectedPhotos].slice(0, PRODUCT_AD_MAX_PHOTOS),
      formUpdateOptions,
    );
  };

  const submitProductAd: SubmitHandler<ProductAdFormValues> = (values) => {
    const category = PRODUCT_AD_CATEGORIES.find((item) => item.id === values.categoryId);
    const pricePreset = PRODUCT_AD_PRICE_PRESETS.find((item) => item.id === values.pricePresetId);
    const parsedPrice = values.customPrice.trim()
      ? parsePriceValue(values.customPrice)
      : pricePreset?.value ?? null;

    if (!category || parsedPrice === null || !values.condition || !canSubmit) {
      return;
    }

    mutation.mutate(
      {
        title: values.title,
        categoryId: category.id,
        price: parsedPrice,
        condition: values.condition,
        description: values.description,
        photos: values.photos,
      },
      {
        onSuccess: () => setSubmitted(true),
        onError: (error) => {
          const message = error instanceof Error ? error.message : 'تعذر نشر إعلان البيع';
          Alert.alert('تعذر نشر الإعلان', message);
        },
      },
    );
  };

  const handleSubmit = () => {
    void handleFormSubmit(submitProductAd)();
  };

  if (submitted) {
    return <ProductAdSuccess />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.screen}>
        <View style={styles.topBubble} pointerEvents="none" />
        <View style={styles.bottomBubble} pointerEvents="none" />

        <ProductAdHeader
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
              <ProductAdBasicStep
                title={title}
                selectedCategoryId={categoryId}
                photos={photos}
                canProceed={step1Done}
                onTitleChange={(value) => setValue('title', value, formUpdateOptions)}
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
              <ProductAdDetailsStep
                pricePresetId={pricePresetId}
                customPrice={customPrice}
                condition={condition}
                description={description}
                canProceed={step2Done}
                onPricePresetChange={(presetId) => {
                  setValue('pricePresetId', presetId, formUpdateOptions);
                  setValue('customPrice', '', formUpdateOptions);
                }}
                onCustomPriceChange={(value) => {
                  setValue('customPrice', value, formUpdateOptions);

                  if (value.trim()) {
                    setValue('pricePresetId', '', formUpdateOptions);
                  }
                }}
                onConditionChange={(value) => setValue('condition', value, formUpdateOptions)}
                onDescriptionChange={(value) => setValue('description', value, formUpdateOptions)}
                onPrevious={() => setActiveStep(1)}
                onNext={() => setActiveStep(3)}
              />
            ) : null}

            {activeStep === 3 ? (
              <ProductAdReviewStep
                title={title}
                description={description}
                priceLabel={priceLabel}
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
  safeArea: { flex: 1, backgroundColor: '#f6f7fb' },
  screen: { flex: 1, backgroundColor: '#f6f7fb' },
  keyboardAvoiding: { flex: 1 },
  topBubble: {
    position: 'absolute',
    top: 100,
    right: -85,
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: 'rgba(255,149,0,0.06)',
  },
  bottomBubble: {
    position: 'absolute',
    left: -100,
    bottom: 36,
    width: 270,
    height: 270,
    borderRadius: 135,
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
