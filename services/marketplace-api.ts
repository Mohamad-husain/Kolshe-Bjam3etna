import { apiClient } from "./http-client";
import { toAbsoluteImageUrl } from "./media";

import { MarketplaceCardData } from "@/types/explore";

type ApiProductAd = {
  id: number;
  title: string;
  price: number;
  condition: string;
  categoryId: number;
  categoryName: string;
  description?: string;
  coverImageUrl: string;
  user: {
    fullName: string;
    profileImageUrl: string | null;
  };
};

function mapCondition(condition: string): string {
  const map: Record<string, string> = {
    LikeNew: "كالجديد",
    Excellent: "ممتاز",
    VeryGood: "جيد جداً",
    Good: "جيد",
    Acceptable: "مقبول",
  };
  return map[condition] ?? condition;
}

function mapToMarketplaceCard(item: ApiProductAd): MarketplaceCardData {
  return {
    id: String(item.id),
    title: item.title,
    description: item.description ?? "",
    category: item.categoryName,
    price: item.price,
    condition: mapCondition(item.condition),
    imageUrl: toAbsoluteImageUrl(item.coverImageUrl),
    owner: {
      name: item.user.fullName,
      initials: item.user.fullName.charAt(0),
    },
  };
}

export async function getProductAds(): Promise<MarketplaceCardData[]> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: ApiProductAd[];
  }>("/api/ProductAds");
  if (!data.data || data.data.length === 0) return [];
  return data.data.map(mapToMarketplaceCard);
}
