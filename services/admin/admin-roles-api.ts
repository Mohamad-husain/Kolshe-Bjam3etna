import { getAvatarColor, getAvatarInitial } from '@/components/chat/chat-ui';
import { getRoleOption } from '@/lib/admin/admin-config';
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
  getNestedRecord,
  getNumberField,
  getRecords,
  getStringField,
  isRecord,
  throwAdminError,
} from './admin-utils';

function normalizeRoleValue(value: string | null): AdminRoleValue | null {
  if (!value) {
    return null;
  }

  const normalized = value.toLowerCase().trim();

  if (normalized.includes('super') || normalized.includes('أعلى') || normalized.includes('اعلى')) {
    return 'superAdmin';
  }

  if (
    normalized.includes('coordinator') ||
    normalized.includes('coord') ||
    normalized.includes('منسق') ||
    normalized.includes('event') ||
    normalized.includes('owner') ||
    normalized.includes('مالك') ||
    normalized.includes('فعالي')
  ) {
    return 'Coordinator';
  }

  if (normalized.includes('admin')) {
    return 'admin';
  }

  return null;
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

function mapRoleMember(record: ApiRecord): AdminRoleMember | null {
  const fullName =
    getStringField(record, ['fullName', 'name', 'userName']) ??
    getStringField(getNestedRecord(record, ['user']) ?? {}, ['fullName', 'name']) ??
    '';
  const role = normalizeRoleValue(getStringField(record, ['role', 'roleName']));
  if (!role) {
    return null;
  }
  const scope = getRoleScope(record);
  const email =
    getStringField(record, ['email']) ??
    getStringField(getNestedRecord(record, ['user']) ?? {}, ['email']) ??
    '';

  return {
    id: `${email}-${role}-${scope.scopeId ?? 'global'}`,
    fullName,
    email,
    role,
    scopeId: scope.scopeId,
    scopeName: scope.scopeName,
    permissions: getPermissions(record, role),
    addedAt: getStringField(record, ['assignedAt', 'createdAt', 'createdAtUtc']) ?? '',
    addedBy: getStringField(record, ['assignedBy', 'createdBy']) ?? '',
    avatarInitial: getAvatarInitial(fullName),
    avatarColor: getAvatarColor(fullName),
  };
}

function mapRoleSummary(record: ApiRecord): AdminRoleSummary | null {
  const role = normalizeRoleValue(getStringField(record, ['role', 'name']));
  const count = getNumberField(record, ['count', 'total', 'membersCount']);

  if (!role || count === null) {
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
    return getRecords(data).map(mapRoleMember).filter((item): item is AdminRoleMember => Boolean(item));
  } catch (error) {
    throwAdminError(error, 'تعذر تحميل الأدوار');
  }
}

export async function getAdminRolesSummary() {
  try {
    const { data } = await apiClient.get('/api/admin/roles');
    return getRecords(data)
      .map(mapRoleSummary)
      .filter((item): item is AdminRoleSummary => Boolean(item));
  } catch (error) {
    throwAdminError(error, 'تعذر تحميل ملخص الأدوار');
  }
}

export async function getAdminAvailableRoles() {
  try {
    const { data } = await apiClient.get('/api/admin/roles');
    const raw = getRecords(data);
    const values = raw
      .map((record) => normalizeRoleValue(getStringField(record, ['role', 'roleName'])))
      .filter((value): value is AdminRoleValue => Boolean(value));

    return Array.from(new Set(values)).map((value) => getRoleOption(value));
  } catch (error) {
    throwAdminError(error, 'تعذر تحميل الأدوار المتاحة');
  }
}

export async function getAdminRoleScopes() {
  try {
    const { data } = await apiClient.get('/api/admin/roles');
    const payload = getRecords(data);

    return payload
      .map((value, index) => {
        const scope = getRoleScope(value);

        if (scope.scopeId !== null && scope.scopeName) {
          return { id: scope.scopeId, name: scope.scopeName };
        }

        return mapScopeOption(value, index);
      })
      .filter((item): item is AdminRoleScopeOption => Boolean(item));
  } catch (error) {
    throwAdminError(error, 'تعذر تحميل نطاقات الأدوار');
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
    throwAdminError(error, 'تعذر إضافة الدور');
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
    throwAdminError(error, 'تعذر تحديث الدور');
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
    throwAdminError(error, 'تعذر إلغاء الدور');
  }
}
