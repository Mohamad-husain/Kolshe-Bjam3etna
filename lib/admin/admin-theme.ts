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
  pageBackground: '#0b1120',
  pageInset: '#0f172a',
  cardBackground: '#111827',
  modalSurface: 'rgba(17, 24, 39, 0.96)',
  cardMuted: '#172033',
  inputBackground: '#1f2937',
  inputFocused: '#243756',
  trackBackground: '#1e293b',
  overlay: 'rgba(2, 6, 23, 0.74)',
  text: '#e5e7eb',
  heading: '#f8fafc',
  mutedText: '#cbd5e1',
  border: 'rgba(148,163,184,0.20)',
  borderStrong: 'rgba(148,163,184,0.34)',
  white: '#ffffff',
  heroBackground: '#111827',
  heroEdge: '#1d4ed8',
  heroTint: 'rgba(96,165,250,0.08)',
  heroCurveFill: '#0b1120',
  heroRailBackground: '#111827',
  heroRailBorder: 'rgba(148,163,184,0.22)',
  primary: '#60a5fa',
  primarySoft: 'rgba(96,165,250,0.18)',
  success: '#4ade80',
  successSoft: 'rgba(74,222,128,0.16)',
  danger: '#fb7185',
  dangerSoft: 'rgba(251,113,133,0.17)',
  warning: '#fbbf24',
  warningSoft: 'rgba(251,191,36,0.17)',
  violet: '#c084fc',
  violetSoft: 'rgba(192,132,252,0.18)',
  neutralSoft: '#1e293b',
  shadow: '#020617',
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
