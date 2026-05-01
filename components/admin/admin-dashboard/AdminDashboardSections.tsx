import { Pressable, Text, View } from 'react-native';

import {
  AdminEmptyState,
  AdminMetricCard,
  AdminOutlinedStat,
  AdminPanelHeading,
  AdminPrimaryButton,
  AdminQuickAction,
  AdminSearchInput,
} from '@/components/admin/admin-primitives';
import {
  ClubCard,
  NewsCard,
  OfferCard,
  OverviewActivityChart,
  RoleCard,
  UserCard,
} from '@/components/admin/admin-entities';
import { formatCompactNumber, toEnglishDigits } from '@/lib/admin/admin-config';

import type { AdminDashboardController } from './use-admin-dashboard-controller';
import { styles } from './styles';

type AdminDashboardSectionsProps = {
  controller: AdminDashboardController;
};

function OverviewSection({ controller }: AdminDashboardSectionsProps) {
  const { theme, dashboard, openNewsEditor, showToast } = controller;

  return (
    <>
      <View style={styles.metricsRow}>
        <AdminMetricCard
          theme={theme}
          icon="briefcase-outline"
          accent={theme.warning}
          value={toEnglishDigits(dashboard.adsCount.toLocaleString('en-US'))}
          label="الإعلانات"
          trend={`${toEnglishDigits(dashboard.adsGrowth)}%+`}
        />
        <AdminMetricCard
          theme={theme}
          icon="people-outline"
          accent={theme.primary}
          value={toEnglishDigits(dashboard.usersCount.toLocaleString('en-US'))}
          label="المستخدمون"
          trend={`${toEnglishDigits(dashboard.usersGrowth)}%+`}
        />
      </View>
      <View style={styles.metricsSingle}>
        <AdminMetricCard
          theme={theme}
          icon="mail-outline"
          accent={theme.success}
          value={formatCompactNumber(dashboard.messagesCount)}
          label="الرسائل"
          trend={`${toEnglishDigits(dashboard.messagesGrowth)}%+`}
        />
      </View>
      <AdminPanelHeading theme={theme} title="إجراءات سريعة" />
      <View style={styles.stack}>
        <AdminQuickAction
          theme={theme}
          icon="document-text-outline"
          accent={theme.success}
          label="نشر خبر جديد"
          onPress={() => openNewsEditor()}
        />
        <AdminQuickAction
          theme={theme}
          icon="stats-chart-outline"
          accent={theme.primary}
          label="تقرير النشاط الأسبوعي"
          onPress={() => showToast('تم تجهيز التقرير الأسبوعي', 'info')}
        />
        <OverviewActivityChart
          theme={theme}
          points={dashboard.activityPoints}
          windowLabel={dashboard.activityWindowLabel}
        />
      </View>
    </>
  );
}

function UsersSection({ controller }: AdminDashboardSectionsProps) {
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
  } = controller;

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

function NewsSection({ controller }: AdminDashboardSectionsProps) {
  const {
    theme,
    openNewsEditor,
    newsLoading,
    news,
    setDeletingNews,
    publishNews,
  } = controller;

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

function RolesSection({ controller }: AdminDashboardSectionsProps) {
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
  } = controller;

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
            ? `\u062c\u0645\u064a\u0639 \u0627\u0644\u0623\u062f\u0648\u0627\u0631 (${toEnglishDigits(roles.length)})`
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
            description="نقوم بجلب صلاحيات ولوائح الأدوار من الخادم الآن."
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

function OffersSection({ controller }: AdminDashboardSectionsProps) {
  const {
    theme,
    offers,
    offerFilter,
    setOfferFilter,
    openOfferEditor,
    offersLoading,
    filteredOffers,
    setDeletingOffer,
  } = controller;

  return (
    <>
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCell}>
          <AdminOutlinedStat
            theme={theme}
            title="أكاديميات"
            value={String(offers.filter((item) => item.type === 'academy').length)}
            accent={theme.violet}
            active={offerFilter === 'academy'}
            onPress={() =>
              setOfferFilter((current) => (current === 'academy' ? 'all' : 'academy'))
            }
          />
        </View>
        <View style={styles.summaryCell}>
          <AdminOutlinedStat
            theme={theme}
            title="متاجر"
            value={String(offers.filter((item) => item.type === 'store').length)}
            accent={theme.warning}
            active={offerFilter === 'store'}
            onPress={() =>
              setOfferFilter((current) => (current === 'store' ? 'all' : 'store'))
            }
          />
        </View>
      </View>
      <AdminPrimaryButton
        theme={theme}
        label="إضافة عرض جديد"
        icon="megaphone-outline"
        onPress={() => openOfferEditor()}
      />
      <View style={styles.stack}>
        {offersLoading ? (
          <AdminEmptyState
            theme={theme}
            icon="hourglass-outline"
            title="جارٍ تحميل العروض"
            description="نقوم بتحميل العروض المرتبطة بلوحة الإدارة الآن."
          />
        ) : filteredOffers.length ? (
          filteredOffers.map((item) => (
            <OfferCard
              key={item.id}
              theme={theme}
              offer={item}
              onEdit={() => openOfferEditor(item)}
              onDelete={() => setDeletingOffer(item)}
            />
          ))
        ) : (
          <AdminEmptyState
            theme={theme}
            icon="calendar-outline"
            title={
              offers.length
                ? 'لا توجد فعاليات من هذا النوع'
                : 'لا توجد فعاليات حالياً'
            }
            description={
              offers.length
                ? 'جرّب نوعاً آخر أو أضف فعالية جديدة من نفس اللوحة.'
                : 'لا توجد أي فعاليات حالياً. أضف فعالية جديدة لتظهر هنا.'
            }
          />
        )}
      </View>
    </>
  );
}

function ClubsSection({ controller }: AdminDashboardSectionsProps) {
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
  } = controller;

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
            title={
              clubs.length
                ? 'لا توجد أندية بهذه الحالة'
                : 'لا توجد أندية حالياً'
            }
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

export function AdminDashboardSections({ controller }: AdminDashboardSectionsProps) {
  switch (controller.resolvedActiveSection) {
    case 'overview':
      return <OverviewSection controller={controller} />;
    case 'users':
      return <UsersSection controller={controller} />;
    case 'news':
      return <NewsSection controller={controller} />;
    case 'roles':
      return <RolesSection controller={controller} />;
    case 'offers':
      return <OffersSection controller={controller} />;
    case 'clubs':
      return <ClubsSection controller={controller} />;
    default:
      return null;
  }
}
