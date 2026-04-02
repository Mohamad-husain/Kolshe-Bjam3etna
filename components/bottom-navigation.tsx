import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Colors,
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
  label: string;
  screen: Screen;
};

type BottomNavigationProps = {
  currentScreen: Screen;
  onChangeScreen: (screen: Screen) => void;
};

const navItems: NavItem[] = [
  { icon: IconSet.nav[0], label: 'الرئيسية', screen: 'home' },
  { icon: IconSet.nav[1], label: 'استكشف', screen: 'explore' },
  { icon: IconSet.nav[2], label: '', screen: 'add-menu' },
  { icon: IconSet.nav[3], label: 'الرسائل', screen: 'messages' },
  { icon: IconSet.nav[4], label: 'حسابي', screen: 'profile' },
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
  const containerPaddingBottom = Math.max(insets.bottom, 10);

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View style={styles.nav}>
        <View style={styles.topShimmer} />

        <View
          style={[
            styles.row,
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
                  accessibilityLabel="إضافة جديد"
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
                accessibilityLabel={item.label}
                onPress={() => onChangeScreen(item.screen)}
                style={({ pressed }) => [styles.tabButton, pressed && styles.tabPressed]}
              >
                {isActive && <View style={styles.activePill} />}

                <View style={styles.iconWrap}>
                  <Ionicons
                    name={iconName}
                    size={22}
                    color={isActive ? Colors.primary : Colors.mutedForeground}
                  />
                </View>

                <Text
                  style={[
                    styles.label,
                    {
                      color: isActive ? Colors.primary : Colors.mutedForeground,
                      fontWeight: isActive ? FontWeight.bold : FontWeight.medium,
                    },
                  ]}
                >
                  {item.label}
                </Text>

                {isActive && <View style={styles.activeDot} />}
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
    direction: 'rtl',
  },
  nav: {
    backgroundColor: Colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  topShimmer: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.9)',
    opacity: 0.85,
  },
  row: {
    flexDirection: 'row-reverse',
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
    backgroundColor: Colors.secondary,
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
    backgroundColor: Colors.primary,
  },
});
