import type { ImagePickerAsset } from 'expo-image-picker';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';

import { useAppSettings } from '@/contexts/app-settings-context';
import { CompleteProfileAvatarPicker } from './complete-profile-avatar-picker';
import type { CompleteProfileFormValues } from '@/hooks/use-complete-profile-flow';

type PickProfileImageHandler = (
  onChange: (value: ImagePickerAsset | null) => void,
) => Promise<void>;

type CompleteProfileAvatarFieldProps = {
  control: Control<CompleteProfileFormValues>;
  errors: FieldErrors<CompleteProfileFormValues>;
  onPickImage: PickProfileImageHandler;
};

export function CompleteProfileAvatarField({
  control,
  errors,
  onPickImage,
}: CompleteProfileAvatarFieldProps) {
  const { t } = useAppSettings();

  return (
    <Controller
      control={control}
      name="profileImage"
      rules={{ required: t('completeProfile.avatarRequired') }}
      render={({ field: { onChange, value } }) => (
        <CompleteProfileAvatarPicker
          errorMessage={errors.profileImage?.message}
          image={value}
          onPress={() => {
            void onPickImage(onChange);
          }}
        />
      )}
    />
  );
}
