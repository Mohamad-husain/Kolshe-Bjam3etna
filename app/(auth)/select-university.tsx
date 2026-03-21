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
import { useAuth } from '@/contexts/auth-context';
import { useUniversitiesQuery } from '@/hooks/queries/use-auth-queries';
import {
  Colors,
  Dimensions,
  FontFamily,
  FontSize,
  FontWeight,
} from '@/styles/ui-theme';

export default function SelectUniversityRoute() {
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
      title="اختر جامعتك"
      subtitle="انضم لمجتمع جامعتك لرؤية الطلبات المناسبة."
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
            pressed && selectedUniversity && styles.primaryButtonPressed,
            (!selectedUniversity || universitiesQuery.isPending) && styles.primaryButtonDisabled,
          ]}
        >
          <View style={styles.primaryButtonContent}>
            <Ionicons name="chevron-back" size={20} color="#ffffff" />
            <Text style={styles.primaryButtonText}>متابعة</Text>
          </View>
        </Pressable>
      }
    >
      {universitiesQuery.isPending ? (
        <View style={styles.feedbackCard}>
          <ActivityIndicator color={Colors.primary} />
          <Text style={styles.feedbackText}>جارٍ تحميل الجامعات...</Text>
        </View>
      ) : null}

      {!universitiesQuery.isPending && universitiesQuery.isError ? (
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackText}>
            {universitiesQuery.error instanceof Error
              ? universitiesQuery.error.message
              : 'تعذر تحميل قائمة الجامعات'}
          </Text>
          <Pressable
            onPress={() => {
              void universitiesQuery.refetch();
            }}
            style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
          >
            <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
          </Pressable>
        </View>
      ) : null}

      {!universitiesQuery.isPending &&
      !universitiesQuery.isError &&
      universitiesQuery.data?.length === 0 ? (
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackText}>لا توجد جامعات متاحة حالياً.</Text>
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
                isSelected && styles.universityCardSelected,
                pressed && styles.universityCardPressed,
              ]}
            >
              <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                {isSelected ? <View style={styles.radioInner} /> : null}
              </View>
              <Text style={styles.universityName}>{university.name}</Text>
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
    borderColor: '#dddfe7',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  universityCardSelected: {
    borderColor: 'rgba(47, 99, 224, 0.25)',
    shadowColor: Colors.primary,
    shadowOpacity: 0.08,
  },
  universityCardPressed: {
    transform: [{ scale: 0.99 }],
  },
  universityName: {
    flex: 1,
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: 16,
    fontWeight: FontWeight.medium,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  radioOuter: {
    width: 26,
    height: 26,
    borderRadius: Dimensions.radiusFull,
    borderWidth: 2,
    borderColor: '#d5d6db',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 14,
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
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
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: '#e2e4ea',
  },
  feedbackText: {
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    textAlign: 'center',
    writingDirection: 'rtl',
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
    color: Colors.primary,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
  },
  primaryButton: {
    minHeight: 58,
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
    opacity: 0.45,
    shadowOpacity: 0,
  },
  primaryButtonContent: {
    flexDirection: 'row',
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
