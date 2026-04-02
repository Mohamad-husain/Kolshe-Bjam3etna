import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

import { AuthLayout, type AuthTab } from '@/components/auth/auth-layout';
import LoginForm from '@/components/auth/login-form';
import RegisterForm from '@/components/auth/register-form';
import { useAuth } from '@/contexts/auth-context';
import PasswordRecoveryFlow from './_passwordRecovery/password-screen';

export default function AuthRoute() {
  const { signIn, user } = useAuth();
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [view, setView] = useState<'tabs' | 'recovery'>('tabs');

  if (user && !user.isProfileCompleted) {
    return <Redirect href="/(auth)/select-university" />;
  }

  function handleAuthenticatedUser() {
    return (nextUser: Parameters<typeof signIn>[0]) => {
      signIn(nextUser);

      if (nextUser.isProfileCompleted) {
        router.replace('/(tabs)/home');
        return;
      }

      router.replace('/(auth)/select-university');
    };
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {view === 'tabs' ? (
        <AuthLayout activeTab={activeTab} onTabChange={setActiveTab}>
          {activeTab === 'login' ? (
            <LoginForm
              onSuccess={handleAuthenticatedUser()}
              onForgotPassword={() => {
                setView('recovery');
              }}
            />
          ) : (
            <RegisterForm
              onSuccess={handleAuthenticatedUser()}
            />
          )}
        </AuthLayout>
      ) : (
        <PasswordRecoveryFlow
          onDone={() => {
            setView('tabs');
            setActiveTab('login');
          }}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
