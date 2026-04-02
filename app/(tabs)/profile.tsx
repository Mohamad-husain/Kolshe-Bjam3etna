import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  getAvatarColor,
  getAvatarInitial,
  getValidImageUri,
} from '@/components/chat/chat-ui';
import { ProfileAdCard } from '@/components/profile/cards/profile-ad-card';
import { ProfileEventCard } from '@/components/profile/cards/profile-event-card';
import { ProfileExchangeCard } from '@/components/profile/cards/profile-exchange-card';
import { ProfileIncomingOfferCard } from '@/components/profile/cards/profile-incoming-offer-card';
import { ProfileOutgoingOfferCard } from '@/components/profile/cards/profile-outgoing-offer-card';
import { ProfileServiceCard } from '@/components/profile/cards/profile-service-card';
import { ProfileHero } from '@/components/profile/profile-hero';
import { ProfileLoadingBanner } from '@/components/profile/profile-loading-banner';
import { ProfileTabsBar } from '@/components/profile/profile-tabs-bar';
import { useAuth } from '@/contexts/auth-context';
import {
  useAcceptOfferMutation,
  useRejectOfferMutation,
} from '@/hooks/mutations/use-profile-mutations';
import { useProfileQuery } from '@/hooks/queries/use-auth-queries';
import {
  useIncomingOffersQuery,
  useMyProductAdsQuery,
  useMyServiceRequestsQuery,
  useMySwapAdsQuery,
  useOutgoingOffersQuery,
} from '@/hooks/queries/use-profile-queries';
import type { IncomingOffer } from '@/services/profile-api';
import { Colors, FontFamily, FontSize, FontWeight, SemanticColors } from '@/styles/ui-theme';

type ProfileTab = 'العروض' | 'إعلانات' | 'خدمات' | 'تبادلات' | 'فعالياتي';
type OfferView = 'incoming' | 'outgoing';
type ExploreTarget = 'services' | 'marketplace' | 'exchange' | 'events';

type RegisteredEventItem = {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  color: string;
};

const registeredEvents: RegisteredEventItem[] = [
  {
    id: 1,
    title: 'ورشة عمل البرمجة بالبايثون',
    date: '28 فبراير 2026',
    time: '10:00 صباحاً',
    location: 'قاعة الحاسوب',
    organizer: 'نادي البرمجة',
    color: SemanticColors.blue,
  },
  {
    id: 2,
    title: 'ندوة ريادة الأعمال',
    date: '5 مارس 2026',
    time: '1:00 مساءً',
    location: 'المدرج الرئيسي',
    organizer: 'نادي الأعمال',
    color: SemanticColors.green,
  },
  {
    id: 3,
    title: 'مسابقة الروبوتات السنوية',
    date: '10 مارس 2026',
    time: '9:00 صباحاً',
    location: 'مختبر الروبوتات',
    organizer: 'نادي الروبوتات',
    color: SemanticColors.lightBlue,
  },
];

function SectionBanner({
  message,
  tone = 'info',
}: {
  message: string;
  tone?: 'info' | 'error';
}) {
  return (
    <View style={[styles.sectionBanner, tone === 'error' && styles.sectionBannerError]}>
      <Text style={[styles.sectionBannerText, tone === 'error' && styles.sectionBannerErrorText]}>
        {message}
      </Text>
    </View>
  );
}

function SectionEmptyState({
  icon,
  title,
  description,
  actionLabel,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onPress?: () => void;
}) {
  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name={icon} size={22} color={Colors.mutedForeground} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
      {actionLabel && onPress ? (
        <Pressable onPress={onPress} style={({ pressed }) => [styles.emptyAction, pressed && styles.pressed]}>
          <Text style={styles.emptyActionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function ProfileRoute() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>('العروض');
  const [offersView, setOffersView] = useState<OfferView>('incoming');

  const profileQuery = useProfileQuery(!!user);
  const incomingOffersQuery = useIncomingOffersQuery(!!user);
  const outgoingOffersQuery = useOutgoingOffersQuery(!!user && activeTab === 'العروض');
  const servicesQuery = useMyServiceRequestsQuery(!!user && activeTab === 'خدمات');
  const adsQuery = useMyProductAdsQuery(!!user && activeTab === 'إعلانات');
  const swapsQuery = useMySwapAdsQuery(!!user && activeTab === 'تبادلات');
  const acceptOfferMutation = useAcceptOfferMutation();
  const rejectOfferMutation = useRejectOfferMutation();

  const profile = profileQuery.data;
  const incomingOffers = incomingOffersQuery.data ?? [];
  const outgoingOffers = outgoingOffersQuery.data ?? [];
  const services = servicesQuery.data ?? [];
  const ads = adsQuery.data ?? [];
  const swaps = swapsQuery.data ?? [];

  const fullName = profile?.fullName?.trim() || user?.name || 'مستخدم جديد';
  const major = profile?.major?.trim() || 'مصمم جرافيك | مطور ويب';
  const universityName = profile?.universityName?.trim() || 'الجامعة الأردنية';
  const studyYear = profile?.studyYear?.trim() || 'السنة الثانية';
  const detailText = profile?.universityNumber?.trim()
    ? `الرقم الجامعي ${profile.universityNumber}`
    : 'مقيم بالحرم';
  const profileImageUri = getValidImageUri(profile?.profileImageUrl);
  const pendingOffers = incomingOffers.filter((item) => item.status === 'pending').length;
  const acceptingOfferId = acceptOfferMutation.isPending ? acceptOfferMutation.variables ?? null : null;
  const rejectingOfferId = rejectOfferMutation.isPending ? rejectOfferMutation.variables ?? null : null;

  const openMessages = () => {
    router.push('/(tabs)/messages');
  };

  const openExploreTab = (tab: ExploreTarget) => {
    router.push({ pathname: '/(tabs)/explore', params: { tab } });
  };

  const showSoonAlert = (title: string, message: string) => {
    Alert.alert(title, message);
  };

  const showIncomingOffers = () => {
    setActiveTab('العروض');
    setOffersView('incoming');
  };

  const handleAcceptOffer = (offer: IncomingOffer) => {
    if (acceptOfferMutation.isPending || rejectOfferMutation.isPending) {
      return;
    }

    acceptOfferMutation.mutate(offer.id, {
      onSuccess: () => {
        Alert.alert(
          'تم قبول العرض',
          `تم قبول عرض ${offer.from} بنجاح.`,
          [
            { text: 'فتح الرسائل', onPress: openMessages },
            { text: 'لاحقاً', style: 'cancel' },
          ],
        );
      },
      onError: (error) => {
        const message = error instanceof Error ? error.message : 'تعذر قبول العرض';
        Alert.alert('تعذر قبول العرض', message);
      },
    });
  };

  const handleRejectOffer = (offer: IncomingOffer) => {
    if (acceptOfferMutation.isPending || rejectOfferMutation.isPending) {
      return;
    }

    rejectOfferMutation.mutate(offer.id, {
      onSuccess: () => {
        Alert.alert('تم رفض العرض', `تم رفض عرض ${offer.from} بنجاح.`);
      },
      onError: (error) => {
        const message = error instanceof Error ? error.message : 'تعذر رفض العرض';
        Alert.alert('تعذر رفض العرض', message);
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="light" />

      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}
          showsVerticalScrollIndicator={false}
        >
          <ProfileHero
            topInset={insets.top}
            summary={{
              fullName,
              major,
              universityName,
              studyYear,
              detailText,
              profileImageUri,
              avatarInitial: getAvatarInitial(fullName),
              avatarColor: getAvatarColor(fullName),
            }}
            onOpenExploreTab={openExploreTab}
            onOpenAdmin={() =>
              showSoonAlert('لوحة الإدارة', 'واجهة الإدارة غير مضافة بعد في التطبيق الحالي.')
            }
            onOpenSettings={() => router.push('/settings')}
            onEditProfile={() =>
              showSoonAlert(
                'تعديل الملف الشخصي',
                'واجهة التعديل ستُربط مع نموذج تحديث الملف الشخصي لاحقاً.',
              )
            }
          />

          <ProfileTabsBar
            activeTab={activeTab}
            pendingOffers={pendingOffers}
            onChangeTab={setActiveTab}
          />

          {profileQuery.isLoading ? <ProfileLoadingBanner /> : null}

          {activeTab === 'العروض' ? (
            <View style={styles.sectionStack}>
              <View style={styles.toggleWrap}>
                <Pressable
                  onPress={() => setOffersView('incoming')}
                  style={({ pressed }) => [
                    styles.toggleButton,
                    offersView === 'incoming' && styles.toggleButtonActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="mail-open-outline"
                    size={14}
                    color={offersView === 'incoming' ? Colors.foreground : Colors.mutedForeground}
                  />
                  <Text
                    style={[
                      styles.toggleText,
                      offersView === 'incoming' && styles.toggleTextActive,
                    ]}
                  >
                    واردة ({incomingOffers.length})
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setOffersView('outgoing')}
                  style={({ pressed }) => [
                    styles.toggleButton,
                    offersView === 'outgoing' && styles.toggleButtonActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="paper-plane-outline"
                    size={14}
                    color={offersView === 'outgoing' ? Colors.foreground : Colors.mutedForeground}
                  />
                  <Text
                    style={[
                      styles.toggleText,
                      offersView === 'outgoing' && styles.toggleTextActive,
                    ]}
                  >
                    صادرة ({outgoingOffers.length})
                  </Text>
                </Pressable>
              </View>

              {offersView === 'incoming' ? (
                incomingOffersQuery.isLoading ? (
                  <SectionBanner message="جاري تحميل العروض الواردة..." />
                ) : incomingOffersQuery.isError ? (
                  <SectionBanner
                    tone="error"
                    message={
                      incomingOffersQuery.error instanceof Error
                        ? incomingOffersQuery.error.message
                        : 'تعذر تحميل العروض الواردة'
                    }
                  />
                ) : incomingOffers.length ? (
                  incomingOffers.map((offer) => (
                    <ProfileIncomingOfferCard
                      key={offer.id}
                      offer={offer}
                      onOpenMessages={openMessages}
                      onRejectOffer={handleRejectOffer}
                      onAcceptOffer={handleAcceptOffer}
                      isAccepting={acceptingOfferId === offer.id}
                      isRejecting={rejectingOfferId === offer.id}
                    />
                  ))
                ) : (
                  <SectionEmptyState
                    icon="mail-open-outline"
                    title="لا توجد عروض واردة"
                    description="أي عرض جديد يصلك على خدماتك أو إعلاناتك سيظهر هنا."
                  />
                )
              ) : outgoingOffersQuery.isLoading ? (
                <SectionBanner message="جاري تحميل العروض الصادرة..." />
              ) : outgoingOffersQuery.isError ? (
                <SectionBanner
                  tone="error"
                  message={
                    outgoingOffersQuery.error instanceof Error
                      ? outgoingOffersQuery.error.message
                      : 'تعذر تحميل العروض الصادرة'
                  }
                />
              ) : outgoingOffers.length ? (
                outgoingOffers.map((offer) => (
                  <ProfileOutgoingOfferCard key={offer.id} offer={offer} />
                ))
              ) : (
                <SectionEmptyState
                  icon="paper-plane-outline"
                  title="لا توجد عروض صادرة"
                  description="العروض التي ترسلها للآخرين ستظهر هنا مع حالتها الحالية."
                />
              )}
            </View>
          ) : null}

          {activeTab === 'إعلانات' ? (
            <View style={styles.sectionStack}>
              {adsQuery.isLoading ? <SectionBanner message="جاري تحميل إعلاناتك..." /> : null}
              {adsQuery.isError ? (
                <SectionBanner
                  tone="error"
                  message={
                    adsQuery.error instanceof Error ? adsQuery.error.message : 'تعذر تحميل إعلاناتك'
                  }
                />
              ) : null}
              {!adsQuery.isLoading && !adsQuery.isError && !ads.length ? (
                <SectionEmptyState
                  icon="bag-outline"
                  title="لا توجد إعلانات بعد"
                  description="أضف إعلاناً جديداً ليظهر هنا ضمن ملفك الشخصي."
                  actionLabel="افتح المتجر"
                  onPress={() => openExploreTab('marketplace')}
                />
              ) : null}
              {ads.map((item) => (
                <ProfileAdCard
                  key={item.id}
                  item={item}
                  onOpenStore={() => openExploreTab('marketplace')}
                />
              ))}
              <Pressable
                onPress={() => openExploreTab('marketplace')}
                style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
              >
                <Text style={styles.addButtonText}>+ إضافة إعلان جديد</Text>
              </Pressable>
            </View>
          ) : null}

          {activeTab === 'خدمات' ? (
            <View style={styles.sectionStack}>
              {servicesQuery.isLoading ? <SectionBanner message="جاري تحميل خدماتك..." /> : null}
              {servicesQuery.isError ? (
                <SectionBanner
                  tone="error"
                  message={
                    servicesQuery.error instanceof Error
                      ? servicesQuery.error.message
                      : 'تعذر تحميل خدماتك'
                  }
                />
              ) : null}
              {!servicesQuery.isLoading && !servicesQuery.isError && !services.length ? (
                <SectionEmptyState
                  icon="briefcase-outline"
                  title="لا توجد خدمات منشورة"
                  description="أضف خدمة جديدة لتظهر هنا ويبدأ استقبال العروض عليها."
                  actionLabel="استكشف الخدمات"
                  onPress={() => openExploreTab('services')}
                />
              ) : null}
              {services.map((service) => (
                <ProfileServiceCard key={service.id} service={service} onShowOffers={showIncomingOffers} />
              ))}
              <Pressable
                onPress={() => openExploreTab('services')}
                style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
              >
                <Text style={styles.addButtonText}>+ إضافة خدمة جديدة</Text>
              </Pressable>
            </View>
          ) : null}

          {activeTab === 'تبادلات' ? (
            <View style={styles.sectionStack}>
              {swapsQuery.isLoading ? <SectionBanner message="جاري تحميل تبادلاتك..." /> : null}
              {swapsQuery.isError ? (
                <SectionBanner
                  tone="error"
                  message={
                    swapsQuery.error instanceof Error ? swapsQuery.error.message : 'تعذر تحميل تبادلاتك'
                  }
                />
              ) : null}
              {!swapsQuery.isLoading && !swapsQuery.isError && !swaps.length ? (
                <SectionEmptyState
                  icon="swap-horizontal-outline"
                  title="لا توجد تبادلات حالية"
                  description="أضف تبادلاً جديداً ليظهر هنا وتتابع الردود عليه."
                  actionLabel="افتح التبادلات"
                  onPress={() => openExploreTab('exchange')}
                />
              ) : null}
              {swaps.map((exchange) => (
                <ProfileExchangeCard
                  key={exchange.id}
                  exchange={exchange}
                  onOpenResponses={() => openExploreTab('exchange')}
                />
              ))}
              <Pressable
                onPress={() => openExploreTab('exchange')}
                style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
              >
                <Text style={styles.addButtonText}>+ إضافة تبادل جديد</Text>
              </Pressable>
            </View>
          ) : null}

          {activeTab === 'فعالياتي' ? (
            <View style={styles.sectionStack}>
              {registeredEvents.length ? (
                registeredEvents.map((event) => (
                  <ProfileEventCard
                    key={event.id}
                    event={event}
                    onCancelRegistration={() =>
                      showSoonAlert(
                        'إلغاء التسجيل',
                        'تم تجهيز الواجهة وسيتم ربط الإجراء مع API الفعاليات لاحقاً.',
                      )
                    }
                  />
                ))
              ) : (
                <SectionEmptyState
                  icon="calendar-outline"
                  title="لا توجد فعاليات مسجلة"
                  description="استكشف الفعاليات وسجّل في ما يناسبك لتظهر هنا."
                  actionLabel="استكشف الفعاليات"
                  onPress={() => openExploreTab('events')}
                />
              )}
            </View>
          ) : null}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    backgroundColor: Colors.background,
  },
  sectionStack: {
    gap: 12,
    marginTop: 16,
    paddingHorizontal: 18,
  },
  toggleWrap: {
    flexDirection: 'row-reverse',
    gap: 8,
    borderRadius: 22,
    padding: 4,
    backgroundColor: 'rgba(120,120,128,0.08)',
  },
  toggleButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 18,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.08)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  toggleText: {
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  toggleTextActive: {
    color: Colors.foreground,
  },
  sectionBanner: {
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(37,99,235,0.08)',
  },
  sectionBannerError: {
    backgroundColor: 'rgba(255,59,48,0.10)',
  },
  sectionBannerText: {
    color: Colors.primary,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
  },
  sectionBannerErrorText: {
    color: SemanticColors.red,
  },
  emptyCard: {
    borderRadius: 28,
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.06)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 4,
  },
  emptyIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(120,120,128,0.08)',
  },
  emptyTitle: {
    marginTop: 12,
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
  },
  emptyDescription: {
    marginTop: 6,
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    lineHeight: 22,
    textAlign: 'center',
  },
  emptyAction: {
    minHeight: 38,
    marginTop: 14,
    borderRadius: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(37,99,235,0.10)',
  },
  emptyActionText: {
    color: Colors.primary,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  addButton: {
    minHeight: 54,
    borderRadius: 22,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(37,99,235,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.65)',
  },
  addButtonText: {
    color: Colors.primary,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
