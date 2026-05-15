import { View } from 'react-native';

import {
  AdminEmptyState,
  AdminSearchInput,
} from '@/components/admin/admin-primitives';
import { UserCard } from '@/components/admin/admin-entities';
import type { AdminDashboard } from '@/hooks/admin/use-admin-dashboard';

import { styles } from '../styles';

type AdminDashboardProps = {
  adminDashboard: AdminDashboard;
};

export function UsersSection({ adminDashboard }: AdminDashboardProps) {
  const {
    theme,
    userSearch,
    setUserSearch,
    usersLoading,
    filteredUsers,
    users,
    openUserEditor,
    setDeletingUser,
    toggleUserBlocked,
  } = adminDashboard;

  return (
    <>
      <AdminSearchInput
        theme={theme}
        value={userSearch}
        onChangeText={setUserSearch}
        placeholder="ابحث عن مستخدم..."
      />

      <View style={styles.stack}>
        {usersLoading ? (
          <AdminEmptyState
            theme={theme}
            icon="hourglass-outline"
            title="جارٍ تحميل المستخدمين"
            description="نقوم بسحب بيانات المستخدمين من لوحة الإدارة الآن."
          />
        ) : filteredUsers.length ? (
          filteredUsers.map((item) => (
            <UserCard
              key={item.id}
              theme={theme}
              user={item}
              onEdit={() => openUserEditor(item)}
              onDelete={() => setDeletingUser(item)}
              onToggleStatus={() => void toggleUserBlocked(item)}
            />
          ))
        ) : (
          <AdminEmptyState
            theme={theme}
            icon="search-outline"
            title={users.length ? 'لا توجد نتائج مطابقة' : 'لا يوجد مستخدمون حالياً'}
            description={
              users.length
                ? 'جرّب كلمة بحث أخرى للعثور على المستخدم المطلوب.'
                : 'لا يوجد أي مستخدمين حالياً. ستظهر الحسابات هنا عند توفرها.'
            }
          />
        )}
      </View>
    </>
  );
}
