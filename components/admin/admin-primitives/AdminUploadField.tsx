import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import type { AdminTheme } from '@/lib/admin/admin-theme';

import { styles } from './styles';

export function AdminUploadField({
  theme,
  imageUri,
  onPress,
}: {
  theme: AdminTheme;
  imageUri: string | null;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.uploadWrap,
        {
          backgroundColor: theme.cardBackground,
          borderColor: `${theme.primary}40`,
        },
        pressed && styles.pressed,
      ]}
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.uploadImage} contentFit="cover" />
      ) : (
        <>
          <View style={[styles.uploadIcon, { backgroundColor: `${theme.primary}14` }]}>
            <Ionicons name="image-outline" size={34} color={theme.primary} />
          </View>
          <Text style={[styles.uploadTitle, { color: theme.heading }]}>اختر صورة للخبر</Text>
          <Text style={[styles.uploadHint, { color: theme.mutedText }]}>
            PNG - JPG - WEBP بحد أقصى 5 MB
          </Text>
          <View style={[styles.uploadButton, { backgroundColor: theme.primarySoft }]}>
            <Text style={[styles.uploadButtonText, { color: theme.primary }]}>استعراض الملفات</Text>
          </View>
        </>
      )}
    </Pressable>
  );
}
