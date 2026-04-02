import { apiClient } from "./http-client";

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

export type MappedNewsItem = {
  id: string;
  title: string;
  source: string;
  category: string;
  imageUrl: string | null;
  isImportant: boolean;
  timeAgo: string;
};

function formatTimeAgo(dateUtc: string): string {
  const date = new Date(dateUtc);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays === 1) return "منذ يوم";
  if (diffDays < 30) return `منذ ${diffDays} أيام`;
  return `منذ ${Math.floor(diffDays / 30)} أشهر`;
}

function mapNewsItem(item: ApiNewsItem): MappedNewsItem {
  return {
    id: String(item.id),
    title: item.title,
    source: item.source,
    category: item.category,
    imageUrl: item.imageUrl,
    isImportant: item.isImportant,
    timeAgo: formatTimeAgo(item.createdAtUtc),
  };
}

export async function getNews(): Promise<MappedNewsItem[]> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: ApiNewsItem[];
  }>("/api/news");

  if (!data.data || data.data.length === 0) return [];
  return data.data.map(mapNewsItem);
}
