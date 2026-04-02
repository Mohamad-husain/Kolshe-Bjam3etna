import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react';

import { queryKeys } from '@/lib/query-keys';
import { queryClient } from '@/lib/query-client';
import type { User } from '@/services/auth-api';
import { getAuthToken, setAuthToken } from '@/services/http-client';

type AuthContextValue = {
  user: User | null;
  signIn: (nextUser: User) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const AUTH_USER_STORAGE_KEY = 'kolshe.auth.user';

function readStoredUser() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(AUTH_USER_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function writeStoredUser(user: User | null) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    if (user) {
      window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
      return;
    }

    window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  } catch {
    // Ignore storage issues and keep in-memory auth working.
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = readStoredUser();
    return getAuthToken() ? storedUser : null;
  });

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      signIn: (nextUser) => {
        setUser(nextUser);
        writeStoredUser(nextUser);
        queryClient.setQueryData(queryKeys.auth.user, nextUser);
      },
      signOut: () => {
        setUser(null);
        setAuthToken(null);
        writeStoredUser(null);
        queryClient.setQueryData(queryKeys.auth.user, null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
