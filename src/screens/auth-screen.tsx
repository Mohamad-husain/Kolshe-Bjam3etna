import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

import { AuthLayout, type AuthTab } from '@src/components/auth/auth-layout';
import type { User } from '@src/services/auth-service';

import LoginScreen from './login-screen';
import PasswordRecoveryFlow from './password-recovery';
import RegisterScreen from './register-screen';

type AuthView = 'tabs' | 'recovery';

type AuthScreenProps = {
  onSuccess: (user: User) => void;
};

export default function AuthScreen({ onSuccess }: AuthScreenProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [view, setView] = useState<AuthView>('tabs');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {view === 'tabs' ? (
        <AuthLayout activeTab={activeTab} onTabChange={setActiveTab}>
          {activeTab === 'login' ? (
            <LoginScreen
              onSuccess={onSuccess}
              onForgotPassword={() => {
                setView('recovery');
              }}
            />
          ) : (
            <RegisterScreen onSuccess={onSuccess} />
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
