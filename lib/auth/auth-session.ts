import { hasAdminPanelRoles } from '@/lib/auth/admin-access';
import {
  deletePersistentStorageItem,
  getPersistentStorageItem,
  setPersistentStorageItem,
} from '@/lib/storage/persistent-storage';
import type { User } from '@/services/auth-api';

const AUTH_SESSION_KEY = 'auth.session';

type PersistedAuthSession = {
  token: string;
  user: User;
};

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
    const storedValue = await getPersistentStorageItem(AUTH_SESSION_KEY);

    if (!storedValue) {
      return null;
    }

    const session = parseStoredSession(JSON.parse(storedValue));

    if (!session) {
      await deletePersistentStorageItem(AUTH_SESSION_KEY);
      return null;
    }

    return session;
  } catch {
    await deletePersistentStorageItem(AUTH_SESSION_KEY);
    return null;
  }
}

export async function saveStoredAuthSession(session: PersistedAuthSession) {
  await setPersistentStorageItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

export async function clearStoredAuthSession() {
  await deletePersistentStorageItem(AUTH_SESSION_KEY);
}
