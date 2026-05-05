import { Ionicons } from '@expo/vector-icons';

import type { SwapAdCondition } from '@/services/swap-api';
import { SemanticColors } from '@/styles/ui-theme';

export type ExchangeStep = 1 | 2 | 3;

export type ExchangeCategoryOption = {
  id: number;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

export type ExchangeConditionOption = {
  value: SwapAdCondition;
  label: string;
};

export const EXCHANGE_ACCENT = SemanticColors.lightBlue;
export const EXCHANGE_ACCENT_DARK = '#007aff';
export const EXCHANGE_DESCRIPTION_MIN_LENGTH = 15;
export const EXCHANGE_MAX_PHOTOS = 5;
export const EXCHANGE_TITLE_MIN_LENGTH = 3;

export const EXCHANGE_CATEGORIES: ExchangeCategoryOption[] = [
  { id: 1, label: 'كتب', icon: 'book-outline', color: EXCHANGE_ACCENT },
  { id: 2, label: 'إلكترونيات', icon: 'desktop-outline', color: SemanticColors.blue },
  { id: 3, label: 'تصميم', icon: 'color-palette-outline', color: '#db2777' },
  { id: 4, label: 'أدوات', icon: 'construct-outline', color: '#d97706' },
  { id: 5, label: 'ملابس', icon: 'shirt-outline', color: '#7c3aed' },
  { id: 6, label: 'أخرى', icon: 'layers-outline', color: '#059669' },
];

export const EXCHANGE_CONDITIONS: ExchangeConditionOption[] = [
  { value: 'LikeNew', label: 'كالجديد' },
  { value: 'Excellent', label: 'ممتاز' },
  { value: 'VeryGood', label: 'جيد جداً' },
  { value: 'Good', label: 'جيد' },
  { value: 'Acceptable', label: 'مقبول' },
];

export function getExchangeStepCopy(step: ExchangeStep) {
  if (step === 1) return 'الخطوة 1 من 3 - العناصر';
  if (step === 2) return 'الخطوة 2 من 3 - التفاصيل';
  return 'الخطوة 3 من 3 - المراجعة';
}
