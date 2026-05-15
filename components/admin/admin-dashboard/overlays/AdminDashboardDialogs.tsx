import { Text, View } from 'react-native';

import {
  AdminCard,
  AdminConfirmDialog,
  AdminSegmentedOptions,
} from '@/components/admin/admin-primitives';
import type { AdminDashboard } from '@/hooks/admin/use-admin-dashboard';

import { styles } from '../styles';

type AdminDashboardProps = {
  adminDashboard: AdminDashboard;
};

export function AdminDashboardDialogs({ adminDashboard }: AdminDashboardProps) {
  const {
    theme,
    deletingUser,
    setDeletingUser,
    deleteUser,
    deletingNews,
    setDeletingNews,
    deleteNews,
    deletingRole,
    setDeletingRole,
    deleteRole,
    deletingOffer,
    setDeletingOffer,
    deleteOffer,
    deletingClub,
    setDeletingClub,
    deleteClub,
    renewingClub,
    setRenewingClub,
    renewType,
    setRenewType,
    handleRenewClub,
  } = adminDashboard;

  return (
    <>
      <AdminConfirmDialog
        theme={theme}
        visible={deletingUser !== null}
        icon="trash-outline"
        accent={theme.danger}
        title="حذف المستخدم"
        subtitle={deletingUser?.fullName}
        description="هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="نعم، احذف"
        onConfirm={() => {
          if (deletingUser) {
            void deleteUser(deletingUser);
          }
          setDeletingUser(null);
        }}
        onCancel={() => setDeletingUser(null)}
      />

      <AdminConfirmDialog
        theme={theme}
        visible={deletingNews !== null}
        icon="trash-outline"
        accent={theme.danger}
        title="حذف الخبر"
        subtitle={deletingNews?.title}
        description="هل أنت متأكد من حذف هذا الخبر؟ لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="نعم، احذف"
        onConfirm={() => {
          if (deletingNews) {
            void deleteNews(deletingNews);
          }
          setDeletingNews(null);
        }}
        onCancel={() => setDeletingNews(null)}
      />

      <AdminConfirmDialog
        theme={theme}
        visible={deletingRole !== null}
        icon="trash-outline"
        accent={theme.danger}
        title="إلغاء الدور"
        description="هل أنت متأكد من إلغاء دور هذا المستخدم؟ سيفقد جميع الصلاحيات الممنوحة له."
        confirmLabel="نعم، إلغاء الدور"
        onConfirm={() => {
          if (deletingRole) {
            void deleteRole(deletingRole);
          }
          setDeletingRole(null);
        }}
        onCancel={() => setDeletingRole(null)}
      />

      <AdminConfirmDialog
        theme={theme}
        visible={deletingOffer !== null}
        icon="trash-outline"
        accent={theme.danger}
        title="حذف العرض"
        subtitle={deletingOffer?.title}
        description="هل أنت متأكد من حذف هذا العرض؟ لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="نعم، احذف"
        onConfirm={() => {
          if (deletingOffer) {
            void deleteOffer(deletingOffer);
          }
          setDeletingOffer(null);
        }}
        onCancel={() => setDeletingOffer(null)}
      />

      <AdminConfirmDialog
        theme={theme}
        visible={deletingClub !== null}
        icon="trash-outline"
        accent={theme.danger}
        title="حذف النادي"
        subtitle={deletingClub?.name}
        description="هل أنت متأكد من حذف هذا النادي؟ سيتم إلغاء الاشتراك المرتبط به نهائياً."
        confirmLabel="نعم، احذف"
        onConfirm={() => {
          if (deletingClub) {
            void deleteClub(deletingClub);
          }
          setDeletingClub(null);
        }}
        onCancel={() => setDeletingClub(null)}
      />

      <AdminConfirmDialog
        theme={theme}
        visible={renewingClub !== null}
        icon="refresh-outline"
        accent={theme.primary}
        title="تجديد الاشتراك"
        subtitle={renewingClub?.name}
        subtitleColor={theme.primary}
        description="سيتم تمديد الاشتراك بحسب الخطة المختارة."
        confirmLabel="تأكيد التجديد"
        confirmTone="primary"
        onConfirm={() => void handleRenewClub()}
        onCancel={() => setRenewingClub(null)}
      />

      {renewingClub ? (
        <View style={styles.renewFloating}>
          <AdminCard theme={theme}>
            <Text style={[styles.renewLabel, { color: theme.mutedText }]}>
              اختر خطة التجديد
            </Text>
            <AdminSegmentedOptions
              theme={theme}
              value={renewType}
              onChange={setRenewType}
              options={[
                { value: 'monthly', label: 'شهري - 15 د.ا', accent: theme.primary },
                { value: 'yearly', label: 'سنوي - 120 د.ا', accent: theme.primary },
              ]}
            />
          </AdminCard>
        </View>
      ) : null}
    </>
  );
}
