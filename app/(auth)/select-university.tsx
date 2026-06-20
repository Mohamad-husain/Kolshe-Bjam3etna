import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ProfileSetupLayout } from '@/components/auth/profile-setup-layout';
import { useAppSettings } from '@/contexts/app-settings-context';
import { useAuth } from '@/contexts/auth-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import { useUniversitiesQuery } from '@/hooks/queries/use-auth-queries';
import {
  Dimensions,
  FontFamily,
  FontSize,
  FontWeight,
} from '@/styles/ui-theme';

export default function SelectUniversityRoute() {
  const { isRtl, t } = useAppSettings();
  const { colors } = useThemePreference();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ selectedId?: string }>();
  const universitiesQuery = useUniversitiesQuery(!!user);
  const [selectedUniversityId, setSelectedUniversityId] = useState<number | null>(() => {
    const initialId = Number(params.selectedId);
    return Number.isFinite(initialId) && initialId > 0 ? initialId : null;
  });

  useEffect(() => {
    if (!user) {
      router.replace('/(auth)');
      return;
    }

    const nextId = Number(params.selectedId);

    if (Number.isFinite(nextId) && nextId > 0) {
      setSelectedUniversityId(nextId);
    }
  }, [params.selectedId, user]);

  if (!user) {
    return null;
  }

  const selectedUniversity =
    universitiesQuery.data?.find((item) => item.id === selectedUniversityId) ?? null;

  return (
    <ProfileSetupLayout
      step={1}
      title={t('completeProfile.selectUniversityTitle')}
      subtitle={t('completeProfile.selectUniversitySubtitle')}
      footer={
        <Pressable
          disabled={!selectedUniversity || universitiesQuery.isPending}
          onPress={() => {
            if (!selectedUniversity) {
              return;
            }

            router.push({
              pathname: '/(auth)/complete-profile',
              params: {
                universityId: String(selectedUniversity.id),
                universityName: selectedUniversity.name,
              },
            });
          }}
          style={({ pressed }) => [
            styles.primaryButton,
            { backgroundColor: colors.primary, shadowColor: colors.primary },
            pressed && selectedUniversity && styles.primaryButtonPressed,
            (!selectedUniversity || universitiesQuery.isPending) && styles.primaryButtonDisabled,
          ]}
        >
          <View style={[styles.primaryButtonContent, { flexDirection: isRtl ? 'row' : 'row-reverse' }]}>
            <Ionicons name="chevron-back" size={20} color="#ffffff" />
            <Text style={styles.primaryButtonText}>{t('completeProfile.continue')}</Text>
          </View>
        </Pressable>
      }
    >
      {universitiesQuery.isPending ? (
        <View style={[styles.feedbackCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.feedbackText, { color: colors.mutedForeground, writingDirection: isRtl ? 'rtl' : 'ltr' }]}>
            {t('completeProfile.loadingUniversities')}
          </Text>
        </View>
      ) : null}

      {!universitiesQuery.isPending && universitiesQuery.isError ? (
        <View style={[styles.feedbackCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.feedbackText, { color: colors.mutedForeground, writingDirection: isRtl ? 'rtl' : 'ltr' }]}>
            {universitiesQuery.error instanceof Error
              ? universitiesQuery.error.message
              : t('completeProfile.loadUniversitiesError')}
          </Text>
          <Pressable
            onPress={() => {
              void universitiesQuery.refetch();
            }}
            style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
          >
            <Text style={[styles.retryButtonText, { color: colors.primary }]}>{t('completeProfile.retry')}</Text>
          </Pressable>
        </View>
      ) : null}

      {!universitiesQuery.isPending &&
      !universitiesQuery.isError &&
      universitiesQuery.data?.length === 0 ? (
        <View style={[styles.feedbackCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.feedbackText, { color: colors.mutedForeground, writingDirection: isRtl ? 'rtl' : 'ltr' }]}>
            {t('completeProfile.emptyUniversities')}
          </Text>
        </View>
      ) : null}

      {!universitiesQuery.isPending &&
        !universitiesQuery.isError &&
        universitiesQuery.data?.map((university) => {
          const isSelected = university.id === selectedUniversityId;

          return (
            <Pressable
              key={university.id}
              onPress={() => {
                setSelectedUniversityId(university.id);
              }}
              style={({ pressed }) => [
                styles.universityCard,
                { backgroundColor: colors.card, borderColor: colors.border, flexDirection: isRtl ? 'row' : 'row-reverse' },
                isSelected && [styles.universityCardSelected, { borderColor: colors.primary, shadowColor: colors.primary }],
                pressed && styles.universityCardPressed,
              ]}
            >
              <View
                style={[
                  styles.radioOuter,
                  { borderColor: colors.border },
                  isSelected && [styles.radioOuterSelected, { borderColor: colors.primary, backgroundColor: colors.primary }],
                ]}
              >
                {isSelected ? <View style={styles.radioInner} /> : null}
              </View>
              <Text
                style={[
                  styles.universityName,
                  {
                    color: colors.foreground,
                    textAlign: isRtl ? 'right' : 'left',
                    writingDirection: isRtl ? 'rtl' : 'ltr',
                  },
                ]}
              >
                {university.name}
              </Text>
            </Pressable>
          );
        })}
    </ProfileSetupLayout>
  );
}

const styles = StyleSheet.create({
  universityCard: {
    minHeight: 70,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  universityCardSelected: {
    shadowOpacity: 0.08,
  },
  universityCardPressed: {
    transform: [{ scale: 0.99 }],
  },
  universityName: {
    flex: 1,
    fontFamily: FontFamily.cairo,
    fontSize: 16,
    fontWeight: FontWeight.medium,
  },
  radioOuter: {
    width: 26,
    height: 26,
    borderRadius: Dimensions.radiusFull,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 14,
  },
  radioOuterSelected: {
  },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: Dimensions.radiusFull,
    backgroundColor: '#ffffff',
  },
  feedbackCard: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 22,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
  },
  feedbackText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    minWidth: 120,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 11,
    backgroundColor: 'rgba(47, 99, 224, 0.1)',
  },
  retryButtonPressed: {
    opacity: 0.8,
  },
  retryButtonText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
  },
  primaryButton: {
    minHeight: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 14,
    elevation: 5,
  },
  primaryButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  primaryButtonDisabled: {
    opacity: 0.45,
    shadowOpacity: 0,
  },
  primaryButtonContent: {
    alignItems: 'center',
    gap: 10,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontFamily: FontFamily.cairo,
    fontSize: 18,
    fontWeight: FontWeight.bold,
  },
});
