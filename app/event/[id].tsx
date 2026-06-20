import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { getEventAccent } from '@/components/explore/explore-colors';
import { useAppSettings, type TranslationKey } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import { useRegisterEventMutation } from '@/hooks/mutations/use-event-mutations';
import { useEventDetailsQuery } from '@/hooks/queries/use-explore-queries';
import {
  Colors,
  Dimensions,
  FontFamily,
  FontSize,
  FontWeight,
  SemanticColors,
  Spacing,
} from '@/styles/ui-theme';

const EVENT_TABS = ['info', 'program', 'speakers', 'registration'] as const;
type EventTab = (typeof EVENT_TABS)[number];
const EVENT_TAB_LABELS: Record<EventTab, TranslationKey> = {
  info: 'eventDetail.info',
  program: 'eventDetail.program',
  speakers: 'eventDetail.speakers',
  registration: 'eventDetail.registration',
};

function getParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function splitAgendaTime(value?: string | null) {
  if (!value) return { hour: '--', minute: '--' };
  const [hour = '--', minute = '--'] = value.split(':');
  return { hour, minute };
}

export default function EventDetailRoute() {
  const { t } = useAppSettings();
  const { colors, effectiveTheme } = useThemePreference();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = getParam(params.id);
  const insets = useSafeAreaInsets();
  const eventQuery = useEventDetailsQuery(id);
  const registerMutation = useRegisterEventMutation();
  const event = eventQuery.data;
  const accent = getEventAccent(event?.eventType);
  const [isRegistered, setIsRegistered] = useState(false);
  const [activeTab, setActiveTab] = useState<EventTab>('info');
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [showRegSuccess, setShowRegSuccess] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formYear, setFormYear] = useState('');

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace({ pathname: '/(tabs)/explore', params: { tab: 'events' } });
  };

  const speakers = useMemo(() => {
    if (!event) return [];

    return [
      {
        name: event.coordinator.name || event.club,
        role: t('eventDetail.organizerRole', { club: event.club }),
        initials: (event.coordinator.name || event.club || t('detail.studentInitial')).charAt(0),
        bg: accent.color,
      },
    ];
  }, [accent.color, event, t]);

  if (eventQuery.isLoading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <StatusBar style={effectiveTheme === 'dark' ? 'light' : 'dark'} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={accent.color} />
        </View>
      </SafeAreaView>
    );
  }

  if (eventQuery.isError || !event) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <StatusBar style={effectiveTheme === 'dark' ? 'light' : 'dark'} />
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <HeaderIcon icon="arrow-back" onPress={goBack} />
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>{t('eventDetail.registrationTitle')}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.center}>
          <Text style={[styles.errorTitle, { color: colors.foreground }]}>{t('eventDetail.loadError')}</Text>
          <Pressable style={[styles.retryButton, { backgroundColor: accent.color }]} onPress={() => eventQuery.refetch()}>
            <Text style={styles.retryText}>{t('common.retry')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const fillPercent = event.maxCount > 0
    ? Math.min(Math.round((event.registeredCount / event.maxCount) * 100), 100)
    : 0;
  const spotsLeft = Math.max(event.maxCount - event.registeredCount, 0);
  const isFull = spotsLeft <= 0;
  const agenda = event.agenda.length
    ? event.agenda
    : [
      { id: 'welcome', title: t('eventDetail.welcome'), startTime: event.time, order: 1 },
      { id: 'main', title: event.title, startTime: event.time, order: 2 },
      { id: 'qa', title: t('eventDetail.openDiscussion'), startTime: null, order: 3 },
    ];

  const shareEvent = async () => {
    await Share.share({
      title: event.title,
      message: `${event.title}\n${event.date} - ${event.time}\n${event.location}`,
    });
    setShowShareSheet(false);
  };

  const handleRegister = async () => {
    const year = Number(formYear);

    try {
      await registerMutation.mutateAsync({
        eventId: event.id,
        fullName: formName,
        universityEmail: formEmail,
        studyYear: year,
      });
      setIsRegistered(true);
      setShowRegSuccess(true);
      setTimeout(() => setShowRegSuccess(false), 4000);
    } catch (error) {
      Alert.alert(
        t('eventDetail.registration'),
        error instanceof Error ? error.message : t('detail.unexpectedError'),
      );
    }
  };

  const submitDisabled =
    isFull ||
    !formName.trim() ||
    !formEmail.trim() ||
    !formYear ||
    registerMutation.isPending;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar style={effectiveTheme === 'dark' ? 'light' : 'dark'} />
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <HeaderIcon icon="share-social-outline" onPress={() => setShowShareSheet(true)} />
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{t('eventDetail.registrationTitle')}</Text>
        <HeaderIcon icon="arrow-back" onPress={goBack} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
        style={styles.keyboardAvoiding}
      >
        <ScrollView
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          contentContainerStyle={[
            styles.content,
            {
              paddingBottom:
                activeTab === 'registration' ? insets.bottom + 260 : insets.bottom + 112,
            },
          ]}
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: colors.background }}
        >
          <View style={[styles.hero, { backgroundColor: accent.softBg }]}>
            {event.imageUrl ? (
              <Image source={{ uri: event.imageUrl }} style={styles.heroImage} contentFit="cover" />
            ) : null}
          </View>

        <View style={[styles.titleCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.eventTitle, { color: colors.foreground }]}>{event.title}</Text>
          <View style={styles.quickInfoWrap}>
            <InfoPill icon="location-outline" text={event.location} />
            <InfoPill icon="time-outline" text={event.time} />
            <InfoPill icon="calendar-outline" text={event.date} color={accent.color} bg={accent.softBg} />
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {EVENT_TABS.map((tab) => {
            const active = activeTab === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={({ pressed }) => [
                  styles.tabButton,
                  active ? { backgroundColor: accent.color } : [styles.tabButtonInactive, { backgroundColor: colors.secondary }],
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name={getTabIcon(tab)} size={15} color={active ? '#fff' : colors.mutedForeground} />
                <Text style={[styles.tabText, { color: colors.mutedForeground }, active && styles.tabTextActive]}>{t(EVENT_TAB_LABELS[tab])}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {activeTab === 'info' ? (
          <View style={styles.tabContent}>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t('eventDetail.about')}</Text>
              <Text style={[styles.description, { color: colors.mutedForeground }]}>{event.content || event.description}</Text>
            </View>

            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t('eventDetail.details')}</Text>
              <DetailRow icon="calendar-outline" label={t('eventDetail.date')} value={event.date} color={accent.color} />
              <DetailRow icon="time-outline" label={t('eventDetail.time')} value={event.time} color={SemanticColors.orange} />
              <DetailRow icon="location-outline" label={t('eventDetail.location')} value={event.location} color={SemanticColors.green} />
              <DetailRow icon="people-outline" label={t('eventDetail.organizer')} value={event.club} color={SemanticColors.violet} />
            </View>

            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.attendanceHeader}>
                <View style={[styles.capacityPill, { backgroundColor: isFull ? `${SemanticColors.red}14` : `${SemanticColors.green}14` }]}>
                  <Text style={[styles.capacityText, { color: isFull ? SemanticColors.red : SemanticColors.green }]}>
                    {isFull ? t('eventDetail.fullSeats') : t('eventDetail.seatsLeft', { count: spotsLeft })}
                  </Text>
                </View>
                <View style={styles.attendanceTitleRow}>
                  <Text style={[styles.sectionTitleNoMargin, { color: colors.foreground }]}>{t('explore.registered')}</Text>
                  <Ionicons name="people-outline" size={17} color={accent.color} />
                </View>
              </View>
              <View style={[styles.progressTrack, { backgroundColor: colors.secondary }]}>
                <View style={[styles.progressFill, { width: `${fillPercent}%`, backgroundColor: accent.color }]} />
              </View>
              <View style={styles.progressLabels}>
                <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>{t('eventDetail.maxCapacity', { count: event.maxCount })}</Text>
                <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
                  {t('eventDetail.registeredCount', { count: event.registeredCount, percent: fillPercent })}
                </Text>
              </View>
            </View>

          </View>
        ) : null}

        {activeTab === 'program' ? (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t('eventDetail.agenda')}</Text>
            {agenda.map((item, index) => {
              const parts = splitAgendaTime(item.startTime);
              return (
                <View key={item.id} style={styles.agendaItem}>
                  <View style={[styles.agendaTime, { backgroundColor: index === 0 ? accent.color : accent.strongBg }]}>
                    <Text style={styles.agendaHour}>{parts.hour}</Text>
                    <Text style={styles.agendaMinute}>{parts.minute}</Text>
                  </View>
                  <View style={[styles.agendaTextBox, { backgroundColor: colors.secondary }]}>
                    <Text style={[styles.agendaTitle, { color: colors.foreground }]}>{item.title}</Text>
                    <Text style={[styles.agendaDescription, { color: colors.mutedForeground }]}>{t('eventDetail.agendaDescription')}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}

        {activeTab === 'speakers' ? (
          <View style={styles.tabContent}>
            {speakers.map((speaker) => (
              <View key={speaker.name} style={[styles.speakerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.speakerBar, { backgroundColor: speaker.bg }]} />
                <View style={styles.speakerContent}>
                  <View style={styles.speakerInfo}>
                    <Text style={[styles.speakerName, { color: colors.foreground }]}>{speaker.name}</Text>
                    <Text style={[styles.speakerRole, { color: colors.mutedForeground }]}>{speaker.role}</Text>
                    <View style={[styles.profilePill, { backgroundColor: `${speaker.bg}14` }]}>
                      <Ionicons name="open-outline" size={12} color={speaker.bg} />
                      <Text style={[styles.profilePillText, { color: speaker.bg }]}>{t('eventDetail.profile')}</Text>
                    </View>
                  </View>
                  <View style={[styles.speakerAvatar, { backgroundColor: speaker.bg }]}>
                    <Text style={styles.speakerInitials}>{speaker.initials}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {activeTab === 'registration' ? (
          <View style={styles.tabContent}>
            {showRegSuccess ? (
              <View style={styles.successBanner}>
                <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
                <View style={styles.successTextBox}>
                  <Text style={styles.successTitle}>{t('eventDetail.registrationSuccess')}</Text>
                  <Text style={styles.successSub}>{t('eventDetail.emailConfirmation')}</Text>
                </View>
              </View>
            ) : null}

            {isRegistered ? (
              <View style={[styles.registeredCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.registeredIcon, { backgroundColor: accent.softBg }]}>
                  <Ionicons name="checkmark-circle-outline" size={38} color={accent.color} />
                </View>
                <Text style={[styles.registeredTitle, { color: colors.foreground }]}>{t('eventDetail.registeredTitle')}</Text>
                <Text style={[styles.registeredText, { color: colors.mutedForeground }]}>{t('eventDetail.reminder')}</Text>
                <Pressable style={styles.cancelButton} onPress={() => setIsRegistered(false)}>
                  <Text style={styles.cancelButtonText}>{t('eventDetail.cancelRegistration')}</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t('eventDetail.registrationForm')}</Text>
                  <FieldLabel text={t('eventDetail.fullName')} />
                  <TextInput
                    value={formName}
                    onChangeText={setFormName}
                    placeholder={t('eventDetail.fullNamePlaceholder')}
                    placeholderTextColor={`${colors.mutedForeground}88`}
                    style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground }]}
                    textAlign="right"
                  />

                  <FieldLabel text={t('eventDetail.email')} />
                  <TextInput
                    value={formEmail}
                    onChangeText={setFormEmail}
                    placeholder="example@university.edu.jo"
                    placeholderTextColor={`${colors.mutedForeground}88`}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground }]}
                    textAlign="right"
                  />

                  <FieldLabel text={t('eventDetail.studyYear')} />
                  <View style={styles.yearGrid}>
                    {['1', '2', '3', '4'].map((year) => {
                      const active = formYear === year;
                      return (
                        <Pressable
                          key={year}
                          onPress={() => setFormYear(year)}
                          style={({ pressed }) => [
                            styles.yearButton,
                            active ? { backgroundColor: accent.color } : [styles.yearButtonInactive, { backgroundColor: colors.secondary }],
                            pressed && styles.pressed,
                          ]}
                        >
                          <Text style={[styles.yearButtonText, { color: colors.mutedForeground }, active && styles.yearButtonTextActive]}>
                            {t('eventDetail.year', { year })}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {spotsLeft < 10 && !isFull ? (
                  <View style={[styles.warningBox, { backgroundColor: colors.secondary }]}>
                    <Ionicons name="flash-outline" size={18} color={SemanticColors.orange} />
                    <Text style={[styles.warningText, { color: colors.foreground }]}>{t('eventDetail.warningSeats', { count: spotsLeft })}</Text>
                  </View>
                ) : null}

                <Pressable
                  disabled={submitDisabled}
                  onPress={handleRegister}
                  style={({ pressed }) => [
                    styles.submitButton,
                    { backgroundColor: isFull ? SemanticColors.red : accent.color },
                    submitDisabled && styles.disabled,
                    pressed && !submitDisabled && styles.pressed,
                  ]}
                >
                  {registerMutation.isPending ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : null}
                  <Text style={styles.submitButtonText}>
                    {isFull ? t('eventDetail.seatsFull') : t('eventDetail.confirmRegistration')}
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        ) : null}
        </ScrollView>

        {activeTab !== 'registration' ? (
          <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: insets.bottom + 12 }]}>
            <Pressable
              onPress={() => setActiveTab('registration')}
              style={({ pressed }) => [
                styles.bottomRegisterButton,
                { backgroundColor: isRegistered ? SemanticColors.green : accent.color },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name={isRegistered ? 'checkmark-circle-outline' : 'notifications-outline'} size={19} color="#fff" />
              <Text style={styles.bottomRegisterText}>
                {isRegistered
                  ? t('eventDetail.alreadyRegistered')
                  : t('eventDetail.registerNow', { count: spotsLeft })}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </KeyboardAvoidingView>

      <Modal visible={showShareSheet} transparent animationType="slide" onRequestClose={() => setShowShareSheet(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowShareSheet(false)} />
          <View style={[styles.shareSheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 24 }]}>
            <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.shareTitle, { color: colors.foreground }]}>{t('eventDetail.shareTitle')}</Text>
            <Text style={[styles.shareSub, { color: colors.mutedForeground }]}>{event.title}</Text>
            <Pressable style={({ pressed }) => [styles.shareButton, { backgroundColor: accent.color }, pressed && styles.pressed]} onPress={shareEvent}>
              <Ionicons name="share-social-outline" size={18} color="#fff" />
              <Text style={styles.shareButtonText}>{t('eventDetail.share')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function getTabIcon(tab: EventTab): keyof typeof Ionicons.glyphMap {
  if (tab === 'program') return 'book-outline';
  if (tab === 'speakers') return 'mic-outline';
  if (tab === 'registration') return 'notifications-outline';
  return 'information-circle-outline';
}

function HeaderIcon({ icon, onPress }: { icon: keyof typeof Ionicons.glyphMap; onPress?: () => void }) {
  const { colors } = useThemePreference();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        { backgroundColor: colors.secondary },
        pressed && styles.pressed,
      ]}
    >
      <Ionicons name={icon} size={18} color={colors.foreground} />
    </Pressable>
  );
}

function InfoPill({
  icon,
  text,
  color,
  bg,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  color?: string;
  bg?: string;
}) {
  const { colors } = useThemePreference();
  const resolvedColor = color ?? colors.mutedForeground;
  const resolvedBg = bg ?? colors.secondary;

  return (
    <View style={[styles.infoPill, { backgroundColor: resolvedBg }]}>
      <Text style={[styles.infoPillText, { color: resolvedColor }]} numberOfLines={1}>{text}</Text>
      <Ionicons name={icon} size={13} color={resolvedColor} />
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
}) {
  const { colors } = useThemePreference();

  return (
    <View style={[styles.detailRow, { backgroundColor: colors.secondary }]}>
      <Text style={[styles.detailValue, { color: colors.foreground }]}>{value}</Text>
      <View style={styles.detailLabelRow}>
        <Text style={[styles.detailLabel, { color }]}>{label}</Text>
        <Ionicons name={icon} size={16} color={color} />
      </View>
    </View>
  );
}

function FieldLabel({ text }: { text: string }) {
  const { colors } = useThemePreference();

  return <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{text}</Text>;
}

const cardShadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.08,
  shadowRadius: 18,
  elevation: 5,
} as const;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  keyboardAvoiding: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    backgroundColor: 'rgba(242,242,247,0.94)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    position: 'absolute',
    left: 72,
    right: 72,
    textAlign: 'center',
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x15,
    fontWeight: FontWeight.bold,
    color: Colors.foreground,
  },
  headerSpacer: { width: 36 },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: Dimensions.radiusFull,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
  },
  content: { paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.lg },
  errorTitle: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.foreground,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: Spacing.md,
    borderRadius: Dimensions.radiusButton,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  retryText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
  hero: { height: 208, overflow: 'hidden' },
  heroImage: { ...StyleSheet.absoluteFillObject },
  titleCard: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: Dimensions.radiusCard,
    padding: Spacing.lg,
    backgroundColor: Colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    ...cardShadow,
  },
  eventTitle: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x17,
    fontWeight: FontWeight.extrabold,
    lineHeight: 29,
    color: Colors.foreground,
    textAlign: 'right',
    marginBottom: Spacing.sm,
  },
  quickInfoWrap: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  infoPill: {
    maxWidth: '100%',
    minHeight: 34,
    borderRadius: 14,
    paddingHorizontal: Spacing.sm,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
  },
  infoPillText: {
    maxWidth: 220,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.semibold,
    textAlign: 'right',
  },
  tabs: {
    flexDirection: 'row-reverse',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: 2,
  },
  tabButton: {
    minHeight: 40,
    borderRadius: 16,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  tabButtonInactive: { backgroundColor: Colors.secondary },
  tabText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.mutedForeground,
  },
  tabTextActive: { color: '#fff' },
  tabContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, gap: Spacing.md },
  card: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: Dimensions.radiusCard,
    padding: Spacing.lg,
    backgroundColor: Colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    ...cardShadow,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.foreground,
    textAlign: 'right',
  },
  sectionTitleNoMargin: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.foreground,
    textAlign: 'right',
  },
  description: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x13,
    lineHeight: 24,
    color: Colors.mutedForeground,
    textAlign: 'right',
  },
  detailRow: {
    minHeight: 48,
    borderRadius: 16,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.xs,
    backgroundColor: Colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  detailValue: {
    flex: 1,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.foreground,
    textAlign: 'left',
  },
  detailLabelRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  detailLabel: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.bold,
  },
  attendanceHeader: {
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  attendanceTitleRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  capacityPill: {
    borderRadius: 12,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
  },
  capacityText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.bold,
  },
  progressTrack: {
    height: 10,
    borderRadius: Dimensions.radiusFull,
    overflow: 'hidden',
    backgroundColor: Colors.secondary,
  },
  progressFill: { height: '100%', borderRadius: Dimensions.radiusFull },
  progressLabels: {
    marginTop: Spacing.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xs,
    color: Colors.mutedForeground,
  },
  agendaItem: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  agendaTime: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agendaHour: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.black,
    color: '#fff',
  },
  agendaMinute: {
    marginTop: -5,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
  agendaTextBox: {
    flex: 1,
    borderRadius: 16,
    padding: Spacing.md,
    backgroundColor: Colors.secondary,
    alignItems: 'flex-end',
  },
  agendaTitle: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.foreground,
    textAlign: 'right',
  },
  agendaDescription: {
    marginTop: 2,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    color: Colors.mutedForeground,
    textAlign: 'right',
  },
  speakerCard: {
    marginHorizontal: Spacing.md,
    borderRadius: Dimensions.radiusCard,
    overflow: 'hidden',
    backgroundColor: Colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    ...cardShadow,
  },
  speakerBar: { height: 4 },
  speakerContent: {
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  speakerInfo: { flex: 1, alignItems: 'flex-end' },
  speakerName: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.foreground,
  },
  speakerRole: {
    marginTop: 2,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    color: Colors.mutedForeground,
  },
  profilePill: {
    marginTop: Spacing.sm,
    borderRadius: 12,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  profilePillText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  speakerAvatar: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakerInitials: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.black,
    color: '#fff',
  },
  successBanner: {
    marginHorizontal: Spacing.md,
    borderRadius: 18,
    padding: Spacing.md,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: SemanticColors.green,
  },
  successTextBox: { flex: 1, alignItems: 'flex-end' },
  successTitle: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
  successSub: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    color: 'rgba(255,255,255,0.82)',
  },
  registeredCard: {
    marginHorizontal: Spacing.md,
    borderRadius: Dimensions.radiusCard,
    padding: Spacing.xl,
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    ...cardShadow,
  },
  registeredIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registeredTitle: {
    marginTop: Spacing.md,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.foreground,
  },
  registeredText: {
    marginTop: 4,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    color: Colors.mutedForeground,
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: Spacing.lg,
    borderRadius: 16,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: `${SemanticColors.red}12`,
  },
  cancelButtonText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: SemanticColors.red,
  },
  fieldLabel: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.semibold,
    color: Colors.mutedForeground,
    textAlign: 'right',
  },
  input: {
    minHeight: 50,
    borderRadius: 18,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.secondary,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    color: Colors.foreground,
  },
  yearGrid: {
    flexDirection: 'row-reverse',
    gap: Spacing.xs,
  },
  yearButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearButtonInactive: { backgroundColor: Colors.secondary },
  yearButtonText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.mutedForeground,
  },
  yearButtonTextActive: { color: '#fff' },
  warningBox: {
    marginHorizontal: Spacing.md,
    borderRadius: 18,
    padding: Spacing.md,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: `${SemanticColors.orange}12`,
  },
  warningText: {
    flex: 1,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: SemanticColors.orange,
    textAlign: 'right',
  },
  submitButton: {
    marginHorizontal: Spacing.md,
    minHeight: 54,
    borderRadius: 18,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...cardShadow,
  },
  submitButtonText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    backgroundColor: 'rgba(242,242,247,0.94)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  bottomRegisterButton: {
    minHeight: 54,
    borderRadius: 18,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...cardShadow,
  },
  bottomRegisterText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.42)' },
  shareSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.md,
    paddingTop: 12,
    backgroundColor: Colors.card,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    marginBottom: Spacing.md,
    backgroundColor: Colors.border,
  },
  shareTitle: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.foreground,
    textAlign: 'center',
  },
  shareSub: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    color: Colors.mutedForeground,
    textAlign: 'center',
  },
  shareButton: {
    minHeight: 50,
    borderRadius: 18,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  shareButtonText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.45 },
});
