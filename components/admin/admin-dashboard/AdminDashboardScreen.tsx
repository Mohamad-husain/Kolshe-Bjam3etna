import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { startTransition } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AdminHero, AdminToastBanner } from '@/components/admin/admin-primitives';
import { AdminProvider } from '@/contexts/admin-context';
import { useAdminDashboard } from '@/hooks/admin/use-admin-dashboard';
import { adminAccessText } from '@/lib/admin/admin-copy';

import { AdminDashboardSections } from './AdminDashboardSections';
import { AdminDashboardDialogs } from './overlays/AdminDashboardDialogs';
import { ClubEditorSheet } from './overlays/ClubEditorSheet';
import { NewsEditorSheet } from './overlays/NewsEditorSheet';
import { OfferEditorSheet } from './overlays/OfferEditorSheet';
import { RoleEditorSheet } from './overlays/RoleEditorSheet';
import { UserEditorSheet } from './overlays/UserEditorSheet';
import { styles } from './styles';

type AdminDashboardAccessStateProps = {
  title: string;
  message: string;
};

export function AdminDashboardAccessState({
  title,
  message,
}: AdminDashboardAccessStateProps) {
  return (
    <SafeAreaView style={[styles.safeArea, styles.accessStateScreen]}>
      <StatusBar style="dark" />
      <View style={styles.accessStateContainer}>
        <View style={styles.accessStateCard}>
          <Text style={styles.accessStateEyebrow}>{adminAccessText.panelLabel}</Text>
          <Text style={styles.accessStateTitle}>{title}</Text>
          <Text style={styles.accessStateMessage}>{message}</Text>
          <Pressable
            onPress={() => router.replace('/(tabs)/profile')}
            style={({ pressed }) => [styles.accessStateButton, pressed && styles.pressed]}
          >
            <Text style={styles.accessStateButtonText}>{adminAccessText.backToProfile}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function AdminDashboardContent() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const adminDashboard = useAdminDashboard();
  const sectionHorizontalPadding =
    width <= 340 ? 4 : width <= 380 ? 6 : width <= 430 ? 8 : 10;

  if (adminDashboard.accessDeniedMessage) {
    return (
      <AdminDashboardAccessState
        title={adminAccessText.openDashboardFailed}
        message={adminDashboard.accessDeniedMessage}
      />
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: adminDashboard.theme.pageBackground }]}
      edges={['top']}
    >
      <StatusBar style={adminDashboard.theme.isDark ? 'light' : 'dark'} />
      <View style={styles.root}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 42 }]}
          showsVerticalScrollIndicator={false}
        >
          <AdminHero
            theme={adminDashboard.theme}
            activeSection={adminDashboard.resolvedActiveSection}
            sections={adminDashboard.visibleSections}
            onChangeSection={(section) => {
              adminDashboard.clearToast();
              startTransition(() => adminDashboard.setActiveSection(section));
            }}
            onBack={() => router.replace('/(tabs)/profile')}
          />
          <AdminToastBanner theme={adminDashboard.theme} toast={adminDashboard.toast} />
          <View
            style={[styles.sectionWrap, { paddingHorizontal: sectionHorizontalPadding }]}
          >
            <AdminDashboardSections adminDashboard={adminDashboard} />
          </View>
        </ScrollView>
      </View>
      <UserEditorSheet adminDashboard={adminDashboard} />
      <NewsEditorSheet adminDashboard={adminDashboard} />
      <RoleEditorSheet adminDashboard={adminDashboard} />
      <OfferEditorSheet adminDashboard={adminDashboard} />
      <ClubEditorSheet adminDashboard={adminDashboard} />
      <AdminDashboardDialogs adminDashboard={adminDashboard} />
    </SafeAreaView>
  );
}

export function AdminDashboardScreen() {
  return (
    <AdminProvider>
      <AdminDashboardContent />
    </AdminProvider>
  );
}
