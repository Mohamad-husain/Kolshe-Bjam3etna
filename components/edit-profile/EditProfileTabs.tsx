import { Pressable, StyleSheet, Text, View } from 'react-native';

import { adminEditProfileTabs } from '@/lib/edit-profile/edit-profile-config';
import type { AdminEditProfileTheme } from '@/lib/edit-profile/edit-profile-theme';
import type { AdminEditProfileTab } from '@/types/edit-profile';
import { FontFamily, FontSize, FontWeight } from '@/styles/ui-theme';

export function EditProfileTabs({
  activeTab,
  onChange,
  theme,
}: {
  activeTab: AdminEditProfileTab;
  onChange: (tab: AdminEditProfileTab) => void;
  theme: AdminEditProfileTheme;
}) {
  return (
    <View style={[styles.rail, { backgroundColor: theme.trackBackground }]}>
      {adminEditProfileTabs.map((tab) => {
        const active = activeTab === tab.value;

        return (
          <Pressable
            key={tab.value}
            onPress={() => onChange(tab.value)}
            style={(state) => {
              const hovered = (state as { hovered?: boolean }).hovered === true;

              return [
                styles.tab,
                active && [
                  styles.tabActive,
                  {
                    backgroundColor: theme.activePillBackground,
                    shadowColor: theme.shadow,
                  },
                ],
                hovered && !active && styles.hovered,
                state.pressed && styles.pressed,
              ];
            }}
          >
            <Text
              style={[
                styles.text,
                { color: active ? theme.activePillText : theme.inactivePillText },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    flexDirection: 'row-reverse',
    borderRadius: 24,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    minHeight: 52,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  text: {
    textAlign: 'center',
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
  },
  hovered: {
    opacity: 0.88,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
