import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { AUTH_COPY } from '@/lib/auth/auth-copy';
import {
  Colors,
  FontFamily,
  FontWeight,
} from '@/styles/ui-theme';

export function AuthBranding() {
  return (
    <View style={styles.container}>
      <View style={styles.logoBox}>
        <Ionicons name="school-outline" size={37} color="#ffffff" />
      </View>

      <Text style={styles.title}>{AUTH_COPY.appTitle}</Text>
      <Text style={styles.subtitle}>{AUTH_COPY.appSubtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 26,
  },
  logoBox: {
    marginBottom: 22,
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: '#2f63e0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2f63e0',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
  },
  title: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: 21,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
    writingDirection: 'rtl',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: {
    color: '#9d9da4',
    fontFamily: FontFamily.cairo,
    fontSize: 14,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});
