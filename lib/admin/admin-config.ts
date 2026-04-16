import type {
  AdminClubStatus,
  AdminClubSubscriptionType,
  AdminNewsStatus,
  AdminOfferType,
  AdminRoleOption,
  AdminRoleValue,
  AdminSection,
} from '@/types/admin';

export const adminSections: { key: AdminSection; label: string }[] = [
  { key: 'overview', label: 'نظرة عامة' },
  { key: 'users', label: 'المستخدمون' },
  { key: 'news', label: 'الأخبار' },
  { key: 'roles', label: 'الأدوار' },
  { key: 'offers', label: 'العروض' },
  { key: 'clubs', label: 'الأندية' },
];

export const adminNewsCategoryEntries = [
  { id: '1', label: 'إعلان عام' },
  { id: '2', label: 'أكاديمي' },
  { id: '3', label: 'منح وبعثات' },
  { id: '4', label: 'أنشطة ورياضة' },
  { id: '5', label: 'مرافق وخدمات' },
] as const;

export const adminNewsCategories = adminNewsCategoryEntries.map((item) => item.label);

export const adminOfferCategories = ['برمجة', 'كتب', 'تصميم', 'قهوة', 'ألعاب'] as const;

export const adminRoleOptions: AdminRoleOption[] = [
  {
    value: 'admin',
    label: 'مدير',
    description: 'إدارة المستخدمين والأخبار.',
    color: '#2f67ea',
    permissions: ['إدارة المستخدمين', 'الأخبار'],
    requiresScope: false,
  },
  {
    value: 'superAdmin',
    label: 'مدير أعلى',
    description: 'صلاحيات كاملة على المنصة.',
    color: '#ff3b30',
    permissions: ['إدارة الأدوار', 'إدارة المستخدمين', 'الأخبار', 'إحصائيات كاملة'],
    requiresScope: false,
  },
  {
    value: 'eventOwner',
    label: 'مالك الفعالية',
    description: 'إدارة فعالية أو نادٍ محدد.',
    color: '#b45af6',
    permissions: ['إنشاء الفعاليات', 'تعديل الفعاليات', 'عرض المسجلين'],
    requiresScope: true,
    scopeLabel: 'النادي أو الفعالية المخصصة',
  },
];

const clubStatusLabels: Record<AdminClubStatus, string> = {
  active: 'نشط',
  expiring: 'ينتهي قريبًا',
  expired: 'منتهي',
};

const subscriptionLabels: Record<AdminClubSubscriptionType, string> = {
  monthly: 'شهري',
  yearly: 'سنوي',
};

const newsStatusLabels: Record<AdminNewsStatus, string> = {
  published: 'منشور',
  draft: 'مسودة',
};

const offerTypeLabels: Record<AdminOfferType, string> = {
  academy: 'أكاديمية',
  store: 'متجر',
};

export function getRoleOption(role: AdminRoleValue) {
  return adminRoleOptions.find((item) => item.value === role) ?? adminRoleOptions[0];
}

function resolveAdminNewsCategoryEntry(value: string | number | null | undefined) {
  const normalized = String(value ?? '').trim();

  if (!normalized) {
    return null;
  }

  return (
    adminNewsCategoryEntries.find(
      (item) => item.id === normalized || item.label === normalized,
    ) ?? null
  );
}

export function getAdminNewsCategoryId(value: string | number | null | undefined) {
  return resolveAdminNewsCategoryEntry(value)?.id ?? String(value ?? '').trim();
}

export function getAdminNewsCategoryLabel(value: string | number | null | undefined) {
  return resolveAdminNewsCategoryEntry(value)?.label ?? String(value ?? '').trim();
}

export function getRoleLabel(role: AdminRoleValue) {
  return getRoleOption(role).label;
}

export function getClubStatusLabel(status: AdminClubStatus) {
  return clubStatusLabels[status];
}

export function getSubscriptionLabel(type: AdminClubSubscriptionType) {
  return subscriptionLabels[type];
}

export function getNewsStatusLabel(status: AdminNewsStatus) {
  return newsStatusLabels[status];
}

export function getOfferTypeLabel(type: AdminOfferType) {
  return offerTypeLabels[type];
}

export function toEnglishDigits(value: string | number) {
  return String(value).replace(/[٠-٩۰-۹]/g, (digit) => {
    const code = digit.charCodeAt(0);

    if (code >= 0x0660 && code <= 0x0669) {
      return String(code - 0x0660);
    }

    if (code >= 0x06f0 && code <= 0x06f9) {
      return String(code - 0x06f0);
    }

    return digit;
  });
}

export function formatCompactNumber(value: number) {
  if (value >= 1000) {
    const compact = value / 1000;
    return toEnglishDigits(`${compact % 1 === 0 ? compact.toFixed(0) : compact.toFixed(1)}K`);
  }

  return toEnglishDigits(value.toLocaleString('en-US'));
}

export function formatIsoDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return toEnglishDigits(value);
  }

  return toEnglishDigits(date.toISOString().slice(0, 10));
}

export function formatCountdownLabel(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'غير محدد';
  }

  const diff = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  if (diff < 0) {
    return 'منتهي';
  }

  if (diff <= 7) {
    return `آخر ${toEnglishDigits(diff)} أيام`;
  }

  return formatIsoDate(value);
}
