import { Ionicons } from '@expo/vector-icons';

export type ExploreTab = 'services' | 'marketplace' | 'events';
export type SectionKey = 'news' | 'offers';

export type QuickItem =
  | { icon: keyof typeof Ionicons.glyphMap; label: string; color: string; bg: string; tab: ExploreTab }
  | { icon: keyof typeof Ionicons.glyphMap; label: string; color: string; bg: string; section: SectionKey };
