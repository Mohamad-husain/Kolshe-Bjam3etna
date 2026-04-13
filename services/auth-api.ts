import { AUTH_COPY } from '@/lib/auth/auth-copy';
import {
  getTokenDisplayName,
  getTokenRoles,
  hasAdminPanelRoles,
} from '@/lib/auth/admin-access';
import { apiClient, getApiErrorMessage, setAuthToken } from '@/services/http-client';

const AUTH_ENDPOINTS = {
  login: '/api/Account/login',
  register: '/api/Account/register',
  forgotPassword: '/api/Account/forgot-password',
  verifyResetCode: '/api/Account/verify-reset-code',
  resetPassword: '/api/Account/reset-password',
  universities: '/api/Account/universities',
  profile: '/api/Account/profile',
  completeProfile: '/api/Account/complete-profile',
} as const;

const AUTH_ERROR_MESSAGES = {
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

export type User = {
  id: string;
  name: string;
  email: string;
  isProfileCompleted: boolean;
  roles: string[];
  canAccessAdmin: boolean;
};

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

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
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

type ApiLoginResponse = ApiMessageResponse & {
  token?: string | null;
  isProfileCompleted?: boolean;
  roles?: unknown;
};

type ApiUniversitiesResponse = ApiMessageResponse & {
  data?: University[];
};

type ApiCompleteProfileResponse = ApiMessageResponse;

type ApiProfileResponse = ApiMessageResponse & {
  data?: AccountProfile;
};

type AuthenticatedUserParams = {
  email: string;
  name: string;
  isProfileCompleted?: boolean;
  roles?: string[];
};

function trimValue(value: string) {
  return value.trim();
}

function requireValue(value: string, errorMessage: string) {
  if (!value) {
    throw new Error(errorMessage);
  }

  return value;
}

function requireTrimmedValue(value: string, errorMessage: string) {
  return requireValue(trimValue(value), errorMessage);
}

function assertMinTrimmedLength(value: string, minLength: number, errorMessage: string) {
  if (trimValue(value).length < minLength) {
    throw new Error(errorMessage);
  }
}

function normalizeEmail(email: string) {
  return trimValue(email).toLowerCase();
}

function normalizeRequiredEmail(email: string) {
  return requireValue(normalizeEmail(email), AUTH_COPY.emailRequired);
}

function normalizeRequiredCode(code: string) {
  return requireTrimmedValue(code, AUTH_ERROR_MESSAGES.verificationCodeRequired);
}

function normalizePositiveNumber(value: number, errorMessage: string) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    throw new Error(errorMessage);
  }

  return numericValue;
}

function buildUserName(name: string, email: string) {
  const emailPrefix = email.split('@')[0]?.trim();

  if (emailPrefix) {
    return emailPrefix;
  }

  return name.replace(/\s+/g, '').toLowerCase() || `user${Date.now()}`;
}

function resolveAuthenticatedUserName(token: string, email: string) {
  return getTokenDisplayName(token) || email.split('@')[0] || 'User';
}

function normalizeProfileCompletionStatus(value?: boolean) {
  return value !== false;
}

function normalizeRoles(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
        .filter((entry): entry is string => Boolean(entry)),
    ),
  );
}

function mergeRoles(primaryRoles: string[], secondaryRoles: string[]) {
  return Array.from(new Set([...primaryRoles, ...secondaryRoles]));
}

function mapAuthenticatedUser({
  email,
  name,
  isProfileCompleted,
  roles = [],
}: AuthenticatedUserParams): User {
  return {
    id: email,
    name,
    email,
    isProfileCompleted: normalizeProfileCompletionStatus(isProfileCompleted),
    roles,
    canAccessAdmin: hasAdminPanelRoles(roles),
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

async function postJson<TResponse>(
  path: string,
  body: Record<string, unknown>,
  fallbackMessage: string,
): Promise<TResponse> {
  try {
    const response = await apiClient.post<TResponse>(path, body);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, fallbackMessage));
  }
}

async function getRequest<TResponse>(path: string, fallbackMessage: string): Promise<TResponse> {
  try {
    const response = await apiClient.get<TResponse>(path);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, fallbackMessage));
  }
}

async function postMultipart<TResponse>(
  path: string,
  body: FormData,
  fallbackMessage: string,
): Promise<TResponse> {
  try {
    const response = await apiClient.post<TResponse>(path, body, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, fallbackMessage));
  }
}

async function submitMessageAction(
  path: string,
  body: Record<string, unknown>,
  fallbackMessage: string,
) {
  const response = await postJson<ApiMessageResponse>(path, body, fallbackMessage);
  return response.message ?? null;
}

export async function login(input: LoginInput): Promise<User> {
  const email = normalizeEmail(input.email);

  const response = await postJson<ApiLoginResponse>(
    AUTH_ENDPOINTS.login,
    {
      email,
      password: input.password,
    },
    AUTH_COPY.loginFailed,
  );

  if (!response.token) {
    throw new Error(response.message ?? AUTH_COPY.invalidCredentials);
  }

  const token = response.token;
  const roles = mergeRoles(normalizeRoles(response.roles), getTokenRoles(token));

  setAuthToken(token);

  return mapAuthenticatedUser({
    email,
    name: resolveAuthenticatedUserName(token, email),
    isProfileCompleted: response.isProfileCompleted,
    roles,
  });
}

export async function register(input: RegisterInput): Promise<User> {
  const email = normalizeEmail(input.email);
  const name = requireTrimmedValue(input.name, AUTH_COPY.fullNameRequired);

  assertMinTrimmedLength(input.password, 8, AUTH_COPY.registerPasswordMinLength);

  await postJson<ApiMessageResponse>(
    AUTH_ENDPOINTS.register,
    {
      fullName: name,
      userName: buildUserName(name, email),
      email,
      password: input.password,
    },
    AUTH_COPY.registerFailed,
  );

  const user = await login({
    email,
    password: input.password,
  });

  return { ...user, name };
}

export async function forgotPassword(input: ForgotPasswordInput): Promise<string | null> {
  const email = normalizeRequiredEmail(input.email);

  return submitMessageAction(
    AUTH_ENDPOINTS.forgotPassword,
    { email },
    AUTH_ERROR_MESSAGES.forgotPasswordFailed,
  );
}

export async function verifyResetCode(input: VerifyResetCodeInput): Promise<string | null> {
  const email = normalizeRequiredEmail(input.email);
  const code = normalizeRequiredCode(input.code);

  return submitMessageAction(
    AUTH_ENDPOINTS.verifyResetCode,
    { email, code },
    AUTH_ERROR_MESSAGES.invalidVerificationCode,
  );
}

export async function resetPassword(input: ResetPasswordInput): Promise<string | null> {
  const email = normalizeRequiredEmail(input.email);
  const code = normalizeRequiredCode(input.code);

  assertMinTrimmedLength(input.newPassword, 8, AUTH_COPY.registerPasswordMinLength);

  return submitMessageAction(
    AUTH_ENDPOINTS.resetPassword,
    {
      email,
      code,
      newPassword: input.newPassword.trim(),
    },
    AUTH_ERROR_MESSAGES.resetPasswordFailed,
  );
}

export async function getUniversities(): Promise<University[]> {
  const response = await getRequest<ApiUniversitiesResponse>(
    AUTH_ENDPOINTS.universities,
    AUTH_ERROR_MESSAGES.universitiesFailed,
  );

  return response.data ?? [];
}

export async function getAccountProfile(): Promise<AccountProfile | null> {
  const response = await getRequest<ApiProfileResponse>(
    AUTH_ENDPOINTS.profile,
    AUTH_ERROR_MESSAGES.profileFailed,
  );

  return response.data ?? null;
}

export async function completeProfile(input: CompleteProfileInput): Promise<string | null> {
  const universityId = normalizePositiveNumber(
    input.universityId,
    AUTH_ERROR_MESSAGES.universityRequired,
  );
  const major = requireTrimmedValue(input.major, AUTH_ERROR_MESSAGES.majorRequired);
  const profileImageUri = requireValue(
    trimValue(input.profileImage?.uri ?? ''),
    AUTH_ERROR_MESSAGES.profileImageRequired,
  );

  const formData = new FormData();
  formData.append('UniversityId', String(universityId));
  formData.append('Major', major);
  formData.append('Bio', trimValue(input.bio));
  appendProfileImage(formData, {
    ...input.profileImage,
    uri: profileImageUri,
  });

  const response = await postMultipart<ApiCompleteProfileResponse>(
    AUTH_ENDPOINTS.completeProfile,
    formData,
    AUTH_ERROR_MESSAGES.completeProfileFailed,
  );

  return response.message ?? null;
}
