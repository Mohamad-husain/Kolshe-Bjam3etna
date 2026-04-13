import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontFamily, FontSize, FontWeight } from '@/styles/ui-theme';

export function HomeSectionHeader({
  title,
  icon,
  color,
  bg,
  onPress,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.hRow}>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.moreBtn, pressed && styles.pressed]}>
        <Text style={styles.moreTxt}>عرض الكل</Text>
        <Ionicons name="chevron-back" size={14} color={Colors.primary} />
      </Pressable>
      <View style={styles.titleRow}>
        <Text style={styles.titleTxt}>{title}</Text>
        <View style={[styles.titleIcon, { backgroundColor: bg }]}>
          <Ionicons name={icon} size={14} color={color} />
        </View>
      </View>
    </View>
  );
}

export function HomeStateBlock({
  color,
  loading,
  error,
  empty,
}: {
  color: string;
  loading?: boolean;
  error?: boolean;
  empty: string;
}) {
  return (
    <View style={styles.state}>
      {loading ? <ActivityIndicator color={color} /> : null}
      <Text style={styles.stateTxt}>
        {loading ? 'جارٍ تحميل البيانات...' : error ? 'تعذر تحميل هذا القسم حالياً' : empty}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  moreBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 2,
  },
  moreTxt: {
    color: Colors.primary,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.semibold,
  },
  titleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  titleTxt: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x17,
    fontWeight: FontWeight.bold,
  },
  titleIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  state: {
    minHeight: 112,
    borderRadius: 24,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 18,
  },
  stateTxt: {
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    textAlign: 'center',
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
