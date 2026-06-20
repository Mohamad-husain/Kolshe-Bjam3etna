import { Ionicons } from '@expo/vector-icons';
import { type PropsWithChildren, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppSettings } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import {
  Dimensions,
  FontFamily,
  FontWeight,
} from '@/styles/ui-theme';

type ProfileSetupLayoutProps = PropsWithChildren<{
  step: 1 | 2;
  title: string;
  subtitle: string;
  footer?: ReactNode;
}>;

export function ProfileSetupLayout({
  step,
  title,
  subtitle,
  children,
  footer,
}: ProfileSetupLayoutProps) {
  const insets = useSafeAreaInsets();
  const { isRtl } = useAppSettings();
  const { colors } = useThemePreference();
  const isSecondStep = step === 2;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.topRightBubble} pointerEvents="none" />
      <View style={styles.leftBubble} pointerEvents="none" />
      <View style={styles.bottomBubble} pointerEvents="none" />
      <View style={styles.softOverlay} pointerEvents="none" />

      <ScrollView
        bounces={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top + 18, 34),
            paddingBottom: Math.max(insets.bottom + 24, 28),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.progressRow}>
          {isSecondStep ? (
            <>
              <View style={[styles.progressDot, styles.progressDotActive]} />
              <View style={styles.progressPill} />
            </>
          ) : (
            <>
              <View style={styles.progressPill} />
              <View style={styles.progressDot} />
            </>
          )}
        </View>

        <View style={[styles.iconBox, { backgroundColor: colors.secondary }]}>
          <Ionicons name="school-outline" size={30} color={colors.primary} />
        </View>

        <Text
          style={[
            styles.title,
            { color: colors.foreground, writingDirection: isRtl ? 'rtl' : 'ltr' },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: colors.mutedForeground, writingDirection: isRtl ? 'rtl' : 'ltr' },
          ]}
        >
          {subtitle}
        </Text>

        <View style={styles.body}>{children}</View>

        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  softOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(244, 245, 250, 0.84)',
  },
  topRightBubble: {
    position: 'absolute',
    top: -120,
    right: -100,
    width: 340,
    height: 340,
    borderRadius: Dimensions.radiusFull,
    backgroundColor: 'rgba(87, 126, 241, 0.16)',
  },
  leftBubble: {
    position: 'absolute',
    top: 280,
    left: -120,
    width: 240,
    height: 240,
    borderRadius: Dimensions.radiusFull,
    backgroundColor: 'rgba(118, 151, 246, 0.1)',
  },
  bottomBubble: {
    position: 'absolute',
    bottom: -96,
    right: -24,
    width: 220,
    height: 220,
    borderRadius: Dimensions.radiusFull,
    backgroundColor: 'rgba(118, 151, 246, 0.1)',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 26,
  },
  progressPill: {
    width: 26,
    height: 8,
    borderRadius: Dimensions.radiusFull,
    backgroundColor: '#2563eb',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: Dimensions.radiusFull,
    backgroundColor: 'rgba(60, 60, 67, 0.18)',
  },
  progressDotActive: {
    backgroundColor: '#2563eb',
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: {
    fontFamily: FontFamily.cairo,
    fontSize: 22,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: FontFamily.cairo,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 290,
  },
  body: {
    width: '100%',
    maxWidth: 390,
    marginTop: 30,
    gap: 14,
  },
  footer: {
    width: '100%',
    maxWidth: 390,
    marginTop: 'auto',
    paddingTop: 28,
  },
});
