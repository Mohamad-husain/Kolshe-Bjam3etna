import { apiClient } from "./api-client";
import { MarketplaceCardData } from "@src/components/explore/MarketplaceCard";

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
    LikeNew: "شبه جديد",
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
    owner: {
      name: item.user.fullName,
      rating: 0,
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
