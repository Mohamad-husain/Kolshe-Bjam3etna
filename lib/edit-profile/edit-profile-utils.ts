import { Platform } from 'react-native';

import { normalizeStudyYearForForm } from '@/lib/edit-profile/edit-profile-config';
import type { AccountProfile } from '@/services/auth-api';
import type { AdminEditProfileFormValues, AdminEditProfileTab } from '@/types/edit-profile';

const EDIT_PROFILE_API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '')
  .trim()
  .replace(/\/$/, '');

export function normalizeEditProfileValue(value: string | number | null | undefined) {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value).trim();
  }

  return '';
}

export function normalizeEditProfileDigits(value: string | number | null | undefined) {
  return normalizeEditProfileValue(value).replace(/\D/g, '');
}

export function getEditProfileErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function blurActiveEditProfileElement() {
  if (Platform.OS !== 'web') {
    return;
  }

  const activeElement = (
    globalThis as {
      document?: {
        activeElement?: {
          blur?: () => void;
        } | null;
      };
    }
  ).document?.activeElement;

  if (activeElement && typeof activeElement.blur === 'function') {
    activeElement.blur();
  }
}

export function getEditProfileTab(tab?: string): AdminEditProfileTab {
  return tab === 'academic' || tab === 'security' || tab === 'personal' ? tab : 'personal';
}

export function getValidEditProfileImageUri(value?: string | null) {
  const uri = value?.trim();

  if (!uri) {
    return null;
  }

  if (
    uri.startsWith('http://') ||
    uri.startsWith('https://') ||
    uri.startsWith('data:') ||
    uri.startsWith('file:') ||
    uri.startsWith('blob:') ||
    uri.startsWith('content:')
  ) {
    return uri;
  }

  if (!EDIT_PROFILE_API_BASE_URL) {
    return null;
  }

  if (uri.startsWith('/')) {
    return `${EDIT_PROFILE_API_BASE_URL}${uri}`;
  }

  return `${EDIT_PROFILE_API_BASE_URL}/${uri.replace(/^\/+/, '')}`;
}

export function buildEditProfileFormValues(
  profile: AccountProfile | null | undefined,
  userEmail: string,
  userName: string,
) {
  const imageUri = getValidEditProfileImageUri(
    normalizeEditProfileValue(profile?.profileImageUrl) || null,
  );

  return {
    fullName: normalizeEditProfileValue(profile?.fullName) || userName,
    universityEmail: normalizeEditProfileValue(profile?.email) || userEmail,
    phoneNumber: normalizeEditProfileValue(profile?.phoneNumber),
    bio: normalizeEditProfileValue(profile?.bio),
    websiteUrl: normalizeEditProfileValue(profile?.websiteUrl),
    universityId: profile?.universityId ?? null,
    universityName: normalizeEditProfileValue(profile?.universityName),
    major: normalizeEditProfileValue(profile?.major),
    studyYear: normalizeStudyYearForForm(profile?.studyYear),
    universityNumber: normalizeEditProfileValue(profile?.universityNumber),
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    profileImage: imageUri
      ? {
          uri: imageUri,
          isRemote: true,
        }
      : null,
  } satisfies AdminEditProfileFormValues;
}
