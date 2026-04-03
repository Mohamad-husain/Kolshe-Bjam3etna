import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react';

import { queryKeys } from '@/lib/query-keys';
import { queryClient } from '@/lib/query-client';
import type { User } from '@/services/auth-api';
import { setAuthToken } from '@/services/http-client';

type AuthContextValue = {
  user: User | null;
  signIn: (nextUser: User) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      signIn: (nextUser) => {
        setUser(nextUser);
        queryClient.setQueryData(queryKeys.auth.user, nextUser);
      },
      signOut: () => {
        setUser(null);
        setAuthToken(null);
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
