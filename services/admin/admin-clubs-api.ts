import { getAvatarColor, getAvatarInitial } from '@/components/chat/chat-ui';
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
  getNumberField,
  getRecord,
  getRecords,
  getStringField,
  throwAdminError,
} from './admin-utils';

const emptyClubSummary: AdminClubSummary = {
  active: 0,
  expiring: 0,
  expired: 0,
};

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
  const name = getStringField(record, ['name', 'clubName']) ?? '';
  const subscriptionType = normalizeSubscriptionType(
    getStringField(record, ['subscriptionType', 'plan', 'planType']),
  );
  const expiresAt = getDateField(record, ['expiresAt', 'expireDateUtc', 'subscriptionEndDate']);

  return {
    id: String(getNumberField(record, ['id', 'clubId']) ?? getStringField(record, ['id']) ?? name),
    name,
    universityName: getStringField(record, ['universityName']) ?? '',
    managerName: getStringField(record, ['managerName', 'ownerName']) ?? '',
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
    return getRecords(data).map(mapClub);
  } catch (error) {
    throwAdminError(error, 'تعذر تحميل الأندية');
  }
}

export async function getAdminClubSummary() {
  try {
    const { data } = await apiClient.get('/api/admin/clubs/summary');
    const record = getRecord(data);

    if (!record) {
      return emptyClubSummary;
    }

    return {
      active: getNumberField(record, ['active', 'activeCount', 'activeClubs']) ?? 0,
      expiring: getNumberField(record, ['expiring', 'expiringCount', 'expiringSoonCount']) ?? 0,
      expired: getNumberField(record, ['expired', 'expiredCount']) ?? 0,
    } satisfies AdminClubSummary;
  } catch (error) {
    throwAdminError(error, 'تعذر تحميل ملخص الأندية');
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
    throwAdminError(error, 'تعذر إضافة النادي');
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
    throwAdminError(error, 'تعذر تحديث النادي');
  }
}

export async function deleteAdminClub(id: string) {
  try {
    await apiClient.delete(`/api/admin/clubs/${id}`);
  } catch (error) {
    throwAdminError(error, 'تعذر حذف النادي');
  }
}

export async function renewAdminClub(id: string, subscriptionType: AdminClubSubscriptionType) {
  try {
    await apiClient.post(`/api/admin/clubs/${id}/renew`, {
      subscriptionType,
    });
  } catch (error) {
    throwAdminError(error, 'تعذر تجديد الاشتراك');
  }
}
