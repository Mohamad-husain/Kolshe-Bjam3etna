import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { ServiceCardData } from '@/types/explore';
import { Colors, FontFamily, FontSize, FontWeight, SemanticColors } from '@/styles/ui-theme';

import { HomeSectionHeader, HomeStateBlock } from './home-shared';
import { price, serviceAccent } from './home-utils';

type HomeServicesSectionProps = {
  isLoading: boolean;
  isError: boolean;
  services: ServiceCardData[];
  onPressMore: () => void;
  onPressCard: (item: ServiceCardData) => void;
};

export function HomeServicesSection({
  isLoading,
  isError,
  services,
  onPressMore,
  onPressCard,
}: HomeServicesSectionProps) {
  return (
    <View style={styles.sec}>
      <HomeSectionHeader title="خدمات رائجة" icon="flame-outline" color={SemanticColors.red} bg="rgba(255,59,48,0.1)" onPress={onPressMore} />
      {isLoading ? (
        <HomeStateBlock color={SemanticColors.blue} loading empty="لا توجد خدمات حالياً" />
      ) : isError ? (
        <HomeStateBlock color={SemanticColors.blue} error empty="لا توجد خدمات حالياً" />
      ) : services.length === 0 ? (
        <HomeStateBlock color={SemanticColors.blue} empty="لا توجد خدمات حالياً" />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rtlScroll} contentContainerStyle={styles.hList}>
          {services.map((item) => {
            const accent = serviceAccent(item.category);
            return (
              <Pressable key={item.id} onPress={() => onPressCard(item)} style={({ pressed }) => [styles.card, styles.serviceCard, styles.mirrorX, styles.hCard, pressed && styles.mirrorPressed]}>
                <View style={[styles.accent, { backgroundColor: accent }]} />
                <View style={styles.rowBetween}>
                  <View style={[styles.pill, { backgroundColor: `${accent}12` }]}>
                    <Text style={[styles.pillTxt, { color: accent }]}>{price(item.pricePerHour, '/ساعة')}</Text>
                  </View>
                  <View style={styles.softPill}>
                    <Text style={styles.softPillTxt}>{item.category}</Text>
                  </View>
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text numberOfLines={2} style={styles.cardDesc}>
                  {item.description}
                </Text>
                <View style={styles.footer}>
                  {item.deadline !== 'غير محدد' ? (
                    <View style={styles.time}>
                      <Ionicons name="time-outline" size={12} color={SemanticColors.green} />
                      <Text style={styles.timeTxt}>{item.deadline}</Text>
                    </View>
                  ) : (
                    <View />
                  )}
                  <View style={styles.owner}>
                    <Text style={styles.ownerTxt}>{item.owner.name}</Text>
                    <View style={[styles.avatar, { backgroundColor: accent }]}>
                      <Text style={styles.avatarTxt}>{item.owner.initials}</Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
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
    paddingTop: 20
  },
  rtlScroll: {
    transform: [{ scaleX: -1 }]
  },
  mirrorX: {
    transform: [{ scaleX: -1 }]
  },
  mirrorPressed: { transform: [{ scaleX: -1 }, { scale: 0.97 }] },
  hList: {
    paddingBottom: 2, paddingHorizontal: 6
  },
  hCard: {
    marginHorizontal: 6
  },
  card: {
    borderRadius: 24, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, ...cardShadow
  },
  serviceCard: {
    width: 248, padding: 18, overflow: 'hidden'
  },
  accent: {
    position: 'absolute', top: 0, right: 0, bottom: 0, width: 4
  },
  rowBetween: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
  },
  pill: {
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5
  },
  pillTxt: {
    fontFamily: FontFamily.cairo, fontSize: FontSize.xs, fontWeight: FontWeight.bold
  },
  softPill: {
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: Colors.secondary
  },
  softPillTxt: {
    color: Colors.mutedForeground, fontFamily: FontFamily.cairo, fontSize: FontSize.xs, fontWeight: FontWeight.semibold
  },
  cardTitle: {
    color: Colors.foreground, fontFamily: FontFamily.cairo, fontSize: FontSize.md, fontWeight: FontWeight.bold, textAlign: 'right', lineHeight: 22
  },
  cardDesc: {
    marginTop: 6, marginBottom: 16, color: Colors.mutedForeground, fontFamily: FontFamily.cairo, fontSize: FontSize.sm, lineHeight: 21, textAlign: 'right'
  },
  footer: {
    borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
  },
  time: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 4
  },
  timeTxt: {
    color: SemanticColors.green, fontFamily: FontFamily.cairo, fontSize: FontSize.x11, fontWeight: FontWeight.semibold
  },
  owner: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 8
  },
  ownerTxt: {
    color: Colors.mutedForeground, fontFamily: FontFamily.cairo, fontSize: FontSize.x11, fontWeight: FontWeight.medium
  },
  avatar: {
    width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center'
  },
  avatarTxt: {
    color: '#fff', fontFamily: FontFamily.cairo, fontSize: FontSize.x11, fontWeight: FontWeight.bold
  },
  pressed: {
    transform: [{ scale: 0.97 }]
  },
});
