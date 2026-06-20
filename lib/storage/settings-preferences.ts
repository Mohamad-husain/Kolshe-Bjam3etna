import AsyncStorage from '@react-native-async-storage/async-storage';

import type { SettingsThemeValue } from '@/components/settings/SettingsThemeSelector';

const SETTINGS_THEME_KEY = 'settings.selectedTheme';
const SETTINGS_LANGUAGE_KEY = 'settings.language';
const SETTINGS_NOTIFICATIONS_KEY = 'settings.notifications';

export type SettingsLanguageValue = 'ar' | 'en';

export type SettingsNotificationPreferences = {
  notificationsEnabled: boolean;
  messageNotifications: boolean;
  offerNotifications: boolean;
  newsNotifications: boolean;
  soundEnabled: boolean;
  showOnlineStatus: boolean;
};

export const defaultSettingsNotificationPreferences: SettingsNotificationPreferences = {
  notificationsEnabled: true,
  messageNotifications: true,
  offerNotifications: true,
  newsNotifications: true,
  soundEnabled: true,
  showOnlineStatus: true,
};

function isValidTheme(value: string | null): value is SettingsThemeValue {
  return value === 'system' || value === 'light' || value === 'dark';
}

function isValidLanguage(value: string | null): value is SettingsLanguageValue {
  return value === 'ar' || value === 'en';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function readBoolean(
  record: Record<string, unknown>,
  key: keyof SettingsNotificationPreferences,
) {
  return typeof record[key] === 'boolean'
    ? record[key]
    : defaultSettingsNotificationPreferences[key];
}

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
  }
}

export async function getSavedSettingsLanguage(): Promise<SettingsLanguageValue | null> {
  try {
    const savedLanguage = await AsyncStorage.getItem(SETTINGS_LANGUAGE_KEY);

    if (isValidLanguage(savedLanguage)) {
      return savedLanguage;
    }

    return null;
  } catch {
    return null;
  }
}

export async function saveSettingsLanguage(language: SettingsLanguageValue): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_LANGUAGE_KEY, language);
  } catch {
  }
}

export async function getSavedNotificationPreferences(): Promise<SettingsNotificationPreferences> {
  try {
    const rawPreferences = await AsyncStorage.getItem(SETTINGS_NOTIFICATIONS_KEY);

    if (!rawPreferences) {
      return defaultSettingsNotificationPreferences;
    }

    const parsed = JSON.parse(rawPreferences) as unknown;

    if (!isRecord(parsed)) {
      return defaultSettingsNotificationPreferences;
    }

    return {
      notificationsEnabled: readBoolean(parsed, 'notificationsEnabled'),
      messageNotifications: readBoolean(parsed, 'messageNotifications'),
      offerNotifications: readBoolean(parsed, 'offerNotifications'),
      newsNotifications: readBoolean(parsed, 'newsNotifications'),
      soundEnabled: readBoolean(parsed, 'soundEnabled'),
      showOnlineStatus: readBoolean(parsed, 'showOnlineStatus'),
    };
  } catch {
    return defaultSettingsNotificationPreferences;
  }
}

export async function saveNotificationPreferences(
  preferences: SettingsNotificationPreferences,
): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_NOTIFICATIONS_KEY, JSON.stringify(preferences));
  } catch {
  }
}
