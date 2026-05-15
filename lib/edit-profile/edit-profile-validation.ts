import { adminEditProfileStudyYearOptions, normalizeWebsiteUrl } from './edit-profile-config';
import { normalizeEditProfileDigits, normalizeEditProfileValue } from './edit-profile-utils';

import type { AdminEditProfileFormValues } from '@/types/edit-profile';

export const personalValidationFields = ['fullName', 'phoneNumber', 'bio'] as const;
export const academicValidationFields = [
  'universityId',
  'major',
  'studyYear',
  'universityNumber',
] as const;
export const securityValidationFields = [
  'currentPassword',
  'newPassword',
  'confirmNewPassword',
] as const;

export function validateFullName(value: string) {
  if (value !== value.trim()) {
    return 'الاسم لا يجب أن يبدأ أو ينتهي بمسافات.';
  }

  const normalizedValue = normalizeEditProfileValue(value);

  if (!normalizedValue) {
    return 'الاسم الكامل مطلوب.';
  }

  if (/^\d/.test(normalizedValue)) {
    return 'الاسم لا يجب أن يبدأ برقم.';
  }

  if (normalizedValue.length < 4) {
    return 'الاسم الكامل يجب أن يكون 4 أحرف على الأقل.';
  }

  if (/\d/.test(normalizedValue)) {
    return 'الاسم الكامل لا يجب أن يحتوي على أرقام.';
  }

  if (!/^[A-Za-z\u0600-\u06FF][A-Za-z\u0600-\u06FF\s]*$/.test(normalizedValue)) {
    return 'الاسم الكامل يجب أن يحتوي على أحرف ومسافات فقط.';
  }

  return true;
}

export function validateUniversityEmail(value: string) {
  const normalizedValue = normalizeEditProfileValue(value);

  if (!normalizedValue) {
    return 'البريد الجامعي مطلوب.';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedValue)) {
    return 'أدخل بريداً جامعياً صالحاً.';
  }

  return true;
}

export function validatePhoneNumber(value: string) {
  const normalizedValue = normalizeEditProfileValue(value);

  if (!normalizedValue) {
    return 'رقم الهاتف مطلوب.';
  }

  if (!/^[0-9+\-\s()]+$/.test(normalizedValue)) {
    return 'رقم الهاتف غير صالح.';
  }

  const digits = normalizeEditProfileDigits(normalizedValue);

  if (digits.length < 8 || digits.length > 15) {
    return 'رقم الهاتف يجب أن يحتوي على 8 إلى 15 رقماً.';
  }

  return true;
}

export function validateBio(value: string) {
  const normalizedValue = normalizeEditProfileValue(value);

  if (!normalizedValue) {
    return 'النبذة مطلوبة.';
  }

  if (normalizedValue.length < 10) {
    return 'النبذة يجب أن تكون 10 أحرف على الأقل.';
  }

  if (normalizedValue.length > 200) {
    return 'الحد الأقصى للنبذة هو 200 حرف.';
  }

  return true;
}

export function validateWebsiteUrl(value: string) {
  const normalizedValue = normalizeEditProfileValue(value);

  if (!normalizedValue) {
    return true;
  }

  const normalizedUrl = normalizeWebsiteUrl(normalizedValue);

  if (!/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(normalizedUrl)) {
    return 'أدخل رابطاً صالحاً.';
  }

  if (normalizedUrl.length > 200) {
    return 'رابط الموقع طويل جداً.';
  }

  return true;
}

export function validateUniversitySelection(value: number | null) {
  return typeof value === 'number' && value > 0 ? true : 'يرجى اختيار الجامعة.';
}

export function validateMajor(value: string) {
  const normalizedValue = normalizeEditProfileValue(value);

  if (!normalizedValue) {
    return 'يرجى اختيار التخصص أو القسم.';
  }

  if (normalizedValue.length < 2) {
    return 'التخصص أو القسم غير صالح.';
  }

  return true;
}

export function validateStudyYear(value: string) {
  const normalizedValue = normalizeEditProfileValue(value);

  if (!normalizedValue) {
    return 'يرجى اختيار السنة الدراسية.';
  }

  if (!adminEditProfileStudyYearOptions.some((option) => option.value === normalizedValue)) {
    return 'يرجى اختيار سنة دراسية صالحة.';
  }

  return true;
}

export function validateUniversityNumber(value: string) {
  const normalizedValue = normalizeEditProfileDigits(value);

  if (!normalizedValue) {
    return 'الرقم الجامعي مطلوب.';
  }

  if (!/^\d{8}$/.test(normalizedValue)) {
    return 'الرقم الجامعي يجب أن يكون 8 أرقام بالضبط.';
  }

  return true;
}

export function createCurrentPasswordValidator(hasPasswordInput: () => boolean) {
  return (value: string) =>
    !hasPasswordInput() ? true : Boolean(value.trim()) || 'أدخل كلمة المرور الحالية.';
}

export function createNewPasswordValidator(
  getValues: () => AdminEditProfileFormValues,
  hasPasswordInput: () => boolean,
) {
  return (value: string) => {
    const values = getValues();
    const normalizedValue = normalizeEditProfileValue(value);
    const normalizedCurrentPassword = normalizeEditProfileValue(values.currentPassword);

    if (!hasPasswordInput()) {
      return true;
    }

    if (!normalizedValue) {
      return 'أدخل كلمة المرور الجديدة.';
    }

    if (normalizedValue.length < 8) {
      return 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل.';
    }

    if (normalizedCurrentPassword && normalizedValue === normalizedCurrentPassword) {
      return 'يجب أن تكون كلمة المرور الجديدة مختلفة عن الحالية.';
    }

    return true;
  };
}

export function createConfirmNewPasswordValidator(
  getValues: () => AdminEditProfileFormValues,
  hasPasswordInput: () => boolean,
) {
  return (value: string) => {
    const values = getValues();

    if (!hasPasswordInput()) {
      return true;
    }

    if (!value.trim()) {
      return 'أعد كتابة كلمة المرور الجديدة.';
    }

    return value === values.newPassword || 'كلمتا المرور غير متطابقتين.';
  };
}
