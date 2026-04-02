import { adminNewsFixture } from '@/lib/admin/admin-fixtures';
import { formatIsoDate } from '@/lib/admin/admin-config';
import { apiClient } from '@/services/http-client';
import type { AdminNewsItem, AdminNewsUpsertInput } from '@/types/admin';
import {
  ApiRecord,
  appendFileToFormData,
  getBooleanField,
  getDateField,
  getFallbackValue,
  getNumberField,
  getRecord,
  getRecords,
  getStringField,
  toAbsoluteImageUrl,
} from './admin-utils';

function mapNewsItem(record: ApiRecord): AdminNewsItem {
  const createdAt = getDateField(record, ['createdAtUtc', 'createdAt', 'publishDateUtc']);
  const isPublished =
    getBooleanField(record, ['isPublished', 'published']) ??
    Boolean(getStringField(record, ['publishedAt', 'publishedAtUtc']));

  return {
    id: String(getNumberField(record, ['id', 'newsId']) ?? getStringField(record, ['id']) ?? createdAt),
    title: getStringField(record, ['title']) ?? 'خبر جديد',
    content: getStringField(record, ['content', 'body', 'description']) ?? '',
    source: getStringField(record, ['source']) ?? 'إعلان جامعي',
    category: getStringField(record, ['category']) ?? 'إعلان عام',
    imageUrl: toAbsoluteImageUrl(getStringField(record, ['imageUrl', 'image', 'coverImageUrl'])),
    isImportant: getBooleanField(record, ['isImportant', 'important']) ?? false,
    isPublished,
    viewsCount: getNumberField(record, ['viewsCount', 'views', 'viewCount']) ?? 0,
    createdAt,
    createdAtLabel: formatIsoDate(createdAt),
    status: isPublished ? 'published' : 'draft',
  };
}

function buildNewsFormData(input: AdminNewsUpsertInput) {
  const formData = new FormData();
  formData.append('Title', input.title.trim());
  formData.append('Content', input.content.trim());
  formData.append('Source', input.source.trim());
  formData.append('Category', input.category.trim());
  formData.append('IsImportant', String(input.isImportant));
  formData.append('IsPublished', String(input.isPublished));
  appendFileToFormData(formData, 'Image', input.image);
  return formData;
}

export async function getAdminNews() {
  try {
    const { data } = await apiClient.get('/api/admin/news');
    const records = getRecords(data);
    return records.length ? records.map(mapNewsItem) : adminNewsFixture;
  } catch (error) {
    return getFallbackValue(error, 'تعذر تحميل الأخبار الإدارية', adminNewsFixture);
  }
}

export async function createAdminNews(input: AdminNewsUpsertInput) {
  try {
    const { data } = await apiClient.post('/api/admin/news', buildNewsFormData(input), {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const record = getRecord(data);
    return record ? mapNewsItem(record) : null;
  } catch (error) {
    return getFallbackValue(error, 'تعذر إنشاء الخبر', null);
  }
}

export async function updateAdminNews(id: string, input: AdminNewsUpsertInput) {
  try {
    const { data } = await apiClient.put(`/api/admin/news/${id}`, buildNewsFormData(input), {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const record = getRecord(data);
    return record ? mapNewsItem(record) : null;
  } catch (error) {
    return getFallbackValue(error, 'تعذر تحديث الخبر', null);
  }
}

export async function deleteAdminNews(id: string) {
  try {
    await apiClient.delete(`/api/admin/news/${id}`);
  } catch (error) {
    if (typeof __DEV__ === 'undefined' || !__DEV__) {
      throw error;
    }
  }
}
