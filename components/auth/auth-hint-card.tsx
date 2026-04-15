import { StyleSheet, Text, View } from 'react-native';

import {
  Colors,
  Dimensions,
  FontFamily,
} from '@/styles/ui-theme';

type AuthHintCardProps = {
  message: string;
};

export function AuthHintCard({ message }: AuthHintCardProps) {
  return (
    <View style={styles.hintBox}>
      <View style={styles.hintDot} />
      <Text style={styles.hintText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hintBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(74, 120, 247, 0.1)',
  },
  hintDot: {
    width: 6,
    height: 6,
    borderRadius: Dimensions.radiusFull,
    backgroundColor: Colors.primary,
  },
  hintText: {
    flex: 1,
    color: 'rgba(54, 101, 229, 0.9)',
    textAlign: 'right',
    writingDirection: 'rtl',
    fontFamily: FontFamily.cairo,
    fontSize: 12,
    lineHeight: 18,
  },
});
