import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { quickAccess } from './home-utils';
import type { ExploreTab, SectionKey } from './home-types';
import { useAppSettings } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import { FontFamily, FontSize, FontWeight } from '@/styles/ui-theme';

export function HomeQuickAccess({
  showOffers,
  onExplore,
  onSection,
  onNewService,
}: {
  showOffers: boolean;
  onExplore: (tab: ExploreTab) => void;
  onSection: (key: SectionKey) => void;
  onNewService: () => void;
}) {
  const { t, isRtl } = useAppSettings();
  const { colors } = useThemePreference();

  return (
    <View style={styles.quickWrap}>
      <View
        style={[
          styles.quickCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            flexDirection: isRtl ? 'row-reverse' : 'row',
          },
        ]}
      >
        {quickAccess.map((item) => (
          <Pressable
            key={item.labelKey}
            onPress={() => {
              if ('route' in item) {
                onNewService();
                return;
              }

              if ('tab' in item) {
                onExplore(item.tab);
                return;
              }

              if (showOffers) {
                onSection(item.section);
              }
            }}
            style={({ pressed }) => [styles.quickItem, pressed && styles.pressed]}
          >
            <View style={[styles.quickIcon, { backgroundColor: item.bg }]}>
              <Ionicons name={item.icon} size={22} color={item.color} />
            </View>
            <Text style={[styles.quickTxt, { color: colors.foreground }]}>
              {t(item.labelKey)}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  quickWrap: {
    marginTop: 18, paddingHorizontal: 16, zIndex: 3,
  },
  quickCard: {
    justifyContent: 'space-between',
    borderRadius: 24,
    paddingHorizontal: 10,
    paddingVertical: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18, elevation: 6,
  },
  quickItem: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
  },
  quickIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTxt: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
