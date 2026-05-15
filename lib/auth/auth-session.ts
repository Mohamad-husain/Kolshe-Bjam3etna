import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { hasAdminPanelRoles } from '@/lib/auth/admin-access';

const AUTH_SESSION_KEY = 'auth.session';

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

const authTokenHost = globalThis as typeof globalThis & {
  __kolsheAuthToken?: string | null;
};

let authToken: string | null = normalizeToken(authTokenHost.__kolsheAuthToken);
let secureStoreAvailability: Promise<boolean> | null = null;
let storageOperationQueue: Promise<void> = Promise.resolve();
const authSessionInvalidationListeners = new Set<AuthSessionInvalidationListener>();

function normalizeToken(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function getSecureStoreOptions() {
  return Platform.OS === 'ios'
    ? { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY }
    : undefined;
}

function enqueueStorageOperation(operation: () => Promise<void>) {
  const nextOperation = storageOperationQueue.then(operation, operation);

  storageOperationQueue = nextOperation.then(
    () => undefined,
    () => undefined,
  );

  return nextOperation;
}

async function isSecureStoreAvailable() {
  if (!secureStoreAvailability) {
    secureStoreAvailability = SecureStore.isAvailableAsync().catch(() => false);
  }

  return secureStoreAvailability;
}

async function getStorageItem(key: string) {
  return (await isSecureStoreAvailable()) ? SecureStore.getItemAsync(key) : null;
}

async function setStorageItem(key: string, value: string) {
  if (await isSecureStoreAvailable()) {
    await SecureStore.setItemAsync(key, value, getSecureStoreOptions());
  }
}

async function deleteStorageItem(key: string) {
  if (await isSecureStoreAvailable()) {
    await SecureStore.deleteItemAsync(key);
  }
}

async function deleteStoredAuthSession() {
  await enqueueStorageOperation(() => deleteStorageItem(AUTH_SESSION_KEY));
}

async function deleteStoredAuthSessionSafely() {
  try {
    await deleteStoredAuthSession();
  } catch {
    // Logout and recovery should still complete if device storage fails.
  }
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

  return token && user ? { token, user } : null;
}

export function getAuthToken() {
  const persistedToken = normalizeToken(authTokenHost.__kolsheAuthToken);

  if (!authToken && persistedToken) {
    authToken = persistedToken;
  }

  return authToken ?? persistedToken;
}

export function setAuthToken(token: string | null) {
  const normalizedToken = normalizeToken(token) ?? null;
  authToken = normalizedToken;
  authTokenHost.__kolsheAuthToken = normalizedToken;
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
  await storageOperationQueue;

  try {
    const storedValue = await getStorageItem(AUTH_SESSION_KEY);

    if (!storedValue) {
      return null;
    }

    const session = parseStoredAuthSession(JSON.parse(storedValue));

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

  await saveStoredAuthSession({ token, user });
}

export async function clearAuthSession() {
  setAuthToken(null);
  await deleteStoredAuthSessionSafely();
}

export async function invalidateAuthSession() {
  await clearAuthSession();

  for (const listener of authSessionInvalidationListeners) {
    listener();
  }
}

export { clearAuthSession as clearStoredAuthSession };
