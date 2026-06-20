import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useAppSettings } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import {
  FontFamily,
  FontSize,
  FontWeight,
} from '@/styles/ui-theme';

type CompleteProfileUniversityBadgeProps = {
  universityName?: string;
};

type CompleteProfileVerifiedCardProps = {
  email: string;
};

export function CompleteProfileUniversityBadge({
  universityName,
}: CompleteProfileUniversityBadgeProps) {
  const { isRtl } = useAppSettings();
  const { colors } = useThemePreference();

  if (!universityName) {
    return null;
  }

  return (
    <View
      style={[
        styles.universityBadge,
        {
          backgroundColor: colors.secondary,
          borderColor: colors.border,
          flexDirection: isRtl ? 'row' : 'row-reverse',
        },
      ]}
    >
      <Ionicons name="school-outline" size={18} color={colors.primary} />
      <Text
        style={[
          styles.universityBadgeText,
          { color: colors.primary, writingDirection: isRtl ? 'rtl' : 'ltr' },
        ]}
      >
        {universityName}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  universityBadge: {
    minHeight: 44,
    borderRadius: 16,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
  },
  universityBadgeText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
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
});

export function CompleteProfileVerifiedCard({ email }: CompleteProfileVerifiedCardProps) {
  const { isRtl, t } = useAppSettings();

  return (
    <View style={styles.verifiedCard}>
      <Ionicons name="checkmark-circle" size={22} color="#34c759" />
      <Text style={[styles.verifiedText, { writingDirection: isRtl ? 'rtl' : 'ltr' }]}>
        {t('completeProfile.verifiedEmail', { email })}
      </Text>
    </View>
  );
}
