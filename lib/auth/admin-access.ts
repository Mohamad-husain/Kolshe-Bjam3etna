const displayNameClaimKeys = [
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
  'name',
  'unique_name',
  'fullName',
  'full_name',
] as const;

const roleClaimKeys = [
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role',
  'role',
  'roles',
] as const;

function decodeBase64Url(value: string) {
  const normalizedValue = value.replace(/-/g, '+').replace(/_/g, '/');
  const paddedValue = normalizedValue.padEnd(
    normalizedValue.length + ((4 - (normalizedValue.length % 4)) % 4),
    '=',
  );

  return typeof atob === 'function'
    ? atob(paddedValue)
    : Buffer.from(paddedValue, 'base64').toString('utf-8');
}

function getStringValues(value: unknown): string[] {
  if (typeof value === 'string') {
    const normalizedValue = value.trim();
    return normalizedValue ? [normalizedValue] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap(getStringValues);
  }

  return [];
}

function normalizeRole(value: string) {
  return value.trim().toLowerCase().replace(/[\s_-]+/g, '');
}

export function decodeJwtPayload(token?: string | null) {
  if (!token) {
    return null;
  }

  try {
    const [, payload = ''] = token.split('.');

    if (!payload) {
      return null;
    }

    return JSON.parse(decodeBase64Url(payload)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getTokenDisplayName(token?: string | null) {
  const payload = decodeJwtPayload(token);

  if (!payload) {
    return '';
  }

  for (const claimKey of displayNameClaimKeys) {
    const claimValue = payload[claimKey];

    if (typeof claimValue === 'string' && claimValue.trim().length > 0) {
      return claimValue.trim();
    }
  }

  const givenName =
    typeof payload.given_name === 'string' ? payload.given_name.trim() : '';
  const familyName =
    typeof payload.family_name === 'string' ? payload.family_name.trim() : '';

  return `${givenName} ${familyName}`.trim();
}

export function getTokenRoles(token?: string | null) {
  const payload = decodeJwtPayload(token);

  if (!payload) {
    return [];
  }

  const roles = roleClaimKeys.flatMap((claimKey) => getStringValues(payload[claimKey]));

  return Array.from(new Set(roles));
}

export function hasAdminPanelRoles(roles: string[]) {
  return roles.some((role) => {
    const normalizedRole = normalizeRole(role);

    return (
      normalizedRole === 'admin' ||
      normalizedRole === 'superadmin' ||
      normalizedRole === 'coordinator' ||
      normalizedRole === 'administrator' ||
      normalizedRole === 'superadministrator' ||
      normalizedRole === 'newseditor' ||
      normalizedRole === 'eventowner'
    );
  });
}

export function hasAdminPanelAccess(token?: string | null) {
  return hasAdminPanelRoles(getTokenRoles(token));
}
