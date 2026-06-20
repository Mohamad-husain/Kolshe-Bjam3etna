import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import type { ImagePickerAsset } from 'expo-image-picker';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppSettings } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import {
  Dimensions,
  FontFamily,
  FontSize,
  FontWeight,
} from '@/styles/ui-theme';
import { CompleteProfileErrorText } from './complete-profile-error-text';

type CompleteProfileAvatarPickerProps = {
  image: ImagePickerAsset | null;
  errorMessage?: string;
  onPress: () => void;
};

export function CompleteProfileAvatarPicker({
  image,
  errorMessage,
  onPress,
}: CompleteProfileAvatarPickerProps) {
  const { t } = useAppSettings();
  const { colors } = useThemePreference();

  return (
    <View style={styles.avatarSection}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.avatarButton,
          { backgroundColor: colors.card, borderColor: colors.border },
          pressed && styles.avatarButtonPressed,
          image ? styles.avatarButtonFilled : null,
        ]}
      >
        {image ? (
          <Image contentFit="cover" source={{ uri: image.uri }} style={styles.avatarImage} />
        ) : (
          <Ionicons name="camera-outline" size={34} color={colors.mutedForeground} />
        )}
      </Pressable>
      <Text style={[styles.uploadHint, { color: colors.primary }]}>
        {t('completeProfile.uploadAvatar')}
      </Text>
      <CompleteProfileErrorText message={errorMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  avatarSection: {
    alignItems: 'center',
    marginBottom: 2,
  },
  avatarButton: {
    width: 122,
    height: 122,
    borderRadius: Dimensions.radiusFull,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarButtonFilled: {
    borderStyle: 'solid',
    borderColor: 'rgba(47, 99, 224, 0.18)',
  },
  avatarButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  uploadHint: {
    marginTop: 14,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
  },
});
