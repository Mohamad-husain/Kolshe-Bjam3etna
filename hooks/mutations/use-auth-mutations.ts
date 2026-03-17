import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import {
  forgotPassword,
  login,
  register,
  resetPassword,
  verifyResetCode,
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

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: (user) => {
      cacheUser(queryClient, user);
    },
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RegisterInput) => register(input),
    onSuccess: (user) => {
      cacheUser(queryClient, user);
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
