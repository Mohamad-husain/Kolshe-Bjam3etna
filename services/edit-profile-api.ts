import { isAxiosError } from 'axios';

import { getPreferredStudyYearApiValue } from '@/lib/edit-profile-config';
import { getAuthToken } from '@/services/auth-api';
import { apiClient, getApiErrorMessage } from '@/services/http-client';
import type {
  AdminEditProfileAcademicInput,
  AdminEditProfilePasswordInput,
  AdminEditProfilePersonalInput,
} from '@/types/edit-profile';

type ApiMessageResponse = {
  message?: string;
};

type UploadableProfileImage = NonNullable<AdminEditProfilePersonalInput['profileImage']>;
type WebUploadPart = Blob | File;

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').trim().replace(/\/$/, '');
const isWebRuntime = typeof window !== 'undefined' && typeof document !== 'undefined';

function trimValue(value: string) {
  return value.trim();
}

function getResponseMessage(payload: ApiMessageResponse | null | undefined, fallback: string) {
  return payload?.message?.trim() || fallback;
}

async function parseUnknownResponse(response: Response) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json() as Promise<unknown>;
  }

  const text = await response.text();

  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function getFetchErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload === 'string' && payload.trim()) {
    return payload.trim();
  }

  if (payload && typeof payload === 'object' && 'message' in payload) {
    const message = (payload as { message?: unknown }).message;

    if (typeof message === 'string' && message.trim()) {
      return message.trim();
    }
  }

  return fallback;
}

async function postWebMultipart<TResponse>(
  path: string,
  body: FormData,
  fallbackMessage: string,
): Promise<TResponse> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
    body,
  });
  const payload = await parseUnknownResponse(response);

  if (!response.ok) {
    throw new Error(getFetchErrorMessage(payload, fallbackMessage));
  }

  return payload as TResponse;
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

async function createWebProfileImagePart(image: UploadableProfileImage): Promise<WebUploadPart> {
  if (image.file) {
    return image.file;
  }

  try {
    const response = await fetch(image.uri);

    if (!response.ok) {
      throw new Error(`Image fetch failed with status ${response.status}`);
    }

    const blob = await response.blob();
    const fileName = image.name?.trim() || `profile-${Date.now()}.jpg`;
    const mimeType = image.type?.trim() || blob.type || 'image/jpeg';

    if (typeof File !== 'undefined') {
      return new File([blob], fileName, { type: mimeType });
    }

    return blob;
  } catch {
    throw new Error('تعذر تجهيز الصورة الجديدة للرفع. حاول اختيار الصورة مرة أخرى.');
  }
}

function appendProfileImage(
  formData: FormData,
  input: AdminEditProfilePersonalInput,
  webPart?: WebUploadPart | null,
) {
  const image = input.profileImage;

  if (!image?.uri || image.isRemote) {
    return;
  }

  if (webPart) {
    if (typeof Blob !== 'undefined' && webPart instanceof Blob) {
      formData.append('ProfileImage', webPart, image.name ?? `profile-${Date.now()}.jpg`);
      return;
    }

    formData.append('ProfileImage', webPart as never);
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
  const webPart =
    isWebRuntime && API_BASE_URL ? await createWebProfileImagePart(input.profileImage) : null;

  appendProfileImage(formData, input, webPart);

  if (isWebRuntime && API_BASE_URL) {
    const payload = await postWebMultipart<ApiMessageResponse | null>(
      '/api/Account/profile/photo',
      formData,
      'تعذر تحديث الصورة الشخصية',
    );

    return getResponseMessage(payload, 'تم تحديث الصورة الشخصية');
  }

  const response = await apiClient
    .post<ApiMessageResponse>('/api/Account/profile/photo', formData)
    .catch((error) => {
      throw new Error(getApiErrorMessage(error, 'تعذر تحديث الصورة الشخصية'));
    });

  return getResponseMessage(response.data, 'تم تحديث الصورة الشخصية');
}

export async function updateAdminEditProfilePersonal(input: AdminEditProfilePersonalInput) {
  if (input.skipPersonalDetailsUpdate) {
    const photoMessage = await uploadAdminEditProfilePhoto(input);
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
  const personalMessage = getResponseMessage(response.data, 'تم حفظ البيانات الشخصية');
  const photoMessage = await uploadAdminEditProfilePhoto(input);

  return photoMessage ?? personalMessage;
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
