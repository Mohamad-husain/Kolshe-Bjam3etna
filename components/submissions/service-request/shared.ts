import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

import {
  Colors,
  Dimensions,
  FontFamily,
  FontSize,
  FontWeight,
  SemanticColors,
  Spacing,
} from '@/styles/ui-theme';

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

export const serviceRequestStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f6f7fb' },
  screen: { flex: 1, backgroundColor: '#f6f7fb' },
  topBubble: {
    position: 'absolute',
    top: 110,
    left: -90,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(37,99,235,0.05)',
  },
  bottomBubble: {
    position: 'absolute',
    right: -100,
    bottom: 26,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(90,200,250,0.06)',
  },
  header: {
    minHeight: 90,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(60,60,67,0.08)',
    backgroundColor: 'rgba(246,247,251,0.96)',
  },
  progressRow: {
    position: 'absolute',
    left: Spacing.md,
    top: 16,
    flexDirection: 'row-reverse',
    gap: 6,
  },
  progressDot: {
    width: 7,
    height: 7,
    borderRadius: Dimensions.radiusFull,
    backgroundColor: Colors.border,
  },
  progressDotActive: {
    width: 22,
    backgroundColor: Colors.primary,
  },
  progressDotDone: {
    backgroundColor: 'rgba(37,99,235,0.35)',
  },
  headerCenter: { alignItems: 'center', paddingHorizontal: 64 },
  headerTitle: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: 19,
    fontWeight: FontWeight.extrabold,
  },
  headerSubtitle: {
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: 12,
    fontWeight: FontWeight.medium,
    marginTop: 1,
  },
  backButton: {
    position: 'absolute',
    right: Spacing.md,
    top: 10,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.05)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  content: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: 18,
  },
  card: {
    backgroundColor: 'transparent',
    paddingHorizontal: 2,
    gap: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
  },
  sectionCopy: { alignItems: 'flex-end' },
  sectionTitle: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: 25,
    fontWeight: FontWeight.bold,
  },
  sectionSubtitle: {
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: 12,
    fontWeight: FontWeight.medium,
    marginTop: 1,
  },
  sectionNumber: {
    width: 31,
    height: 31,
    borderRadius: 15.5,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 2,
  },
  sectionNumberText: {
    color: '#ffffff',
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.extrabold,
  },
  fieldBlock: { gap: 10 },
  fieldTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  labelRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  fieldLabel: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: 15,
    fontWeight: FontWeight.semibold,
    textAlign: 'right',
  },
  counter: {
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.medium,
  },
  counterActive: { color: Colors.primary },
  fieldRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.06)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 14,
    elevation: 2,
  },
  fieldRowError: {
    borderColor: 'rgba(255,59,48,0.38)',
    borderWidth: 1.4,
  },
  input: {
    flex: 1,
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  dateFieldButton: {
    justifyContent: 'space-between',
  },
  dateValueText: {
    flex: 1,
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    textAlign: 'left',
  },
  dateSelectedText: {
    color: '#111827',
  },
  datePlaceholderText: {
    color: 'rgba(142,142,147,0.75)',
  },
  textareaWrap: {
    borderRadius: 22,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.06)',
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 14,
    elevation: 2,
  },
  textarea: {
    minHeight: 132,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  descriptionProgressTrack: {
    height: 4,
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: Dimensions.radiusFull,
    backgroundColor: Colors.secondary,
    overflow: 'hidden',
  },
  descriptionProgressFill: {
    height: '100%',
    borderRadius: Dimensions.radiusFull,
  },
  errorText: {
    color: SemanticColors.red,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.medium,
    textAlign: 'right',
  },
  grid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  categoryButton: {
    width: '31.2%',
    minHeight: 112,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.06)',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 15,
    marginBottom: 12,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(120,120,128,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    marginTop: 12,
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: 12,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
    lineHeight: 18,
  },
  chipWrap: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Dimensions.radiusFull,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.06)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.025,
    shadowRadius: 10,
    elevation: 1,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  chipTextActive: { color: '#ffffff' },
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  flexButton: { flex: 1 },
  primaryButton: {
    minHeight: 56,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 4,
  },
  primaryButtonDisabled: { backgroundColor: '#e7e8ef', shadowOpacity: 0, elevation: 0 },
  primaryText: {
    color: '#ffffff',
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
  },
  primaryTextDisabled: { color: Colors.mutedForeground },
  previewCard: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.06)',
    backgroundColor: '#ffffff',
    padding: 18,
    gap: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 2,
  },
  previewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  previewBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Dimensions.radiusFull,
    backgroundColor: 'rgba(37,99,235,0.08)',
  },
  previewBadgeText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.bold,
  },
  previewLabel: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  previewTitle: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.base,
    fontWeight: FontWeight.extrabold,
    textAlign: 'right',
  },
  previewDesc: {
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    textAlign: 'right',
    lineHeight: 22,
  },
  previewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(60,60,67,0.12)',
  },
  previewInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: Dimensions.radiusFull,
    backgroundColor: Colors.secondary,
  },
  previewInfoPrimary: { backgroundColor: 'rgba(37,99,235,0.08)' },
  previewInfoText: {
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.medium,
  },
  previewInfoPrimaryText: {
    color: Colors.primary,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.bold,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15,23,42,0.16)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  pickerSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 24,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 10,
  },
  calendarHandle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(142,142,147,0.25)',
    marginBottom: 14,
  },
  pickerSheetTitle: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.base,
    fontWeight: FontWeight.extrabold,
    textAlign: 'center',
    marginBottom: 10,
  },
  iosDatePicker: {
    alignSelf: 'center',
    marginBottom: 12,
  },
  pickerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  pickerActionButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerPrimaryAction: {
    backgroundColor: Colors.primary,
  },
  pickerSecondaryAction: {
    backgroundColor: '#f3f4f8',
  },
  pickerPrimaryActionText: {
    color: '#ffffff',
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  pickerSecondaryActionText: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  successWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: Colors.background,
  },
  successCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 30,
    paddingHorizontal: 24,
    paddingVertical: 28,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.08)',
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  },
  successIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(37,99,235,0.10)',
  },
  successTitle: {
    marginTop: 16,
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extrabold,
    textAlign: 'center',
  },
  successText: {
    marginTop: 8,
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
    lineHeight: 24,
  },
  pressed: { transform: [{ scale: 0.98 }] },
});
