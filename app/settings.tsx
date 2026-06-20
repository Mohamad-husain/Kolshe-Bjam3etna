import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { SettingsAccountSection } from '@/components/settings/SettingsAccountSection';
import { SettingsHeader } from '@/components/settings/SettingsHeader';
import { SettingsLogoutSection } from '@/components/settings/SettingsLogoutSection';
import { SettingsNotificationsSection } from '@/components/settings/SettingsNotificationsSection';
import { SettingsPrivacySection } from '@/components/settings/SettingsPrivacySection';
import { useAppSettings } from '@/contexts/app-settings-context';
import { useAuth } from '@/contexts/auth-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import { FontFamily, FontSize, FontWeight } from '@/styles/ui-theme';

export default function SettingsRoute() {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const { selectedTheme, colors } = useThemePreference();
  const {
    language,
    notifications,
    setNotificationPreference,
    t,
  } = useAppSettings();

  useEffect(() => {
    if (!user) {
      router.replace('/(auth)');
    }
  }, [user]);

  if (!user) {
    return null;
  }

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)/profile');
  };

  const handleLogout = () => {
    Alert.alert(t('settings.logout'), t('settings.logoutConfirm'), [
      {
        text: t('common.cancel'),
        style: 'cancel',
      },
      {
        text: t('settings.logout'),
        style: 'destructive',
        onPress: signOut,
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.primary }]} edges={['top']}>
      <StatusBar style="light" />

      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { backgroundColor: colors.background, paddingBottom: insets.bottom + 28 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <SettingsHeader onGoBack={handleGoBack} />

          <SettingsNotificationsSection
            notificationsEnabled={notifications.notificationsEnabled}
            messageNotifications={notifications.messageNotifications}
            newsNotifications={notifications.newsNotifications}
            offerNotifications={notifications.offerNotifications}
            soundEnabled={notifications.soundEnabled}
            onToggleNotifications={() =>
              setNotificationPreference(
                'notificationsEnabled',
                !notifications.notificationsEnabled,
              )
            }
            onToggleMessages={() =>
              setNotificationPreference(
                'messageNotifications',
                !notifications.messageNotifications,
              )
            }
            onToggleOffers={() =>
              setNotificationPreference(
                'offerNotifications',
                !notifications.offerNotifications,
              )
            }
            onToggleNews={() =>
              setNotificationPreference(
                'newsNotifications',
                !notifications.newsNotifications,
              )
            }
            onToggleSound={() =>
              setNotificationPreference('soundEnabled', !notifications.soundEnabled)
            }
          />

          <SettingsPrivacySection
            showOnlineStatus={notifications.showOnlineStatus}
            onToggleShowOnline={() =>
              setNotificationPreference('showOnlineStatus', !notifications.showOnlineStatus)
            }
            onChangePassword={() =>
              router.push({ pathname: '/edit-profile', params: { tab: 'security' } })
            }
          />

          <SettingsAccountSection
            appearanceDescription={t('settings.appearanceDescription', {
              mode:
                selectedTheme === 'system'
                  ? t('settings.themeAuto')
                  : selectedTheme === 'dark'
                    ? t('settings.themeDark')
                    : t('settings.themeLight'),
            })}
            languageDescription={
              language === 'ar' ? t('settings.languageArabic') : t('settings.languageEnglish')
            }
            onOpenAppearance={() => router.push('/appearance-settings')}
            onOpenLanguage={() => router.push('/language-settings')}
            onEditProfile={() =>
              router.push({ pathname: '/edit-profile', params: { tab: 'personal' } })
            }
            onChangeUniversity={() =>
              router.push({ pathname: '/edit-profile', params: { tab: 'academic' } })
            }
            onAbout={() => router.push('/about')}
          />

          <SettingsLogoutSection onPress={handleLogout} />

          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            {t('common.appName')} © {new Date().getFullYear()}
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
  },
  footerText: {
    marginTop: 28,
    color: 'rgba(142, 142, 147, 0.9)',
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
});
