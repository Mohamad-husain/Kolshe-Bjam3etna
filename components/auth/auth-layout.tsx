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

import { useAppSettings } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
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
  const { isRtl, t } = useAppSettings();
  const { colors } = useThemePreference();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
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
          <Text
            style={[
              styles.terms,
              {
                color: colors.mutedForeground,
                writingDirection: isRtl ? 'rtl' : 'ltr',
              },
            ]}
          >
            {t('auth.termsAgreement')}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export type { AuthTab } from './auth-tab-switcher';

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontFamily: FontFamily.cairo,
    fontSize: 12,
    lineHeight: 18,
    opacity: 0.9,
  },
});
