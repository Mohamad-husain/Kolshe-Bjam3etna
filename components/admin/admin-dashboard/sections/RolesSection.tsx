import { View } from 'react-native';

import {
  AdminEmptyState,
  AdminOutlinedStat,
  AdminPanelHeading,
  AdminPrimaryButton,
} from '@/components/admin/admin-primitives';
import { RoleCard } from '@/components/admin/admin-entities';
import type { AdminDashboard } from '@/hooks/admin/use-admin-dashboard';
import { toEnglishDigits } from '@/lib/admin/admin-config';

import { styles } from '../styles';

type AdminDashboardProps = {
  adminDashboard: AdminDashboard;
};

export function RolesSection({ adminDashboard }: AdminDashboardProps) {
  const {
    theme,
    roleSummary,
    roleFilter,
    setRoleFilter,
    openRoleEditor,
    roles,
    filteredRoles,
    rolesLoading,
    getRoleOptionByValue,
    setDeletingRole,
  } = adminDashboard;

  return (
    <>
      <View style={styles.rolesSummaryGrid}>
        {roleSummary.map((item) => {
          const option = getRoleOptionByValue(item.role);

          return (
            <View key={item.role} style={styles.rolesSummaryCell}>
              <AdminOutlinedStat
                theme={theme}
                title={option.label}
                value={String(item.count)}
                accent={option.color}
                active={roleFilter === item.role}
                onPress={() =>
                  setRoleFilter((current) => (current === item.role ? 'all' : item.role))
                }
              />
            </View>
          );
        })}
      </View>

      <AdminPrimaryButton
        theme={theme}
        label="إضافة دور جديد"
        icon="git-network-outline"
        onPress={() => openRoleEditor()}
      />

      <AdminPanelHeading
        theme={theme}
        title={
          roleFilter === 'all'
            ? `جميع الأدوار (${toEnglishDigits(roles.length)})`
            : `${getRoleOptionByValue(roleFilter).label} (${toEnglishDigits(filteredRoles.length)})`
        }
        actionLabel="عرض الكل"
        onActionPress={() => setRoleFilter('all')}
      />

      <View style={styles.stack}>
        {rolesLoading ? (
          <AdminEmptyState
            theme={theme}
            icon="hourglass-outline"
            title="جارٍ تحميل الأدوار"
            description="نقوم بجلب صلاحيات وأعضاء الأدوار من الخادم الآن."
          />
        ) : filteredRoles.length ? (
          filteredRoles.map((item) => (
            <RoleCard
              key={item.id}
              theme={theme}
              item={item}
              roleOption={getRoleOptionByValue(item.role)}
              onEdit={() => openRoleEditor(item)}
              onDelete={() => setDeletingRole(item)}
            />
          ))
        ) : (
          <AdminEmptyState
            theme={theme}
            icon="person-outline"
            title="لا يوجد أعضاء بهذا الدور"
            description="اختر دوراً آخر أو أضف عضواً جديداً من نفس اللوحة."
          />
        )}
      </View>
    </>
  );
}
