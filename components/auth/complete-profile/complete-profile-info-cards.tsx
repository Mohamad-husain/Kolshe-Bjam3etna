import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import {
  Colors,
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
  if (!universityName) {
    return null;
  }

  return (
    <View style={styles.universityBadge}>
      <Ionicons name="school-outline" size={18} color={Colors.primary} />
      <Text style={styles.universityBadgeText}>{universityName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
  return (
    <View style={styles.verifiedCard}>
      <Ionicons name="checkmark-circle" size={22} color="#34c759" />
      <Text style={styles.verifiedText}>تم التحقق من البريد: {email}</Text>
    </View>
  );
}
