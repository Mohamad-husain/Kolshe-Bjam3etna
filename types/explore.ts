export type ExploreOwner = {
  name: string;
  initials: string;
};

export interface MarketplaceCardData {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  condition: string;
  imageUrl?: string | null;
  isTrending?: boolean;
  isSold?: boolean;
  owner: ExploreOwner;
}

export interface EventCardData {
  imageUrl: string | null;
  id: string;
  title: string;
  description: string;
  club: string;
  eventType: string;
  date: string;
  time: string;
  location: string;
  registeredCount: number;
  maxCount: number;
}

export interface ExchangeCardData {
  imageUrl: string | null;
  id: string;
  title: string;
  description: string;
  category: string;
  have: string;
  want: string;
  owner: ExploreOwner;
}

export interface ServiceCardData {
  id: string;
  title: string;
  description: string;
  category: string;
  pricePerHour: number;
  deadline: string;
  isUrgent?: boolean;
  isTrending?: boolean;
  owner: ExploreOwner;
}
