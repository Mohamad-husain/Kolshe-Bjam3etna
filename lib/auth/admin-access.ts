import type { AdminSection } from '@/types/admin';
import {
  decodeJwtPayload as decodeJwtTokenPayload,
  getJwtStringClaim,
  getJwtStringClaims,
  jwtClaimKeys,
} from '@/lib/auth/jwt';

function normalizeRole(value: string) {
  return value.trim().toLowerCase().replace(/[\s_-]+/g, '');
}

const fullAdminSections: AdminSection[] = ['overview', 'users', 'news', 'roles', 'offers', 'clubs'];
const limitedAdminSections: AdminSection[] = ['overview', 'news', 'offers'];

export function decodeJwtPayload(token?: string | null) {
  return decodeJwtTokenPayload(token);
}

export function getTokenDisplayName(token?: string | null) {
  const payload = decodeJwtPayload(token);

  if (!payload) {
    return '';
  }

  const displayName = getJwtStringClaim(payload, jwtClaimKeys.displayName);

  if (displayName) {
    return displayName;
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

  return getJwtStringClaims(payload, jwtClaimKeys.roles);
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

export function hasSuperAdminRole(roles: string[]) {
  return roles.some((role) => {
    const normalizedRole = normalizeRole(role);
    return normalizedRole === 'superadmin' || normalizedRole === 'superadministrator';
  });
}

export function getAllowedAdminSections(roles: string[]) {
  if (hasSuperAdminRole(roles)) {
    return [...fullAdminSections];
  }

  if (hasAdminPanelRoles(roles)) {
    return [...limitedAdminSections];
  }

  return [] as AdminSection[];
}

export function hasAdminPanelAccess(token?: string | null) {
  return hasAdminPanelRoles(getTokenRoles(token));
}
