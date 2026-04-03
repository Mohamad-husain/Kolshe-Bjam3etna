import { formatIsoDate } from '@/lib/admin/admin-config';
import { apiClient } from '@/services/http-client';
import type { AdminNewsItem, AdminNewsUpsertInput } from '@/types/admin';

import {
  ApiRecord,
  appendFileToFormData,
  getBooleanField,
  getDateField,
  getRecord,
  getRecords,
  getStringField,
  getNumberField,
  throwAdminError,
  toAbsoluteImageUrl,
} from './admin-utils';

function mapNewsItem(record: ApiRecord): AdminNewsItem {
  const createdAt = getDateField(record, ['createdAtUtc', 'createdAt', 'publishDateUtc']);
  const isPublished =
    getBooleanField(record, ['isPublished', 'published']) ??
    Boolean(getStringField(record, ['publishedAt', 'publishedAtUtc']));

  return {
    id: String(getNumberField(record, ['id', 'newsId']) ?? getStringField(record, ['id']) ?? createdAt),
    title: getStringField(record, ['title']) ?? '',
    content: getStringField(record, ['content', 'body', 'description']) ?? '',
    source: getStringField(record, ['source']) ?? '',
    category: getStringField(record, ['category']) ?? '',
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
    return getRecords(data).map(mapNewsItem);
  } catch (error) {
    throwAdminError(error, 'تعذر تحميل الأخبار الإدارية');
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
    throwAdminError(error, 'تعذر إنشاء الخبر');
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
    throwAdminError(error, 'تعذر تحديث الخبر');
  }
}

export async function deleteAdminNews(id: string) {
  try {
    await apiClient.delete(`/api/admin/news/${id}`);
  } catch (error) {
    throwAdminError(error, 'تعذر حذف الخبر');
  }
}
