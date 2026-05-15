import * as ImagePicker from 'expo-image-picker';
import { useCallback } from 'react';
import type { UseFormClearErrors, UseFormSetValue } from 'react-hook-form';

import type { AdminEditProfileFormValues, AdminEditProfileToast } from '@/types/edit-profile';

type UseEditProfileImagePickerParams = {
  clearErrors: UseFormClearErrors<AdminEditProfileFormValues>;
  onDirty: () => void;
  setValue: UseFormSetValue<AdminEditProfileFormValues>;
  showToast: (message: string, tone: AdminEditProfileToast['tone']) => void;
};

export function useEditProfileImagePicker({
  clearErrors,
  onDirty,
  setValue,
  showToast,
}: UseEditProfileImagePickerParams) {
  return useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      showToast('يرجى السماح بالوصول للصور لاختيار صورة جديدة.', 'warning');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.92,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];

    if (!asset) {
      return;
    }

    setValue('profileImage', {
      uri: asset.uri,
      name: asset.fileName ?? asset.file?.name ?? `profile-${Date.now()}.jpg`,
      type: asset.mimeType ?? asset.file?.type ?? 'image/jpeg',
      file: asset.file,
      isRemote: false,
    });
    clearErrors('profileImage');
    onDirty();
  }, [clearErrors, onDirty, setValue, showToast]);
}
