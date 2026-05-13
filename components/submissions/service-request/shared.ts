import { Ionicons } from '@expo/vector-icons';

import { SemanticColors } from '@/styles/ui-theme';

export type ServiceRequestStep = 1 | 2 | 3;

export type ServiceRequestCategoryOption = {
  id: number;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

export const TITLE_MIN_LENGTH = 5;
export const DESCRIPTION_MIN_LENGTH = 20;

// Replace these ids with the backend category ids once they are confirmed.
export const SERVICE_REQUEST_CATEGORIES: ServiceRequestCategoryOption[] = [
  { id: 1, label: 'دروس خصوصية', icon: 'book-outline', color: SemanticColors.blue },
  { id: 2, label: 'تقنية وبرمجة', icon: 'desktop-outline', color: SemanticColors.violet },
  { id: 3, label: 'تصميم', icon: 'color-palette-outline', color: '#db2777' },
  { id: 4, label: 'صيانة', icon: 'construct-outline', color: '#d97706' },
  { id: 5, label: 'تصوير', icon: 'camera-outline', color: '#059669' },
  { id: 6, label: 'موسيقى وفنون', icon: 'musical-notes-outline', color: '#dc2626' },
  { id: 7, label: 'أخرى', icon: 'ellipsis-horizontal-outline', color: SemanticColors.lightBlue },
];

export const SERVICE_REQUEST_BUDGET_PRESETS = [
  { id: '5', label: '5 ش/ساعة', value: 5 },
  { id: '10', label: '10 ش/ساعة', value: 10 },
  { id: '20', label: '20 ش/ساعة', value: 20 },
  { id: '50', label: '50 ش/ساعة', value: 50 },
  { id: 'negotiable', label: 'متفاوت', value: 0 },
] as const;

export function formatDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createDateFromInput(value: string) {
  if (!isValidDateInput(value)) {
    return null;
  }

  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isValidDateInput(value: string) {
  const normalized = value.trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return false;
  }

  const date = new Date(`${normalized}T12:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === normalized;
}

export function parseBudgetValue(value: string) {
  const normalized = value.replace(/[^0-9.]/g, '').trim();

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function getBudgetLabel(customBudget: string, presetLabel?: string) {
  const normalized = customBudget.trim();

  if (!normalized) {
    return presetLabel ?? '—';
  }

  return normalized.includes('ش') ? normalized : `${normalized} ش`;
}

export function getStepCopy(step: ServiceRequestStep) {
  if (step === 1) return 'الخطوة 1 من 2';
  if (step === 2) return 'الخطوة 2 من 2';
  return 'جاهز للنشر';
}
