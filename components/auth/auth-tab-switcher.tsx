import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AUTH_COPY } from '@/lib/auth/auth-copy';
import {
  Colors,
  FontFamily,
  FontWeight,
} from '@/styles/ui-theme';

export type AuthTab = 'login' | 'register';

type AuthTabSwitcherProps = {
  activeTab: AuthTab;
  onTabChange: (tab: AuthTab) => void;
};

const AUTH_TABS: { label: string; value: AuthTab }[] = [
  { label: AUTH_COPY.loginTab, value: 'login' },
  { label: AUTH_COPY.registerTab, value: 'register' },
];

export function AuthTabSwitcher({ activeTab, onTabChange }: AuthTabSwitcherProps) {
  return (
    <View style={styles.segment}>
      {AUTH_TABS.map((tab) => {
        const isActive = activeTab === tab.value;

        return (
          <Pressable
            key={tab.value}
            onPress={() => onTabChange(tab.value)}
            style={[styles.segmentButton, isActive && styles.segmentButtonActive]}
          >
            <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  segment: {
    flexDirection: 'row-reverse',
    width: '100%',
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
    writingDirection: 'rtl',
  },
  segmentTextActive: {
    color: Colors.foreground,
  },
});
