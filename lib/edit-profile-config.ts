import type {
  AdminEditProfileOption,
  AdminEditProfileTab,
} from '@/types/edit-profile';

export const adminEditProfileTabs: Array<AdminEditProfileOption<AdminEditProfileTab>> = [
  { label: 'شخصية', value: 'personal' },
  { label: 'أكاديمية', value: 'academic' },
  { label: 'الأمان', value: 'security' },
];

export const adminEditProfileStudyYearOptions: Array<AdminEditProfileOption<string>> = [
  { label: 'الأولى', value: 'الأولى' },
  { label: 'الثانية', value: 'الثانية' },
  { label: 'الثالثة', value: 'الثالثة' },
  { label: 'الرابعة', value: 'الرابعة' },
  { label: 'الخامسة+', value: 'الخامسة+' },
];

const studyYearAliases = [
  {
    formValue: 'الأولى',
    apiValues: ['الأولى', '1', 1, 'First', 'first', 'FirstYear', 'Year1'],
  },
  {
    formValue: 'الثانية',
    apiValues: ['الثانية', '2', 2, 'Second', 'second', 'SecondYear', 'Year2'],
  },
  {
    formValue: 'الثالثة',
    apiValues: ['الثالثة', '3', 3, 'Third', 'third', 'ThirdYear', 'Year3'],
  },
  {
    formValue: 'الرابعة',
    apiValues: ['الرابعة', '4', 4, 'Fourth', 'fourth', 'FourthYear', 'Year4'],
  },
  {
    formValue: 'الخامسة+',
    apiValues: ['الخامسة+', '5', 5, 'Fifth', 'fifth', 'FifthYear', 'Year5'],
  },
] as const;

function normalizeStudyYearInput(value: string | number | null | undefined) {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value).trim();
  }

  return '';
}

export function normalizeStudyYearForForm(value: string | number | null | undefined) {
  const trimmedValue = normalizeStudyYearInput(value);

  if (!trimmedValue) {
    return '';
  }

  const matchedStudyYear = studyYearAliases.find((entry) =>
    entry.apiValues.some((candidate) => String(candidate).trim() === trimmedValue),
  );

  return matchedStudyYear?.formValue ?? trimmedValue;
}

export function getStudyYearApiValues(value: string | number) {
  const normalizedFormValue = normalizeStudyYearForForm(value);
  const matchedStudyYear = studyYearAliases.find(
    (entry) => entry.formValue === normalizedFormValue,
  );

  if (!matchedStudyYear) {
    return normalizedFormValue ? [normalizedFormValue] : [];
  }

  return Array.from(
    new Set([
      normalizedFormValue,
      ...matchedStudyYear.apiValues,
    ]),
  );
}

export function getPreferredStudyYearApiValue(value: string | number) {
  const normalizedFormValue = normalizeStudyYearForForm(value);
  const matchedStudyYear = studyYearAliases.find(
    (entry) => entry.formValue === normalizedFormValue,
  );

  if (!matchedStudyYear) {
    return normalizedFormValue;
  }

  const numericValue = matchedStudyYear.apiValues.find(
    (candidate) => typeof candidate === 'number' && Number.isFinite(candidate),
  );

  if (typeof numericValue === 'number') {
    return numericValue;
  }

  const numericStringValue = matchedStudyYear.apiValues.find((candidate) =>
    /^\d+$/.test(String(candidate).trim()),
  );

  return numericStringValue ?? normalizedFormValue;
}

export function formatStudyYearLabel(value: string | number | null | undefined) {
  return normalizeStudyYearForForm(value);
}

const sharedMajorOptions = [
  'هندسة برمجيات',
  'علوم الحاسوب',
  'الذكاء الاصطناعي',
  'الأمن السيبراني',
  'هندسة الحاسوب',
  'نظم المعلومات الحاسوبية',
  'إدارة الأعمال',
  'التصميم الجرافيكي',
  'اللغة الإنجليزية',
  'المحاسبة',
  'أخرى',
];

export function getAdminEditProfileMajorOptions(currentMajor?: string | null) {
  const normalizedCurrentMajor = currentMajor?.trim();
  const options = normalizedCurrentMajor
    ? [normalizedCurrentMajor, ...sharedMajorOptions]
    : sharedMajorOptions;

  return Array.from(new Set(options)).map((label) => ({
    label,
    value: label,
  }));
}

export function normalizeWebsiteUrl(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return '';
  }

  if (/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  return `https://${trimmedValue}`;
}
