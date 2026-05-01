import { isAxiosError } from 'axios';

import { getPreferredStudyYearApiValue } from '@/lib/edit-profile-config';
import { apiClient, getApiErrorMessage } from '@/services/http-client';
import type {
  AdminEditProfileAcademicInput,
  AdminEditProfilePasswordInput,
  AdminEditProfilePersonalInput,
} from '@/types/edit-profile';

type ApiMessageResponse = {
  message?: string;
};

function trimValue(value: string) {
  return value.trim();
}

function getResponseMessage(payload: ApiMessageResponse | null | undefined, fallback: string) {
  return payload?.message?.trim() || fallback;
}

function shouldRetryWithFallback(error: unknown, retryStatuses: number[]) {
  if (!isAxiosError(error)) {
    return false;
  }

  const status = error.response?.status ?? 0;
  return retryStatuses.includes(status);
}

async function requestWithFallback<TResponse>(
  requests: (() => Promise<TResponse>)[],
  fallbackMessage: string,
  retryStatuses: number[] = [404, 405],
) {
  let lastError: unknown = null;

  for (const request of requests) {
    try {
      return await request();
    } catch (error) {
      lastError = error;

      if (!shouldRetryWithFallback(error, retryStatuses)) {
        throw new Error(getApiErrorMessage(error, fallbackMessage));
      }
    }
  }

  throw new Error(getApiErrorMessage(lastError, fallbackMessage));
}

function appendFormFields(
  formData: FormData,
  payload: Record<string, string | number | null | undefined>,
) {
  for (const [key, value] of Object.entries(payload)) {
    formData.append(key, value == null ? '' : String(value));
  }
}

function normalizeUniversityNumber(value: string) {
  return value.replace(/\D/g, '');
}

function appendProfileImage(formData: FormData, input: AdminEditProfilePersonalInput) {
  const image = input.profileImage;

  if (!image?.uri || image.isRemote) {
    return;
  }

  if (image.file) {
    formData.append('ProfileImage', image.file);
    return;
  }

  formData.append(
    'ProfileImage',
    {
      uri: image.uri,
      name: image.name ?? `profile-${Date.now()}.jpg`,
      type: image.type ?? 'image/jpeg',
    } as never,
  );
}

function buildPersonalPayload(input: AdminEditProfilePersonalInput) {
  return {
    FullName: trimValue(input.fullName),
    PhoneNumber: trimValue(input.phoneNumber),
    Bio: trimValue(input.bio),
  };
}

function buildAcademicPayload(input: AdminEditProfileAcademicInput) {
  return {
    UniversityId: input.universityId,
    UniversityName: trimValue(input.universityName),
    Major: trimValue(input.major),
    StudyYear: getPreferredStudyYearApiValue(input.studyYear),
    UniversityNumber: normalizeUniversityNumber(input.universityNumber),
  };
}

async function uploadAdminEditProfilePhoto(input: AdminEditProfilePersonalInput) {
  if (!input.profileImage?.uri || input.profileImage.isRemote) {
    return null;
  }

  const formData = new FormData();
  appendProfileImage(formData, input);

  const response = await apiClient.post<ApiMessageResponse>('/api/Account/profile/photo', formData).catch((error) => {
    throw new Error(getApiErrorMessage(error, 'تعذر تحديث الصورة الشخصية'));
  });

  return getResponseMessage(response.data, 'تم تحديث الصورة الشخصية');
}

export async function updateAdminEditProfilePersonal(input: AdminEditProfilePersonalInput) {
  const photoMessage = await uploadAdminEditProfilePhoto(input);

  if (input.skipPersonalDetailsUpdate) {
    return photoMessage ?? 'تم حفظ البيانات الشخصية';
  }

  const payload = buildPersonalPayload(input);
  const formData = new FormData();

  appendFormFields(formData, payload);
  formData.append('request', JSON.stringify(payload));

  const response = await requestWithFallback(
    [
      () => apiClient.put<ApiMessageResponse>('/api/Account/profile/personal', formData),
      () => apiClient.put<ApiMessageResponse>('/api/Account/profile', formData),
    ],
    'تعذر حفظ البيانات الشخصية',
    [404, 405, 415],
  );

  return getResponseMessage(response.data, photoMessage ?? 'تم حفظ البيانات الشخصية');
}

export async function updateAdminEditProfileAcademic(input: AdminEditProfileAcademicInput) {
  const payload = buildAcademicPayload(input);
  const formData = new FormData();

  appendFormFields(formData, payload);
  formData.append('request', JSON.stringify(payload));

  try {
    const response = await apiClient.put<ApiMessageResponse>(
      '/api/Account/profile/academic',
      payload,
    );
    return getResponseMessage(response.data, 'تم حفظ البيانات الأكاديمية');
  } catch (error) {
    if (!shouldRetryWithFallback(error, [415])) {
      throw new Error(getApiErrorMessage(error, 'تعذر حفظ البيانات الأكاديمية'));
    }
  }

  try {
    const response = await apiClient.put<ApiMessageResponse>(
      '/api/Account/profile/academic',
      formData,
    );
    return getResponseMessage(response.data, 'تم حفظ البيانات الأكاديمية');
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'تعذر حفظ البيانات الأكاديمية'));
  }
}

export async function updateAdminEditProfilePassword(input: AdminEditProfilePasswordInput) {
  const payload = {
    CurrentPassword: input.currentPassword.trim(),
    OldPassword: input.currentPassword.trim(),
    NewPassword: input.newPassword.trim(),
    ConfirmNewPassword: input.confirmNewPassword.trim(),
    ConfirmPassword: input.confirmNewPassword.trim(),
  };

  const response = await requestWithFallback(
    [
      () => apiClient.put<ApiMessageResponse>('/api/Account/profile/password', payload),
      () => apiClient.post<ApiMessageResponse>('/api/Account/change-password', payload),
      () => apiClient.post<ApiMessageResponse>('/api/Account/profile/change-password', payload),
    ],
    'تعذر تحديث كلمة المرور',
  );

  return getResponseMessage(response.data, 'تم تحديث كلمة المرور');
}
