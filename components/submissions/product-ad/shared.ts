import { Ionicons } from '@expo/vector-icons';

import type { ProductAdCondition } from '@/services/marketplace-api';
import { SemanticColors } from '@/styles/ui-theme';

export type ProductAdStep = 1 | 2 | 3;

export type ProductAdCategoryOption = {
  id: number;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

export type ProductAdConditionOption = {
  value: ProductAdCondition;
  label: string;
};

export const PRODUCT_AD_ACCENT = SemanticColors.orange;
export const PRODUCT_AD_CURRENCY = 'د.أ';
export const PRODUCT_AD_TITLE_MIN_LENGTH = 4;
export const PRODUCT_AD_DESCRIPTION_MIN_LENGTH = 15;
export const PRODUCT_AD_MAX_PHOTOS = 5;

// These ids must match the backend ProductAds category seed.
export const PRODUCT_AD_CATEGORIES: ProductAdCategoryOption[] = [
  { id: 1, label: 'كتاب', icon: 'book-outline', color: PRODUCT_AD_ACCENT },
  { id: 2, label: 'الكترونيات', icon: 'desktop-outline', color: SemanticColors.blue },
  { id: 3, label: 'تصميم', icon: 'color-palette-outline', color: '#db2777' },
  { id: 4, label: 'برمجة', icon: 'code-slash-outline', color: '#7c3aed' },
];

export const PRODUCT_AD_CONDITIONS: ProductAdConditionOption[] = [
  { value: 'LikeNew', label: 'كالجديد' },
  { value: 'Excellent', label: 'ممتاز' },
  { value: 'VeryGood', label: 'جيد جداً' },
  { value: 'Good', label: 'جيد' },
  { value: 'Acceptable', label: 'مقبول' },
];

export const PRODUCT_AD_PRICE_PRESETS = [
  { id: '5', label: `5 ${PRODUCT_AD_CURRENCY}`, value: 5 },
  { id: '10', label: `10 ${PRODUCT_AD_CURRENCY}`, value: 10 },
  { id: '20', label: `20 ${PRODUCT_AD_CURRENCY}`, value: 20 },
  { id: '50', label: `50 ${PRODUCT_AD_CURRENCY}`, value: 50 },
  { id: '100', label: `100 ${PRODUCT_AD_CURRENCY}`, value: 100 },
] as const;

function normalizeDigits(value: string) {
  const arabicZero = '٠'.charCodeAt(0);
  const persianZero = '۰'.charCodeAt(0);

  return value.replace(/[٠-٩۰-۹]/g, (digit) => {
    const code = digit.charCodeAt(0);
    const normalized = code >= persianZero ? code - persianZero : code - arabicZero;

    return String(normalized);
  });
}

export function parsePriceValue(value: string) {
  const normalized = normalizeDigits(value).replace(/[^0-9.]/g, '').trim();

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function getPriceLabel(customPrice: string, presetLabel?: string) {
  const normalized = normalizeDigits(customPrice).replace(/[^0-9.]/g, '').trim();

  if (!normalized) {
    return presetLabel ?? '—';
  }

  return `${normalized} ${PRODUCT_AD_CURRENCY}`;
}

export function getStepCopy(step: ProductAdStep) {
  if (step === 1) return 'الخطوة 1 من 3 - المعلومات';
  if (step === 2) return 'الخطوة 2 من 3 - التفاصيل';
  return 'الخطوة 3 من 3 - المراجعة';
}
