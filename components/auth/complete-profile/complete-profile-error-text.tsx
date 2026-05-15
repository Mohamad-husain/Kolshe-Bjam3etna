import { StyleSheet, Text } from 'react-native';

import {
  Colors,
  FontFamily,
  FontSize,
} from '@/styles/ui-theme';

type CompleteProfileErrorTextProps = {
  message?: string | null;
};

export function CompleteProfileErrorText({ message }: CompleteProfileErrorTextProps) {
  if (!message) {
    return null;
  }

  return <Text style={styles.errorText}>{message}</Text>;
}

const styles = StyleSheet.create({
  errorText: {
    color: Colors.destructive,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    textAlign: 'right',
    writingDirection: 'rtl',
    paddingHorizontal: 4,
  },
});
