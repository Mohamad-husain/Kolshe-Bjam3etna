import {
  getTokenDisplayName,
  getTokenRoles,
  hasAdminPanelRoles,
} from '@/lib/auth/admin-access';
import { AUTH_COPY } from '@/lib/auth/auth-copy';
import { setAuthToken, type User } from '@/lib/auth/auth-session';
import { apiClient, getApiErrorMessage } from '@/services/http-client';

export {
  clearAuthSession,
  getAuthToken,
  invalidateAuthSession,
  loadStoredAuthSession,
  restoreAuthSession,
  saveAuthenticatedUser,
  saveStoredAuthSession,
  subscribeToAuthSessionInvalidation,
} from '@/lib/auth/auth-session';
export type { AuthSession, User } from '@/lib/auth/auth-session';
export {
  completeProfile,
  forgotPassword,
  getAccountProfile,
  getUniversities,
  resetPassword,
  verifyResetCode,
} from '@/services/account-api';
export type {
  AccountProfile,
  CompleteProfileInput,
  ForgotPasswordInput,
  ProfileImageInput,
  ResetPasswordInput,
  University,
  VerifyResetCodeInput,
} from '@/services/account-api';

const AUTH_ENDPOINTS = {
  login: '/api/Account/login',
  register: '/api/Account/register',
} as const;

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

type ApiMessageResponse = {
  message?: string;
};

type ApiLoginResponse = ApiMessageResponse & {
  token?: string | null;
  isProfileCompleted?: boolean;
  roles?: unknown;
};

async function postRequest<TResponse>(
  path: string,
  body: Record<string, unknown>,
  fallbackMessage: string,
) {
  try {
    return (await apiClient.post<TResponse>(path, body)).data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, fallbackMessage));
  }
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
}: {
  email: string;
  name: string;
  isProfileCompleted?: boolean;
  roles?: string[];
}): User {
  return {
    id: email,
    name,
    email,
    isProfileCompleted: isProfileCompleted !== false,
    roles,
    canAccessAdmin: hasAdminPanelRoles(roles),
  };
}

export async function login(input: LoginInput): Promise<User> {
  const email = normalizeEmail(input.email);
  const password = input.password;

  const response = await postRequest<ApiLoginResponse>(
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

  await postRequest<ApiMessageResponse>(
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
