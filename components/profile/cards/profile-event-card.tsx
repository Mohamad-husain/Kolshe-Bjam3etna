import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppSettings } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import {
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
  onCancelRegistration?: () => void;
};

export function ProfileEventCard({
  event,
  onCancelRegistration,
}: ProfileEventCardProps) {
  const { isRtl, t } = useAppSettings();
  const { colors } = useThemePreference();
  const rowDirection = isRtl ? 'row-reverse' : 'row';
  const textAlign = isRtl ? 'right' : 'left';

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRightColor: event.color }]}>
      <View style={[styles.eventHeader, { flexDirection: rowDirection }]}>
        <View style={[styles.eventOrganizerBadge, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.eventOrganizerText, { color: colors.mutedForeground }]}>{event.organizer}</Text>
        </View>

        <View style={[styles.eventIconWrap, { backgroundColor: `${event.color}18` }]}>
          <Ionicons name="calendar-outline" size={20} color={event.color} />
        </View>
      </View>

      <Text style={[styles.eventTitle, { color: colors.foreground, textAlign }]}>{event.title}</Text>

      <View style={[styles.eventMetaWrap, { flexDirection: rowDirection }]}>
        <View style={[styles.eventMetaPill, { backgroundColor: colors.secondary, flexDirection: rowDirection }]}>
          <Ionicons name="calendar-outline" size={12} color={colors.mutedForeground} />
          <Text style={[styles.eventMetaText, { color: colors.mutedForeground }]}>{event.date}</Text>
        </View>
        <View style={[styles.eventMetaPill, { backgroundColor: colors.secondary, flexDirection: rowDirection }]}>
          <Ionicons name="time-outline" size={12} color={colors.mutedForeground} />
          <Text style={[styles.eventMetaText, { color: colors.mutedForeground }]}>{event.time}</Text>
        </View>
        <View style={[styles.eventMetaPill, { backgroundColor: colors.secondary, flexDirection: rowDirection }]}>
          <Ionicons name="location-outline" size={12} color={colors.mutedForeground} />
          <Text style={[styles.eventMetaText, { color: colors.mutedForeground }]}>{event.location}</Text>
        </View>
      </View>

      <View style={[styles.separator, { backgroundColor: colors.border }]} />

      <View style={[styles.priceRow, { flexDirection: rowDirection }]}>
        <View style={[styles.registeredState, { flexDirection: rowDirection }]}>
          <Ionicons name="checkmark-circle" size={14} color={SemanticColors.green} />
          <Text style={styles.registeredStateText}>{t('profile.registered')}</Text>
        </View>
        {onCancelRegistration ? (
          <Pressable
            onPress={onCancelRegistration}
            style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
          >
            <Text style={styles.cancelButtonText}>{t('profile.cancelRegistration')}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    padding: 16,
    borderWidth: 1,
    borderRightWidth: 4,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 4,
  },
  eventHeader: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventOrganizerBadge: {
    minHeight: 32,
    borderRadius: 999,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventOrganizerText: {
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
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  eventMetaWrap: {
    marginTop: 14,
    flexWrap: 'wrap',
    gap: 8,
  },
  eventMetaPill: {
    minHeight: 34,
    borderRadius: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 6,
  },
  eventMetaText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.medium,
  },
  separator: {
    height: 1,
    marginTop: 14,
  },
  priceRow: {
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  registeredState: {
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
