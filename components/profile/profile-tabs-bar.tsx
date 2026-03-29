import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Colors, FontFamily, FontSize, FontWeight } from '@/styles/ui-theme';

const profileTabs = [
  'العروض',
  'إعلانات',
  'خدمات',
  'تبادلات',
  'فعالياتي',
] as const;

type ProfileTab = (typeof profileTabs)[number];

export function ProfileTabsBar({
  activeTab,
  pendingOffers,
  onChangeTab,
}: {
  activeTab: ProfileTab;
  pendingOffers: number;
  onChangeTab: (tab: ProfileTab) => void;
}) {
  return (
    <View style={styles.tabsSection}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContent}
      >
        {profileTabs.map((tab) => {
          const isActive = activeTab === tab;

          return (
            <Pressable
              key={tab}
              onPress={() => onChangeTab(tab)}
              style={({ pressed }) => [
                styles.tabButton,
                isActive && styles.tabButtonActive,
                pressed && styles.pressed,
              ]}
            >
              {tab === 'العروض' ? (
                <View style={styles.tabLabelRow}>
                  {pendingOffers ? (
                    <View style={styles.tabBadge}>
                      <Text style={styles.tabBadgeText}>{pendingOffers}</Text>
                    </View>
                  ) : null}
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</Text>
                </View>
              ) : (
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</Text>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabsSection: {
    marginTop: 18,
  },
  tabsContent: {
    flexDirection: 'row-reverse',
    gap: 8,
    paddingHorizontal: 18,
  },
  tabButton: {
    minHeight: 42,
    borderRadius: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(120,120,128,0.08)',
  },
  tabButtonActive: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.08)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  tabLabelRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  tabText: {
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  tabTextActive: {
    color: Colors.foreground,
  },
  tabBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff3b30',
  },
  tabBadgeText: {
    color: '#ffffff',
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xxs,
    fontWeight: FontWeight.bold,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
