import { Ionicons } from '@expo/vector-icons';
import { type PropsWithChildren } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppLogoBadge } from '@/components/app-logo-badge';
import { useAppSettings } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';

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
  const { isRtl, t } = useAppSettings();
  const { colors, effectiveTheme } = useThemePreference();
  const isDark = effectiveTheme === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.topRightBubble,
          { backgroundColor: isDark ? 'rgba(96,165,250,0.16)' : 'rgba(104, 140, 245, 0.21)' },
        ]}
      />
      <View
        style={[
          styles.topLeftBubble,
          { backgroundColor: isDark ? 'rgba(96,165,250,0.08)' : 'rgba(124, 156, 251, 0.1)' },
        ]}
      />
      <View
        style={[
          styles.softOverlay,
          { backgroundColor: isDark ? 'rgba(11,17,32,0.76)' : 'rgba(244, 245, 250, 0.84)' },
        ]}
      />

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
            style={({ pressed }) => [
              styles.backButton,
              { flexDirection: isRtl ? 'row-reverse' : 'row', alignSelf: isRtl ? 'flex-end' : 'flex-start' },
              pressed && styles.buttonPressed,
            ]}
          >
            <Ionicons name={isRtl ? 'chevron-forward' : 'chevron-back'} size={17} color={colors.primary} />
            <Text style={[styles.backButtonText, { color: colors.primary }]}>
              {t('recovery.back')}
            </Text>
          </Pressable>
        ) : null}

        <AppLogoBadge style={styles.logoBox} iconSize={38} />

        {children}
      </View>
    </View>
  );
}
