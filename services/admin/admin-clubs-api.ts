import { getAvatarColor, getAvatarInitial } from '@/components/chat/chat-ui';
import { adminClubSummaryFixture, adminClubsFixture } from '@/lib/admin/admin-fixtures';
import { apiClient } from '@/services/http-client';
import type {
  AdminClubItem,
  AdminClubStatus,
  AdminClubSubscriptionType,
  AdminClubSummary,
  AdminClubUpsertInput,
} from '@/types/admin';
import {
  ApiRecord,
  getDateField,
  getFallbackValue,
  getNumberField,
  getRecord,
  getRecords,
  getStringField,
} from './admin-utils';

function normalizeSubscriptionType(value: string | null): AdminClubSubscriptionType {
  if (!value) {
    return 'yearly';
  }

  return value.toLowerCase().includes('month') ? 'monthly' : 'yearly';
}

function normalizeClubStatus(record: ApiRecord, expiresAt: string): AdminClubStatus {
  const explicit = getStringField(record, ['status']);

  if (explicit) {
    const normalized = explicit.toLowerCase();

    if (normalized.includes('expired')) {
      return 'expired';
    }

    if (normalized.includes('expiring') || normalized.includes('soon')) {
      return 'expiring';
    }
  }

  const date = new Date(expiresAt);

  if (Number.isNaN(date.getTime())) {
    return 'active';
  }

  const daysLeft = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return 'expired';
  }

  if (daysLeft <= 14) {
    return 'expiring';
  }

  return 'active';
}

function buildPriceLabel(type: AdminClubSubscriptionType) {
  return type === 'monthly' ? '15 د.ا' : '120 د.ا';
}

function mapClub(record: ApiRecord): AdminClubItem {
  const name = getStringField(record, ['name', 'clubName']) ?? 'نادي جديد';
  const subscriptionType = normalizeSubscriptionType(
    getStringField(record, ['subscriptionType', 'plan', 'planType']),
  );
  const expiresAt = getDateField(record, ['expiresAt', 'expireDateUtc', 'subscriptionEndDate']);

  return {
    id:
      String(getNumberField(record, ['id', 'clubId']) ?? getStringField(record, ['id']) ?? name),
    name,
    universityName: getStringField(record, ['universityName']) ?? 'جامعة غير محددة',
    managerName: getStringField(record, ['managerName', 'ownerName']) ?? 'غير محدد',
    managerEmail: getStringField(record, ['managerEmail', 'email']) ?? '',
    subscriptionType,
    status: normalizeClubStatus(record, expiresAt),
    startedAt: getDateField(record, ['startedAt', 'subscriptionStartDate', 'createdAt']),
    expiresAt,
    priceLabel: buildPriceLabel(subscriptionType),
    avatarInitial: getAvatarInitial(name),
    avatarColor: getAvatarColor(name),
  };
}

export async function getAdminClubs() {
  try {
    const { data } = await apiClient.get('/api/admin/clubs');
    const records = getRecords(data);
    return records.length ? records.map(mapClub) : adminClubsFixture;
  } catch (error) {
    return getFallbackValue(error, 'تعذر تحميل الأندية', adminClubsFixture);
  }
}

export async function getAdminClubSummary() {
  try {
    const { data } = await apiClient.get('/api/admin/clubs/summary');
    const record = getRecord(data);

    if (!record) {
      return adminClubSummaryFixture;
    }

    return {
      active:
        getNumberField(record, ['active', 'activeCount', 'activeClubs']) ??
        adminClubSummaryFixture.active,
      expiring:
        getNumberField(record, ['expiring', 'expiringCount', 'expiringSoonCount']) ??
        adminClubSummaryFixture.expiring,
      expired:
        getNumberField(record, ['expired', 'expiredCount']) ?? adminClubSummaryFixture.expired,
    } satisfies AdminClubSummary;
  } catch (error) {
    return getFallbackValue(error, 'تعذر تحميل ملخص الأندية', adminClubSummaryFixture);
  }
}

export async function createAdminClub(input: AdminClubUpsertInput) {
  try {
    const { data } = await apiClient.post('/api/admin/clubs', {
      name: input.name,
      universityName: input.universityName,
      managerName: input.managerName,
      managerEmail: input.managerEmail,
      subscriptionType: input.subscriptionType,
    });
    const record = getRecord(data);
    return record ? mapClub(record) : null;
  } catch (error) {
    return getFallbackValue(error, 'تعذر إضافة النادي', null);
  }
}

export async function updateAdminClub(id: string, input: AdminClubUpsertInput) {
  try {
    const { data } = await apiClient.put(`/api/admin/clubs/${id}`, {
      name: input.name,
      universityName: input.universityName,
      managerName: input.managerName,
      managerEmail: input.managerEmail,
      subscriptionType: input.subscriptionType,
    });
    const record = getRecord(data);
    return record ? mapClub(record) : null;
  } catch (error) {
    return getFallbackValue(error, 'تعذر تحديث النادي', null);
  }
}

export async function deleteAdminClub(id: string) {
  try {
    await apiClient.delete(`/api/admin/clubs/${id}`);
  } catch (error) {
    if (typeof __DEV__ === 'undefined' || !__DEV__) {
      throw error;
    }
  }
}

export async function renewAdminClub(id: string, subscriptionType: AdminClubSubscriptionType) {
  try {
    await apiClient.post(`/api/admin/clubs/${id}/renew`, {
      subscriptionType,
    });
  } catch (error) {
    if (typeof __DEV__ === 'undefined' || !__DEV__) {
      throw error;
    }
  }
}
