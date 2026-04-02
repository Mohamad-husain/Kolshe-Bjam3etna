import { getAvatarColor, getAvatarInitial } from '@/components/chat/chat-ui';
import { adminUsersFixture } from '@/lib/admin/admin-fixtures';
import { apiClient } from '@/services/http-client';
import type { AdminUser, AdminUserUpsertInput } from '@/types/admin';
import {
  ApiRecord,
  getBooleanField,
  getDateField,
  getFallbackValue,
  getNestedRecord,
  getNumberField,
  getRecord,
  getRecords,
  getStringField,
} from './admin-utils';

function getUniversityName(record: ApiRecord) {
  const direct = getStringField(record, ['universityName', 'collegeName']);

  if (direct) {
    return direct;
  }

  const universityRecord = getNestedRecord(record, ['university', 'college']);

  if (!universityRecord) {
    return 'جامعة غير محددة';
  }

  return getStringField(universityRecord, ['name', 'universityName']) ?? 'جامعة غير محددة';
}

function mapUser(record: ApiRecord): AdminUser {
  const fullName =
    getStringField(record, ['fullName', 'name', 'userName', 'username']) ?? 'مستخدم';

  const email = getStringField(record, ['email']) ?? `${fullName}@example.com`;
  const isBlocked =
    getBooleanField(record, ['isBlocked', 'blocked', 'isSuspended']) ?? false;

  return {
    id:
      String(getNumberField(record, ['id', 'userId']) ?? getStringField(record, ['id']) ?? email),
    fullName,
    email,
    universityId: getNumberField(record, ['universityId']) ?? null,
    universityName: getUniversityName(record),
    postsCount:
      getNumberField(record, ['postsCount', 'adsCount', 'newsCount', 'itemsCount']) ?? 0,
    status: isBlocked ? 'blocked' : 'active',
    joinedAt: getDateField(record, ['joinedAt', 'createdAt', 'createdAtUtc', 'registeredAt']),
    avatarInitial: getAvatarInitial(fullName),
    avatarColor: getAvatarColor(fullName),
  };
}

export async function getAdminUsers() {
  try {
    const { data } = await apiClient.get('/api/admin/users');
    const records = getRecords(data);
    return records.length ? records.map(mapUser) : adminUsersFixture;
  } catch (error) {
    return getFallbackValue(error, 'تعذر تحميل المستخدمين', adminUsersFixture);
  }
}

export async function getAdminUserById(id: string) {
  try {
    const { data } = await apiClient.get(`/api/admin/users/${id}`);
    const record = getRecord(data);
    return record ? mapUser(record) : adminUsersFixture.find((item) => item.id === id) ?? null;
  } catch (error) {
    return getFallbackValue(
      error,
      'تعذر تحميل بيانات المستخدم',
      adminUsersFixture.find((item) => item.id === id) ?? null,
    );
  }
}

export async function updateAdminUser(id: string, input: AdminUserUpsertInput) {
  try {
    await apiClient.put(`/api/admin/users/${id}`, {
      fullName: input.fullName,
      email: input.email,
      universityId: input.universityId ?? 0,
      isBlocked: input.isBlocked,
    });
  } catch (error) {
    if (typeof __DEV__ === 'undefined' || !__DEV__) {
      throw error;
    }
  }
}

export async function deleteAdminUser(id: string) {
  try {
    await apiClient.delete(`/api/admin/users/${id}`);
  } catch (error) {
    if (typeof __DEV__ === 'undefined' || !__DEV__) {
      throw error;
    }
  }
}

export async function blockAdminUser(id: string) {
  try {
    await apiClient.post(`/api/admin/users/${id}/block`);
  } catch (error) {
    if (typeof __DEV__ === 'undefined' || !__DEV__) {
      throw error;
    }
  }
}

export async function unblockAdminUser(id: string) {
  try {
    await apiClient.post(`/api/admin/users/${id}/unblock`);
  } catch (error) {
    if (typeof __DEV__ === 'undefined' || !__DEV__) {
      throw error;
    }
  }
}
