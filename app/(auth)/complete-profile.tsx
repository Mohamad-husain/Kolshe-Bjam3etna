import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';

import { CompleteProfileAvatarField } from '@/components/auth/complete-profile/complete-profile-avatar-field';
import { CompleteProfileErrorText } from '@/components/auth/complete-profile/complete-profile-error-text';
import { CompleteProfileFooter } from '@/components/auth/complete-profile/complete-profile-footer';
import {
  CompleteProfileUniversityBadge,
  CompleteProfileVerifiedCard,
} from '@/components/auth/complete-profile/complete-profile-info-cards';
import { CompleteProfileTextField } from '@/components/auth/complete-profile/complete-profile-text-field';
import { ProfileSetupLayout } from '@/components/auth/profile-setup-layout';
import { useAppSettings } from '@/contexts/app-settings-context';
import { useAuth } from '@/contexts/auth-context';
import { useCompleteProfileFlow } from '@/hooks/use-complete-profile-flow';

export default function CompleteProfileRoute() {
  const { t } = useAppSettings();
  const { user, signIn } = useAuth();
  const params = useLocalSearchParams<{ universityId?: string; universityName?: string }>();
  const universityId = Number(params.universityId);
  const completeProfileFlow = useCompleteProfileFlow({
    universityId,
    onCompleted: () => {
      if (!user) {
        return;
      }

      signIn({
        ...user,
        isProfileCompleted: true,
      });

      router.replace('/(tabs)/home');
    },
  });

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

  return (
    <ProfileSetupLayout
      step={2}
      title={t('completeProfile.profileTitle')}
      subtitle={t('completeProfile.profileSubtitle')}
      footer={
        <CompleteProfileFooter
          isSubmitting={completeProfileFlow.isSubmitting}
          onBack={() => {
            router.replace({
              pathname: '/(auth)/select-university',
              params: { selectedId: String(universityId) },
            });
          }}
          onSubmit={() => {
            void completeProfileFlow.submitCompleteProfile();
          }}
        />
      }
    >
      <CompleteProfileAvatarField
        control={completeProfileFlow.control}
        errors={completeProfileFlow.errors}
        onPickImage={completeProfileFlow.handlePickImage}
      />

      <CompleteProfileUniversityBadge universityName={params.universityName} />

      <CompleteProfileTextField
        control={completeProfileFlow.control}
        errors={completeProfileFlow.errors}
        label={t('completeProfile.majorLabel')}
        name="major"
        onValueChange={completeProfileFlow.clearServerError}
        placeholder={t('completeProfile.majorPlaceholder')}
        requiredMessage={t('completeProfile.majorRequired')}
      />

      <CompleteProfileTextField
        control={completeProfileFlow.control}
        errors={completeProfileFlow.errors}
        label={t('completeProfile.bioLabel')}
        multiline
        name="bio"
        onValueChange={completeProfileFlow.clearServerError}
        placeholder={t('completeProfile.bioPlaceholder')}
      />

      <CompleteProfileVerifiedCard email={user.email} />

      <CompleteProfileErrorText message={completeProfileFlow.serverError} />
    </ProfileSetupLayout>
  );
}
