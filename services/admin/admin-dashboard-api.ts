import { adminDashboardFixture } from '@/lib/admin/admin-fixtures';
import { apiClient } from '@/services/http-client';
import type { AdminDashboardSummary, AdminMetricPoint } from '@/types/admin';
import {
  getFallbackValue,
  getNumberField,
  getRecord,
  getRecords,
  getStringField,
} from './admin-utils';

function mapActivityPoints(payload: unknown): AdminMetricPoint[] {
  const records = getRecords(payload);

  if (!records.length) {
    return adminDashboardFixture.activityPoints;
  }

  return records.map((record, index) => ({
    label:
      getStringField(record, ['label', 'day', 'name', 'dateLabel']) ??
      adminDashboardFixture.activityPoints[index]?.label ??
      `يوم ${index + 1}`,
    value: getNumberField(record, ['value', 'count', 'total', 'messagesCount']) ?? 0,
  }));
}

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  try {
    const { data } = await apiClient.get('/api/admin/dashboard');
    const record = getRecord(data);

    if (!record) {
      return adminDashboardFixture;
    }

    return {
      usersCount:
        getNumberField(record, ['usersCount', 'totalUsers', 'totalUserCount']) ??
        adminDashboardFixture.usersCount,
      adsCount:
        getNumberField(record, ['adsCount', 'productAdsCount', 'totalAdsCount']) ??
        adminDashboardFixture.adsCount,
      messagesCount:
        getNumberField(record, ['messagesCount', 'chatsCount', 'totalMessagesCount']) ??
        adminDashboardFixture.messagesCount,
      usersGrowth:
        getNumberField(record, ['usersGrowth', 'usersGrowthPercentage', 'usersGrowthPercent']) ??
        adminDashboardFixture.usersGrowth,
      adsGrowth:
        getNumberField(record, ['adsGrowth', 'adsGrowthPercentage', 'adsGrowthPercent']) ??
        adminDashboardFixture.adsGrowth,
      messagesGrowth:
        getNumberField(record, ['messagesGrowth', 'messagesGrowthPercentage', 'messagesGrowthPercent']) ??
        adminDashboardFixture.messagesGrowth,
      activityWindowLabel:
        getStringField(record, ['activityWindowLabel', 'activityPeriodLabel', 'lastPeriodLabel']) ??
        adminDashboardFixture.activityWindowLabel,
      activityPoints:
        mapActivityPoints(record.weeklyActivity ?? record.activityPoints ?? record.activity ?? null),
    };
  } catch (error) {
    return getFallbackValue(error, 'تعذر تحميل إحصائيات لوحة الإدارة', adminDashboardFixture);
  }
}
