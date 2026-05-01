import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AdminEditProfileTheme } from '@/lib/edit-profile-theme';
import { FontFamily, FontSize, FontWeight } from '@/styles/ui-theme';

export function EditProfileHero({
  avatarUri,
  isSaving,
  onBack,
  onPickImage,
  onSave,
  theme,
  topInset,
}: {
  avatarUri: string | null;
  isSaving: boolean;
  onBack: () => void;
  onPickImage: () => void;
  onSave: () => void;
  theme: AdminEditProfileTheme;
  topInset: number;
}) {
  return (
    <View style={[styles.hero, { backgroundColor: theme.heroBackground, paddingTop: topInset + 12 }]}>
      <View style={[styles.glowPrimary, { backgroundColor: theme.heroGlowPrimary }]} />
      <View style={[styles.glowSecondary, { backgroundColor: theme.heroGlowSecondary }]} />
      <View style={[styles.tint, { backgroundColor: theme.heroTint }]} />

      <View style={styles.topRow}>
        <Pressable
          onPress={onSave}
          style={(state) => {
            const hovered = (state as { hovered?: boolean }).hovered === true;

            return [
              styles.topButton,
              {
                backgroundColor: theme.heroButtonBackground,
                borderColor: theme.heroButtonBorder,
              },
              hovered && styles.hovered,
              state.pressed && styles.pressed,
            ];
          }}
        >
          <Text style={[styles.topButtonText, { color: theme.heroButtonText }]}>
            {isSaving ? '...' : 'حفظ'}
          </Text>
        </Pressable>

        <Text style={styles.title}>تعديل الملف</Text>

        <Pressable
          onPress={onBack}
          style={(state) => {
            const hovered = (state as { hovered?: boolean }).hovered === true;

            return [
              styles.circleButton,
              {
                backgroundColor: theme.heroButtonBackground,
                borderColor: theme.heroButtonBorder,
              },
              hovered && styles.hovered,
              state.pressed && styles.pressed,
            ];
          }}
        >
          <Ionicons color={theme.heroButtonText} name="chevron-back" size={22} />
        </Pressable>
      </View>

      <View style={styles.avatarSection}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatarShell}>
            {avatarUri ? (
              <Image
                cachePolicy="none"
                contentFit="cover"
                source={{ uri: avatarUri }}
                style={styles.avatarImage}
              />
            ) : (
              <Ionicons color="rgba(255,255,255,0.78)" name="person-outline" size={54} />
            )}
          </View>

          <Pressable
            onPress={onPickImage}
            style={(state) => {
              const hovered = (state as { hovered?: boolean }).hovered === true;

              return [
                styles.cameraButton,
                hovered && styles.hovered,
                state.pressed && styles.pressed,
              ];
            }}
          >
            <Ionicons color={theme.primary} name="camera-outline" size={18} />
          </Pressable>
        </View>

        <Text style={styles.photoHint}>اضغط لتغيير الصورة</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    minHeight: 292,
    overflow: 'hidden',
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  glowPrimary: {
    position: 'absolute',
    top: -96,
    left: -54,
    width: 220,
    height: 220,
    borderRadius: 999,
  },
  glowSecondary: {
    position: 'absolute',
    right: -58,
    bottom: -76,
    width: 240,
    height: 240,
    borderRadius: 999,
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
  },
  topRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topButton: {
    minWidth: 94,
    minHeight: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  topButtonText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x17,
    fontWeight: FontWeight.bold,
  },
  title: {
    color: '#ffffff',
    fontFamily: FontFamily.cairo,
    fontSize: 22,
    fontWeight: FontWeight.extrabold,
  },
  avatarSection: {
    marginTop: 28,
    alignItems: 'center',
  },
  avatarWrap: {
    width: 132,
    height: 132,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarShell: {
    width: 122,
    height: 122,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  cameraButton: {
    position: 'absolute',
    left: 4,
    bottom: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 5,
  },
  photoHint: {
    marginTop: 12,
    color: 'rgba(255,255,255,0.82)',
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
  },
  hovered: {
    opacity: 0.9,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
