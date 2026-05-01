import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  clearAuthSession,
  restoreAuthSession,
  saveAuthenticatedUser,
} from '@/services/auth-api';
import { queryKeys } from '@/lib/query-keys';
import { queryClient } from '@/lib/query-client';
import type { User } from '@/services/auth-api';

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
      const session = await restoreAuthSession();

      if (!isMounted) {
        return;
      }

      if (session) {
        setUser(session.user);
        queryClient.setQueryData(queryKeys.auth.user, session.user);
      } else {
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
        queryClient.removeQueries({ queryKey: queryKeys.auth.profile });
        void saveAuthenticatedUser(nextUser);
      },
      signOut: () => {
        setUser(null);
        queryClient.setQueryData(queryKeys.auth.user, null);
        queryClient.removeQueries({ queryKey: queryKeys.auth.profile });
        void clearAuthSession();
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
