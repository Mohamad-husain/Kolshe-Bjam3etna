import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import {
  adminNewsCategories,
  adminOfferCategories,
  getRoleOption,
  toEnglishDigits,
} from '@/lib/admin/admin-config';
import type {
  AdminClubItem,
  AdminClubSubscriptionType,
  AdminNewsItem,
  AdminNewsUpsertInput,
  AdminOfferItem,
  AdminOfferUpsertInput,
  AdminRoleAssignInput,
  AdminRoleMember,
  AdminUser,
  AdminUserUpsertInput,
} from '@/types/admin';

export type UserFormErrors = Partial<Record<'fullName' | 'email' | 'universityName', string>>;
export type NewsFormErrors = Partial<Record<'title' | 'source' | 'content', string>>;
export type RoleFormErrors = Partial<Record<'email' | 'scopeId', string>>;
export type OfferFormErrors = Partial<
  Record<'partnerName' | 'title' | 'description' | 'location' | 'phone' | 'email' | 'expireDateUtc' | 'discountPercent', string>
>;

export type ClubFormState = {
  name: string;
  universityName: string;
  managerName: string;
  managerEmail: string;
  subscriptionType: AdminClubSubscriptionType;
};

export type ClubFormErrors = Partial<Record<'name' | 'universityName' | 'managerName' | 'managerEmail', string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

export function createFieldValidator<
  TValues extends Record<string, unknown>,
  TFieldName extends keyof TValues & string,
  TErrors extends Partial<Record<TFieldName, string>>,
>(getValues: () => TValues, validateForm: (values: TValues) => TErrors) {
  return (fieldName: TFieldName) => (value: TValues[TFieldName]): true | string => {
    const nextValues = {
      ...getValues(),
      [fieldName]: value,
    } as TValues;

    const nextError = validateForm(nextValues)[fieldName];

    return typeof nextError === 'string' ? nextError : true;
  };
}

function countLetters(value: string) {
  return Array.from(normalizeText(value)).filter((char) => /\p{L}/u.test(char)).length;
}

function startsWithLetter(value: string) {
  const normalized = normalizeText(value);
  return normalized.length > 0 && /^\p{L}/u.test(normalized);
}

function isEmailValid(value: string) {
  return emailPattern.test(normalizeText(value).toLowerCase());
}

function isIsoDateValid(value: string) {
  if (!isoDatePattern.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function validateNameField(value: string, label: string, minimumLetters: number, maximumLetters: number) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return `${label} مطلوب`;
  }

  if (!startsWithLetter(normalized)) {
    return `${label} يجب أن يبدأ بحرف`;
  }

  const letters = countLetters(normalized);

  if (letters < minimumLetters) {
    return `${label} يجب أن يحتوي على ${toEnglishDigits(String(minimumLetters))} أحرف على الأقل`;
  }

  if (letters > maximumLetters) {
    return `${label} يجب ألّا يزيد عن ${toEnglishDigits(String(maximumLetters))} حرفاً`;
  }

  return undefined;
}

function validateRequiredText(value: string, label: string) {
  return normalizeText(value) ? undefined : `${label} مطلوب`;
}

export function validateUserForm(form: AdminUserUpsertInput): UserFormErrors {
  return {
    fullName: validateNameField(form.fullName, 'الاسم', 6, 18),
    email: !normalizeText(form.email)
      ? 'البريد الإلكتروني مطلوب'
      : !isEmailValid(form.email)
        ? 'البريد الإلكتروني غير صحيح'
        : undefined,
    universityName: validateRequiredText(form.universityName, 'الجامعة'),
  };
}

export function validateNewsForm(form: AdminNewsUpsertInput): NewsFormErrors {
  const title = normalizeText(form.title);
  const titleLetters = countLetters(title);
  const contentLetters = countLetters(form.content);

  return {
    title: !title
      ? 'عنوان الخبر مطلوب'
      : !startsWithLetter(title)
        ? 'عنوان الخبر يجب أن يبدأ بحرف'
        : titleLetters < 10
          ? 'عنوان الخبر يجب أن يحتوي على 10 أحرف على الأقل'
          : undefined,
    source: !normalizeText(form.source)
      ? 'المصدر مطلوب'
      : countLetters(form.source) < 3
        ? 'المصدر قصير جداً'
        : undefined,
    content: !normalizeText(form.content)
      ? 'تفاصيل الخبر مطلوبة'
      : contentLetters < 30
        ? 'تفاصيل الخبر يجب أن تحتوي على 30 حرفاً على الأقل'
        : undefined,
  };
}

export function validateRoleForm(
  form: AdminRoleAssignInput,
  isEditing: boolean,
  roleOption = getRoleOption(form.role),
): RoleFormErrors {
  return {
    email: isEditing
      ? undefined
      : !normalizeText(form.email)
        ? 'البريد الجامعي مطلوب'
        : !isEmailValid(form.email)
          ? 'البريد الجامعي غير صحيح'
          : undefined,
    scopeId: roleOption.requiresScope && !form.scopeId ? `حقل ${roleOption.scopeLabel ?? 'الفعالية المخصصة'} مطلوب` : undefined,
  };
}

export function validateOfferForm(form: AdminOfferUpsertInput): OfferFormErrors {
  return {
    partnerName: !normalizeText(form.partnerName)
      ? 'الاسم مطلوب'
      : !startsWithLetter(form.partnerName)
        ? 'الاسم يجب أن يبدأ بحرف'
        : countLetters(form.partnerName) < 3
          ? 'الاسم قصير جداً'
          : undefined,
    title: !normalizeText(form.title)
      ? 'عنوان العرض مطلوب'
      : !startsWithLetter(form.title)
        ? 'عنوان العرض يجب أن يبدأ بحرف'
        : countLetters(form.title) < 10
          ? 'عنوان العرض يجب أن يحتوي على 10 أحرف على الأقل'
          : undefined,
    description: !normalizeText(form.description)
      ? 'تفاصيل العرض مطلوبة'
      : countLetters(form.description) < 20
        ? 'تفاصيل العرض يجب أن تحتوي على 20 حرفاً على الأقل'
        : undefined,
    location: validateRequiredText(form.location, 'الموقع'),
    phone: !normalizeText(form.phone)
      ? 'رقم التواصل مطلوب'
      : form.phone.replace(/\D/g, '').length < 8
        ? 'رقم التواصل غير صحيح'
        : undefined,
    email: normalizeText(form.email) && !isEmailValid(form.email) ? 'البريد الإلكتروني غير صحيح' : undefined,
    expireDateUtc: !normalizeText(form.expireDateUtc)
      ? 'تاريخ الانتهاء مطلوب'
      : !isIsoDateValid(form.expireDateUtc)
        ? 'تاريخ الانتهاء يجب أن يكون بصيغة YYYY-MM-DD'
        : undefined,
    discountPercent:
      !Number.isFinite(form.discountPercent) || form.discountPercent <= 0 || form.discountPercent > 100
        ? 'نسبة الخصم يجب أن تكون بين 1 و100'
        : undefined,
  };
}

export function validateClubForm(form: ClubFormState): ClubFormErrors {
  return {
    name: !normalizeText(form.name)
      ? 'اسم النادي مطلوب'
      : !startsWithLetter(form.name)
        ? 'اسم النادي يجب أن يبدأ بحرف'
        : countLetters(form.name) < 3
          ? 'اسم النادي قصير جداً'
          : undefined,
    universityName: validateRequiredText(form.universityName, 'الجامعة'),
    managerName: validateNameField(form.managerName, 'اسم المسؤول', 6, 18),
    managerEmail: !normalizeText(form.managerEmail)
      ? 'البريد الإلكتروني مطلوب'
      : !isEmailValid(form.managerEmail)
        ? 'البريد الإلكتروني غير صحيح'
        : undefined,
  };
}

export function hasValidationErrors(errors: Record<string, string | undefined>) {
  return Object.values(errors).some(Boolean);
}

export function buildUserForm(user?: AdminUser | null): AdminUserUpsertInput {
  return {
    fullName: normalizeText(user?.fullName ?? ''),
    email: normalizeText(user?.email ?? '').toLowerCase(),
    universityId: user?.universityId ?? null,
    universityName: normalizeText(user?.universityName ?? ''),
    isBlocked: user?.status === 'blocked',
  };
}

export function buildNewsForm(item?: AdminNewsItem | null): AdminNewsUpsertInput {
  return {
    title: normalizeText(item?.title ?? ''),
    content: normalizeText(item?.content ?? ''),
    source: normalizeText(item?.source ?? ''),
    category: item?.category ?? adminNewsCategories[0],
    image: null,
    isImportant: item?.isImportant ?? false,
    isPublished: item?.isPublished ?? false,
  };
}

export function buildRoleForm(member?: AdminRoleMember | null): AdminRoleAssignInput {
  return {
    fullName: '',
    email: normalizeText(member?.email ?? '').toLowerCase(),
    role: member?.role ?? 'admin',
    scopeId: member?.scopeId ?? null,
  };
}

export function buildOfferForm(item?: AdminOfferItem | null): AdminOfferUpsertInput {
  return {
    image: null,
    partnerName: normalizeText(item?.partnerName ?? ''),
    type: item?.type ?? 'academy',
    category: normalizeText(item?.category ?? adminOfferCategories[0]),
    title: normalizeText(item?.title ?? ''),
    description: normalizeText(item?.description ?? ''),
    location: normalizeText(item?.location ?? ''),
    phone: normalizeText(item?.phone ?? ''),
    email: normalizeText(item?.email ?? '').toLowerCase(),
    expireDateUtc: item?.expireDateUtc ?? new Date().toISOString().slice(0, 10),
    discountPercent: item?.discountPercent ?? 0,
    showOnHomePage: item?.showOnHomePage ?? true,
    isVerified: item?.isVerified ?? true,
  };
}

export function buildClubForm(item?: AdminClubItem | null): ClubFormState {
  return {
    name: normalizeText(item?.name ?? ''),
    universityName: normalizeText(item?.universityName ?? ''),
    managerName: normalizeText(item?.managerName ?? ''),
    managerEmail: normalizeText(item?.managerEmail ?? '').toLowerCase(),
    subscriptionType: item?.subscriptionType ?? 'monthly',
  };
}

export function normalizeUserFormInput(form: AdminUserUpsertInput): AdminUserUpsertInput {
  return {
    ...form,
    fullName: normalizeText(form.fullName),
    email: normalizeText(form.email).toLowerCase(),
    universityName: normalizeText(form.universityName),
  };
}

export function normalizeNewsFormInput(
  form: AdminNewsUpsertInput,
  publishNow = false,
): AdminNewsUpsertInput {
  return {
    ...form,
    title: normalizeText(form.title),
    source: normalizeText(form.source),
    content: normalizeText(form.content),
    isPublished: publishNow ? true : form.isPublished,
  };
}

export function normalizeOfferFormInput(form: AdminOfferUpsertInput): AdminOfferUpsertInput {
  return {
    ...form,
    partnerName: normalizeText(form.partnerName),
    category: normalizeText(form.category),
    title: normalizeText(form.title),
    description: normalizeText(form.description),
    location: normalizeText(form.location),
    phone: normalizeText(form.phone),
    email: normalizeText(form.email).toLowerCase(),
    expireDateUtc: normalizeText(form.expireDateUtc),
  };
}

export function normalizeClubFormInput(form: ClubFormState): ClubFormState {
  return {
    ...form,
    name: normalizeText(form.name),
    universityName: normalizeText(form.universityName),
    managerName: normalizeText(form.managerName),
    managerEmail: normalizeText(form.managerEmail).toLowerCase(),
  };
}

export async function pickImage() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    Alert.alert('صلاحية مطلوبة', 'يرجى السماح بالوصول إلى الصور لاختيار صورة مناسبة.');
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.9,
  });

  if (result.canceled || !result.assets?.length) {
    return null;
  }

  return result.assets[0] ?? null;
}
