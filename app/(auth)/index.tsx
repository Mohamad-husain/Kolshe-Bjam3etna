import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

import { AuthLayout, type AuthTab } from '@/components/auth/auth-layout';
import LoginForm from '@/components/auth/login-form';
import RegisterForm from '@/components/auth/register-form';
import { useAuth } from '@/contexts/auth-context';
import PasswordRecoveryFlow from './_passwordRecovery/password-screen';

export default function AuthRoute() {
  const { signIn } = useAuth();
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [view, setView] = useState<'tabs' | 'recovery'>('tabs');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {view === 'tabs' ? (
        <AuthLayout activeTab={activeTab} onTabChange={setActiveTab}>
          {activeTab === 'login' ? (
            <LoginForm
              onSuccess={(user) => {
                signIn(user);
                router.replace('/(tabs)/home');
              }}
              onForgotPassword={() => {
                setView('recovery');
              }}
            />
          ) : (
            <RegisterForm
              onSuccess={(user) => {
                signIn(user);
                router.replace('/(tabs)/home');
              }}
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
