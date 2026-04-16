import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { startTransition } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AdminHero, AdminToastBanner } from '@/components/admin/admin-primitives';
import { AdminProvider } from '@/contexts/admin-context';
import { adminAccessText } from '@/lib/admin/admin-copy';

import { AdminDashboardAccessState } from './AdminDashboardAccessState';
import { AdminDashboardOverlays } from './AdminDashboardOverlays';
import { AdminDashboardSections } from './AdminDashboardSections';
import { styles } from './styles';
import { useAdminDashboardController } from './use-admin-dashboard-controller';

function AdminDashboardContent() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const controller = useAdminDashboardController();
  const sectionHorizontalPadding =
    width <= 340 ? 4 : width <= 380 ? 6 : width <= 430 ? 8 : 10;

  if (controller.accessDeniedMessage) {
    return (
      <AdminDashboardAccessState
        title={adminAccessText.openDashboardFailed}
        message={controller.accessDeniedMessage}
      />
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: controller.theme.pageBackground }]}
      edges={['top']}
    >
      <StatusBar style={controller.theme.isDark ? 'light' : 'dark'} />
      <View style={styles.root}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 42 }]}
          showsVerticalScrollIndicator={false}
        >
          <AdminHero
            theme={controller.theme}
            activeSection={controller.resolvedActiveSection}
            sections={controller.visibleSections}
            onChangeSection={(section) => {
              controller.clearToast();
              startTransition(() => controller.setActiveSection(section));
            }}
            onBack={() => router.replace('/(tabs)/profile')}
          />
          <AdminToastBanner theme={controller.theme} toast={controller.toast} />
          <View
            style={[styles.sectionWrap, { paddingHorizontal: sectionHorizontalPadding }]}
          >
            <AdminDashboardSections controller={controller} />
          </View>
        </ScrollView>
      </View>
      <AdminDashboardOverlays controller={controller} />
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
