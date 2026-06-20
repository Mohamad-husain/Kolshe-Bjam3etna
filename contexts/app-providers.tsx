import { PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppSettingsProvider } from '@/contexts/app-settings-context';
import { ThemePreferenceProvider } from '@/contexts/theme-preference-context';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemePreferenceProvider>
          <AppSettingsProvider>{children}</AppSettingsProvider>
        </ThemePreferenceProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
