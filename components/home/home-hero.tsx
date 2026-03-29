import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, Text, TextInput, View } from 'react-native';
import { styles } from './home-styles';

export function HomeHero({
  universityNumber,
  universityName,
  fullName,
  search,
  onChangeSearch,
}: {
  universityNumber: string;
  universityName: string;
  fullName: string;
  search: string;
  onChangeSearch: (value: string) => void;
}) {
  return (
    <View style={styles.hero}>
      <View style={styles.heroBg} />

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
