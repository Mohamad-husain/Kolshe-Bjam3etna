import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppSettings } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import { FontFamily, FontSize, FontWeight } from '@/styles/ui-theme';

const profileTabs = [
  'offers',
  'ads',
  'services',
  'exchange',
  'events',
] as const;

export type ProfileTab = (typeof profileTabs)[number];

const tabLabels: Record<ProfileTab, 'profile.offers' | 'profile.ads' | 'profile.services' | 'profile.exchange' | 'profile.events'> = {
  offers: 'profile.offers',
  ads: 'profile.ads',
  services: 'profile.services',
  exchange: 'profile.exchange',
  events: 'profile.events',
};

export function ProfileTabsBar({
  activeTab,
  pendingOffers,
  onChangeTab,
}: {
  activeTab: ProfileTab;
  pendingOffers: number;
  onChangeTab: (tab: ProfileTab) => void;
}) {
  const { t } = useAppSettings();
  const { colors } = useThemePreference();

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
                { backgroundColor: colors.secondary },
                isActive && [
                  styles.tabButtonActive,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ],
                pressed && styles.pressed,
              ]}
            >
              {tab === 'offers' ? (
                <View style={styles.tabLabelRow}>
                  {pendingOffers ? (
                    <View style={styles.tabBadge}>
                      <Text style={styles.tabBadgeText}>{pendingOffers}</Text>
                    </View>
                  ) : null}
                  <Text
                    style={[
                      styles.tabText,
                      { color: isActive ? colors.foreground : colors.mutedForeground },
                      isActive && styles.tabTextActive,
                    ]}
                  >
                    {t(tabLabels[tab])}
                  </Text>
                </View>
              ) : (
                <Text
                  style={[
                    styles.tabText,
                    { color: isActive ? colors.foreground : colors.mutedForeground },
                    isActive && styles.tabTextActive,
                  ]}
                >
                  {t(tabLabels[tab])}
                </Text>
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
  },
  tabButtonActive: {
    borderWidth: 1,
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
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  tabTextActive: {
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
