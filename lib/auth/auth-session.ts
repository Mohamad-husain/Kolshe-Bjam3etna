import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { hasAdminPanelRoles } from '@/lib/auth/admin-access';

const AUTH_SESSION_KEY = 'auth.session';
const GLOBAL_AUTH_TOKEN_KEY = '__kolsheAuthToken';
const IOS_SECURE_STORE_OPTIONS = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
} as const;

export type User = {
  id: string;
  name: string;
  email: string;
  isProfileCompleted: boolean;
  roles: string[];
  canAccessAdmin: boolean;
};

export type AuthSession = {
  token: string;
  user: User;
};

export type PersistedAuthSession = AuthSession;

type AuthSessionInvalidationListener = () => void;
type StorageOperation = () => Promise<void>;
type GlobalAuthTokenHost = typeof globalThis & {
  [GLOBAL_AUTH_TOKEN_KEY]?: string | null;
};

const globalAuthTokenHost = globalThis as GlobalAuthTokenHost;
const invalidationListeners = new Set<AuthSessionInvalidationListener>();

let currentAuthToken: string | null = readGlobalAuthToken();
let secureStoreAvailabilityPromise: Promise<boolean> | null = null;
let storageQueue: Promise<void> = Promise.resolve();

function ignoreStorageResult() {
  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function normalizeToken(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function readGlobalAuthToken() {
  return normalizeToken(globalAuthTokenHost[GLOBAL_AUTH_TOKEN_KEY]);
}

function writeGlobalAuthToken(token: string | null) {
  globalAuthTokenHost[GLOBAL_AUTH_TOKEN_KEY] = token;
}

function getSecureStoreOptions() {
  return Platform.OS === 'ios' ? IOS_SECURE_STORE_OPTIONS : undefined;
}

function enqueueStorageOperation(operation: StorageOperation) {
  const queuedOperation = storageQueue.then(operation, operation);

  storageQueue = queuedOperation.then(ignoreStorageResult, ignoreStorageResult);

  return queuedOperation;
}

async function isSecureStoreAvailable() {
  secureStoreAvailabilityPromise ??= SecureStore.isAvailableAsync().catch(() => false);
  return secureStoreAvailabilityPromise;
}

async function readStoredSessionValue() {
  if (!(await isSecureStoreAvailable())) {
    return null;
  }

  return SecureStore.getItemAsync(AUTH_SESSION_KEY);
}

async function writeStoredSessionValue(session: AuthSession) {
  if (!(await isSecureStoreAvailable())) {
    return;
  }

  await SecureStore.setItemAsync(
    AUTH_SESSION_KEY,
    JSON.stringify(session),
    getSecureStoreOptions(),
  );
}

async function deleteStoredSessionValue() {
  if (!(await isSecureStoreAvailable())) {
    return;
  }

  await SecureStore.deleteItemAsync(AUTH_SESSION_KEY);
}

async function deleteStoredAuthSession() {
  await enqueueStorageOperation(deleteStoredSessionValue);
}

async function deleteStoredAuthSessionSafely() {
  try {
    await deleteStoredAuthSession();
  } catch {
    // Logout and recovery should still complete if device storage fails.
  }
}

function normalizeStoredRoles(value: unknown) {
  return Array.isArray(value) ? value.filter(isString) : [];
}

function normalizeStoredUser(value: unknown): User | null {
  if (!isRecord(value)) {
    return null;
  }

  const {
    canAccessAdmin,
    email,
    id,
    isProfileCompleted,
    name,
    roles: rawRoles,
  } = value;

  if (
    !isString(id) ||
    !isString(name) ||
    !isString(email) ||
    typeof isProfileCompleted !== 'boolean'
  ) {
    return null;
  }

  const roles = normalizeStoredRoles(rawRoles);

  return {
    id,
    name,
    email,
    isProfileCompleted,
    roles,
    canAccessAdmin:
      typeof canAccessAdmin === 'boolean'
        ? canAccessAdmin
        : hasAdminPanelRoles(roles),
  };
}

function normalizeAuthSession(value: unknown): AuthSession | null {
  if (!isRecord(value)) {
    return null;
  }

  const token = normalizeToken(value.token);
  const user = normalizeStoredUser(value.user);

  return token && user ? { token, user } : null;
}

export function getAuthToken() {
  const globalToken = readGlobalAuthToken();

  if (!currentAuthToken && globalToken) {
    currentAuthToken = globalToken;
  }

  return currentAuthToken ?? globalToken;
}

export function setAuthToken(token: string | null) {
  const normalizedToken = normalizeToken(token) ?? null;

  currentAuthToken = normalizedToken;
  writeGlobalAuthToken(normalizedToken);
}

export function subscribeToAuthSessionInvalidation(
  listener: AuthSessionInvalidationListener,
) {
  invalidationListeners.add(listener);

  return () => {
    invalidationListeners.delete(listener);
  };
}

export async function loadStoredAuthSession(): Promise<AuthSession | null> {
  await storageQueue;

  try {
    const storedValue = await readStoredSessionValue();

    if (!storedValue) {
      return null;
    }

    const session = normalizeAuthSession(JSON.parse(storedValue));

    if (session) {
      return session;
    }
  } catch {
    // Invalid JSON or unavailable storage falls through to cleanup.
  }

  await deleteStoredAuthSessionSafely();
  return null;
}

export async function restoreAuthSession(): Promise<AuthSession | null> {
  const session = await loadStoredAuthSession();
  setAuthToken(session?.token ?? null);
  return session;
}

export async function saveStoredAuthSession(session: AuthSession) {
  const normalizedSession = normalizeAuthSession(session);

  if (!normalizedSession) {
    await clearAuthSession();
    return;
  }

  setAuthToken(normalizedSession.token);

  try {
    await enqueueStorageOperation(() =>
      writeStoredSessionValue(normalizedSession),
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

  await saveStoredAuthSession({ token, user });
}

export async function clearAuthSession() {
  setAuthToken(null);
  await deleteStoredAuthSessionSafely();
}

export async function invalidateAuthSession() {
  await clearAuthSession();

  for (const listener of invalidationListeners) {
    listener();
  }
}

export { clearAuthSession as clearStoredAuthSession };
