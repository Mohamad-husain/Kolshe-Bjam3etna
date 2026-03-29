import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ProfileSetupLayout } from '@/components/auth/profile-setup-layout';
import { useAuth } from '@/contexts/auth-context';
import { useCompleteProfileMutation } from '@/hooks/mutations/use-auth-mutations';
import {
  Colors,
  Dimensions,
  FontFamily,
  FontSize,
  FontWeight,
} from '@/styles/ui-theme';

export default function CompleteProfileRoute() {
  const { user, signIn } = useAuth();
  const params = useLocalSearchParams<{ universityId?: string; universityName?: string }>();
  const completeProfileMutation = useCompleteProfileMutation();
  const [major, setMajor] = useState('');
  const [bio, setBio] = useState('');
  const [serverError, setServerError] = useState('');
  const [profileImage, setProfileImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const universityId = Number(params.universityId);

  useEffect(() => {
    if (!user) {
      router.replace('/(auth)');
      return;
    }

    if (!Number.isFinite(universityId) || universityId <= 0) {
      router.replace('/(auth)/select-university');
    }
  }, [universityId, user]);

  if (!user || !Number.isFinite(universityId) || universityId <= 0) {
    return null;
  }

  const currentUser = user;

  async function handlePickImage() {
    setServerError('');

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('صلاحية مطلوبة', 'يرجى السماح للتطبيق بالوصول إلى الصور لاختيار صورة شخصية.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0] ?? null);
    }
  }

  async function handleSubmit() {
    setServerError('');

    try {
      await completeProfileMutation.mutateAsync({
        universityId,
        major,
        bio,
        profileImage: {
          uri: profileImage?.uri ?? '',
          name: profileImage?.fileName,
          type: profileImage?.mimeType,
          file: profileImage?.file,
        },
      });

      signIn({
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        isProfileCompleted: true,
      });

      router.replace('/(tabs)/home');
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'تعذر إكمال الملف الشخصي');
    }
  }

  return (
    <ProfileSetupLayout
      step={2}
      title="أكمل ملفك الشخصي"
      subtitle="أخبر زملاءك قليلاً عن تخصصك واهتماماتك."
      footer={
        <View style={styles.footerActions}>
          <Pressable
            onPress={() => {
              router.replace({
                pathname: '/(auth)/select-university',
                params: { selectedId: String(universityId) },
              });
            }}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.secondaryButtonPressed,
            ]}
          >
            <Text style={styles.secondaryButtonText}>رجوع</Text>
          </Pressable>

          <Pressable
            disabled={completeProfileMutation.isPending}
            onPress={() => {
              void handleSubmit();
            }}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && !completeProfileMutation.isPending && styles.primaryButtonPressed,
              completeProfileMutation.isPending && styles.primaryButtonDisabled,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {completeProfileMutation.isPending ? 'جارٍ الإرسال...' : 'إكمال التسجيل'}
            </Text>
          </Pressable>
        </View>
      }
    >
      <View style={styles.avatarSection}>
        <Pressable
          onPress={() => {
            void handlePickImage();
          }}
          style={({ pressed }) => [
            styles.avatarButton,
            pressed && styles.avatarButtonPressed,
            profileImage ? styles.avatarButtonFilled : null,
          ]}
        >
          {profileImage ? (
            <Image contentFit="cover" source={{ uri: profileImage.uri }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="camera-outline" size={34} color="#b8b8bf" />
          )}
        </Pressable>
        <Text style={styles.uploadHint}>رفع صورة شخصية</Text>
      </View>

      {!!params.universityName ? (
        <View style={styles.universityBadge}>
          <Ionicons name="school-outline" size={18} color={Colors.primary} />
          <Text style={styles.universityBadgeText}>{params.universityName}</Text>
        </View>
      ) : null}

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>التخصص / القسم</Text>
        <TextInput
          onChangeText={setMajor}
          placeholder="مثال: هندسة برمجيات"
          placeholderTextColor="#a1a1aa"
          style={styles.input}
          textAlign="right"
          value={major}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>نبذة عنك</Text>
        <TextInput
          multiline
          onChangeText={setBio}
          placeholder="أنا طالب سنة ثالثة مهتم بتطوير التطبيقات..."
          placeholderTextColor="#a1a1aa"
          style={[styles.input, styles.textArea]}
          textAlign="right"
          textAlignVertical="top"
          value={bio}
        />
      </View>

      <View style={styles.verifiedCard}>
        <Ionicons name="checkmark-circle" size={22} color="#34c759" />
        <Text style={styles.verifiedText}>تم التحقق من البريد: {currentUser.email}</Text>
      </View>

      {!!serverError ? <Text style={styles.errorText}>{serverError}</Text> : null}
    </ProfileSetupLayout>
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
    borderColor: '#d6d7dd',
    backgroundColor: 'rgba(255, 255, 255, 0.52)',
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
    color: Colors.primary,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
  },
  universityBadge: {
    minHeight: 44,
    borderRadius: 16,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(47, 99, 224, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(47, 99, 224, 0.12)',
  },
  universityBadgeText: {
    color: Colors.primary,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  fieldGroup: {
    gap: 10,
  },
  label: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: 16,
    fontWeight: FontWeight.medium,
    textAlign: 'right',
    writingDirection: 'rtl',
    paddingHorizontal: 4,
  },
  input: {
    minHeight: 58,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1e3e9',
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: 15,
    writingDirection: 'rtl',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  textArea: {
    minHeight: 132,
  },
  verifiedCard: {
    minHeight: 50,
    borderRadius: 18,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  verifiedText: {
    color: '#24a34c',
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  errorText: {
    color: Colors.destructive,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    textAlign: 'right',
    writingDirection: 'rtl',
    paddingHorizontal: 4,
  },
  footerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#dddfe7',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  secondaryButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  secondaryButtonText: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: 17,
    fontWeight: FontWeight.semibold,
  },
  primaryButton: {
    flex: 1,
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 14,
    elevation: 5,
  },
  primaryButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  primaryButtonDisabled: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontFamily: FontFamily.cairo,
    fontSize: 17,
    fontWeight: FontWeight.bold,
  },
});
