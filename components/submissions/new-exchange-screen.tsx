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
import { useCreateSwapAdMutation } from '@/hooks/mutations/use-swap-ad-mutations';
import type { SwapAdCondition, SwapAdPhotoInput } from '@/services/swap-api';
import { Spacing } from '@/styles/ui-theme';

function mapAssetToPhoto(asset: ImagePicker.ImagePickerAsset, index: number): SwapAdPhotoInput {
  return {
    uri: asset.uri,
    name: asset.fileName ?? `swap-photo-${Date.now()}-${index + 1}.jpg`,
    type: asset.mimeType ?? 'image/jpeg',
  };
}

export function NewExchangeScreen() {
  const insets = useSafeAreaInsets();
  const mutation = useCreateSwapAdMutation();
  const [activeStep, setActiveStep] = useState<ExchangeStep>(1);
  const [submitted, setSubmitted] = useState(false);
  const [offerTitle, setOfferTitle] = useState('');
  const [wantedTitle, setWantedTitle] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [condition, setCondition] = useState<SwapAdCondition | ''>('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<SwapAdPhotoInput[]>([]);

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
    const remainingSlots = EXCHANGE_MAX_PHOTOS - photos.length;

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

    setPhotos((current) => [...current, ...selectedPhotos].slice(0, EXCHANGE_MAX_PHOTOS));
  };

  const handleSubmit = () => {
    if (!selectedCategory || !condition || !canSubmit) {
      return;
    }

    mutation.mutate(
      {
        offerTitle,
        wantedTitle,
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.label,
        condition,
        conditionLabel: selectedCondition?.label,
        description,
        photos,
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

  if (submitted) {
    return <ExchangeSuccess />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.screen}>
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
                onOfferTitleChange={setOfferTitle}
                onWantedTitleChange={setWantedTitle}
                onCategoryChange={setCategoryId}
                onPickPhotos={handlePickPhotos}
                onRemovePhoto={(index) =>
                  setPhotos((current) => current.filter((_, itemIndex) => itemIndex !== index))
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
                onConditionChange={setCondition}
                onDescriptionChange={setDescription}
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
