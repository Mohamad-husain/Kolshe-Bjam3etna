import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';

import { adminSections } from '@/lib/admin/admin-config';
import { getAdminShadow, type AdminTheme } from '@/lib/admin/admin-theme';
import type { AdminSection } from '@/types/admin';

import { getHovered } from './shared';
import { styles } from './styles';

export function AdminHero({
  theme,
  activeSection,
  sections = adminSections,
  onChangeSection,
  onBack,
}: {
  theme: AdminTheme;
  activeSection: AdminSection;
  sections?: { key: AdminSection; label: string }[];
  onChangeSection: (section: AdminSection) => void;
  onBack: () => void;
}) {
  const { width } = useWindowDimensions();
  const baseTabWidth = width <= 360 ? 72 : width <= 420 ? 82 : 90;
  const tabsGap = 2;
  const isCompactTabs = sections.length <= 3;

  return (
    <View style={styles.heroShell}>
      <View
        style={[
          styles.hero,
          {
            backgroundColor: theme.heroBackground,
          },
        ]}
      >
        <View pointerEvents="none" style={[styles.heroGlow, { backgroundColor: theme.heroEdge }]} />
        <View pointerEvents="none" style={[styles.heroTint, { backgroundColor: theme.heroTint }]} />

        <Pressable
          onPress={onBack}
          style={(state) => {
            const hovered = getHovered(state);
            return [
            styles.backButton,
            {
              backgroundColor: hovered ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.10)',
              borderColor: 'rgba(255,255,255,0.06)',
            },
            hovered && styles.hoveredLift,
            state.pressed && styles.pressed,
          ];
          }}
        >
          <Ionicons name="arrow-back" size={23} color="#ffffff" />
        </Pressable>

        <View pointerEvents="none" style={styles.heroBrandRow}>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>لوحة الإدارة</Text>
            <Text style={[styles.heroSubtitle, { color: 'rgba(255,255,255,0.60)' }]}>
              إدارة المنصة والمحتوى
            </Text>
          </View>
          <View
            style={[
              styles.shieldWrap,
              {
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderColor: 'rgba(255,255,255,0.10)',
              },
            ]}
          >
            <Ionicons name="shield-checkmark-outline" size={24} color="#ffffff" />
          </View>
        </View>

        <View pointerEvents="none" style={[styles.heroCurve, { backgroundColor: theme.heroCurveFill }]} />
      </View>

      <View style={styles.tabsWrap}>
        <View
          style={[
            styles.tabsRail,
            {
              backgroundColor: theme.heroRailBackground,
              borderColor: theme.heroRailBorder,
            },
          ]}
        >
          <ScrollView
            horizontal
            bounces={false}
            scrollEnabled={!isCompactTabs}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.tabsContent,
              {
                gap: tabsGap,
                justifyContent: isCompactTabs ? 'space-between' : 'flex-start',
              },
              isCompactTabs ? styles.tabsContentCompact : null,
            ]}
            style={styles.tabsScroller}
          >
            {sections.map((item) => {
              const active = item.key === activeSection;

              return (
                <Pressable
                  key={item.key}
                  onPress={() => onChangeSection(item.key)}
                  style={(state) => {
                    const hovered = getHovered(state);
                    return [
                    styles.tabButton,
                    {
                      minWidth: isCompactTabs ? undefined : Math.max(baseTabWidth, item.label.length * 11),
                      flex: isCompactTabs ? 1 : undefined,
                      backgroundColor: active
                        ? theme.isDark
                          ? theme.inputBackground
                          : theme.cardBackground
                        : 'transparent',
                      borderColor: active ? theme.borderStrong : 'transparent',
                    },
                    active ? getAdminShadow(theme) : null,
                    hovered && !active ? styles.tabHovered : null,
                    state.pressed && styles.pressed,
                  ];
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.tabText,
                      { color: active ? theme.heading : theme.mutedText },
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}
