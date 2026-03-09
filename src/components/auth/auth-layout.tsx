import { Ionicons } from '@expo/vector-icons';
import { type PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Colors,
  Dimensions,
  FontFamily,
  FontWeight,
  Spacing,
} from '@src/styles/ui-theme';

export type AuthTab = 'login' | 'register';

type AuthLayoutProps = PropsWithChildren<{
  activeTab: AuthTab;
  onTabChange: (tab: AuthTab) => void;
}>;

export function AuthLayout({ activeTab, onTabChange, children }: AuthLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={styles.topRightBubble} />
      <View style={styles.topLeftBubble} />
      <View style={styles.bottomLeftBubble} />
      <View style={styles.softOverlay} />

      <View
        style={[
          styles.content,
          {
            paddingTop: Math.max(insets.top + 44, 58),
            paddingBottom: Math.max(insets.bottom + 20, 24),
          },
        ]}
      >
        <View style={styles.logoBox}>
          <Ionicons name="school-outline" size={37} color="#ffffff" />
        </View>

        <Text style={styles.title}>كلشي بجامعتنا</Text>
        <Text style={styles.subtitle}>منصتك الجامعية الشاملة للخدمات والتواصل.</Text>

        <View style={styles.segment}>
          <Pressable
            onPress={() => onTabChange('login')}
            style={[styles.segmentButton, activeTab === 'login' && styles.segmentButtonActive]}
          >
            <Text
              style={[
                styles.segmentText,
                activeTab === 'login' && styles.segmentTextActive,
              ]}
            >
              تسجيل الدخول
            </Text>
          </Pressable>

          <Pressable
            onPress={() => onTabChange('register')}
            style={[
              styles.segmentButton,
              activeTab === 'register' && styles.segmentButtonActive,
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                activeTab === 'register' && styles.segmentTextActive,
              ]}
            >
              إنشاء حساب
            </Text>
          </Pressable>
        </View>

        <View style={styles.formCard}>{children}</View>

        <Text style={styles.terms}>
          بالمتابعة، أنت توافق على شروط الاستخدام وسياسة الخصوصية
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ececf1',
    overflow: 'hidden',
    direction: 'ltr',
  },
  softOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(244, 245, 250, 0.82)',
  },
  topRightBubble: {
    position: 'absolute',
    top: -110,
    right: -90,
    width: 360,
    height: 360,
    borderRadius: Dimensions.radiusFull,
    backgroundColor: 'rgba(104, 140, 245, 0.2)',
  },
  topLeftBubble: {
    position: 'absolute',
    top: 260,
    left: -130,
    width: 250,
    height: 250,
    borderRadius: Dimensions.radiusFull,
    backgroundColor: 'rgba(124, 156, 251, 0.11)',
  },
  bottomLeftBubble: {
    position: 'absolute',
    bottom: -110,
    right: -40,
    width: 210,
    height: 210,
    borderRadius: Dimensions.radiusFull,
    backgroundColor: 'rgba(108, 150, 255, 0.12)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 3,
  },
  logoBox: {
    marginBottom: 22,
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: '#2f63e0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2f63e0',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
  },
  title: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: 42 / 2,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: {
    color: '#9d9da4',
    fontFamily: FontFamily.cairo,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 26,
  },
  segment: {
    flexDirection: 'row-reverse',
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#dcdee4',
    borderRadius: 20,
    padding: 3,
    marginBottom: 24,
    gap: 4,
  },
  segmentButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    color: '#a0a0a7',
    fontFamily: FontFamily.cairo,
    fontSize: 14,
    fontWeight: FontWeight.semibold,
  },
  segmentTextActive: {
    color: Colors.foreground,
  },
  formCard: {
    width: '100%',
    maxWidth: 380,
    gap: 10,
  },
  terms: {
    marginTop: 30,
    textAlign: 'center',
    color: '#b1b1b9',
    fontFamily: FontFamily.cairo,
    fontSize: 12,
    lineHeight: 18,
    opacity: 0.9,
  },
});
