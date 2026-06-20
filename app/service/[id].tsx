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

import { useAppSettings, type TranslationKey } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import { useStartDirectChat } from '@/hooks/chat/mutations/use-start-direct-chat';
import { useCreateServiceOfferMutation } from '@/hooks/mutations/use-offer-mutations';
import { useServiceDetailsQuery } from '@/hooks/queries/use-explore-queries';
import { toAbsoluteImageUrl } from '@/services/media';
import {
  Colors,
  Dimensions,
  FontFamily,
  FontSize,
  FontWeight,
  SemanticColors,
  Spacing,
} from '@/styles/ui-theme';

function getParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function formatPostedAt(value: string | undefined, t: (key: TranslationKey, values?: Record<string, string | number>) => string) {
  if (!value) return t('detail.postedRecently');

  const createdAt = new Date(value);
  if (Number.isNaN(createdAt.getTime())) return t('detail.postedRecently');

  const diffHours = Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / 3_600_000));

  if (diffHours < 1) return t('detail.postedNow');
  if (diffHours === 1) return t('detail.postedHour');
  if (diffHours < 24) return t('detail.postedHours', { count: diffHours });

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return t('detail.postedDay');
  return t('detail.postedDays', { count: diffDays });
}

function isServiceExpired(deadlineUtc?: string) {
  if (!deadlineUtc) return false;

  const deadline = new Date(deadlineUtc);
  return !Number.isNaN(deadline.getTime()) && deadline.getTime() < Date.now();
}

export default function ServiceDetailRoute() {
  const { t } = useAppSettings();
  const { colors, effectiveTheme } = useThemePreference();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = getParam(params.id);
  const insets = useSafeAreaInsets();
  const [isSaved, setIsSaved] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [availability, setAvailability] = useState('');

  const serviceQuery = useServiceDetailsQuery(id);
  const createOfferMutation = useCreateServiceOfferMutation();
  const startDirectChatMutation = useStartDirectChat();
  const service = serviceQuery.data;
  const attachmentImage = toAbsoluteImageUrl(
    service?.attachments.find((item) => item.fileUrl)?.fileUrl ?? null,
  );

  const poster = useMemo(() => {
    const owner = service?.owner;

    return {
      name: owner?.name || t('detail.student'),
      initials: owner?.initials || t('detail.studentInitial'),
      imageUrl: owner?.imageUrl?.trim() || null,
      rating: 4.8,
      tasks: 12,
      university: t('home.universityFallback'),
      department: owner?.major || t('detail.universityStudent'),
      joined: t('detail.memberSince'),
    };
  }, [service?.owner, t]);

  const resetOfferForm = () => {
    setShowOfferForm(false);
    setSubmitted(false);
    setOfferPrice('');
    setOfferMessage('');
    setAvailability('');
  };

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace({ pathname: '/(tabs)/explore', params: { tab: 'services' } });
  };

  const submitOffer = async () => {
    if (isServiceExpired(service?.deadlineUtc)) {
      Alert.alert(t('detail.serviceExpiredTitle'), t('detail.serviceExpiredBody'));
      return;
    }

    if (!id || !offerPrice.trim() || !availability.trim()) {
      return;
    }

    try {
      await createOfferMutation.mutateAsync({
        targetId: id,
        price: Number(offerPrice),
        availability,
        message: offerMessage,
      });
      setSubmitted(true);
    } catch (error) {
      Alert.alert(
        t('profile.acceptOfferError'),
        error instanceof Error ? error.message : t('detail.unexpectedError'),
      );
    }
  };

  const shareService = async () => {
    if (!service) return;

    await Share.share({
      title: service.title,
      message: `${service.title}\n${service.description}`,
    });
  };

  const openOwnerChat = async () => {
    if (!service?.owner.id) {
      Alert.alert(t('detail.openChatError'), t('detail.noOwnerAccount'));
      return;
    }

    try {
      const conversationId = await startDirectChatMutation.mutateAsync({
        otherUserId: service.owner.id,
      });

      router.push({
        pathname: '/chat/[conversationId]',
        params: {
          conversationId,
          otherUserName: poster.name,
          otherUserAvatarUrl: poster.imageUrl ?? '',
        },
      });
    } catch (error) {
      Alert.alert(
        t('detail.openChatError'),
        error instanceof Error ? error.message : t('detail.unexpectedError'),
      );
    }
  };

  if (serviceQuery.isLoading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (serviceQuery.isError || !service) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <HeaderIcon icon="arrow-back" onPress={goBack} />
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>{t('detail.serviceDetails')}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.center}>
          <Text style={[styles.errorTitle, { color: colors.foreground }]}>{t('detail.serviceLoadError')}</Text>
          <Pressable style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={() => serviceQuery.refetch()}>
            <Text style={styles.retryText}>{t('common.retry')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const priceLabel = `${service.pricePerHour} ${t('explore.shekelPerHour')}`;
  const isExpired = isServiceExpired(service.deadlineUtc);
  const serviceStatusColor = isExpired ? SemanticColors.red : SemanticColors.green;
  const isSubmitDisabled =
    isExpired || !offerPrice.trim() || !availability.trim() || createOfferMutation.isPending;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar style={effectiveTheme === 'dark' ? 'light' : 'dark'} />
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={styles.headerActions}>
          <HeaderIcon
            icon={isSaved ? 'bookmark' : 'bookmark-outline'}
            color={isSaved ? colors.primary : colors.foreground}
            onPress={() => setIsSaved((current) => !current)}
          />
          <HeaderIcon icon="share-social-outline" onPress={shareService} />
        </View>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{t('detail.serviceDetails')}</Text>
        <HeaderIcon icon="arrow-back" onPress={goBack} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroCard, { backgroundColor: colors.secondary }]}>
          {attachmentImage ? (
            <Image source={{ uri: attachmentImage }} style={styles.heroImage} contentFit="cover" />
          ) : (
            <View style={styles.heroPlaceholder}>
              <View style={styles.heroIconCircle}>
                <Ionicons name="school-outline" size={42} color={`${SemanticColors.green}99`} />
              </View>
              <Text style={[styles.heroPlaceholderText, { color: colors.mutedForeground }]}>{t('detail.serviceImage')}</Text>
            </View>
          )}
        </View>

        <View style={styles.badgeRow}>
          <View style={styles.pricePill}>
            <Text style={styles.pricePillText}>{priceLabel}</Text>
          </View>
          <View style={[styles.categoryPill, { backgroundColor: `${colors.primary}18` }]}>
            <Text style={[styles.categoryPillText, { color: colors.primary }]}>{service.category}</Text>
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.serviceTitle, { color: colors.foreground }]}>{service.title}</Text>
          <Text style={[styles.serviceDescription, { color: colors.mutedForeground }]}>{service.description}</Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.metaRow}>
            <View style={styles.deadlinePill}>
              <Ionicons name="time-outline" size={14} color={SemanticColors.orange} />
              <Text style={styles.deadlineText}>{service.deadline}</Text>
            </View>
            <View style={styles.postedRow}>
              <Text style={[styles.postedText, { color: colors.mutedForeground }]}>{formatPostedAt(service.createdAtUtc, t)}</Text>
              <Ionicons name="time-outline" size={14} color={colors.mutedForeground} />
            </View>
          </View>
        </View>

        <View style={[styles.statusBanner, { backgroundColor: `${serviceStatusColor}14` }]}>
          <Text style={[styles.statusText, { color: serviceStatusColor }]}>
            {isExpired ? t('detail.closedForOffers') : t('detail.openForOffers')}
          </Text>
          <View style={[styles.statusDot, { backgroundColor: serviceStatusColor }]} />
        </View>

        <View style={[styles.posterCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t('detail.owner')}</Text>
          <View style={styles.posterRow}>
            <View style={styles.posterInfo}>
              <Text style={[styles.posterName, { color: colors.foreground }]}>{poster.name}</Text>
              <Text style={[styles.posterDepartment, { color: colors.mutedForeground }]}>{poster.department}</Text>
              <View style={styles.posterMetaRow}>
                <Text style={[styles.posterMetaText, { color: colors.mutedForeground }]}>{poster.joined}</Text>
                <Text style={[styles.posterDivider, { color: `${colors.mutedForeground}55` }]}>|</Text>
                <Text style={[styles.posterMetaText, { color: colors.mutedForeground }]}>{t('detail.tasksCount', { count: poster.tasks })}</Text>
                <Text style={[styles.posterDivider, { color: `${colors.mutedForeground}55` }]}>|</Text>
                <View style={styles.ratingRow}>
                  <Text style={[styles.ratingText, { color: colors.foreground }]}>{poster.rating}</Text>
                  <Ionicons name="star" size={12} color={SemanticColors.orange} />
                </View>
              </View>
            </View>
            <View style={styles.posterAvatar}>
              {poster.imageUrl ? (
                <Image source={{ uri: poster.imageUrl }} style={styles.posterAvatarImage} contentFit="cover" />
              ) : (
                <Text style={styles.posterAvatarText}>{poster.initials}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipText}>
            {t('detail.serviceTip')}
          </Text>
          <Ionicons name="shield-checkmark-outline" size={18} color={SemanticColors.orange} />
        </View>

        <Pressable
          disabled={startDirectChatMutation.isPending}
          onPress={openOwnerChat}
          style={({ pressed }) => [
            styles.secondaryButton,
            { backgroundColor: `${colors.primary}14`, borderColor: `${colors.primary}30` },
            startDirectChatMutation.isPending && styles.disabled,
            pressed && !startDirectChatMutation.isPending && styles.pressed,
          ]}
        >
          {startDirectChatMutation.isPending ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="chatbubble-ellipses-outline" size={19} color={colors.primary} />
          )}
          <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>{t('detail.contactOwner')}</Text>
        </Pressable>

        <Pressable
          disabled={isExpired}
          onPress={() => setShowOfferForm(true)}
          style={({ pressed }) => [
            styles.primaryButton,
            {
              backgroundColor: isExpired ? colors.mutedForeground : colors.primary,
              shadowColor: isExpired ? colors.mutedForeground : colors.primary,
            },
            isExpired && styles.disabled,
            pressed && !isExpired && styles.pressed,
          ]}
        >
          <Ionicons name="send-outline" size={20} color="#fff" />
          <Text style={styles.primaryButtonText}>
            {isExpired ? t('detail.closedForOffers') : t('detail.submitOffer')}
          </Text>
        </Pressable>
      </ScrollView>

      <Modal
        visible={showOfferForm}
        transparent
        animationType="slide"
        onRequestClose={resetOfferForm}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
          style={styles.modalRoot}
        >
          <Pressable style={styles.modalBackdrop} onPress={resetOfferForm} />
          <View style={[styles.sheet, { backgroundColor: colors.background, paddingBottom: insets.bottom + 18 }]}>
            <View style={[styles.sheetHandle, { backgroundColor: `${colors.mutedForeground}40` }]} />

            {submitted ? (
              <View style={styles.successContent}>
                <View style={styles.successIcon}>
                  <Ionicons name="checkmark-circle-outline" size={38} color={SemanticColors.green} />
                </View>
                <Text style={[styles.successTitle, { color: colors.foreground }]}>{t('detail.offerSentTitle')}</Text>
                <Text style={[styles.successText, { color: colors.mutedForeground }]}>{t('detail.offerSentOwner')}</Text>
                <Pressable style={[styles.doneButton, { backgroundColor: colors.primary }]} onPress={resetOfferForm}>
                  <Text style={styles.doneButtonText}>{t('detail.done')}</Text>
                </Pressable>
              </View>
            ) : (
              <ScrollView
                automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
                keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.sheetHeader}>
                  <HeaderIcon icon="close" onPress={() => setShowOfferForm(false)} />
                  <Text style={[styles.sheetTitle, { color: colors.foreground }]}>{t('detail.submitOffer')}</Text>
                  <View style={styles.headerSpacer} />
                </View>

                <View style={[styles.summaryBox, { backgroundColor: colors.secondary }]}>
                  <View style={styles.summaryIcon}>
                    <Ionicons name="send-outline" size={17} color={colors.primary} />
                  </View>
                  <View style={styles.summaryTextBox}>
                    <Text style={[styles.summaryTitle, { color: colors.foreground }]} numberOfLines={2}>
                      {service.title}
                    </Text>
                    <Text style={[styles.summarySub, { color: colors.mutedForeground }]}>
                      {t('detail.serviceSuggestedPrice')} <Text style={[styles.summaryPrice, { color: colors.primary }]}>{priceLabel}</Text>
                    </Text>
                  </View>
                </View>

                <FieldLabel text={t('detail.yourPrice')} />
                <View style={[styles.inputShell, { backgroundColor: colors.secondary }]}>
                  <Text style={[styles.currencyText, { color: colors.mutedForeground }]}>{t('detail.currency')}</Text>
                  <TextInput
                    value={offerPrice}
                    onChangeText={setOfferPrice}
                    placeholder={t('detail.servicePricePlaceholder')}
                    placeholderTextColor={`${colors.mutedForeground}88`}
                    keyboardType="numeric"
                    style={[styles.input, { color: colors.foreground }]}
                    textAlign="right"
                  />
                </View>

                <FieldLabel text={t('detail.serviceAvailability')} />
                <View style={[styles.inputShell, { backgroundColor: colors.secondary }]}>
                  <Ionicons name="time-outline" size={17} color={`${colors.mutedForeground}88`} />
                  <TextInput
                    value={availability}
                    onChangeText={setAvailability}
                    placeholder={t('detail.serviceAvailabilityPlaceholder')}
                    placeholderTextColor={`${colors.mutedForeground}88`}
                    style={[styles.input, { color: colors.foreground }]}
                    textAlign="right"
                  />
                </View>

                <FieldLabel text={t('detail.serviceOfferMessage')} />
                <TextInput
                  value={offerMessage}
                  onChangeText={setOfferMessage}
                  placeholder={t('detail.serviceOfferMessagePlaceholder')}
                  placeholderTextColor={`${colors.mutedForeground}88`}
                  multiline
                  numberOfLines={4}
                  style={[
                    styles.inputShell,
                    styles.textArea,
                    { backgroundColor: colors.secondary, color: colors.foreground },
                  ]}
                  textAlign="right"
                  textAlignVertical="top"
                />

                <Pressable
                  onPress={submitOffer}
                  disabled={isSubmitDisabled}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    styles.sheetSubmitButton,
                    { backgroundColor: colors.primary, shadowColor: colors.primary },
                    isSubmitDisabled && styles.disabled,
                    pressed && !isSubmitDisabled && styles.pressed,
                  ]}
                >
                  {createOfferMutation.isPending ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="send-outline" size={20} color="#fff" />
                  )}
                  <Text style={styles.primaryButtonText}>{t('detail.sendOffer')}</Text>
                </Pressable>
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function HeaderIcon({
  icon,
  onPress,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  color?: string;
}) {
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
      <Ionicons name={icon} size={18} color={color ?? colors.foreground} />
    </Pressable>
  );
}

function FieldLabel({ text }: { text: string }) {
  const { colors } = useThemePreference();

  return <Text style={[styles.fieldLabel, { color: colors.foreground }]}>{text}</Text>;
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
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  headerTitle: {
    position: 'absolute',
    left: 72,
    right: 72,
    textAlign: 'center',
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x17,
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
  content: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Dimensions.radiusButton,
    backgroundColor: Colors.primary,
  },
  retryText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
  heroCard: {
    height: 170,
    borderRadius: Dimensions.radiusCard,
    overflow: 'hidden',
    borderRightWidth: 4,
    borderRightColor: SemanticColors.green,
    backgroundColor: Colors.secondary,
    ...cardShadow,
  },
  heroImage: { width: '100%', height: '100%' },
  heroPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  heroIconCircle: {
    width: 82,
    height: 82,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${SemanticColors.green}14`,
  },
  heroPlaceholderText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    color: `${Colors.mutedForeground}AA`,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  pricePill: {
    borderRadius: Dimensions.radiusFull,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    backgroundColor: `${SemanticColors.green}16`,
  },
  pricePillText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: SemanticColors.green,
  },
  categoryPill: {
    borderRadius: Dimensions.radiusFull,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    backgroundColor: `${Colors.primary}12`,
  },
  categoryPillText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  infoCard: {
    marginTop: Spacing.md,
    borderRadius: Dimensions.radiusCard,
    padding: Spacing.lg,
    backgroundColor: Colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    ...cardShadow,
  },
  serviceTitle: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x17,
    fontWeight: FontWeight.bold,
    lineHeight: 28,
    color: Colors.foreground,
    textAlign: 'right',
  },
  serviceDescription: {
    marginTop: Spacing.sm,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    lineHeight: 25,
    color: Colors.mutedForeground,
    textAlign: 'right',
  },
  divider: { height: 1, backgroundColor: Colors.border, marginTop: Spacing.md },
  metaRow: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deadlinePill: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
    borderRadius: Dimensions.radiusFull,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 7,
    backgroundColor: `${SemanticColors.orange}12`,
  },
  deadlineText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.semibold,
    color: SemanticColors.orange,
  },
  postedRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5 },
  postedText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xs,
    color: Colors.mutedForeground,
  },
  statusBanner: {
    marginTop: Spacing.md,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    borderRadius: 18,
    paddingVertical: 12,
    backgroundColor: `${SemanticColors.green}12`,
  },
  statusText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: SemanticColors.green,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: SemanticColors.green,
  },
  posterCard: {
    marginTop: Spacing.md,
    borderRadius: Dimensions.radiusCard,
    padding: Spacing.md,
    backgroundColor: Colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    ...cardShadow,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.foreground,
    textAlign: 'right',
  },
  posterRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  posterInfo: { flex: 1, alignItems: 'flex-end' },
  posterName: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.foreground,
  },
  posterDepartment: {
    marginTop: 2,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    color: Colors.mutedForeground,
  },
  posterMetaRow: {
    marginTop: Spacing.xs,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  posterMetaText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    color: Colors.mutedForeground,
  },
  posterDivider: { color: `${Colors.mutedForeground}55` },
  ratingRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 2 },
  ratingText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.semibold,
    color: Colors.foreground,
  },
  posterAvatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SemanticColors.green,
    overflow: 'hidden',
  },
  posterAvatarImage: {
    width: '100%',
    height: '100%',
  },
  posterAvatarText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
  tipCard: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderRadius: 18,
    padding: Spacing.md,
    backgroundColor: `${SemanticColors.orange}10`,
  },
  tipText: {
    flex: 1,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    lineHeight: 20,
    color: SemanticColors.orange,
    textAlign: 'right',
  },
  primaryButton: {
    marginTop: Spacing.lg,
    minHeight: 54,
    borderRadius: 18,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 6,
  },
  primaryButtonText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
  secondaryButton: {
    marginTop: Spacing.lg,
    minHeight: 52,
    borderRadius: 18,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: `${Colors.primary}12`,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${Colors.primary}25`,
  },
  secondaryButtonText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  sheet: {
    maxHeight: '90%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.md,
    paddingTop: 12,
    backgroundColor: Colors.background,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    marginBottom: Spacing.md,
    backgroundColor: `${Colors.mutedForeground}40`,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sheetTitle: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.foreground,
  },
  summaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: 18,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    backgroundColor: Colors.secondary,
  },
  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${Colors.primary}14`,
  },
  summaryTextBox: { flex: 1, alignItems: 'flex-end' },
  summaryTitle: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.foreground,
    textAlign: 'right',
  },
  summarySub: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xs,
    color: Colors.mutedForeground,
    textAlign: 'right',
  },
  summaryPrice: { color: Colors.primary, fontWeight: FontWeight.bold },
  fieldLabel: {
    marginBottom: Spacing.xs,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.foreground,
    textAlign: 'right',
  },
  inputShell: {
    marginBottom: Spacing.md,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: 18,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.secondary,
    fontFamily: FontFamily.cairo,
    color: Colors.foreground,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    color: Colors.foreground,
  },
  currencyText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xs,
    color: Colors.mutedForeground,
  },
  textArea: {
    minHeight: 106,
    paddingTop: 12,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  sheetSubmitButton: { marginTop: Spacing.sm, marginBottom: Spacing.md },
  disabled: { opacity: 0.42 },
  successContent: { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.md },
  successIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${SemanticColors.green}14`,
  },
  successTitle: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.foreground,
  },
  successText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    color: Colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 22,
  },
  doneButton: {
    marginTop: Spacing.xs,
    borderRadius: 18,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
  },
  doneButtonText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
});
