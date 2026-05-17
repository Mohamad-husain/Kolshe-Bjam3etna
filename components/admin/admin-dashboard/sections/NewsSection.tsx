import { Pressable, Text, View } from 'react-native';

import { AdminEmptyState } from '@/components/admin/admin-primitives';
import { NewsCard } from '@/components/admin/admin-entities';
import type { AdminDashboard } from '@/hooks/admin/use-admin-dashboard';

import { styles } from '../styles';

type AdminDashboardProps = {
  adminDashboard: AdminDashboard;
};

export function NewsSection({ adminDashboard }: AdminDashboardProps) {
  const {
    theme,
    openNewsEditor,
    newsLoading,
    news,
    setDeletingNews,
    publishNews,
  } = adminDashboard;

  return (
    <>
      <Pressable
        onPress={() => openNewsEditor()}
        style={({ pressed }) => [
          styles.addDashed,
          {
            borderColor: `${theme.primary}50`,
            backgroundColor: theme.cardBackground,
          },
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.addDashedText, { color: theme.primary }]}>نشر خبر جديد +</Text>
      </Pressable>

      <View style={styles.stack}>
        {newsLoading ? (
          <AdminEmptyState
            theme={theme}
            icon="hourglass-outline"
            title="جارٍ تحميل الأخبار"
            description="نقوم بجلب آخر الأخبار الإدارية الآن."
          />
        ) : news.length ? (
          news.map((item) => (
            <NewsCard
              key={item.id}
              theme={theme}
              item={item}
              onEdit={() => openNewsEditor(item)}
              onDelete={() => setDeletingNews(item)}
              onPublish={() => void publishNews(item)}
            />
          ))
        ) : (
          <AdminEmptyState
            theme={theme}
            icon="newspaper-outline"
            title="لا توجد أخبار حالياً"
            description="لا يوجد أي خبر حالياً. أضف خبراً جديداً ليظهر هنا."
          />
        )}
      </View>
    </>
  );
}
