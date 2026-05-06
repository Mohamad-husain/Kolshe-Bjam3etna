import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { AUTH_COPY } from '@/lib/auth/auth-copy';
import {
  getTokenDisplayName,
  getTokenRoles,
  hasAdminPanelRoles,
} from '@/lib/auth/admin-access';
import { apiClient, getApiErrorMessage } from '@/services/http-client';

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

const AUTH_SESSION_KEY = 'auth.session';

export type User = {
  id: string;
  name: string;
  email: string;
  isProfileCompleted: boolean;
  roles: string[];
  canAccessAdmin: boolean;
};

type WebStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

export type AuthSession = {
  token: string;
  user: User;
};

type AuthSessionInvalidationListener = () => void;

type GlobalAuthTokenHost = typeof globalThis & {
  __kolsheAuthToken?: string | null;
};

function getAuthTokenHost() {
  return globalThis as GlobalAuthTokenHost;
}

function readPersistedAuthToken() {
  return normalizeToken(getAuthTokenHost().__kolsheAuthToken) ?? null;
}

let authToken: string | null = readPersistedAuthToken();
let secureStoreAvailability: Promise<boolean> | null = null;
// Keep storage writes in order so save/logout do not race each other.
let storageOperationQueue: Promise<void> = Promise.resolve();
const authSessionInvalidationListeners = new Set<AuthSessionInvalidationListener>();

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

type ApiProfileResponse = ApiMessageResponse & {
  data?: AccountProfile;
};

type AuthenticatedUserParams = {
  email: string;
  name: string;
  isProfileCompleted?: boolean;
  roles?: string[];
};

function getWebStorage(): WebStorage | null {
  return (globalThis as { localStorage?: WebStorage }).localStorage ?? null;
}

function getSecureStoreOptions() {
  if (Platform.OS === 'ios') {
    return {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    };
  }

  return undefined;
}

function enqueueStorageOperation(operation: () => Promise<void>) {
  const nextOperation = storageOperationQueue.then(operation, operation);

  storageOperationQueue = nextOperation.then(
    () => undefined,
    () => undefined,
  );

  return nextOperation;
}

async function waitForStorageOperations() {
  await storageOperationQueue;
}

async function isSecureStoreAvailable() {
  if (Platform.OS === 'web') {
    return false;
  }

  if (!secureStoreAvailability) {
    secureStoreAvailability = SecureStore.isAvailableAsync().catch(() => false);
  }

  return secureStoreAvailability;
}

async function getStorageItem(key: string) {
  if (Platform.OS === 'web') {
    return getWebStorage()?.getItem(key) ?? null;
  }

  if (!(await isSecureStoreAvailable())) {
    return null;
  }

  return SecureStore.getItemAsync(key);
}

async function setStorageItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    getWebStorage()?.setItem(key, value);
    return;
  }

  if (!(await isSecureStoreAvailable())) {
    return;
  }

  await SecureStore.setItemAsync(key, value, getSecureStoreOptions());
}

async function deleteStorageItem(key: string) {
  if (Platform.OS === 'web') {
    getWebStorage()?.removeItem(key);
    return;
  }

  if (!(await isSecureStoreAvailable())) {
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

function normalizeToken(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function normalizeStoredUser(value: unknown): User | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Partial<User> & {
    roles?: unknown;
    canAccessAdmin?: unknown;
  };

  if (
    typeof candidate.id !== 'string' ||
    typeof candidate.name !== 'string' ||
    typeof candidate.email !== 'string' ||
    typeof candidate.isProfileCompleted !== 'boolean'
  ) {
    return null;
  }

  const roles = Array.isArray(candidate.roles)
    ? candidate.roles.filter((role): role is string => typeof role === 'string')
    : [];

  return {
    id: candidate.id,
    name: candidate.name,
    email: candidate.email,
    isProfileCompleted: candidate.isProfileCompleted,
    roles,
    canAccessAdmin:
      typeof candidate.canAccessAdmin === 'boolean'
        ? candidate.canAccessAdmin
        : hasAdminPanelRoles(roles),
  };
}

function parseStoredAuthSession(value: unknown): AuthSession | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as {
    token?: unknown;
    user?: unknown;
  };
  const token = normalizeToken(candidate.token);
  const user = normalizeStoredUser(candidate.user);

  if (!token || !user) {
    return null;
  }

  return {
    token,
    user,
  };
}

export function getAuthToken() {
  const persistedToken = readPersistedAuthToken();

  if (!authToken && persistedToken) {
    authToken = persistedToken;
  }

  return authToken ?? persistedToken;
}

export function setAuthToken(token: string | null) {
  const normalizedToken = normalizeToken(token) ?? null;
  authToken = normalizedToken;
  getAuthTokenHost().__kolsheAuthToken = normalizedToken;
}

export function subscribeToAuthSessionInvalidation(
  listener: AuthSessionInvalidationListener,
) {
  authSessionInvalidationListeners.add(listener);

  return () => {
    authSessionInvalidationListeners.delete(listener);
  };
}

export async function loadStoredAuthSession(): Promise<AuthSession | null> {
  await waitForStorageOperations();

  try {
    const storedValue = await getStorageItem(AUTH_SESSION_KEY);

    if (!storedValue) {
      return null;
    }

    const session = parseStoredAuthSession(JSON.parse(storedValue));

    if (!session) {
      await enqueueStorageOperation(() => deleteStorageItem(AUTH_SESSION_KEY));
      return null;
    }

    return session;
  } catch {
    try {
      await enqueueStorageOperation(() => deleteStorageItem(AUTH_SESSION_KEY));
    } catch {
      return null;
    }

    return null;
  }
}

export async function restoreAuthSession(): Promise<AuthSession | null> {
  const session = await loadStoredAuthSession();
  setAuthToken(session?.token ?? null);
  return session;
}

export async function saveStoredAuthSession(session: AuthSession) {
  const normalizedSession = parseStoredAuthSession(session);

  if (!normalizedSession) {
    await clearAuthSession();
    return;
  }

  setAuthToken(normalizedSession.token);

  try {
    await enqueueStorageOperation(() =>
      setStorageItem(AUTH_SESSION_KEY, JSON.stringify(normalizedSession)),
    );
  } catch {
    // Keep the in-memory token active even if persistence fails on the device.
  }
}

export async function saveAuthenticatedUser(user: User) {
  const token = getAuthToken();

  if (!token) {
    await clearAuthSession();
    return;
  }

  await saveStoredAuthSession({
    token,
    user,
  });
}

export async function clearAuthSession() {
  setAuthToken(null);

  try {
    await enqueueStorageOperation(() => deleteStorageItem(AUTH_SESSION_KEY));
  } catch {
    // Ignore storage cleanup errors so logout still completes in memory.
  }
}

export async function invalidateAuthSession() {
  await clearAuthSession();

  for (const listener of authSessionInvalidationListeners) {
    listener();
  }
}

function trimText(value: string) {
  return value.trim();
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
  const normalizedValue = normalizeTextValue(value);
  return normalizedValue || null;
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
  return requireText(code, AUTH_ERROR_MESSAGES.verificationCodeRequired);
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
    const response = await apiClient.post<TResponse>(path, body);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, fallbackMessage));
  }
}

async function postMessageAction(
  path: string,
  body: Record<string, unknown>,
  fallbackMessage: string,
) {
  const response = await postJson<ApiMessageResponse>(path, body, fallbackMessage);
  return response.message ?? null;
}

export async function login(input: LoginInput): Promise<User> {
  const email = normalizeEmail(input.email);
  const password = input.password;

  const response = await postJson<ApiLoginResponse>(
    AUTH_ENDPOINTS.login,
    {
      email,
      password,
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
  const name = requireText(input.name, AUTH_COPY.fullNameRequired);
  const password = input.password;

  assertMinTrimmedLength(password, 8, AUTH_COPY.registerPasswordMinLength);

  await postJson<ApiMessageResponse>(
    AUTH_ENDPOINTS.register,
    {
      fullName: name,
      userName: buildUserName(name, email),
      email,
      password,
    },
    AUTH_COPY.registerFailed,
  );

  const user = await login({
    email,
    password,
  });

  return { ...user, name };
}

export async function forgotPassword(input: ForgotPasswordInput): Promise<string | null> {
  const email = normalizeRequiredEmail(input.email);

  return postMessageAction(
    AUTH_ENDPOINTS.forgotPassword,
    { email },
    AUTH_ERROR_MESSAGES.forgotPasswordFailed,
  );
}

export async function verifyResetCode(input: VerifyResetCodeInput): Promise<string | null> {
  const email = normalizeRequiredEmail(input.email);
  const code = normalizeRequiredCode(input.code);

  return postMessageAction(
    AUTH_ENDPOINTS.verifyResetCode,
    { email, code },
    AUTH_ERROR_MESSAGES.invalidVerificationCode,
  );
}

export async function resetPassword(input: ResetPasswordInput): Promise<string | null> {
  const email = normalizeRequiredEmail(input.email);
  const code = normalizeRequiredCode(input.code);
  const newPassword = trimText(input.newPassword);

  assertMinTrimmedLength(newPassword, 8, AUTH_COPY.registerPasswordMinLength);

  return postMessageAction(
    AUTH_ENDPOINTS.resetPassword,
    {
      email,
      code,
      newPassword,
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

  return normalizeAccountProfile(response.data);
}

export async function completeProfile(input: CompleteProfileInput): Promise<string | null> {
  const universityId = normalizePositiveNumber(
    input.universityId,
    AUTH_ERROR_MESSAGES.universityRequired,
  );
  const major = requireText(input.major, AUTH_ERROR_MESSAGES.majorRequired);
  const profileImageUri = requireText(
    input.profileImage?.uri ?? '',
    AUTH_ERROR_MESSAGES.profileImageRequired,
  );

  const formData = new FormData();
  formData.append('UniversityId', String(universityId));
  formData.append('Major', major);
  formData.append('Bio', trimText(input.bio));
  appendProfileImage(formData, {
    ...input.profileImage,
    uri: profileImageUri,
  });

  const response = await postMultipart<ApiMessageResponse>(
    AUTH_ENDPOINTS.completeProfile,
    formData,
    AUTH_ERROR_MESSAGES.completeProfileFailed,
  );

  return response.message ?? null;
}
