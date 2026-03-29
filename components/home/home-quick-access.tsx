import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { quickAccess } from './home-utils';
import { styles } from './home-styles';
import type { ExploreTab, SectionKey } from './home-types';

export function HomeQuickAccess({
  showOffers,
  onExplore,
  onSection,
}: {
  showOffers: boolean;
  onExplore: (tab: ExploreTab) => void;
  onSection: (key: SectionKey) => void;
}) {
  return (
    <View style={styles.quickWrap}>
      <View style={styles.quickCard}>
        {quickAccess.map((item) => (
          <Pressable
            key={item.label}
            onPress={() => {
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
            <Text style={styles.quickTxt}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
