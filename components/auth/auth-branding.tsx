import { StyleSheet, Text, View } from 'react-native';

import { AppLogoBadge } from '@/components/app-logo-badge';
import { AUTH_COPY } from '@/lib/auth/auth-copy';
import {
  Colors,
  FontFamily,
  FontWeight,
} from '@/styles/ui-theme';

export function AuthBranding() {
  return (
    <View style={styles.container}>
      <AppLogoBadge style={styles.logoBox} />

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
