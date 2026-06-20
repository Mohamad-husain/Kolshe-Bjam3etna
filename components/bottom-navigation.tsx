import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppSettings } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import {
  Dimensions,
  FontFamily,
  FontSize,
  FontWeight,
  IconSet,
  SemanticColors,
} from '@/styles/ui-theme';

export type Screen = 'home' | 'explore' | 'add-menu' | 'messages' | 'profile';

type NavItem = {
  icon: (typeof IconSet.nav)[number];
  labelKey: 'nav.home' | 'nav.explore' | 'nav.add' | 'nav.messages' | 'nav.profile';
  screen: Screen;
};

type BottomNavigationProps = {
  currentScreen: Screen;
  onChangeScreen: (screen: Screen) => void;
};

const navItems: NavItem[] = [
  { icon: IconSet.nav[0], labelKey: 'nav.home', screen: 'home' },
  { icon: IconSet.nav[1], labelKey: 'nav.explore', screen: 'explore' },
  { icon: IconSet.nav[2], labelKey: 'nav.add', screen: 'add-menu' },
  { icon: IconSet.nav[3], labelKey: 'nav.messages', screen: 'messages' },
  { icon: IconSet.nav[4], labelKey: 'nav.profile', screen: 'profile' },
];

function toIoniconName(icon: (typeof IconSet.nav)[number], active: boolean) {
  if (icon === 'Home') {
    return active ? 'home' : 'home-outline';
  }

  if (icon === 'Compass') {
    return active ? 'compass' : 'compass-outline';
  }

  if (icon === 'MessageCircle') {
    return active ? 'chatbubble' : 'chatbubble-outline';
  }

  if (icon === 'User') {
    return active ? 'person' : 'person-outline';
  }

  return 'add';
}

export function BottomNavigation({ currentScreen, onChangeScreen }: BottomNavigationProps) {
  const insets = useSafeAreaInsets();
  const { t, isRtl } = useAppSettings();
  const { colors } = useThemePreference();
  const containerPaddingBottom = Math.max(insets.bottom, 10);

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View
        style={[
          styles.nav,
          { backgroundColor: colors.background, borderTopColor: colors.border },
        ]}
      >
        <View style={styles.topShimmer} />

        <View
          style={[
            styles.row,
            { flexDirection: isRtl ? 'row-reverse' : 'row' },
            { paddingBottom: containerPaddingBottom, paddingTop: 8 },
          ]}
        >
          {navItems.map((item) => {
            const isCenter = item.screen === 'add-menu';
            const isActive = currentScreen === item.screen;

            if (isCenter) {
              return (
                <Pressable
                  key={item.screen}
                  accessibilityRole="button"
                  accessibilityLabel={t('nav.add')}
                  onPress={() => onChangeScreen('add-menu')}
                  style={({ pressed }) => [
                    styles.centerButton,
                    pressed && styles.centerButtonPressed,
                  ]}
                >
                  <Ionicons name={toIoniconName(item.icon, true)} size={24} color="#ffffff" />
                  <View style={styles.innerGlow} pointerEvents="none" />
                </Pressable>
              );
            }

            const iconName = toIoniconName(item.icon, isActive);

            return (
              <Pressable
                key={item.screen}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={t(item.labelKey)}
                onPress={() => onChangeScreen(item.screen)}
                style={({ pressed }) => [styles.tabButton, pressed && styles.tabPressed]}
              >
                {isActive && (
                  <View style={[styles.activePill, { backgroundColor: colors.secondary }]} />
                )}

                <View style={styles.iconWrap}>
                  <Ionicons
                    name={iconName}
                    size={22}
                    color={isActive ? colors.primary : colors.mutedForeground}
                  />
                </View>

                <Text
                  style={[
                    styles.label,
                    {
                      color: isActive ? colors.primary : colors.mutedForeground,
                      fontWeight: isActive ? FontWeight.bold : FontWeight.medium,
                    },
                  ]}
                >
                  {t(item.labelKey)}
                </Text>

                {isActive && (
                  <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const shadow: ViewStyle = {
  shadowColor: SemanticColors.blue,
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.45,
  shadowRadius: 12,
  elevation: 7,
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    // Lock the nav layout so app-level RTL does not flip tab order.
    writingDirection: 'ltr',
  },
  nav: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  topShimmer: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.9)',
    opacity: 0.85,
  },
  row: {
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    minHeight: Dimensions.bottomNavigationHeight,
  },
  centerButton: {
    marginTop: -Dimensions.fabLift,
    height: Dimensions.fabSize,
    width: Dimensions.fabSize,
    borderRadius: Dimensions.radiusFull,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SemanticColors.blue,
    ...shadow,
  },
  centerButtonPressed: {
    transform: [{ scale: 0.92 }],
  },
  innerGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: Dimensions.radiusFull,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  tabButton: {
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 3,
  },
  tabPressed: {
    transform: [{ scale: 0.96 }],
  },
  activePill: {
    position: 'absolute',
    left: -6,
    right: -6,
    top: -4,
    bottom: -2,
    borderRadius: Dimensions.radiusButton,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: FontSize.x11,
    lineHeight: 14,
    fontFamily: FontFamily.cairo,
    textAlign: 'center',
  },
  activeDot: {
    position: 'absolute',
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
