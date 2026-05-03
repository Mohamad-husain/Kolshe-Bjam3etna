import { useMemo } from 'react';

import { useAdminTheme } from '@/lib/admin/admin-theme';

export type AdminEditProfileTheme = {
  isDark: boolean;
  pageBackground: string;
  heroBackground: string;
  heroGlowPrimary: string;
  heroGlowSecondary: string;
  heroTint: string;
  heroButtonBackground: string;
  heroButtonBorder: string;
  heroButtonText: string;
  panelBackground: string;
  trackBackground: string;
  activePillBackground: string;
  activePillText: string;
  inactivePillText: string;
  cardBackground: string;
  fieldBackground: string;
  fieldHover: string;
  fieldFocus: string;
  fieldBorder: string;
  fieldBorderStrong: string;
  text: string;
  mutedText: string;
  placeholder: string;
  iconShell: string;
  iconColor: string;
  divider: string;
  primary: string;
  primaryPressed: string;
  primarySoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  shadow: string;
  white: string;
};

export function useAdminEditProfileTheme() {
  const theme = useAdminTheme();

  return useMemo<AdminEditProfileTheme>(() => {
    if (theme.isDark) {
      return {
        isDark: true,
        pageBackground: '#11131a',
        heroBackground: '#2f6ff5',
        heroGlowPrimary: 'rgba(255,255,255,0.16)',
        heroGlowSecondary: 'rgba(255,255,255,0.10)',
        heroTint: 'rgba(255,255,255,0.03)',
        heroButtonBackground: 'rgba(255,255,255,0.14)',
        heroButtonBorder: 'rgba(255,255,255,0.08)',
        heroButtonText: '#ffffff',
        panelBackground: '#171922',
        trackBackground: '#20232d',
        activePillBackground: '#2b2f3a',
        activePillText: '#ffffff',
        inactivePillText: '#8d93a5',
        cardBackground: '#1a1d27',
        fieldBackground: '#1f232e',
        fieldHover: '#242937',
        fieldFocus: '#202c47',
        fieldBorder: 'rgba(255,255,255,0.06)',
        fieldBorderStrong: 'rgba(72, 125, 255, 0.42)',
        text: '#f8f9ff',
        mutedText: '#9aa2b6',
        placeholder: '#8e94a6',
        iconShell: '#262a35',
        iconColor: '#aeb6ca',
        divider: 'rgba(255,255,255,0.05)',
        primary: '#2f6ff5',
        primaryPressed: '#285fd1',
        primarySoft: 'rgba(47,111,245,0.16)',
        success: '#2f6ff5',
        successSoft: 'rgba(47,111,245,0.18)',
        warning: '#ff9f1a',
        warningSoft: 'rgba(255,159,26,0.16)',
        danger: '#ff5b57',
        dangerSoft: 'rgba(255,91,87,0.16)',
        shadow: '#000000',
        white: '#ffffff',
      };
    }

    return {
      isDark: false,
      pageBackground: '#f2f3f8',
      heroBackground: '#2f6ff5',
      heroGlowPrimary: 'rgba(255,255,255,0.15)',
      heroGlowSecondary: 'rgba(255,255,255,0.10)',
      heroTint: 'rgba(255,255,255,0.03)',
      heroButtonBackground: 'rgba(255,255,255,0.16)',
      heroButtonBorder: 'rgba(255,255,255,0.10)',
      heroButtonText: '#ffffff',
      panelBackground: '#f2f3f8',
      trackBackground: '#e9e9ee',
      activePillBackground: '#ffffff',
      activePillText: '#2b2b31',
      inactivePillText: '#a0a0aa',
      cardBackground: '#ffffff',
      fieldBackground: '#ffffff',
      fieldHover: '#fcfcff',
      fieldFocus: '#f6f8ff',
      fieldBorder: 'rgba(43, 43, 49, 0.08)',
      fieldBorderStrong: 'rgba(47, 111, 245, 0.28)',
      text: '#2a2a31',
      mutedText: '#878791',
      placeholder: '#a3a3ad',
      iconShell: '#f4f4f7',
      iconColor: '#9d9da8',
      divider: 'rgba(43, 43, 49, 0.06)',
      primary: '#2f6ff5',
      primaryPressed: '#285fd1',
      primarySoft: 'rgba(47,111,245,0.12)',
      success: '#2f6ff5',
      successSoft: 'rgba(47,111,245,0.14)',
      warning: '#ff9f1a',
      warningSoft: 'rgba(255,159,26,0.12)',
      danger: '#ff5b57',
      dangerSoft: 'rgba(255,91,87,0.10)',
      shadow: '#172033',
      white: '#ffffff',
    };
  }, [theme.isDark]);
}

export function getAdminEditProfileShadow(theme: AdminEditProfileTheme) {
  return {
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: theme.isDark ? 0.24 : 0.08,
    shadowRadius: theme.isDark ? 18 : 16,
    elevation: theme.isDark ? 5 : 4,
  } as const;
}

export function getAdminEditProfileFocusShadow(theme: AdminEditProfileTheme) {
  return {
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: theme.isDark ? 0.3 : 0.12,
    shadowRadius: theme.isDark ? 14 : 10,
    elevation: 4,
  } as const;
}
