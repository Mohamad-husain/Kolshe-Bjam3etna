import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Colors,
  Dimensions,
  FontFamily,
  FontSize,
  FontWeight,
  SemanticColors,
} from '@/styles/ui-theme';

type AddMenuItem = {
  title: string;
  description: string;
  href: '/new-service' | '/new-ad' | '/new-exchange';
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  softColor: string;
  borderColor: string;
};

const menuItems: AddMenuItem[] = [
  {
    title: 'إضافة طلب خدمة',
    description: 'لطلب مساعدة دراسية أو عرض مهارة',
    href: '/new-service',
    icon: 'briefcase-outline',
    color: SemanticColors.blue,
    softColor: 'rgba(37,99,235,0.10)',
    borderColor: 'rgba(37,99,235,0.16)',
  },
  {
    title: 'إضافة إعلان بيع',
    description: 'لبيع الكتب والإلكترونيات والمستلزمات',
    href: '/new-ad',
    icon: 'bag-handle-outline',
    color: SemanticColors.orange,
    softColor: 'rgba(255,149,0,0.10)',
    borderColor: 'rgba(255,149,0,0.16)',
  },
  {
    title: 'إضافة طلب تبادل',
    description: 'لتبادل الكتب والأغراض مع زملائك',
    href: '/new-exchange',
    icon: 'swap-horizontal-outline',
    color: SemanticColors.green,
    softColor: 'rgba(52,199,89,0.10)',
    borderColor: 'rgba(52,199,89,0.16)',
  },
];

export default function AddMenuRoute() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.screen}>
        <View style={styles.primaryGlow} pointerEvents="none" />
        <View style={styles.secondaryGlow} pointerEvents="none" />

        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + Dimensions.bottomNavigationHeight + 32 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.headerSide} />

            <View style={styles.titleRow}>
              <Text style={styles.title}>إضافة جديد</Text>
            </View>

            <View style={styles.headerSide} />
          </View>

          <View style={styles.sheet}>
            <Text style={styles.sectionLabel}>اختر نوع المحتوى</Text>

            <View style={styles.cardsList}>
              {menuItems.map((item) => (
                <Pressable
                  key={item.title}
                  accessibilityRole="button"
                  accessibilityLabel={item.title}
                  onPress={() => router.push(item.href)}
                  style={({ pressed }) => [
                    styles.optionCard,
                    {
                      borderColor: item.borderColor,
                      shadowColor: item.color,
                    },
                    pressed && styles.optionCardPressed,
                  ]}
                >
                  <View style={[styles.iconShell, { backgroundColor: item.softColor, borderColor: item.borderColor }]}>
                    <Ionicons name={item.icon} size={27} color={item.color} />
                  </View>

                  <View style={styles.copyBlock}>
                    <Text style={styles.optionTitle}>{item.title}</Text>
                    <Text style={styles.optionDescription}>{item.description}</Text>
                  </View>

                  <View style={styles.chevronWrap}>
                    <Ionicons name="chevron-back" size={18} color="rgba(142,142,147,0.8)" />
                  </View>
                </Pressable>
              ))}
            </View>

            <Text style={styles.helperText}>اختر القسم الذي تريد البدء به</Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f4f8',
  },
  screen: {
    flex: 1,
    backgroundColor: '#f3f4f8',
  },
  primaryGlow: {
    position: 'absolute',
    top: 110,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(37,99,235,0.08)',
  },
  secondaryGlow: {
    position: 'absolute',
    bottom: 90,
    left: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(90,200,250,0.08)',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  headerSide: {
    width: 46,
    height: 46,
  },
  titleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flex: 1,
  },
  title: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: 18,
    fontWeight: FontWeight.extrabold,
  },
  sheet: {
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.06)',
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 6,
  },
  sectionLabel: {
    color: '#a1a1aa',
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
  },
  cardsList: {
    marginTop: 18,
    gap: 14,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
  },
  optionCardPressed: {
    transform: [{ scale: 0.985 }],
  },
  iconShell: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  copyBlock: {
    flex: 1,
    marginHorizontal: 14,
    alignItems: 'flex-end',
  },
  optionTitle: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: 17,
    fontWeight: FontWeight.bold,
    textAlign: 'right',
  },
  optionDescription: {
    marginTop: 3,
    color: '#9ca3af',
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    textAlign: 'right',
  },
  chevronWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(60,60,67,0.05)',
  },
  helperText: {
    marginTop: 18,
    color: '#b0b0b7',
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
});
