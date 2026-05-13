import { apiClient } from '@/services/http-client';
import type { AdminUser, AdminUserUpsertInput } from '@/types/admin';

import {
  ApiRecord,
  getBooleanField,
  getDateField,
  getNestedRecord,
  getNumberField,
  getRecord,
  getRecords,
  getStringField,
  throwAdminError,
} from './admin-utils';

const CHAT_AVATAR_COLORS = [
  '#2563EB',
  '#22C55E',
  '#38BDF8',
  '#F59E0B',
  '#A855F7',
  '#F97316',
] as const;

function getAvatarColor(seed?: string | null) {
  const value = (seed ?? '').trim();

  if (!value) {
    return CHAT_AVATAR_COLORS[0];
  }

  const index =
    value.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % CHAT_AVATAR_COLORS.length;

  return CHAT_AVATAR_COLORS[index];
}

function getAvatarInitial(name?: string | null) {
  const value = (name ?? '').trim();
  return value[0]?.toUpperCase() ?? 'م';
}

function getUniversityName(record: ApiRecord) {
  const direct = getStringField(record, ['universityName', 'collegeName']);

  if (direct) {
    return direct;
  }

  const universityRecord = getNestedRecord(record, ['university', 'college']);

  if (!universityRecord) {
    return '';
  }

  return getStringField(universityRecord, ['name', 'universityName']) ?? '';
}

function mapUser(record: ApiRecord): AdminUser {
  const fullName = getStringField(record, ['fullName', 'name', 'userName', 'username']) ?? '';
  const email = getStringField(record, ['email']) ?? '';
  const isBlocked = getBooleanField(record, ['isBlocked', 'blocked', 'isSuspended']) ?? false;

  return {
    id: String(getNumberField(record, ['id', 'userId']) ?? getStringField(record, ['id']) ?? email),
    fullName,
    email,
    universityId: getNumberField(record, ['universityId']) ?? null,
    universityName: getUniversityName(record),
    postsCount: getNumberField(record, ['postsCount', 'adsCount', 'newsCount', 'itemsCount']) ?? 0,
    status: isBlocked ? 'blocked' : 'active',
    joinedAt: getDateField(record, ['joinedAt', 'createdAt', 'createdAtUtc', 'registeredAt']),
    avatarInitial: getAvatarInitial(fullName),
    avatarColor: getAvatarColor(fullName),
  };
}

export async function getAdminUsers() {
  try {
    const { data } = await apiClient.get('/api/admin/users');
    return getRecords(data).map(mapUser);
  } catch (error) {
    throwAdminError(error, 'تعذر تحميل المستخدمين');
  }
}

export async function getAdminUserById(id: string) {
  try {
    const { data } = await apiClient.get(`/api/admin/users/${id}`);
    const record = getRecord(data);
    return record ? mapUser(record) : null;
  } catch (error) {
    throwAdminError(error, 'تعذر تحميل بيانات المستخدم');
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
    throwAdminError(error, 'تعذر تحديث المستخدم');
  }
}

export async function deleteAdminUser(id: string) {
  try {
    await apiClient.delete(`/api/admin/users/${id}`);
  } catch (error) {
    throwAdminError(error, 'تعذر حذف المستخدم');
  }
}

export async function blockAdminUser(id: string) {
  try {
    await apiClient.post(`/api/admin/users/${id}/block`);
  } catch (error) {
    throwAdminError(error, 'تعذر إيقاف المستخدم');
  }
}

export async function unblockAdminUser(id: string) {
  try {
    await apiClient.post(`/api/admin/users/${id}/unblock`);
  } catch (error) {
    throwAdminError(error, 'تعذر تفعيل المستخدم');
  }
}
