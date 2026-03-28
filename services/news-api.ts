import { apiClient, getApiErrorMessage } from '@/services/http-client';

type ApiNewsItem = {
  id: number;
  title: string;
  source: string;
  category: string;
  imageUrl: string | null;
  isImportant: boolean;
  viewsCount: number;
  createdAtUtc: string;
};

type ApiNewsResponse = {
  success?: boolean;
  message?: string;
  data?: ApiNewsItem[];
};

export type NewsItem = {
  id: string;
  title: string;
  source: string;
  category: string;
  imageUrl: string | null;
  isImportant: boolean;
  viewsCount: number;
  timeAgo: string;
};

function toAbsoluteImageUrl(path: string | null) {
  if (!path) {
    return null;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const baseUrl = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').trim().replace(/\/$/, '');
  if (!baseUrl) {
    return path;
  }

  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

function pluralizeArabic(value: number, singular: string, dual: string, plural: string) {
  if (value === 1) {
    return singular;
  }

  if (value === 2) {
    return dual;
  }

  if (value >= 3 && value <= 10) {
    return `${value} ${plural}`;
  }

  return `${value} ${singular}`;
}

function formatRelativeTime(dateValue: string) {
  const createdAt = new Date(dateValue);

  if (Number.isNaN(createdAt.getTime())) {
    return 'الآن';
  }

  const diffMs = Date.now() - createdAt.getTime();

  if (diffMs <= 0) {
    return 'الآن';
  }

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) {
    return 'الآن';
  }

  if (minutes < 60) {
    return `منذ ${pluralizeArabic(minutes, 'دقيقة', 'دقيقتين', 'دقائق')}`;
  }

  if (hours < 24) {
    return `منذ ${pluralizeArabic(hours, 'ساعة', 'ساعتين', 'ساعات')}`;
  }

  if (days < 30) {
    return `منذ ${pluralizeArabic(days, 'يوم', 'يومين', 'أيام')}`;
  }

  const months = Math.max(1, Math.floor(days / 30));
  return `منذ ${pluralizeArabic(months, 'شهر', 'شهرين', 'أشهر')}`;
}

function mapNewsItem(item: ApiNewsItem): NewsItem {
  return {
    id: String(item.id),
    title: item.title,
    source: item.source || 'إعلان جامعي',
    category: item.category || 'عام',
    imageUrl: toAbsoluteImageUrl(item.imageUrl),
    isImportant: Boolean(item.isImportant),
    viewsCount: Number(item.viewsCount ?? 0),
    timeAgo: formatRelativeTime(item.createdAtUtc),
  };
}

export async function getNews(): Promise<NewsItem[]> {
  try {
    const { data } = await apiClient.get<ApiNewsResponse>('/api/news');
    return (data.data ?? []).map(mapNewsItem);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'تعذر تحميل الأخبار'));
  }
}
