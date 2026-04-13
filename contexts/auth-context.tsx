import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  clearStoredAuthSession,
  loadStoredAuthSession,
  saveStoredAuthSession,
} from '@/lib/auth/auth-session';
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

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function hydrateAuthState() {
      const session = await loadStoredAuthSession();

      if (!isMounted) {
        return;
      }

      if (session) {
        setAuthToken(session.token);
        setUser(session.user);
        queryClient.setQueryData(queryKeys.auth.user, session.user);
      } else {
        setAuthToken(null);
        queryClient.setQueryData(queryKeys.auth.user, null);
      }

      setIsHydrated(true);
    }

    void hydrateAuthState();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      signIn: (nextUser) => {
        setUser(nextUser);
        queryClient.setQueryData(queryKeys.auth.user, nextUser);

        const token = getAuthToken();

        if (token) {
          void saveStoredAuthSession({ token, user: nextUser });
          return;
        }

        void clearStoredAuthSession();
      },
      signOut: () => {
        setUser(null);
        setAuthToken(null);
        queryClient.setQueryData(queryKeys.auth.user, null);
        void clearStoredAuthSession();
      },
    }),
    [user],
  );

  if (!isHydrated) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
