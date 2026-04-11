import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { hasAdminPanelRoles } from '@/lib/auth/admin-access';
import type { User } from '@/services/auth-api';

const AUTH_SESSION_KEY = 'auth.session';

type PersistedAuthSession = {
  token: string;
  user: User;
};

type WebStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

function getWebStorage(): WebStorage | null {
  return (globalThis as { localStorage?: WebStorage }).localStorage ?? null;
}

async function getStorageItem(key: string) {
  if (Platform.OS === 'web') {
    return getWebStorage()?.getItem(key) ?? null;
  }

  return SecureStore.getItemAsync(key);
}

async function setStorageItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    getWebStorage()?.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

async function deleteStorageItem(key: string) {
  if (Platform.OS === 'web') {
    getWebStorage()?.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
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

function parseStoredSession(value: unknown): PersistedAuthSession | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as {
    token?: unknown;
    user?: unknown;
  };
  const user = normalizeStoredUser(candidate.user);

  if (typeof candidate.token !== 'string' || !candidate.token || !user) {
    return null;
  }

  return {
    token: candidate.token,
    user,
  };
}

export async function loadStoredAuthSession(): Promise<PersistedAuthSession | null> {
  try {
    const storedValue = await getStorageItem(AUTH_SESSION_KEY);

    if (!storedValue) {
      return null;
    }

    const session = parseStoredSession(JSON.parse(storedValue));

    if (!session) {
      await deleteStorageItem(AUTH_SESSION_KEY);
      return null;
    }

    return session;
  } catch {
    await deleteStorageItem(AUTH_SESSION_KEY);
    return null;
  }
}

export async function saveStoredAuthSession(session: PersistedAuthSession) {
  await setStorageItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

export async function clearStoredAuthSession() {
  await deleteStorageItem(AUTH_SESSION_KEY);
}
