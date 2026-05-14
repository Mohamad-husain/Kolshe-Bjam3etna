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
import { useAuth } from '@/contexts/auth-context';
import { useCompleteProfileFlow } from '@/hooks/use-complete-profile-flow';

export default function CompleteProfileRoute() {
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
      router.navigate('/(auth)');
      return;
    }

    if (!Number.isFinite(universityId) || universityId <= 0) {
      router.navigate('/(auth)/select-university');
    }
  }, [universityId, user]);

  if (!user || !Number.isFinite(universityId) || universityId <= 0) {
    return null;
  }

  return (
    <ProfileSetupLayout
      step={2}
      title="أكمل ملفك الشخصي"
      subtitle="أخبر زملاءك قليلاً عن تخصصك واهتماماتك."
      footer={
        <CompleteProfileFooter
          isSubmitting={completeProfileFlow.isSubmitting}
          onBack={() => {
            router.navigate({
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
        label="التخصص / القسم"
        name="major"
        onValueChange={completeProfileFlow.clearServerError}
        placeholder="مثال: هندسة برمجيات"
        requiredMessage="يرجى إدخال التخصص أو القسم"
      />

      <CompleteProfileTextField
        control={completeProfileFlow.control}
        errors={completeProfileFlow.errors}
        label="نبذة عنك"
        multiline
        name="bio"
        onValueChange={completeProfileFlow.clearServerError}
        placeholder="أنا طالب سنة ثالثة مهتم بتطوير التطبيقات..."
      />

      <CompleteProfileVerifiedCard email={user.email} />

      <CompleteProfileErrorText message={completeProfileFlow.serverError} />
    </ProfileSetupLayout>
  );
}
