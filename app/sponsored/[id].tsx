import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemePreference } from '@/contexts/theme-preference-context';
import { usePartnerOfferDetailsQuery } from '@/hooks/queries/use-explore-queries';
import {
  Colors,
  Dimensions,
  FontFamily,
  FontSize,
  FontWeight,
  SemanticColors,
  Spacing,
} from '@/styles/ui-theme';

const PROMO_CODE = 'STUDENT30';

function getParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function getOfferPalette(type?: 'academy' | 'store') {
  return type === 'academy'
    ? {
      color: SemanticColors.violet,
      secondColor: Colors.primary,
      icon: 'ribbon-outline' as const,
      label: 'أكاديمية معتمدة',
      gradient: ['#af52de', '#2563eb'] as const,
    }
    : {
      color: SemanticColors.orange,
      secondColor: SemanticColors.red,
      icon: 'business-outline' as const,
      label: 'متجر موثق',
      gradient: ['#ff9500', '#ff3b30'] as const,
    };
}

export default function SponsoredDetailRoute() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = getParam(params.id);
  const insets = useSafeAreaInsets();
  const { colors } = useThemePreference();
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const offerQuery = usePartnerOfferDetailsQuery(id);
  const offer = offerQuery.data;
  const palette = getOfferPalette(offer?.type);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/sponsored');
  };

  const copyPromoCode = async () => {
    await Clipboard.setStringAsync(PROMO_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = offer
    ? `${offer.name}\n${offer.offerTitle}\n${offer.offerDetails}`
    : 'عرض خاص من كلشي بجامعتنا';

  const copyShareText = async () => {
    await Clipboard.setStringAsync(shareText);
    setCopied(true);
    setShowShareModal(false);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = async () => {
    const url = `whatsapp://send?text=${encodeURIComponent(shareText)}`;

    try {
      await Linking.openURL(url);
    } catch {
      await Share.share({ message: shareText });
    } finally {
      setShowShareModal(false);
    }
  };

  const openEmail = async () => {
    if (!offer?.contactEmail) {
      Alert.alert('غير متوفر', 'لا يوجد بريد إلكتروني لهذا العرض');
      return;
    }

    await Linking.openURL(`mailto:${offer.contactEmail}`);
  };

  const openPhone = async () => {
    if (!offer?.contactPhone) {
      Alert.alert('غير متوفر', 'لا يوجد رقم هاتف لهذا العرض');
      return;
    }

    await Linking.openURL(`tel:${offer.contactPhone}`);
  };

  const openLocation = async () => {
    if (!offer?.location) {
      Alert.alert('غير متوفر', 'لا يوجد موقع لهذا العرض');
      return;
    }

    const query = encodeURIComponent(offer.location);
    await Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  if (offerQuery.isLoading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={palette.color} />
        </View>
      </SafeAreaView>
    );
  }

  if (offerQuery.isError || !offer) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <HeaderIcon icon="arrow-back" onPress={goBack} />
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>تفاصيل العرض</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.center}>
          <Text style={[styles.errorTitle, { color: colors.foreground }]}>تعذر تحميل تفاصيل العرض</Text>
          <Pressable style={[styles.retryButton, { backgroundColor: palette.color }]} onPress={() => offerQuery.refetch()}>
            <Text style={styles.retryText}>إعادة المحاولة</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const hasDiscount = typeof offer.discount === 'number' && offer.discount > 0;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <HeaderIcon icon="share-social-outline" onPress={() => setShowShareModal(true)} />
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>تفاصيل العرض</Text>
        <HeaderIcon icon="arrow-back" onPress={goBack} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient colors={palette.gradient} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} style={styles.hero}>
          {offer.imageUrl ? (
            <Image source={{ uri: offer.imageUrl }} style={styles.heroImage} contentFit="cover" />
          ) : null}
          <View style={styles.heroOverlay} />
          <View style={styles.heroCenter}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{offer.category}</Text>
            </View>
            <Text style={styles.heroName}>{offer.name}</Text>
          </View>
          {hasDiscount ? (
            <View style={styles.discountBadge}>
              <Text style={styles.discountValue}>{offer.discount}%</Text>
              <Text style={styles.discountLabel}>خصم</Text>
            </View>
          ) : null}
        </LinearGradient>

        <View style={styles.titleBlock}>
          <View style={styles.topMetaRow}>
            <View style={[styles.typePill, { backgroundColor: `${palette.color}14` }]}>
              <Ionicons name={palette.icon} size={15} color={palette.color} />
              <Text style={[styles.typePillText, { color: palette.color }]}>{palette.label}</Text>
            </View>
            {offer.verified ? (
              <View style={styles.verifiedRow}>
                <Ionicons name="checkmark-circle" size={16} color={SemanticColors.green} />
                <Text style={styles.verifiedText}>موثق</Text>
              </View>
            ) : null}
          </View>
          <Text style={[styles.offerName, { color: colors.foreground }]}>{offer.name}</Text>
          <Text style={[styles.description, { color: colors.mutedForeground }]}>{offer.description}</Text>
        </View>

        <View style={[styles.ratingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.ratingInfo}>
            <Text style={[styles.ratingCount, { color: colors.foreground }]}>{offer.reviews ?? 0} تقييم</Text>
            <Text style={[styles.ratingSub, { color: `${colors.mutedForeground}BB` }]}>من الطلاب والمستخدمين</Text>
          </View>
          <View style={styles.ratingValueRow}>
            <Ionicons name="star" size={24} color={SemanticColors.orange} />
            <Text style={[styles.ratingValue, { color: colors.foreground }]}>{offer.rating ?? 0}</Text>
          </View>
        </View>

        <View style={[styles.mainOfferCard, { backgroundColor: colors.card, borderColor: `${palette.color}35` }]}>
          <Text style={[styles.offerEyebrow, { color: palette.color }]}>العرض الحصري</Text>
          <Text style={[styles.offerTitle, { color: palette.color }]}>{offer.offerTitle}</Text>
          <Text style={[styles.offerDetails, { color: colors.foreground }]}>{offer.offerDetails}</Text>

          {hasDiscount ? (
            <Pressable
              onPress={copyPromoCode}
              style={({ pressed }) => [
                styles.promoButton,
                { backgroundColor: `${palette.color}10`, borderColor: `${palette.color}30` },
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.promoAction}>
                <Ionicons name={copied ? 'checkmark-circle-outline' : 'copy-outline'} size={16} color={palette.color} />
                <Text style={[styles.promoActionText, { color: palette.color }]}>
                  {copied ? 'تم النسخ!' : 'نسخ الرمز'}
                </Text>
              </View>
              <Text style={[styles.promoCode, { color: palette.color }]}>{PROMO_CODE}</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={[styles.expiryBox, { backgroundColor: colors.secondary }]}>
          <Ionicons name="time-outline" size={16} color={colors.mutedForeground} />
          <Text style={[styles.expiryText, { color: colors.mutedForeground }]}>
            ينتهي العرض في: {offer.expiryDate ?? 'غير محدد'}
          </Text>
        </View>

        <View style={styles.contactBlock}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>تواصل معنا</Text>
          <ContactRow
            icon="mail-outline"
            title={offer.contactEmail ?? 'غير متوفر'}
            subtitle="البريد الإلكتروني"
            color={palette.color}
            onPress={openEmail}
          />
          <ContactRow
            icon="call-outline"
            title={offer.contactPhone ?? 'غير متوفر'}
            subtitle="رقم الهاتف"
            color={palette.color}
            onPress={openPhone}
          />
          <ContactRow
            icon="location-outline"
            title={offer.location ?? 'غير متوفر'}
            subtitle="الموقع"
            color={palette.color}
            onPress={openLocation}
          />
        </View>
      </ScrollView>

      <Modal visible={showShareModal} transparent animationType="slide" onRequestClose={() => setShowShareModal(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowShareModal(false)} />
          <View style={[styles.shareSheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 24 }]}>
            <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.shareTitle, { color: colors.foreground }]}>شارك هذا العرض</Text>
            <View style={styles.shareActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.shareSecondary,
                  { backgroundColor: colors.secondary },
                  pressed && styles.pressed,
                ]}
                onPress={copyShareText}
              >
                <Text style={[styles.shareSecondaryText, { color: colors.mutedForeground }]}>نسخ النص</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.sharePrimary,
                  { backgroundColor: palette.color },
                  pressed && styles.pressed,
                ]}
                onPress={shareOnWhatsApp}
              >
                <Text style={styles.sharePrimaryText}>شارك على WhatsApp</Text>
              </Pressable>
            </View>
            <Pressable style={({ pressed }) => [styles.closeShare, pressed && styles.pressed]} onPress={() => setShowShareModal(false)}>
              <Text style={styles.closeShareText}>إغلاق</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function HeaderIcon({
  icon,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
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
      <Ionicons name={icon} size={18} color={colors.mutedForeground} />
    </Pressable>
  );
}

function ContactRow({
  icon,
  title,
  subtitle,
  color,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
}) {
  const { colors } = useThemePreference();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.contactRow,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.contactText}>
        <Text style={[styles.contactTitle, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.contactSubtitle, { color: `${colors.mutedForeground}BB` }]}>{subtitle}</Text>
      </View>
      <Ionicons name={icon} size={20} color={color} />
    </Pressable>
  );
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
  headerTitle: {
    position: 'absolute',
    left: 72,
    right: 72,
    textAlign: 'center',
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.foreground,
  },
  headerSpacer: { width: 36 },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    gap: Spacing.md,
  },
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
  },
  retryText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
  hero: {
    height: 192,
    borderRadius: Dimensions.radiusCard,
    overflow: 'hidden',
    ...cardShadow,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.32,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  heroCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  categoryBadge: {
    borderRadius: Dimensions.radiusFull,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  categoryBadgeText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
  heroName: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.black,
    color: '#fff',
    textAlign: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    minWidth: 70,
    borderRadius: 18,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: SemanticColors.red,
    alignItems: 'center',
    ...cardShadow,
  },
  discountValue: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.black,
    color: '#fff',
  },
  discountLabel: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: 'rgba(255,255,255,0.82)',
  },
  titleBlock: { gap: Spacing.sm },
  topMetaRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  typePill: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.xs,
    borderRadius: Dimensions.radiusFull,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
  },
  typePillText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.bold,
  },
  verifiedRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.semibold,
    color: SemanticColors.green,
  },
  offerName: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.black,
    color: Colors.foreground,
    textAlign: 'right',
  },
  description: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x13,
    lineHeight: 23,
    color: Colors.mutedForeground,
    textAlign: 'right',
  },
  ratingCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 18,
    padding: Spacing.md,
    backgroundColor: Colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    ...cardShadow,
  },
  ratingInfo: { alignItems: 'flex-end' },
  ratingCount: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x13,
    fontWeight: FontWeight.bold,
    color: Colors.foreground,
  },
  ratingSub: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    color: `${Colors.mutedForeground}BB`,
  },
  ratingValueRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5 },
  ratingValue: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.black,
    color: Colors.foreground,
  },
  mainOfferCard: {
    borderRadius: Dimensions.radiusCard,
    padding: Spacing.lg,
    backgroundColor: Colors.card,
    borderWidth: 1,
    ...cardShadow,
  },
  offerEyebrow: {
    marginBottom: 4,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.semibold,
    textAlign: 'right',
  },
  offerTitle: {
    marginBottom: Spacing.sm,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.black,
    textAlign: 'right',
  },
  offerDetails: {
    marginBottom: Spacing.md,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x13,
    lineHeight: 23,
    color: Colors.foreground,
    textAlign: 'right',
  },
  promoButton: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promoAction: { flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.xs },
  promoActionText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.bold,
  },
  promoCode: {
    fontSize: FontSize.x13,
    fontWeight: FontWeight.black,
    letterSpacing: 0,
  },
  expiryBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: Spacing.xs,
    borderRadius: 14,
    padding: Spacing.md,
    backgroundColor: Colors.secondary,
  },
  expiryText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.mutedForeground,
    textAlign: 'right',
  },
  contactBlock: { gap: Spacing.sm },
  sectionTitle: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x13,
    fontWeight: FontWeight.bold,
    color: Colors.foreground,
    textAlign: 'right',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.md,
    borderRadius: 18,
    padding: Spacing.md,
    backgroundColor: Colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    ...cardShadow,
  },
  contactText: { flex: 1, alignItems: 'flex-end' },
  contactTitle: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.foreground,
    textAlign: 'right',
  },
  contactSubtitle: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xs,
    color: `${Colors.mutedForeground}BB`,
    textAlign: 'right',
  },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
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
    marginBottom: Spacing.md,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.foreground,
    textAlign: 'center',
  },
  shareActions: {
    flexDirection: 'row-reverse',
    gap: Spacing.sm,
  },
  sharePrimary: {
    flex: 1,
    minHeight: 46,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sharePrimaryText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
  shareSecondary: {
    flex: 1,
    minHeight: 46,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
  },
  shareSecondaryText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.mutedForeground,
  },
  closeShare: {
    minHeight: 46,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  closeShareText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: SemanticColors.red,
  },
});
