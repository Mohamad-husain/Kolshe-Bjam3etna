import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  Colors,
  FontFamily,
  FontSize,
  FontWeight,
  SemanticColors,
} from '@/styles/ui-theme';

type RegisteredEventItem = {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  color: string;
};

type ProfileEventCardProps = {
  event: RegisteredEventItem;
  onCancelRegistration: () => void;
};

export function ProfileEventCard({
  event,
  onCancelRegistration,
}: ProfileEventCardProps) {
  return (
    <View style={[styles.card, { borderRightColor: event.color }]}>
      <View style={styles.eventHeader}>
        <View style={styles.eventOrganizerBadge}>
          <Text style={styles.eventOrganizerText}>{event.organizer}</Text>
        </View>

        <View style={[styles.eventIconWrap, { backgroundColor: `${event.color}18` }]}>
          <Ionicons name="calendar-outline" size={20} color={event.color} />
        </View>
      </View>

      <Text style={styles.eventTitle}>{event.title}</Text>

      <View style={styles.eventMetaWrap}>
        <View style={styles.eventMetaPill}>
          <Ionicons name="calendar-outline" size={12} color={Colors.mutedForeground} />
          <Text style={styles.eventMetaText}>{event.date}</Text>
        </View>
        <View style={styles.eventMetaPill}>
          <Ionicons name="time-outline" size={12} color={Colors.mutedForeground} />
          <Text style={styles.eventMetaText}>{event.time}</Text>
        </View>
        <View style={styles.eventMetaPill}>
          <Ionicons name="location-outline" size={12} color={Colors.mutedForeground} />
          <Text style={styles.eventMetaText}>{event.location}</Text>
        </View>
      </View>

      <View style={styles.separator} />

      <View style={styles.priceRow}>
        <View style={styles.registeredState}>
          <Ionicons name="checkmark-circle" size={14} color={SemanticColors.green} />
          <Text style={styles.registeredStateText}>مسجّل</Text>
        </View>
        <Pressable
          onPress={onCancelRegistration}
          style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
        >
          <Text style={styles.cancelButtonText}>إلغاء التسجيل</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 1,
    borderRightWidth: 4,
    borderColor: 'rgba(60,60,67,0.06)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 4,
  },
  eventHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventOrganizerBadge: {
    minHeight: 32,
    borderRadius: 999,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(120,120,128,0.08)',
  },
  eventOrganizerText: {
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  eventIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventTitle: {
    marginTop: 14,
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    textAlign: 'right',
  },
  eventMetaWrap: {
    marginTop: 14,
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
  },
  eventMetaPill: {
    minHeight: 34,
    borderRadius: 14,
    paddingHorizontal: 10,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(120,120,128,0.08)',
  },
  eventMetaText: {
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.medium,
  },
  separator: {
    height: 1,
    marginTop: 14,
    backgroundColor: 'rgba(60,60,67,0.08)',
  },
  priceRow: {
    marginTop: 12,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  registeredState: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  registeredStateText: {
    color: SemanticColors.green,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.bold,
  },
  cancelButton: {
    minHeight: 36,
    borderRadius: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,59,48,0.10)',
  },
  cancelButtonText: {
    color: SemanticColors.red,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.semibold,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
