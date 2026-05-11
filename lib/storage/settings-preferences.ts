import AsyncStorage from '@react-native-async-storage/async-storage';

import type { SettingsThemeValue } from '@/components/settings/SettingsThemeSelector';

const SETTINGS_THEME_KEY = 'settings.selectedTheme';

function isValidTheme(value: string | null): value is SettingsThemeValue {
  return value === 'system' || value === 'light' || value === 'dark';
}

// AsyncStorage is used only for simple non-sensitive preferences.
// Auth tokens and user sessions must stay in SecureStore.
export async function getSavedSettingsTheme(): Promise<SettingsThemeValue | null> {
  try {
    const savedTheme = await AsyncStorage.getItem(SETTINGS_THEME_KEY);

    if (isValidTheme(savedTheme)) {
      return savedTheme;
    }

    return null;
  } catch {
    return null;
  }
}

export async function saveSettingsTheme(theme: SettingsThemeValue): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_THEME_KEY, theme);
  } catch {
    // Theme preference is not critical, so we safely ignore storage errors.
  }
}