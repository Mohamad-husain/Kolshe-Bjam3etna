import { getAvatarColor, getAvatarInitial } from '@/components/chat/chat-ui';
import {
  adminRoleScopeFixture,
  adminRolesFixture,
  adminRoleSummaryFixture,
} from '@/lib/admin/admin-fixtures';
import { adminRoleOptions, getRoleOption } from '@/lib/admin/admin-config';
import { apiClient } from '@/services/http-client';
import type {
  AdminRoleAssignInput,
  AdminRoleMember,
  AdminRoleScopeOption,
  AdminRoleSummary,
  AdminRoleUpdateInput,
  AdminRoleValue,
} from '@/types/admin';
import {
  ApiRecord,
  getFallbackValue,
  getNestedRecord,
  getNumberField,
  getRecord,
  getRecords,
  getStringField,
  isRecord,
} from './admin-utils';

function normalizeRoleValue(value: string | null): AdminRoleValue {
  if (!value) {
    return 'admin';
  }

  const normalized = value.toLowerCase().trim();

  if (normalized.includes('super') || normalized.includes('أعلى') || normalized.includes('اعلى')) {
    return 'superAdmin';
  }

  if (normalized.includes('news') || normalized.includes('محرر') || normalized.includes('خبر')) {
    return 'newsEditor';
  }

  if (
    normalized.includes('event') ||
    normalized.includes('owner') ||
    normalized.includes('مالك') ||
    normalized.includes('فعالي')
  ) {
    return 'eventOwner';
  }

  return 'admin';
}

function getUniqueRoleOptions(values: AdminRoleValue[]) {
  const uniqueValues = new Set(values);
  return adminRoleOptions.filter((option) => uniqueValues.has(option.value));
}

function getPermissions(record: ApiRecord, role: AdminRoleValue) {
  const raw = record.permissions;

  if (Array.isArray(raw)) {
    return raw
      .map((value) => (typeof value === 'string' ? value.trim() : null))
      .filter((value): value is string => Boolean(value));
  }

  return getRoleOption(role).permissions;
}

function getRoleScope(record: ApiRecord) {
  const nestedScope = getNestedRecord(record, ['club', 'scope', 'event', 'activity']);

  return {
    scopeId:
      getNumberField(record, ['clubId', 'scopeId', 'eventId']) ??
      (nestedScope ? getNumberField(nestedScope, ['id']) : null),
    scopeName:
      getStringField(record, ['clubName', 'scopeName', 'eventName']) ??
      (nestedScope ? getStringField(nestedScope, ['name', 'title']) : null),
  };
}

function mapRoleMember(record: ApiRecord): AdminRoleMember {
  const fullName =
    getStringField(record, ['fullName', 'name', 'userName']) ??
    getStringField(getNestedRecord(record, ['user']) ?? {}, ['fullName', 'name']) ??
    'مستخدم';
  const role = normalizeRoleValue(getStringField(record, ['role', 'roleName']));
  const scope = getRoleScope(record);
  const email =
    getStringField(record, ['email']) ??
    getStringField(getNestedRecord(record, ['user']) ?? {}, ['email']) ??
    `${fullName}@example.com`;

  return {
    id: `${email}-${role}-${scope.scopeId ?? 'global'}`,
    fullName,
    email,
    role,
    scopeId: scope.scopeId,
    scopeName: scope.scopeName,
    permissions: getPermissions(record, role),
    addedAt: getStringField(record, ['assignedAt', 'createdAt', 'createdAtUtc']) ?? '2026-01-01',
    addedBy: getStringField(record, ['assignedBy', 'createdBy']) ?? 'المدير الأعلى',
    avatarInitial: getAvatarInitial(fullName),
    avatarColor: getAvatarColor(fullName),
  };
}

function mapRoleSummary(record: ApiRecord): AdminRoleSummary | null {
  const role = normalizeRoleValue(getStringField(record, ['role', 'name']));
  const count = getNumberField(record, ['count', 'total', 'membersCount']);

  if (count === null) {
    return null;
  }

  return { role, count };
}

function mapScopeOption(value: unknown, index: number): AdminRoleScopeOption | null {
  if (typeof value === 'string' && value.trim().length > 0) {
    return { id: index + 1, name: value.trim() };
  }

  if (!isRecord(value)) {
    return null;
  }

  const id = getNumberField(value, ['id', 'clubId', 'eventId']) ?? index + 1;
  const name = getStringField(value, ['name', 'title', 'clubName', 'eventName']);

  if (!name) {
    return null;
  }

  return { id, name };
}

export async function getAdminRoles() {
  try {
    const { data } = await apiClient.get('/api/admin/roles');
    const records = getRecords(data);
    return records.length ? records.map(mapRoleMember) : adminRolesFixture;
  } catch (error) {
    return getFallbackValue(error, 'تعذر تحميل الأدوار', adminRolesFixture);
  }
}

export async function getAdminRolesSummary() {
  try {
    const { data } = await apiClient.get('/api/admin/roles/summary');
    const records = getRecords(data);
    const summary = records.map(mapRoleSummary).filter((item): item is AdminRoleSummary => Boolean(item));
    return summary.length ? summary : adminRoleSummaryFixture;
  } catch (error) {
    return getFallbackValue(error, 'تعذر تحميل ملخص الأدوار', adminRoleSummaryFixture);
  }
}

export async function getAdminAvailableRoles() {
  try {
    const { data } = await apiClient.get('/api/admin/roles/available');
    const raw = getRecords(data);

    if (raw.length) {
      return getUniqueRoleOptions(
        raw.map((record) => normalizeRoleValue(getStringField(record, ['value', 'name', 'role']))),
      );
    }

    const record = getRecord(data);

    if (record) {
      const entries = Object.values(record)
        .map((value, index) => mapScopeOption(value, index))
        .filter((item): item is AdminRoleScopeOption => Boolean(item));

      if (entries.length) {
        return getUniqueRoleOptions(entries.map((item) => normalizeRoleValue(item.name)));
      }
    }

    return adminRoleOptions;
  } catch (error) {
    return getFallbackValue(error, 'تعذر تحميل الأدوار المتاحة', adminRoleOptions);
  }
}

export async function getAdminRoleScopes() {
  try {
    const { data } = await apiClient.get('/api/admin/roles/clubs');
    const payload = getRecords(data);

    if (payload.length) {
      return payload
        .map((value, index) => mapScopeOption(value, index))
        .filter((item): item is AdminRoleScopeOption => Boolean(item));
    }

    const record = getRecord(data);

    if (record) {
      const options = Object.values(record)
        .map((value, index) => mapScopeOption(value, index))
        .filter((item): item is AdminRoleScopeOption => Boolean(item));

      if (options.length) {
        return options;
      }
    }

    return adminRoleScopeFixture;
  } catch (error) {
    return getFallbackValue(error, 'تعذر تحميل نطاقات الأدوار', adminRoleScopeFixture);
  }
}

export async function assignAdminRole(input: AdminRoleAssignInput) {
  try {
    await apiClient.post('/api/admin/roles/assign', {
      email: input.email,
      role: input.role,
      clubId: input.scopeId ?? 0,
    });
  } catch (error) {
    if (typeof __DEV__ === 'undefined' || !__DEV__) {
      throw error;
    }
  }
}

export async function updateAdminRole(input: AdminRoleUpdateInput) {
  try {
    await apiClient.put('/api/admin/roles/update', {
      email: input.email,
      newRole: input.newRole,
      clubId: input.scopeId ?? 0,
    });
  } catch (error) {
    if (typeof __DEV__ === 'undefined' || !__DEV__) {
      throw error;
    }
  }
}

export async function removeAdminRole(email: string, role: AdminRoleValue) {
  try {
    await apiClient.delete('/api/admin/roles/remove', {
      data: {
        email,
        role,
      },
    });
  } catch (error) {
    if (typeof __DEV__ === 'undefined' || !__DEV__) {
      throw error;
    }
  }
}
