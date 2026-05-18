import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';

import type { SettingsThemeValue } from '@/components/settings/SettingsThemeSelector';
import {
  getSavedSettingsTheme,
  saveSettingsTheme,
} from '@/lib/storage/settings-preferences';

type ThemePreferenceContextValue = {
  selectedTheme: SettingsThemeValue;
  effectiveTheme: 'light' | 'dark';
  setSelectedTheme: (theme: SettingsThemeValue) => void;
};

const ThemePreferenceContext = createContext<ThemePreferenceContextValue | null>(null);

export function ThemePreferenceProvider({ children }: PropsWithChildren) {
  const systemColorScheme = useColorScheme();
  const [selectedTheme, setSelectedThemeState] =
    useState<SettingsThemeValue>('system');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function hydrateThemePreference() {
      const savedTheme = await getSavedSettingsTheme();

      if (!isMounted) {
        return;
      }

      if (savedTheme) {
        setSelectedThemeState(savedTheme);
      }

      setIsHydrated(true);
    }

    void hydrateThemePreference();

    return () => {
      isMounted = false;
    };
  }, []);

  const effectiveTheme = useMemo<'light' | 'dark'>(() => {
    if (selectedTheme === 'dark') {
      return 'dark';
    }

    if (selectedTheme === 'light') {
      return 'light';
    }

    return systemColorScheme === 'dark' ? 'dark' : 'light';
  }, [selectedTheme, systemColorScheme]);

  const value = useMemo<ThemePreferenceContextValue>(
    () => ({
      selectedTheme,
      effectiveTheme,
      setSelectedTheme: (theme) => {
        setSelectedThemeState(theme);
        void saveSettingsTheme(theme);
      },
    }),
    [effectiveTheme, selectedTheme],
  );

  if (!isHydrated) {
    return null;
  }

  return (
    <ThemePreferenceContext.Provider value={value}>
      {children}
    </ThemePreferenceContext.Provider>
  );
}

export function useThemePreference() {
  const context = useContext(ThemePreferenceContext);

  if (!context) {
    throw new Error(
      'useThemePreference must be used within ThemePreferenceProvider',
    );
  }

  return context;
}
