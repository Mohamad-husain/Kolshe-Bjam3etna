import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import {
  updateAdminEditProfileAcademic,
  updateAdminEditProfilePassword,
  updateAdminEditProfilePersonal,
} from '@/services/edit-profile-api';
import type { AccountProfile } from '@/services/auth-api';
import type {
  AdminEditProfileAcademicInput,
  AdminEditProfilePasswordInput,
  AdminEditProfilePersonalInput,
} from '@/types/edit-profile';

function invalidateProfile(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile });
}

function patchProfileCache(
  queryClient: ReturnType<typeof useQueryClient>,
  patch: Partial<AccountProfile>,
) {
  queryClient.setQueryData<AccountProfile | null>(queryKeys.auth.profile, (currentProfile) =>
    currentProfile ? { ...currentProfile, ...patch } : currentProfile,
  );
}

export function useAdminEditProfilePersonalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AdminEditProfilePersonalInput) =>
      updateAdminEditProfilePersonal(input),
    onSuccess: async (_message, input) => {
      patchProfileCache(queryClient, {
        fullName: input.fullName.trim(),
        phoneNumber: input.phoneNumber.trim() || null,
        bio: input.bio.trim() || null,
        profileImageUrl: input.profileImage?.uri ?? undefined,
      });

      await invalidateProfile(queryClient);
    },
  });
}

export function useAdminEditProfileAcademicMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AdminEditProfileAcademicInput) =>
      updateAdminEditProfileAcademic(input),
    onSuccess: (_message, input) => {
      patchProfileCache(queryClient, {
        universityId: input.universityId,
        universityName: input.universityName.trim() || null,
        major: input.major.trim() || null,
        studyYear: input.studyYear.trim() || null,
        universityNumber: input.universityNumber.trim() || null,
      });

      void invalidateProfile(queryClient);
    },
  });
}

export function useAdminEditProfilePasswordMutation() {
  return useMutation({
    mutationFn: (input: AdminEditProfilePasswordInput) =>
      updateAdminEditProfilePassword(input),
  });
}
