import { View } from 'react-native';

import {
  AdminEmptyState,
  AdminOutlinedStat,
  AdminPrimaryButton,
} from '@/components/admin/admin-primitives';
import { ClubCard } from '@/components/admin/admin-entities';
import type { AdminDashboard } from '@/hooks/admin/use-admin-dashboard';

import { styles } from '../styles';

type AdminDashboardProps = {
  adminDashboard: AdminDashboard;
};

export function ClubsSection({ adminDashboard }: AdminDashboardProps) {
  const {
    theme,
    clubSummary,
    clubFilter,
    setClubFilter,
    openClubEditor,
    clubsLoading,
    filteredClubs,
    clubs,
    setDeletingClub,
    setRenewingClub,
    setRenewType,
  } = adminDashboard;

  return (
    <>
      <View style={styles.summaryGridWide}>
        <View style={styles.summaryWideCell}>
          <AdminOutlinedStat
            theme={theme}
            title="منتهي"
            value={String(clubSummary.expired)}
            accent={theme.danger}
            active={clubFilter === 'expired'}
            onPress={() =>
              setClubFilter((current) => (current === 'expired' ? 'all' : 'expired'))
            }
          />
        </View>
        <View style={styles.summaryWideCell}>
          <AdminOutlinedStat
            theme={theme}
            title="ينتهي قريباً"
            value={String(clubSummary.expiring)}
            accent={theme.warning}
            active={clubFilter === 'expiring'}
            onPress={() =>
              setClubFilter((current) => (current === 'expiring' ? 'all' : 'expiring'))
            }
          />
        </View>
        <View style={styles.summaryWideCell}>
          <AdminOutlinedStat
            theme={theme}
            title="نشط"
            value={String(clubSummary.active)}
            accent={theme.success}
            active={clubFilter === 'active'}
            onPress={() =>
              setClubFilter((current) => (current === 'active' ? 'all' : 'active'))
            }
          />
        </View>
      </View>

      <AdminPrimaryButton
        theme={theme}
        label="إضافة نادي جديد"
        icon="people-outline"
        onPress={() => openClubEditor()}
      />

      <View style={styles.stack}>
        {clubsLoading ? (
          <AdminEmptyState
            theme={theme}
            icon="hourglass-outline"
            title="جارٍ تحميل الأندية"
            description="نقوم بسحب بيانات الأندية والاشتراكات الآن."
          />
        ) : filteredClubs.length ? (
          filteredClubs.map((item) => (
            <ClubCard
              key={item.id}
              theme={theme}
              club={item}
              onEdit={() => openClubEditor(item)}
              onDelete={() => setDeletingClub(item)}
              onRenew={() => {
                setRenewingClub(item);
                setRenewType(item.subscriptionType);
              }}
            />
          ))
        ) : (
          <AdminEmptyState
            theme={theme}
            icon="people-outline"
            title={clubs.length ? 'لا توجد أندية بهذه الحالة' : 'لا توجد أندية حالياً'}
            description={
              clubs.length
                ? 'اختر حالة أخرى أو أضف نادياً جديداً من نفس اللوحة.'
                : 'لا يوجد أي نادٍ حالياً. أضف نادياً جديداً ليظهر هنا.'
            }
          />
        )}
      </View>
    </>
  );
}
