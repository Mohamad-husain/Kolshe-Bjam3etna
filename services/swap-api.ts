import { apiClient } from "./http-client";
import { ExchangeCardData } from "@/types/explore";
import { toAbsoluteImageUrl } from "./media";

type ApiSwapAd = {
  id: number;
  offerTitle: string;
  wantedTitle: string;
  condition: string;
  description: string;
  categoryId: number;
  categoryName: string;
  user: {
    fullName: string;
    profileImageUrl: string | null;
  };
};

function mapToExchangeCard(item: ApiSwapAd): ExchangeCardData {
  return {
    id: String(item.id),
    title: item.description,
    description: item.description,
    category: item.categoryName,
    have: item.offerTitle, // ← أملك
    want: item.wantedTitle, // ← أريد
    owner: {
      name: item.user.fullName,
      initials: item.user.fullName.charAt(0),
    },
    imageUrl: toAbsoluteImageUrl(item.user.profileImageUrl),
  };
}

export async function getSwapAds(): Promise<ExchangeCardData[]> {
  const { data } = await apiClient.get<{ success: boolean; data: ApiSwapAd[] }>(
    "/api/SwapAds",
  );
  if (!data.data || data.data.length === 0) return [];
  return data.data.map(mapToExchangeCard);
}
