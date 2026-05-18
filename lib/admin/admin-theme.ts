import { useThemePreference } from '@/contexts/theme-preference-context';

export type AdminTheme = {
  isDark: boolean;
  pageBackground: string;
  pageInset: string;
  cardBackground: string;
  modalSurface: string;
  cardMuted: string;
  inputBackground: string;
  inputFocused: string;
  trackBackground: string;
  overlay: string;
  text: string;
  heading: string;
  mutedText: string;
  border: string;
  borderStrong: string;
  white: string;
  heroBackground: string;
  heroEdge: string;
  heroTint: string;
  heroCurveFill: string;
  heroRailBackground: string;
  heroRailBorder: string;
  primary: string;
  primarySoft: string;
  success: string;
  successSoft: string;
  danger: string;
  dangerSoft: string;
  warning: string;
  warningSoft: string;
  violet: string;
  violetSoft: string;
  neutralSoft: string;
  shadow: string;
};

const lightTheme: AdminTheme = {
  isDark: false,
  pageBackground: '#f3f4f9',
  pageInset: '#eceef5',
  cardBackground: '#ffffff',
  modalSurface: 'rgba(255,255,255,0.86)',
  cardMuted: '#f7f8fc',
  inputBackground: '#fbfbfe',
  inputFocused: '#edf3ff',
  trackBackground: '#eef1f6',
  overlay: 'rgba(10, 15, 24, 0.34)',
  text: '#252833',
  heading: '#1f232c',
  mutedText: '#9a9fad',
  border: 'rgba(32, 41, 61, 0.06)',
  borderStrong: 'rgba(32, 41, 61, 0.12)',
  white: '#ffffff',
  heroBackground: '#2a2b31',
  heroEdge: '#4b2428',
  heroTint: 'rgba(255,255,255,0.03)',
  heroCurveFill: '#f3f4f9',
  heroRailBackground: '#eceef5',
  heroRailBorder: 'rgba(32, 41, 61, 0.06)',
  primary: '#2f67ea',
  primarySoft: '#e8f0ff',
  success: '#34c759',
  successSoft: '#e9f8ee',
  danger: '#ff3b30',
  dangerSoft: '#ffeceb',
  warning: '#ff9500',
  warningSoft: '#fff3e2',
  violet: '#b45af6',
  violetSoft: '#f6ecff',
  neutralSoft: '#f2f4f8',
  shadow: '#0f172a',
};

const darkTheme: AdminTheme = {
  isDark: true,
  pageBackground: '#000000',
  pageInset: '#000000',
  cardBackground: '#bebfc4',
  modalSurface: 'rgba(33, 33, 38, 0.94)',
  cardMuted: '#c8c9ce',
  inputBackground: '#d8d9dd',
  inputFocused: '#e3e6ed',
  trackBackground: '#3a3b41',
  overlay: 'rgba(0, 0, 0, 0.72)',
  text: '#f6f7fb',
  heading: '#ffffff',
  mutedText: '#8a8d96',
  border: 'rgba(255,255,255,0.02)',
  borderStrong: 'rgba(255,255,255,0.08)',
  white: '#ffffff',
  heroBackground: '#303136',
  heroEdge: '#4b2428',
  heroTint: 'rgba(255,255,255,0.02)',
  heroCurveFill: '#000000',
  heroRailBackground: '#16161a',
  heroRailBorder: 'rgba(255,255,255,0.02)',
  primary: '#2f86ff',
  primarySoft: 'rgba(47,134,255,0.18)',
  success: '#35c95a',
  successSoft: 'rgba(53,201,90,0.17)',
  danger: '#ff4d43',
  dangerSoft: 'rgba(255,77,67,0.17)',
  warning: '#ff9d1b',
  warningSoft: 'rgba(255,157,27,0.17)',
  violet: '#ba63ff',
  violetSoft: 'rgba(186,99,255,0.18)',
  neutralSoft: '#44454c',
  shadow: '#000000',
};

export function useAdminTheme() {
  const { selectedTheme } = useThemePreference();

  return selectedTheme === 'dark' ? darkTheme : lightTheme;
}

export function getAdminShadow(theme: AdminTheme) {
  return {
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: theme.isDark ? 0.28 : 0.1,
    shadowRadius: theme.isDark ? 22 : 20,
    elevation: theme.isDark ? 6 : 7,
  } as const;
}

export function getAdminFocusShadow(theme: AdminTheme) {
  return {
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: theme.isDark ? 0.34 : 0.14,
    shadowRadius: theme.isDark ? 16 : 12,
    elevation: 4,
  } as const;
}
