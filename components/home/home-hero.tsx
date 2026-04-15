import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Colors, FontFamily, FontSize, FontWeight, SemanticColors } from '@/styles/ui-theme';

type HomeHeroProps = {
  universityNumber: string;
  universityName: string;
  fullName: string;
  search: string;
  onChangeSearch: (value: string) => void;
};

export function HomeHero({
  universityNumber,
  universityName,
  fullName,
  search,
  onChangeSearch,
}: HomeHeroProps) {
  return (
    <View style={styles.hero}>
      <View style={styles.heroIn}>
        <View style={styles.top}>
          <Pressable style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}>
            <Ionicons name="notifications-outline" size={18} color="rgba(255,255,255,0.92)" />
            <View style={styles.badge}>
              <Text style={styles.badgeTxt}>3</Text>
            </View>
          </Pressable>

          <View style={styles.brand}>
            <View style={styles.brandTxt}>
              <Text style={styles.app}>كلشي بجامعتا</Text>
              <View style={styles.meta}>
                {universityNumber ? <Text style={styles.metaMuted}>{universityNumber}</Text> : null}
                {universityNumber ? <Text style={styles.metaDot}>•</Text> : null}
                <Text style={styles.metaStrong}>{universityName}</Text>
              </View>
            </View>

            <View style={styles.logoWrap}>
              <Image source={require('../../assets/souqlogo.png')} style={styles.logo} contentFit="cover" />
            </View>
          </View>
        </View>

        <View style={styles.welcome}>
          <Text style={styles.welcomeSmall}>مرحباً {fullName ? `، ${fullName}` : 'بك'}!</Text>
          <Text style={styles.welcomeBig}>عن ماذا تبحث اليوم؟</Text>
        </View>

        <View style={styles.search}>
          <View style={styles.searchIcon}>
            <Ionicons name="search-outline" size={16} color="rgba(255,255,255,0.65)" />
          </View>
          <TextInput
            value={search}
            onChangeText={onChangeSearch}
            placeholder="ابحث عن خدمات، كتب، فعاليات..."
            placeholderTextColor="rgba(255,255,255,0.42)"
            style={styles.searchInput}
            textAlign="right"
          />
        </View>
      </View>

      <View style={styles.heroCurve} />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    overflow: 'hidden', backgroundColor: Colors.primary
  },
  heroIn:
  {
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 36
  },
  top: {
    flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20
  },
  iconBtn: {
    width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.12)'
  },
  badge: {
    position: 'absolute', top: -3, right: -3, minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: SemanticColors.red, paddingHorizontal: 4
  },
  badgeTxt: {
    color: '#fff', fontFamily: FontFamily.cairo, fontSize: FontSize.xxs, fontWeight: FontWeight.bold
  },
  brand: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 12
  },
  brandTxt: {
    alignItems: 'flex-end'
  },
  app: {
    color: '#fff', fontFamily: FontFamily.cairo, fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, textAlign: 'right'
  },
  meta: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 6
  },
  metaMuted: {
    color: 'rgba(255,255,255,0.55)', fontFamily: FontFamily.cairo, fontSize: FontSize.x11, fontWeight: FontWeight.medium
  },
  metaDot: {
    color: 'rgba(255,255,255,0.28)', fontSize: FontSize.x11
  },
  metaStrong: {
    color: 'rgba(191,219,254,0.9)', fontFamily: FontFamily.cairo, fontSize: FontSize.x11, fontWeight: FontWeight.semibold
  },
  logoWrap: {
    width: 50, height: 50, borderRadius: 16, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.14)'
  },
  logo: {
    width: '100%', height: '100%'
  },
  welcome: {
    alignItems: 'flex-end', marginBottom: 20
  },
  welcomeSmall: {
    color: 'rgba(219,234,254,0.72)', fontFamily: FontFamily.cairo, fontSize: FontSize.md, fontWeight: FontWeight.medium, textAlign: 'right'
  },
  welcomeBig: {
    color: 'rgba(255,255,255,0.96)', fontFamily: FontFamily.cairo, fontSize: FontSize.lg, fontWeight: FontWeight.bold, textAlign: 'right'
  },
  search: {
    minHeight: 56, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 16
  },
  searchIcon: {
    width: 32, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.1)'
  },
  searchInput: {
    flex: 1, color: '#fff', fontFamily: FontFamily.cairo, fontSize: FontSize.md, writingDirection: 'rtl'
  },
  heroCurve: {
    position: 'absolute', left: -8, right: -8, bottom: -20, height: 34, backgroundColor: Colors.background, borderTopLeftRadius: 42, borderTopRightRadius: 42
  },
  pressed: {
    transform: [{ scale: 0.97 }]
  },
});
