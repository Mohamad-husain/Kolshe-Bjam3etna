import { View } from 'react-native';

import {
  AdminEmptyState,
  AdminOutlinedStat,
  AdminPrimaryButton,
} from '@/components/admin/admin-primitives';
import { OfferCard } from '@/components/admin/admin-entities';
import type { AdminDashboard } from '@/hooks/admin/use-admin-dashboard';

import { styles } from '../styles';

type AdminDashboardProps = {
  adminDashboard: AdminDashboard;
};

export function OffersSection({ adminDashboard }: AdminDashboardProps) {
  const {
    theme,
    offers,
    offerFilter,
    setOfferFilter,
    openOfferEditor,
    offersLoading,
    filteredOffers,
    setDeletingOffer,
  } = adminDashboard;

  return (
    <>
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCell}>
          <AdminOutlinedStat
            theme={theme}
            title="أكاديمية"
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
            title="متجر"
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
            icon="pricetag-outline"
            title={offers.length ? 'لا توجد عروض من هذا النوع' : 'لا توجد عروض حالياً'}
            description={
              offers.length
                ? 'جرّب نوعاً آخر أو أضف عرضاً جديداً من نفس اللوحة.'
                : 'لا يوجد أي عرض حالياً. أضف عرضاً جديداً ليظهر هنا.'
            }
          />
        )}
      </View>
    </>
  );
}
