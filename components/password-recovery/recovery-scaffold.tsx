import { Ionicons } from '@expo/vector-icons';
import { type PropsWithChildren } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppLogoBadge } from '@/components/app-logo-badge';
import { Colors } from '@/styles/ui-theme';

import { styles } from './styles';

type RecoveryScaffoldProps = PropsWithChildren<{
  showBackButton: boolean;
  onBackPress: () => void;
  backDisabled?: boolean;
}>;

export function RecoveryScaffold({
  showBackButton,
  onBackPress,
  backDisabled = false,
  children,
}: RecoveryScaffoldProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={styles.topRightBubble} />
      <View style={styles.topLeftBubble} />
      <View style={styles.softOverlay} />

      <View
        style={[
          styles.content,
          {
            paddingTop: Math.max(insets.top + 18, 42),
            paddingBottom: Math.max(insets.bottom + 20, 24),
          },
        ]}
      >
        {showBackButton ? (
          <Pressable
            onPress={onBackPress}
            disabled={backDisabled}
            style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}
          >
            <Ionicons name="chevron-forward" size={17} color={Colors.primary} />
            <Text style={styles.backButtonText}>رجوع</Text>
          </Pressable>
        ) : null}

        <AppLogoBadge style={styles.logoBox} iconSize={38} />

        {children}
      </View>
    </View>
  );
}
