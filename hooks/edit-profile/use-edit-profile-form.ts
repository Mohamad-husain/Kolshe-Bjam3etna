import { useCallback, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';

import { buildEditProfileFormValues } from '@/lib/edit-profile/edit-profile-utils';
import type { AccountProfile, User } from '@/services/auth-api';
import type { AdminEditProfileFormValues } from '@/types/edit-profile';

type UseEditProfileFormParams = {
  profile: AccountProfile | null | undefined;
  user: User | null;
};

export function useEditProfileForm({ profile, user }: UseEditProfileFormParams) {
  const initialValuesRef = useRef<AdminEditProfileFormValues | null>(null);
  const form = useForm<AdminEditProfileFormValues>({
    defaultValues: buildEditProfileFormValues(null, user?.email ?? '', user?.name ?? ''),
  });
  const { reset } = form;

  useEffect(() => {
    if (!user) {
      return;
    }

    const nextValues = buildEditProfileFormValues(profile, user.email, user.name);
    reset(nextValues);
    initialValuesRef.current = nextValues;
  }, [profile, reset, user]);

  const initialValues =
    initialValuesRef.current ??
    buildEditProfileFormValues(profile, user?.email ?? '', user?.name ?? '');

  const syncLocalSnapshot = useCallback(
    (nextValues: AdminEditProfileFormValues) => {
      reset(nextValues);
      initialValuesRef.current = nextValues;
    },
    [reset],
  );

  return {
    ...form,
    initialValues,
    syncLocalSnapshot,
  };
}
