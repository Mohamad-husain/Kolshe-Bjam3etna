import type { MarketplaceCardData } from '@/components/explore/MarketplaceCard';
import type { NewsItem } from '@/services/news-api';
import type { PartnerOffer } from '@/services/partner-offers-api';
import { SemanticColors } from '@/styles/ui-theme';
import type { QuickItem } from './home-types';

export const quickAccess: QuickItem[] = [
  { icon: 'add', label: 'طلب', color: SemanticColors.blue, bg: 'rgba(37,99,235,0.08)', tab: 'services' },
  { icon: 'briefcase-outline', label: 'خدمات', color: SemanticColors.green, bg: 'rgba(52,199,89,0.08)', tab: 'services' },
  { icon: 'bag-outline', label: 'المتجر', color: SemanticColors.orange, bg: 'rgba(255,149,0,0.08)', tab: 'marketplace' },
  { icon: 'megaphone-outline', label: 'عروض', color: SemanticColors.violet, bg: 'rgba(175,82,222,0.08)', section: 'offers' },
  { icon: 'calendar-outline', label: 'فعاليات', color: SemanticColors.violet, bg: 'rgba(175,82,222,0.08)', tab: 'events' },
];

export function hasText(value: string, search: string) {
  return value.toLowerCase().includes(search);
}

export function price(value: number, suffix = '') {
  const text = Number.isInteger(value) ? `${value}` : value.toFixed(2).replace(/\.00$/, '');
  return `${text} د.أ${suffix}`;
}

export function serviceAccent(category: string) {
  if (category.includes('تصميم')) return SemanticColors.orange;
  if (category.includes('برمج') || category.includes('تقني')) return SemanticColors.green;
  return SemanticColors.blue;
}

export function newsEmoji(item: NewsItem) {
  const text = `${item.title} ${item.category}`.toLowerCase();
  if (text.includes('منح') || text.includes('تدريب')) return '🎓';
  if (text.includes('تسجيل') || text.includes('قبول')) return '📝';
  if (item.isImportant || text.includes('امتح') || text.includes('تأجيل')) return '📢';
  return '📰';
}

export function adEmoji(item: MarketplaceCardData) {
  const text = `${item.title} ${item.category}`.toLowerCase();
  if (text.includes('كتاب')) return '📚';
  if (text.includes('حاسبة') || text.includes('آلة')) return '🔢';
  if (text.includes('لاب') || text.includes('إلكتر')) return '💻';
  return '🛍️';
}

export function offerMeta(type: PartnerOffer['type']) {
  return type === 'academy'
    ? { color: SemanticColors.violet, bg: 'rgba(175,82,222,0.08)', icon: 'school-outline' as const, label: 'أكاديمية' }
    : { color: SemanticColors.orange, bg: 'rgba(255,149,0,0.08)', icon: 'storefront-outline' as const, label: 'متجر' };
}

export function dateParts(dateLabel: string) {
  const parts = dateLabel.split(' ').filter(Boolean);
  return { day: parts[0] ?? '--', month: parts[1] ?? '---' };
}
