import { useState } from 'react';

import type { AdminContextValue } from '@/contexts/admin/admin-context-types';
import { normalizeNewsFormInput } from '@/lib/admin/admin-dashboard-form-utils';
import type { AdminNewsItem, AdminNewsUpsertInput } from '@/types/admin';

type UseAdminDashboardNewsParams = Pick<AdminContextValue, 'loading' | 'news' | 'saveNews'>;

export function useAdminDashboardNews({
  loading,
  news,
  saveNews,
}: UseAdminDashboardNewsParams) {
  const [editingNews, setEditingNews] = useState<AdminNewsItem | null>(null);
  const [newsEditorVisible, setNewsEditorVisible] = useState(false);
  const [deletingNews, setDeletingNews] = useState<AdminNewsItem | null>(null);
  const newsLoading = loading.news && news.length === 0;

  const openNewsEditor = (item?: AdminNewsItem | null) => {
    setEditingNews(item ?? null);
    setNewsEditorVisible(true);
  };

  const closeNewsEditor = () => {
    setEditingNews(null);
    setNewsEditorVisible(false);
  };

  const submitNewsForm = async (values: AdminNewsUpsertInput) => {
    await saveNews(editingNews, normalizeNewsFormInput(values, values.isPublished));
    setEditingNews(null);
    setNewsEditorVisible(false);
  };

  const publishNews = async (item: AdminNewsItem) => {
    await saveNews(item, {
      title: item.title,
      content: item.content,
      source: item.source,
      category: item.category,
      image: null,
      isImportant: item.isImportant,
      isPublished: true,
    });
  };

  return {
    newsLoading,
    editingNews,
    newsEditorVisible,
    deletingNews,
    setDeletingNews,
    openNewsEditor,
    closeNewsEditor,
    submitNewsForm,
    publishNews,
  };
}
