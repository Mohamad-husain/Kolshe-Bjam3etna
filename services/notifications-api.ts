import { apiClient, getApiErrorMessage } from '@/services/http-client';

type ApiRecord = Record<string, unknown>;

type ApiNotificationResponse = {
  success?: boolean;
  message?: string;
  data?: {
    unreadCount?: number;
    items?: ApiRecord[];
  };
};

type ApiUnreadResponse = {
  success?: boolean;
  message?: string;
  data?: number;
};

export type AppNotificationType =
  | 'Offer'
  | 'Message'
  | 'EventReminder'
  | 'Deadline'
  | 'Announcement'
  | string;

export type AppNotification = {
  id: number;
  type: AppNotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAtUtc: string;
  targetType: string | null;
  targetId: number | null;
};

export type NotificationsSummary = {
  unreadCount: number;
  items: AppNotification[];
};

function isRecord(value: unknown): value is ApiRecord {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function getString(record: ApiRecord, keys: string[], fallback = '') {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return fallback;
}

function getNumber(record: ApiRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function getBoolean(record: ApiRecord, keys: string[], fallback = false) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'boolean') {
      return value;
    }
  }

  return fallback;
}

function mapNotification(record: ApiRecord): AppNotification {
  return {
    id: getNumber(record, ['id', 'notificationId']) ?? Date.now(),
    type: getString(record, ['type'], 'Announcement'),
    title: getString(record, ['title'], 'إشعار جديد'),
    body: getString(record, ['body', 'message', 'description']),
    isRead: getBoolean(record, ['isRead', 'read']),
    createdAtUtc: getString(record, ['createdAtUtc', 'createdAt'], new Date().toISOString()),
    targetType: getString(record, ['targetType']) || null,
    targetId: getNumber(record, ['targetId']),
  };
}

export async function getNotifications(take = 30): Promise<NotificationsSummary> {
  try {
    const { data } = await apiClient.get<ApiNotificationResponse>('/api/notifications', {
      params: { take },
    });

    const payload = isRecord(data.data) ? data.data : {};
    const items = Array.isArray(payload.items)
      ? payload.items.filter(isRecord).map(mapNotification)
      : [];

    return {
      unreadCount: typeof payload.unreadCount === 'number' ? payload.unreadCount : 0,
      items,
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'تعذر تحميل الإشعارات'));
  }
}

export async function getUnreadNotificationCount() {
  try {
    const { data } = await apiClient.get<ApiUnreadResponse>('/api/notifications/unread-count');
    return typeof data.data === 'number' ? data.data : 0;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'تعذر تحميل عدد الإشعارات'));
  }
}

export async function markNotificationRead(id: number | string) {
  try {
    await apiClient.post(`/api/notifications/${id}/read`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'تعذر تحديث الإشعار'));
  }
}

export async function markAllNotificationsRead() {
  try {
    await apiClient.post('/api/notifications/read-all');
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'تعذر تحديث الإشعارات'));
  }
}
