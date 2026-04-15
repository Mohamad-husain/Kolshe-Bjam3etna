import { type PropsWithChildren } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AUTH_COPY } from '@/lib/auth/auth-copy';
import {
  FontFamily,
} from '@/styles/ui-theme';
import { AuthBackground } from './auth-background';
import { AuthBranding } from './auth-branding';
import { AuthSurface } from './auth-surface';
import { AuthTabSwitcher, type AuthTab } from './auth-tab-switcher';

type AuthLayoutProps = PropsWithChildren<{
  activeTab: AuthTab;
  onTabChange: (tab: AuthTab) => void;
}>;

export function AuthLayout({ activeTab, onTabChange, children }: AuthLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <AuthBackground />

      <ScrollView
        bounces={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top + 44, 58),
            paddingBottom: Math.max(insets.bottom + 20, 24),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <AuthBranding />
          <AuthTabSwitcher activeTab={activeTab} onTabChange={onTabChange} />
          <AuthSurface>{children}</AuthSurface>
          <Text style={styles.terms}>{AUTH_COPY.termsAgreement}</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export type { AuthTab } from './auth-tab-switcher';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ececf1',
    overflow: 'hidden',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 3,
  },
  content: {
    width: '100%',
    maxWidth: 380,
  },
  terms: {
    marginTop: 30,
    textAlign: 'center',
    color: '#b1b1b9',
    fontFamily: FontFamily.cairo,
    fontSize: 12,
    lineHeight: 18,
    writingDirection: 'rtl',
    opacity: 0.9,
  },
});
