import {
  getPreferredStudyYearApiValue,
  normalizeWebsiteUrl,
} from '@/lib/edit-profile/edit-profile-config';
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

function normalizeNullableValue(value: string) {
  const trimmedValue = trimValue(value);
  return trimmedValue.length > 0 ? trimmedValue : null;
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

async function putJson<TResponse>(
  path: string,
  body: Record<string, unknown>,
  fallbackMessage: string,
): Promise<TResponse> {
  try {
    const response = await apiClient.put<TResponse>(path, body);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, fallbackMessage));
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
  const websiteUrl = normalizeNullableValue(input.websiteUrl);

  return {
    fullName: trimValue(input.fullName),
    phoneNumber: normalizeNullableValue(input.phoneNumber),
    bio: normalizeNullableValue(input.bio),
    websiteUrl: websiteUrl ? normalizeWebsiteUrl(websiteUrl) : null,
  };
}

function buildAcademicPayload(input: AdminEditProfileAcademicInput) {
  return {
    universityId: input.universityId,
    major: trimValue(input.major),
    studyYear: getPreferredStudyYearApiValue(input.studyYear),
    universityNumber: normalizeUniversityNumber(input.universityNumber),
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

  try {
    const response = await apiClient.post<ApiMessageResponse>('/api/Account/profile/photo', formData);
    return getResponseMessage(response.data, 'تم تحديث الصورة الشخصية');
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'تعذر تحديث الصورة الشخصية'));
  }
}

export async function updateAdminEditProfilePersonal(input: AdminEditProfilePersonalInput) {
  if (input.skipPersonalDetailsUpdate) {
    const photoMessage = await uploadAdminEditProfilePhoto(input);
    return photoMessage ?? 'تم حفظ البيانات الشخصية';
  }

  const payload = buildPersonalPayload(input);
  const response = await putJson<ApiMessageResponse>(
    '/api/Account/profile/personal',
    payload,
    'تعذر حفظ البيانات الشخصية',
  );
  const personalMessage = getResponseMessage(response, 'تم حفظ البيانات الشخصية');
  const photoMessage = await uploadAdminEditProfilePhoto(input);

  return photoMessage ?? personalMessage;
}

export async function updateAdminEditProfileAcademic(input: AdminEditProfileAcademicInput) {
  const payload = buildAcademicPayload(input);
  const response = await putJson<ApiMessageResponse>(
    '/api/Account/profile/academic',
    payload,
    'تعذر حفظ البيانات الأكاديمية',
  );

  return getResponseMessage(response, 'تم حفظ البيانات الأكاديمية');
}

export async function updateAdminEditProfilePassword(input: AdminEditProfilePasswordInput) {
  const payload = {
    currentPassword: trimValue(input.currentPassword),
    newPassword: trimValue(input.newPassword),
    confirmNewPassword: trimValue(input.confirmNewPassword),
  };
  const response = await putJson<ApiMessageResponse>(
    '/api/Account/profile/password',
    payload,
    'تعذر تحديث كلمة المرور',
  );

  return getResponseMessage(response, 'تم تحديث كلمة المرور');
}
