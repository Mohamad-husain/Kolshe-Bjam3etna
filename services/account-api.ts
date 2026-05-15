import { AUTH_COPY } from '@/lib/auth/auth-copy';
import { apiClient, getApiErrorMessage } from '@/services/http-client';

const ACCOUNT_ENDPOINTS = {
  forgotPassword: '/api/Account/forgot-password',
  verifyResetCode: '/api/Account/verify-reset-code',
  resetPassword: '/api/Account/reset-password',
  universities: '/api/Account/universities',
  profile: '/api/Account/profile',
  completeProfile: '/api/Account/complete-profile',
} as const;

const ACCOUNT_ERROR_MESSAGES = {
  forgotPasswordFailed: 'تعذر إرسال رمز التحقق',
  verificationCodeRequired: 'يرجى إدخال رمز التحقق',
  invalidVerificationCode: 'رمز التحقق غير صحيح',
  resetPasswordFailed: 'تعذر تغيير كلمة المرور',
  universitiesFailed: 'تعذر تحميل قائمة الجامعات',
  profileFailed: 'تعذر تحميل الملف الشخصي',
  universityRequired: 'يرجى اختيار الجامعة',
  majorRequired: 'يرجى إدخال التخصص أو القسم',
  profileImageRequired: 'يرجى اختيار صورة شخصية',
  completeProfileFailed: 'تعذر إكمال الملف الشخصي',
} as const;

export type University = {
  id: number;
  name: string;
};

export type AccountProfile = {
  fullName: string;
  email: string;
  phoneNumber: string | null;
  bio: string | null;
  websiteUrl: string | null;
  profileImageUrl: string | null;
  universityName: string | null;
  universityId: number | null;
  major: string | null;
  studyYear: string | null;
  universityNumber: string | null;
};

export type ForgotPasswordInput = {
  email: string;
};

export type VerifyResetCodeInput = {
  email: string;
  code: string;
};

export type ResetPasswordInput = {
  email: string;
  code: string;
  newPassword: string;
};

export type ProfileImageInput = {
  uri: string;
  name?: string | null;
  type?: string | null;
  file?: File;
};

export type CompleteProfileInput = {
  universityId: number;
  major: string;
  bio: string;
  profileImage: ProfileImageInput;
};

type ApiMessageResponse = {
  message?: string;
};

type ApiUniversitiesResponse = {
  data?: University[];
};

type ApiProfileResponse = {
  data?: AccountProfile;
};

async function request<TResponse>(
  action: () => Promise<{ data: TResponse }>,
  fallbackMessage: string,
) {
  try {
    return (await action()).data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, fallbackMessage));
  }
}

function postRequest<TResponse>(
  path: string,
  body: FormData | Record<string, unknown>,
  fallbackMessage: string,
) {
  return request(() => apiClient.post<TResponse>(path, body), fallbackMessage);
}

function getRequest<TResponse>(path: string, fallbackMessage: string) {
  return request(() => apiClient.get<TResponse>(path), fallbackMessage);
}

async function postMessageAction(
  path: string,
  body: Record<string, unknown>,
  fallbackMessage: string,
) {
  const response = await postRequest<ApiMessageResponse>(path, body, fallbackMessage);
  return response.message ?? null;
}

function trimText(value: string) {
  return value.trim();
}

function requireText(value: string, errorMessage: string) {
  const trimmedValue = trimText(value);

  if (!trimmedValue) {
    throw new Error(errorMessage);
  }

  return trimmedValue;
}

function assertMinTrimmedLength(value: string, minLength: number, errorMessage: string) {
  if (trimText(value).length < minLength) {
    throw new Error(errorMessage);
  }
}

function normalizeEmail(email: string) {
  return trimText(email).toLowerCase();
}

function normalizeRequiredEmail(email: string) {
  return requireText(normalizeEmail(email), AUTH_COPY.emailRequired);
}

function normalizeRequiredCode(code: string) {
  return requireText(code, ACCOUNT_ERROR_MESSAGES.verificationCodeRequired);
}

function normalizePositiveNumber(value: number, errorMessage: string) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    throw new Error(errorMessage);
  }

  return numericValue;
}

function normalizeTextValue(value: unknown) {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value).trim();
  }

  return '';
}

function normalizeNullableTextValue(value: unknown) {
  return normalizeTextValue(value) || null;
}

function appendCacheBustingParam(value: string | null) {
  if (!value) {
    return null;
  }

  if (
    value.startsWith('data:') ||
    value.startsWith('file:') ||
    value.startsWith('blob:') ||
    value.startsWith('content:')
  ) {
    return value;
  }

  const separator = value.includes('?') ? '&' : '?';
  return `${value}${separator}v=${Date.now()}`;
}

function normalizeNullablePositiveNumber(value: unknown) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : null;
}

function normalizeAccountProfile(value: unknown): AccountProfile | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Partial<AccountProfile> & Record<string, unknown>;

  return {
    fullName: normalizeTextValue(candidate.fullName),
    email: normalizeTextValue(candidate.email),
    phoneNumber: normalizeNullableTextValue(candidate.phoneNumber),
    bio: normalizeNullableTextValue(candidate.bio),
    websiteUrl: normalizeNullableTextValue(candidate.websiteUrl),
    profileImageUrl: appendCacheBustingParam(
      normalizeNullableTextValue(candidate.profileImageUrl),
    ),
    universityName: normalizeNullableTextValue(candidate.universityName),
    universityId: normalizeNullablePositiveNumber(candidate.universityId),
    major: normalizeNullableTextValue(candidate.major),
    studyYear: normalizeNullableTextValue(candidate.studyYear),
    universityNumber: normalizeNullableTextValue(candidate.universityNumber),
  };
}

function appendProfileImage(formData: FormData, profileImage: ProfileImageInput) {
  if (profileImage.file) {
    formData.append('ProfileImageUrl', profileImage.file);
    return;
  }

  formData.append(
    'ProfileImageUrl',
    {
      uri: profileImage.uri,
      name: profileImage.name ?? `profile-${Date.now()}.jpg`,
      type: profileImage.type ?? 'image/jpeg',
    } as never,
  );
}

export async function forgotPassword(
  input: ForgotPasswordInput,
): Promise<string | null> {
  const email = normalizeRequiredEmail(input.email);

  return postMessageAction(
    ACCOUNT_ENDPOINTS.forgotPassword,
    { email },
    ACCOUNT_ERROR_MESSAGES.forgotPasswordFailed,
  );
}

export async function verifyResetCode(
  input: VerifyResetCodeInput,
): Promise<string | null> {
  const email = normalizeRequiredEmail(input.email);
  const code = normalizeRequiredCode(input.code);

  return postMessageAction(
    ACCOUNT_ENDPOINTS.verifyResetCode,
    { email, code },
    ACCOUNT_ERROR_MESSAGES.invalidVerificationCode,
  );
}

export async function resetPassword(input: ResetPasswordInput): Promise<string | null> {
  const email = normalizeRequiredEmail(input.email);
  const code = normalizeRequiredCode(input.code);
  const newPassword = trimText(input.newPassword);

  assertMinTrimmedLength(newPassword, 8, AUTH_COPY.registerPasswordMinLength);

  return postMessageAction(
    ACCOUNT_ENDPOINTS.resetPassword,
    {
      email,
      code,
      newPassword,
    },
    ACCOUNT_ERROR_MESSAGES.resetPasswordFailed,
  );
}

export async function getUniversities(): Promise<University[]> {
  const response = await getRequest<ApiUniversitiesResponse>(
    ACCOUNT_ENDPOINTS.universities,
    ACCOUNT_ERROR_MESSAGES.universitiesFailed,
  );

  return response.data ?? [];
}

export async function getAccountProfile(): Promise<AccountProfile | null> {
  const response = await getRequest<ApiProfileResponse>(
    ACCOUNT_ENDPOINTS.profile,
    ACCOUNT_ERROR_MESSAGES.profileFailed,
  );

  return normalizeAccountProfile(response.data);
}

export async function completeProfile(
  input: CompleteProfileInput,
): Promise<string | null> {
  const universityId = normalizePositiveNumber(
    input.universityId,
    ACCOUNT_ERROR_MESSAGES.universityRequired,
  );
  const major = requireText(input.major, ACCOUNT_ERROR_MESSAGES.majorRequired);
  const profileImageUri = requireText(
    input.profileImage?.uri ?? '',
    ACCOUNT_ERROR_MESSAGES.profileImageRequired,
  );

  const formData = new FormData();
  formData.append('UniversityId', String(universityId));
  formData.append('Major', major);
  formData.append('Bio', trimText(input.bio));
  appendProfileImage(formData, {
    ...input.profileImage,
    uri: profileImageUri,
  });

  const response = await postRequest<ApiMessageResponse>(
    ACCOUNT_ENDPOINTS.completeProfile,
    formData,
    ACCOUNT_ERROR_MESSAGES.completeProfileFailed,
  );

  return response.message ?? null;
}
