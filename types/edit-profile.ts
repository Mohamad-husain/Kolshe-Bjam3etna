import type { ProfileImageInput } from '@/services/auth-api';
import type { AdminToastTone } from '@/types/admin';

export type AdminEditProfileTab = 'personal' | 'academic' | 'security';
export type AdminEditProfileSelectKey = 'university' | 'major';

export type AdminEditProfileOption<TValue extends string | number = string> = {
  label: string;
  value: TValue;
};

export type AdminEditProfileImageValue = ProfileImageInput & {
  isRemote?: boolean;
};

export type AdminEditProfileFormValues = {
  fullName: string;
  universityEmail: string;
  phoneNumber: string;
  bio: string;
  websiteUrl: string;
  universityId: number | null;
  universityName: string;
  major: string;
  studyYear: string;
  universityNumber: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  profileImage: AdminEditProfileImageValue | null;
};

export type AdminEditProfilePersonalInput = {
  fullName: string;
  phoneNumber: string;
  bio: string;
  websiteUrl: string;
  profileImage: AdminEditProfileImageValue | null;
  skipPersonalDetailsUpdate?: boolean;
};

export type AdminEditProfileAcademicInput = {
  universityId: number;
  universityName: string;
  major: string;
  studyYear: string;
  universityNumber: string;
};

export type AdminEditProfilePasswordInput = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export type AdminEditProfileToast = {
  id: string;
  message: string;
  tone: AdminToastTone;
};
