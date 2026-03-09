import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

import { AuthLayout, type AuthTab } from '@src/components/auth/auth-layout';
import type { User } from '@src/services/auth-service';

import LoginScreen from './login-screen';
import RegisterScreen from './register-screen';

type AuthScreenProps = {
  onSuccess: (user: User) => void;
};

export default function AuthScreen({ onSuccess }: AuthScreenProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <AuthLayout activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === 'login' ? (
          <LoginScreen onSuccess={onSuccess} />
        ) : (
          <RegisterScreen onSuccess={onSuccess} />
        )}
      </AuthLayout>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
