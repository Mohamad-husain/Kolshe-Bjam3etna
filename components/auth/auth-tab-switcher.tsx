import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppSettings, type TranslationKey } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import {
  FontFamily,
  FontWeight,
} from '@/styles/ui-theme';

export type AuthTab = 'login' | 'register';

type AuthTabSwitcherProps = {
  activeTab: AuthTab;
  onTabChange: (tab: AuthTab) => void;
};

const AUTH_TABS: { labelKey: TranslationKey; value: AuthTab }[] = [
  { labelKey: 'auth.loginTab', value: 'login' },
  { labelKey: 'auth.registerTab', value: 'register' },
];

export function AuthTabSwitcher({ activeTab, onTabChange }: AuthTabSwitcherProps) {
  const { isRtl, t } = useAppSettings();
  const { colors } = useThemePreference();

  return (
    <View
      style={[
        styles.segment,
        {
          backgroundColor: colors.secondary,
          flexDirection: isRtl ? 'row-reverse' : 'row',
        },
      ]}
    >
      {AUTH_TABS.map((tab) => {
        const isActive = activeTab === tab.value;

        return (
          <Pressable
            key={tab.value}
            onPress={() => onTabChange(tab.value)}
            style={[
              styles.segmentButton,
              isActive && [
                styles.segmentButtonActive,
                { backgroundColor: colors.card },
              ],
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                {
                  color: isActive ? colors.foreground : colors.mutedForeground,
                  writingDirection: isRtl ? 'rtl' : 'ltr',
                },
                isActive && styles.segmentTextActive,
              ]}
            >
              {t(tab.labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  segment: {
    width: '100%',
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontFamily: FontFamily.cairo,
    fontSize: 14,
    fontWeight: FontWeight.semibold,
  },
  segmentTextActive: {
  },
});
