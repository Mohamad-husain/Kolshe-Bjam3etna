import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { EventCardData } from '@/types/explore';
import { Colors, FontFamily, FontSize, FontWeight, SemanticColors } from '@/styles/ui-theme';
import { HomeSectionHeader, HomeStateBlock } from './home-shared';
import { dateParts } from './home-utils';

type HomeEventsSectionProps = {
  isLoading: boolean;
  isError: boolean;
  events: EventCardData[];
  onPressMore: () => void;
  onPressCard: (item: EventCardData) => void;
};

export function HomeEventsSection({
  isLoading,
  isError,
  events,
  onPressMore,
  onPressCard,
}: HomeEventsSectionProps) {
  return (
    <View style={styles.sec}>
      <HomeSectionHeader title="فعاليات قادمة" icon="calendar-outline" color={SemanticColors.violet} bg="rgba(175,82,222,0.1)" onPress={onPressMore} />
      {isLoading ? (
        <HomeStateBlock color={SemanticColors.violet} loading empty="لا توجد فعاليات حالياً" />
      ) : isError ? (
        <HomeStateBlock color={SemanticColors.violet} error empty="لا توجد فعاليات حالياً" />
      ) : events.length === 0 ? (
        <HomeStateBlock color={SemanticColors.violet} empty="لا توجد فعاليات حالياً" />
      ) : (
        <View style={styles.vList}>
          {events.map((item, index) => {
            const d = dateParts(item.date);
            const p = item.maxCount > 0 ? Math.min(item.registeredCount / item.maxCount, 1) : 0;
            return (
              <Pressable key={item.id} onPress={() => onPressCard(item)} style={({ pressed }) => [styles.event, index > 0 && styles.vGap, pressed && styles.pressed]}>
                <View style={styles.eventDate}>
                  <View style={styles.dateBadge}>
                    <Text style={styles.dateMonth}>{d.month}</Text>
                    <Text style={styles.dateDay}>{d.day}</Text>
                  </View>
                  <View style={styles.track}>
                    <View style={[styles.fill, { width: `${p * 100}%` }]} />
                  </View>
                  <Text style={styles.count}>
                    {item.registeredCount}/{item.maxCount}
                  </Text>
                </View>
                <View style={styles.eventBody}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text numberOfLines={2} style={styles.cardDesc}>
                    {item.description}
                  </Text>
                  <View style={styles.eventMetaRow}>
                    <View style={styles.metaItem}>
                      <Text style={styles.smallStrong}>{item.time}</Text>
                      <Ionicons name="time-outline" size={12} color={Colors.mutedForeground} />
                    </View>
                    <View style={styles.metaItem}>
                      <Text numberOfLines={1} style={styles.smallStrong}>
                        {item.location}
                      </Text>
                      <Ionicons name="location-outline" size={12} color={Colors.mutedForeground} />
                    </View>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const cardShadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.06,
  shadowRadius: 12,
  elevation: 4,
} as const;

const styles = StyleSheet.create({
  sec: {
    paddingTop: 20, paddingBottom: 8
  },
  vList: {
    gap: 8
  },
  vGap: {
    marginTop: 8
  },
  event: {
    flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 14, borderRadius: 24, backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(60,60,67,0.05)', padding: 16, ...cardShadow
  },
  eventDate: {
    alignItems: 'center'
  },
  dateBadge: {
    width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(175,82,222,0.08)'
  },
  dateMonth: {
    color: Colors.mutedForeground, fontFamily: FontFamily.cairo, fontSize: FontSize.x11, fontWeight: FontWeight.semibold
  },
  dateDay: {
    color: SemanticColors.violet, fontFamily: FontFamily.cairo, fontSize: FontSize.lg, fontWeight: FontWeight.extrabold, lineHeight: 26
  },
  track: {
    width: 40, height: 4, borderRadius: 999, backgroundColor: Colors.secondary, overflow: 'hidden', marginTop: 8
  },
  fill: {
    height: '100%', borderRadius: 999, backgroundColor: SemanticColors.violet
  },
  count: {
    marginTop: 4, color: Colors.mutedForeground, fontFamily: FontFamily.cairo, fontSize: FontSize.xxs
  },
  eventBody: {
    flex: 1
  },
  cardTitle: {
    color: Colors.foreground, fontFamily: FontFamily.cairo, fontSize: FontSize.md, fontWeight: FontWeight.bold, textAlign: 'right', lineHeight: 22
  },
  cardDesc: {
    marginTop: 6, marginBottom: 16, color: Colors.mutedForeground, fontFamily: FontFamily.cairo, fontSize: FontSize.sm, lineHeight: 21, textAlign: 'right'
  },
  eventMetaRow: {
    flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'flex-end', gap: 12, flexWrap: 'wrap'
  },
  metaItem: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 4
  },
  smallStrong: {
    color: Colors.mutedForeground, fontFamily: FontFamily.cairo, fontSize: FontSize.x11, fontWeight: FontWeight.medium
  },
  pressed: {
    transform: [{ scale: 0.97 }]
  },
});
