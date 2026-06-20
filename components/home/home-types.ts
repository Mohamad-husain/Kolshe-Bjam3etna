import { Ionicons } from '@expo/vector-icons';
import type { TranslationKey } from '@/contexts/app-settings-context';

export type ExploreTab = 'services' | 'marketplace' | 'events';
export type SectionKey = 'news' | 'offers';

export type QuickItem =
  | { icon: keyof typeof Ionicons.glyphMap; labelKey: TranslationKey; color: string; bg: string; tab: ExploreTab }
  | { icon: keyof typeof Ionicons.glyphMap; labelKey: TranslationKey; color: string; bg: string; route: 'new-service' }
  | { icon: keyof typeof Ionicons.glyphMap; labelKey: TranslationKey; color: string; bg: string; section: SectionKey };
