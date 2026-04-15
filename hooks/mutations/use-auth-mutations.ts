import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import {
  completeProfile,
  forgotPassword,
  login,
  register,
  resetPassword,
  verifyResetCode,
  type CompleteProfileInput,
  type ForgotPasswordInput,
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
  type User,
  type VerifyResetCodeInput,
} from '@/services/auth-api';

function cacheUser(queryClient: ReturnType<typeof useQueryClient>, user: User) {
  queryClient.setQueryData(queryKeys.auth.user, user);
}

function clearProfileCache(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.removeQueries({ queryKey: queryKeys.auth.profile });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: (user) => {
      cacheUser(queryClient, user);
      clearProfileCache(queryClient);
    },
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RegisterInput) => register(input),
    onSuccess: (user) => {
      cacheUser(queryClient, user);
      clearProfileCache(queryClient);
    },
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (input: ForgotPasswordInput) => forgotPassword(input),
  });
}

export function useVerifyResetCodeMutation() {
  return useMutation({
    mutationFn: (input: VerifyResetCodeInput) => verifyResetCode(input),
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (input: ResetPasswordInput) => resetPassword(input),
  });
}

export function useCompleteProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CompleteProfileInput) => completeProfile(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile });
    },
  });
}
