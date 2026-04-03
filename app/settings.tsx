import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { SettingsAccountSection } from '@/components/settings/SettingsAccountSection';
import {
  SettingsAppearanceSection,
} from '@/components/settings/SettingsAppearanceSection';
import { SettingsHeader } from '@/components/settings/SettingsHeader';
import { SettingsLogoutSection } from '@/components/settings/SettingsLogoutSection';
import { SettingsNotificationsSection } from '@/components/settings/SettingsNotificationsSection';
import { SettingsPrivacySection } from '@/components/settings/SettingsPrivacySection';
import type { SettingsThemeValue } from '@/components/settings/SettingsThemeSelector';
import { useAuth } from '@/contexts/auth-context';
import { Colors, FontFamily, FontSize, FontWeight } from '@/styles/ui-theme';

export default function SettingsRoute() {
  const insets = useSafeAreaInsets();
  const systemColorScheme = useColorScheme();
  const { user, signOut } = useAuth();
  const [selectedTheme, setSelectedTheme] = useState<SettingsThemeValue>('system');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [offerNotifications, setOfferNotifications] = useState(true);
  const [newsNotifications, setNewsNotifications] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);

  useEffect(() => {
    if (!user) {
      router.replace('/(auth)');
    }
  }, [user]);

  const effectiveTheme = useMemo<'light' | 'dark'>(() => {
    if (selectedTheme === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }

    return selectedTheme;
  }, [selectedTheme, systemColorScheme]);

  if (!user) {
    return null;
  }

  const isDarkPreview = effectiveTheme === 'dark';

  const showSoonAlert = (title: string, message: string) => {
    Alert.alert(title, message);
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)/profile');
  };

  const handleToggleThemeMode = () => {
    setSelectedTheme(isDarkPreview ? 'light' : 'dark');
  };

  const handleLogout = () => {
    Alert.alert('تسجيل الخروج', 'هل أنت متأكد أنك تريد تسجيل الخروج من حسابك؟', [
      {
        text: 'إلغاء',
        style: 'cancel',
      },
      {
        text: 'تسجيل الخروج',
        style: 'destructive',
        onPress: signOut,
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="light" />

      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 28 }]}
          showsVerticalScrollIndicator={false}
        >
          <SettingsHeader
            isDarkPreview={isDarkPreview}
            onGoBack={handleGoBack}
            onToggleTheme={handleToggleThemeMode}
          />

          <SettingsAppearanceSection
            selectedTheme={selectedTheme}
            onChangeTheme={setSelectedTheme}
          />

          <SettingsNotificationsSection
            notificationsEnabled={notificationsEnabled}
            messageNotifications={messageNotifications}
            newsNotifications={newsNotifications}
            offerNotifications={offerNotifications}
            soundEnabled={soundEnabled}
            onToggleNotifications={() => setNotificationsEnabled((current) => !current)}
            onToggleMessages={() => setMessageNotifications((current) => !current)}
            onToggleOffers={() => setOfferNotifications((current) => !current)}
            onToggleNews={() => setNewsNotifications((current) => !current)}
            onToggleSound={() => setSoundEnabled((current) => !current)}
          />

          <SettingsPrivacySection
            showOnlineStatus={showOnlineStatus}
            onToggleShowOnline={() => setShowOnlineStatus((current) => !current)}
            onChangePassword={() =>
              showSoonAlert(
                'تغيير كلمة المرور',
                'واجهة تغيير كلمة المرور جاهزة للتوصيل لاحقاً مع الـ API.',
              )
            }
            onOpenTwoFactor={() =>
              showSoonAlert(
                'المصادقة الثنائية',
                'ميزة المصادقة الثنائية ستُربط لاحقاً ضمن إعدادات الأمان.',
              )
            }
          />

          <SettingsAccountSection
            onEditProfile={() =>
              showSoonAlert(
                'تعديل الملف الشخصي',
                'واجهة التعديل الحالية موجودة في صفحة البروفايل وسيتم ربط نموذج مستقل لاحقاً.',
              )
            }
            onChangeUniversity={() => router.push('/(auth)/select-university')}
          />

          <SettingsLogoutSection onPress={handleLogout} />

          <Text style={styles.footerText}>كلشي بجامعتنا © {new Date().getFullYear()}</Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    backgroundColor: Colors.background,
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
