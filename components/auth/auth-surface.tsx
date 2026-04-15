import { type PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

export function AuthSurface({ children }: PropsWithChildren) {
  return <View style={styles.surface}>{children}</View>;
}

const styles = StyleSheet.create({
  surface: {
    width: '100%',
    gap: 10,
  },
});
