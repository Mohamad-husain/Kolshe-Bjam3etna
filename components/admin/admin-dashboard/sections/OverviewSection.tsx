import { View } from 'react-native';

import {
  AdminMetricCard,
  AdminPanelHeading,
  AdminQuickAction,
} from '@/components/admin/admin-primitives';
import { OverviewActivityChart } from '@/components/admin/admin-entities';
import type { AdminDashboard } from '@/hooks/admin/use-admin-dashboard';
import { formatCompactNumber, toEnglishDigits } from '@/lib/admin/admin-config';

import { styles } from '../styles';

type AdminDashboardProps = {
  adminDashboard: AdminDashboard;
};

export function OverviewSection({ adminDashboard }: AdminDashboardProps) {
  const { theme, dashboard, openNewsEditor, showToast } = adminDashboard;

  return (
    <>
      <View style={styles.metricsRow}>
        <AdminMetricCard
          theme={theme}
          icon="briefcase-outline"
          accent={theme.warning}
          value={toEnglishDigits(dashboard.adsCount.toLocaleString('en-US'))}
          label="الإعلانات"
          trend={`${toEnglishDigits(dashboard.adsGrowth)}%+`}
        />
        <AdminMetricCard
          theme={theme}
          icon="people-outline"
          accent={theme.primary}
          value={toEnglishDigits(dashboard.usersCount.toLocaleString('en-US'))}
          label="المستخدمون"
          trend={`${toEnglishDigits(dashboard.usersGrowth)}%+`}
        />
      </View>

      <View style={styles.metricsSingle}>
        <AdminMetricCard
          theme={theme}
          icon="mail-outline"
          accent={theme.success}
          value={formatCompactNumber(dashboard.messagesCount)}
          label="الرسائل"
          trend={`${toEnglishDigits(dashboard.messagesGrowth)}%+`}
        />
      </View>

      <AdminPanelHeading theme={theme} title="إجراءات سريعة" />

      <View style={styles.stack}>
        <AdminQuickAction
          theme={theme}
          icon="document-text-outline"
          accent={theme.success}
          label="نشر خبر جديد"
          onPress={() => openNewsEditor()}
        />
        <AdminQuickAction
          theme={theme}
          icon="stats-chart-outline"
          accent={theme.primary}
          label="تقرير النشاط الأسبوعي"
          onPress={() => showToast('تم تجهيز التقرير الأسبوعي', 'info')}
        />
        <OverviewActivityChart
          theme={theme}
          points={dashboard.activityPoints}
          windowLabel={dashboard.activityWindowLabel}
        />
      </View>
    </>
  );
}
