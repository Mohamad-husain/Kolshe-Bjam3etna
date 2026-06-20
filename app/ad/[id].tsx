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
import { useCreateProductOfferMutation } from '@/hooks/mutations/use-offer-mutations';
import { useProductAdDetailsQuery } from '@/hooks/queries/use-explore-queries';
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

function formatPrice(value: number | undefined, currency: string) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return `0 ${currency}`;
  const text = Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.00$/, '');
  return `${text} ${currency}`;
}

export default function AdDetailRoute() {
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
  const [meetLocation, setMeetLocation] = useState('');

  const adQuery = useProductAdDetailsQuery(id);
  const createOfferMutation = useCreateProductOfferMutation();
  const startDirectChatMutation = useStartDirectChat();
  const ad = adQuery.data;
  const coverImage = ad?.imageUrls[0] ?? null;

  const seller = useMemo(() => ({
    name: ad?.owner.name || t('detail.student'),
    initials: ad?.owner.initials || t('detail.studentInitial'),
    imageUrl: ad?.owner.imageUrl ?? null,
    rating: 4.7,
    sales: 8,
    department: ad?.owner.major || t('detail.universityStudent'),
    joined: t('detail.memberSince'),
  }), [ad?.owner, t]);

  const resetOfferForm = () => {
    setShowOfferForm(false);
    setSubmitted(false);
    setOfferPrice('');
    setOfferMessage('');
    setMeetLocation('');
  };

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace({ pathname: '/(tabs)/explore', params: { tab: 'marketplace' } });
  };

  const submitOffer = async () => {
    if (!id || !offerPrice.trim() || !meetLocation.trim()) {
      return;
    }

    try {
      await createOfferMutation.mutateAsync({
        targetId: id,
        price: Number(offerPrice),
        availability: meetLocation,
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

  const shareAd = async () => {
    if (!ad) return;

    await Share.share({
      title: ad.title,
      message: `${ad.title}\n${ad.description}`,
    });
  };

  const openSellerChat = async () => {
    if (!ad?.owner.id) {
      Alert.alert(t('detail.openChatError'), t('detail.noSellerAccount'));
      return;
    }

    try {
      const conversationId = await startDirectChatMutation.mutateAsync({
        otherUserId: ad.owner.id,
      });

      router.push({
        pathname: '/chat/[conversationId]',
        params: {
          conversationId,
          otherUserName: seller.name,
          otherUserAvatarUrl: seller.imageUrl ?? '',
        },
      });
    } catch (error) {
      Alert.alert(
        t('detail.openChatError'),
        error instanceof Error ? error.message : t('detail.unexpectedError'),
      );
    }
  };

  if (adQuery.isLoading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={SemanticColors.orange} />
        </View>
      </SafeAreaView>
    );
  }

  if (adQuery.isError || !ad) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <HeaderIcon icon="arrow-back" onPress={goBack} />
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>{t('detail.adDetails')}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.center}>
          <Text style={[styles.errorTitle, { color: colors.foreground }]}>{t('detail.adLoadError')}</Text>
          <Pressable style={styles.retryButton} onPress={() => adQuery.refetch()}>
            <Text style={styles.retryText}>{t('common.retry')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const priceLabel = formatPrice(ad.price, t('detail.currency'));
  const isSubmitDisabled =
    !offerPrice.trim() || !meetLocation.trim() || createOfferMutation.isPending;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar style={effectiveTheme === 'dark' ? 'light' : 'dark'} />
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={styles.headerActions}>
          <HeaderIcon
            icon={isSaved ? 'heart' : 'heart-outline'}
            color={isSaved ? SemanticColors.red : colors.foreground}
            onPress={() => setIsSaved((current) => !current)}
          />
          <HeaderIcon icon="share-social-outline" onPress={shareAd} />
        </View>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{t('detail.adDetails')}</Text>
        <HeaderIcon icon="arrow-back" onPress={goBack} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroCard, { backgroundColor: colors.secondary }]}>
          {coverImage ? (
            <Image source={{ uri: coverImage }} style={styles.heroImage} contentFit="cover" />
          ) : (
            <View style={styles.heroPlaceholder}>
              <View style={styles.heroIconCircle}>
                <Ionicons name="bag-outline" size={42} color={`${SemanticColors.orange}99`} />
              </View>
              <Text style={[styles.heroPlaceholderText, { color: colors.mutedForeground }]}>{t('detail.productImage')}</Text>
            </View>
          )}
        </View>

        <View style={styles.badgeRow}>
          <View style={styles.conditionPill}>
            <Text style={styles.conditionPillText}>{ad.condition}</Text>
          </View>
          <View style={[styles.categoryPill, { backgroundColor: `${colors.primary}18` }]}>
            <Text style={[styles.categoryPillText, { color: colors.primary }]}>{ad.category}</Text>
          </View>
          <Text style={styles.priceText}>{priceLabel}</Text>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.adTitle, { color: colors.foreground }]}>{ad.title}</Text>
          <Text style={[styles.adDescription, { color: colors.mutedForeground }]}>{ad.description}</Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.metaRow}>
            <View style={styles.postedRow}>
              <Text style={[styles.postedText, { color: colors.mutedForeground }]}>{formatPostedAt(ad.createdAtUtc, t)}</Text>
              <Ionicons name="time-outline" size={14} color={colors.mutedForeground} />
            </View>
            <View style={styles.postedRow}>
              <Text style={[styles.postedText, { color: colors.mutedForeground }]}>{t('detail.campus')}</Text>
              <Ionicons name="location-outline" size={14} color={colors.mutedForeground} />
            </View>
          </View>
        </View>

        <View style={[styles.sellerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t('detail.seller')}</Text>
          <View style={styles.sellerRow}>
            <View style={styles.sellerInfo}>
              <Text style={[styles.sellerName, { color: colors.foreground }]}>{seller.name}</Text>
              <Text style={[styles.sellerDepartment, { color: colors.mutedForeground }]}>{seller.department}</Text>
              <View style={styles.sellerMetaRow}>
                <Text style={[styles.sellerMetaText, { color: colors.mutedForeground }]}>{seller.joined}</Text>
                <Text style={[styles.sellerDivider, { color: `${colors.mutedForeground}55` }]}>|</Text>
                <Text style={[styles.sellerMetaText, { color: colors.mutedForeground }]}>{t('detail.salesCount', { count: seller.sales })}</Text>
                <Text style={[styles.sellerDivider, { color: `${colors.mutedForeground}55` }]}>|</Text>
                <View style={styles.ratingRow}>
                  <Text style={[styles.ratingText, { color: colors.foreground }]}>{seller.rating}</Text>
                  <Ionicons name="star" size={12} color={SemanticColors.orange} />
                </View>
              </View>
            </View>
            <View style={styles.sellerAvatar}>
              {seller.imageUrl ? (
                <Image source={{ uri: seller.imageUrl }} style={styles.sellerAvatarImage} contentFit="cover" />
              ) : (
                <Text style={styles.sellerAvatarText}>{seller.initials}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipText}>
            {t('detail.buyerSafetyTip')}
          </Text>
          <Ionicons name="shield-checkmark-outline" size={18} color={SemanticColors.orange} />
        </View>

        <Pressable
          disabled={startDirectChatMutation.isPending}
          onPress={openSellerChat}
          style={({ pressed }) => [
            styles.secondaryButton,
            { backgroundColor: `${SemanticColors.orange}14`, borderColor: `${SemanticColors.orange}30` },
            startDirectChatMutation.isPending && styles.disabled,
            pressed && !startDirectChatMutation.isPending && styles.pressed,
          ]}
        >
          {startDirectChatMutation.isPending ? (
            <ActivityIndicator size="small" color={SemanticColors.orange} />
          ) : (
            <Ionicons name="chatbubble-ellipses-outline" size={19} color={SemanticColors.orange} />
          )}
          <Text style={styles.secondaryButtonText}>{t('detail.contactSeller')}</Text>
        </Pressable>

        <Pressable
          onPress={() => setShowOfferForm(true)}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        >
          <Ionicons name="send-outline" size={20} color="#fff" />
          <Text style={styles.primaryButtonText}>{t('detail.submitOffer')}</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={showOfferForm} transparent animationType="slide" onRequestClose={resetOfferForm}>
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
                <Text style={[styles.successText, { color: colors.mutedForeground }]}>{t('detail.offerSentSeller')}</Text>
                <Pressable style={styles.doneButton} onPress={resetOfferForm}>
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
                    <Ionicons name="bag-outline" size={17} color={SemanticColors.orange} />
                  </View>
                  <View style={styles.summaryTextBox}>
                    <Text style={[styles.summaryTitle, { color: colors.foreground }]} numberOfLines={2}>{ad.title}</Text>
                    <Text style={[styles.summarySub, { color: colors.mutedForeground }]}>
                      {t('detail.requestedPrice')} <Text style={styles.summaryPrice}>{priceLabel}</Text>
                    </Text>
                  </View>
                </View>

                <FieldLabel text={t('detail.yourPrice')} />
                <View style={[styles.inputShell, { backgroundColor: colors.secondary }]}>
                  <Text style={[styles.currencyText, { color: colors.mutedForeground }]}>{t('detail.currency')}</Text>
                  <TextInput
                    value={offerPrice}
                    onChangeText={setOfferPrice}
                    placeholder={t('detail.yourPrice')}
                    placeholderTextColor={`${colors.mutedForeground}88`}
                    keyboardType="numeric"
                    style={[styles.input, { color: colors.foreground }]}
                    textAlign="right"
                  />
                </View>

                <FieldLabel text={t('detail.meetLocation')} />
                <View style={[styles.inputShell, { backgroundColor: colors.secondary }]}>
                  <Ionicons name="location-outline" size={17} color={`${colors.mutedForeground}88`} />
                  <TextInput
                    value={meetLocation}
                    onChangeText={setMeetLocation}
                    placeholder={t('detail.meetLocationPlaceholder')}
                    placeholderTextColor={`${colors.mutedForeground}88`}
                    style={[styles.input, { color: colors.foreground }]}
                    textAlign="right"
                  />
                </View>

                <FieldLabel text={t('detail.offerMessageSeller')} />
                <TextInput
                  value={offerMessage}
                  onChangeText={setOfferMessage}
                  placeholder={t('detail.offerMessageSellerPlaceholder')}
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
                    { backgroundColor: SemanticColors.orange, shadowColor: SemanticColors.orange },
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
    backgroundColor: SemanticColors.orange,
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
    borderRightColor: SemanticColors.orange,
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
    backgroundColor: `${SemanticColors.orange}14`,
  },
  heroPlaceholderText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    color: `${Colors.mutedForeground}AA`,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  conditionPill: {
    borderRadius: Dimensions.radiusFull,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    backgroundColor: `${SemanticColors.green}16`,
  },
  conditionPillText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
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
    fontSize: FontSize.x11,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  priceText: {
    marginLeft: 'auto',
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: SemanticColors.orange,
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
  adTitle: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x17,
    fontWeight: FontWeight.bold,
    lineHeight: 28,
    color: Colors.foreground,
    textAlign: 'right',
  },
  adDescription: {
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
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  postedRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5 },
  postedText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xs,
    color: Colors.mutedForeground,
  },
  sellerCard: {
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
  sellerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  sellerInfo: { flex: 1, alignItems: 'flex-end' },
  sellerName: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.foreground,
  },
  sellerDepartment: {
    marginTop: 2,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    color: Colors.mutedForeground,
  },
  sellerMetaRow: {
    marginTop: Spacing.xs,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  sellerMetaText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    color: Colors.mutedForeground,
  },
  sellerDivider: { color: `${Colors.mutedForeground}55` },
  ratingRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 2 },
  ratingText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.semibold,
    color: Colors.foreground,
  },
  sellerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SemanticColors.orange,
    overflow: 'hidden',
  },
  sellerAvatarImage: { width: '100%', height: '100%' },
  sellerAvatarText: {
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
    backgroundColor: SemanticColors.orange,
    shadowColor: SemanticColors.orange,
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
    backgroundColor: `${SemanticColors.orange}12`,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${SemanticColors.orange}30`,
  },
  secondaryButtonText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: SemanticColors.orange,
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
    backgroundColor: `${SemanticColors.orange}14`,
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
  summaryPrice: { color: SemanticColors.orange, fontWeight: FontWeight.bold },
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
    backgroundColor: SemanticColors.orange,
  },
  doneButtonText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
});
