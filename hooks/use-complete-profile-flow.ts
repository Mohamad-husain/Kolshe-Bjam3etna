import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { useForm } from 'react-hook-form';

import { useAppSettings } from '@/contexts/app-settings-context';
import { useCompleteProfileMutation } from '@/hooks/mutations/use-auth-mutations';

export type CompleteProfileFormValues = {
  major: string;
  bio: string;
  profileImage: ImagePicker.ImagePickerAsset | null;
};

export type PickProfileImageHandler = (
  onChange: (value: CompleteProfileFormValues['profileImage']) => void,
) => Promise<void>;

type UseCompleteProfileFlowProps = {
  universityId: number;
  onCompleted: () => void;
};

export function useCompleteProfileFlow({
  universityId,
  onCompleted,
}: UseCompleteProfileFlowProps) {
  const { t } = useAppSettings();
  const completeProfileMutation = useCompleteProfileMutation();
  const {
    control,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm<CompleteProfileFormValues>({
    defaultValues: {
      major: '',
      bio: '',
      profileImage: null,
    },
    mode: 'onChange',
  });

  const serverError =
    completeProfileMutation.isError && completeProfileMutation.error
      ? completeProfileMutation.error instanceof Error
        ? completeProfileMutation.error.message
        : t('completeProfile.error')
      : '';

  function clearServerError() {
    if (completeProfileMutation.isError) {
      completeProfileMutation.reset();
    }
  }

  const handlePickImage: PickProfileImageHandler = async (onChange) => {
    clearServerError();

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        t('completeProfile.photoPermissionTitle'),
        t('completeProfile.photoPermissionMessage'),
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0] ?? null;
      onChange(selectedImage);

      if (selectedImage) {
        clearErrors('profileImage');
      }
    }
  };

  const submitCompleteProfile = handleSubmit((values) => {
    completeProfileMutation.mutate(
      {
        universityId,
        major: values.major,
        bio: values.bio,
        profileImage: {
          uri: values.profileImage?.uri ?? '',
          name: values.profileImage?.fileName,
          type: values.profileImage?.mimeType,
          file: values.profileImage?.file,
        },
      },
      {
        onSuccess: onCompleted,
      },
    );
  });

  return {
    control,
    errors,
    serverError,
    isSubmitting: completeProfileMutation.isPending,
    clearServerError,
    handlePickImage,
    submitCompleteProfile,
  };
}
