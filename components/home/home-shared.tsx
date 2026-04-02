import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Colors } from '@/styles/ui-theme';
import { styles } from './home-styles';

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
