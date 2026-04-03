import { apiClient } from '@/services/http-client';
import type { AdminDashboardSummary, AdminMetricPoint } from '@/types/admin';

import {
  getNumberField,
  getRecord,
  getRecords,
  getStringField,
  throwAdminError,
} from './admin-utils';

const emptyDashboardSummary: AdminDashboardSummary = {
  usersCount: 0,
  adsCount: 0,
  messagesCount: 0,
  usersGrowth: 0,
  adsGrowth: 0,
  messagesGrowth: 0,
  activityWindowLabel: '',
  activityPoints: [],
};

function mapActivityPoints(payload: unknown): AdminMetricPoint[] {
  return getRecords(payload).map((record) => ({
    label: getStringField(record, ['label', 'day', 'name', 'dateLabel']) ?? '',
    value: getNumberField(record, ['value', 'count', 'total', 'messagesCount']) ?? 0,
  }));
}

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  try {
    const { data } = await apiClient.get('/api/admin/dashboard');
    const record = getRecord(data);

    if (!record) {
      return emptyDashboardSummary;
    }

    return {
      usersCount: getNumberField(record, ['usersCount', 'totalUsers', 'totalUserCount']) ?? 0,
      adsCount: getNumberField(record, ['adsCount', 'productAdsCount', 'totalAdsCount']) ?? 0,
      messagesCount:
        getNumberField(record, ['messagesCount', 'chatsCount', 'totalMessagesCount']) ?? 0,
      usersGrowth:
        getNumberField(record, ['usersGrowth', 'usersGrowthPercentage', 'usersGrowthPercent']) ?? 0,
      adsGrowth:
        getNumberField(record, ['adsGrowth', 'adsGrowthPercentage', 'adsGrowthPercent']) ?? 0,
      messagesGrowth:
        getNumberField(record, ['messagesGrowth', 'messagesGrowthPercentage', 'messagesGrowthPercent']) ?? 0,
      activityWindowLabel:
        getStringField(record, ['activityWindowLabel', 'activityPeriodLabel', 'lastPeriodLabel']) ??
        '',
      activityPoints:
        mapActivityPoints(record.weeklyActivity ?? record.activityPoints ?? record.activity ?? null),
    };
  } catch (error) {
    throwAdminError(error, 'تعذر تحميل إحصائيات لوحة الإدارة');
  }
}
