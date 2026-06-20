import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import ar from '@/locales/ar.json';
import en from '@/locales/en.json';
import {
  defaultSettingsNotificationPreferences,
  getSavedNotificationPreferences,
  getSavedSettingsLanguage,
  saveNotificationPreferences,
  saveSettingsLanguage,
  type SettingsLanguageValue,
  type SettingsNotificationPreferences,
} from '@/lib/storage/settings-preferences';

export type TranslationKey = keyof typeof ar;

type AppSettingsContextValue = {
  language: SettingsLanguageValue;
  isRtl: boolean;
  notifications: SettingsNotificationPreferences;
  setLanguage: (language: SettingsLanguageValue) => void;
  setNotificationPreference: <Key extends keyof SettingsNotificationPreferences>(
    key: Key,
    value: SettingsNotificationPreferences[Key],
  ) => void;
  t: (key: TranslationKey, values?: Record<string, string | number>) => string;
};

const translations: Record<SettingsLanguageValue, Record<TranslationKey, string>> = {
  ar,
  en,
};

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

function interpolate(text: string, values?: Record<string, string | number>) {
  if (!values) {
    return text;
  }

  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    text,
  );
}

export function AppSettingsProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<SettingsLanguageValue>('ar');
  const [notifications, setNotifications] =
    useState<SettingsNotificationPreferences>(defaultSettingsNotificationPreferences);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function hydrateSettings() {
      const [savedLanguage, savedNotifications] = await Promise.all([
        getSavedSettingsLanguage(),
        getSavedNotificationPreferences(),
      ]);

      if (!isMounted) {
        return;
      }

      setLanguageState(savedLanguage ?? 'ar');
      setNotifications(savedNotifications);
      setIsHydrated(true);
    }

    void hydrateSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<AppSettingsContextValue>(
    () => ({
      language,
      isRtl: language === 'ar',
      notifications,
      setLanguage: (nextLanguage) => {
        setLanguageState(nextLanguage);
        void saveSettingsLanguage(nextLanguage);
      },
      setNotificationPreference: (key, preferenceValue) => {
        setNotifications((current) => {
          const next = { ...current, [key]: preferenceValue };
          void saveNotificationPreferences(next);
          return next;
        });
      },
      t: (key, values) => {
        const text = translations[language][key] ?? translations.ar[key] ?? key;
        return interpolate(text, values);
      },
    }),
    [language, notifications],
  );

  if (!isHydrated) {
    return null;
  }

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);

  if (!context) {
    throw new Error('useAppSettings must be used within AppSettingsProvider');
  }

  return context;
}
