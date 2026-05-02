import { apiClient, getApiErrorMessage } from "./http-client";
import { toAbsoluteImageUrl } from "./media";

import { MarketplaceCardData } from "@/types/explore";

export type ProductAdCondition = "LikeNew" | "Excellent" | "VeryGood" | "Good" | "Acceptable";

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

type ApiProductAdsResponse = {
  success?: boolean;
  data?: ApiProductAd[];
};

type ApiCreateProductAdResponse = {
  success?: boolean;
  message?: string;
};

export type ProductAdPhotoInput = {
  uri: string;
  name: string;
  type: string;
};

export type CreateProductAdInput = {
  title: string;
  categoryId: number;
  price: number;
  condition: ProductAdCondition;
  description: string;
  photos: ProductAdPhotoInput[];
};

const PRODUCT_AD_ERRORS = {
  titleRequired: "يرجى إدخال عنوان واضح للإعلان",
  descriptionRequired: "يرجى كتابة وصف لا يقل عن 15 حرفاً",
  categoryRequired: "يرجى اختيار تصنيف للإعلان",
  priceRequired: "يرجى تحديد سعر صحيح",
  conditionRequired: "يرجى اختيار حالة المنتج",
  listFailed: "تعذر تحميل إعلانات البيع",
  createFailed: "تعذر نشر إعلان البيع",
} as const;

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

function trimValue(value: string) {
  return value.trim();
}

function assertMinTrimmedLength(value: string, minLength: number, errorMessage: string) {
  if (trimValue(value).length < minLength) {
    throw new Error(errorMessage);
  }
}

function normalizePositiveNumber(value: number, errorMessage: string) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    throw new Error(errorMessage);
  }

  return numericValue;
}

function normalizeCondition(value: ProductAdCondition) {
  const allowedConditions: ProductAdCondition[] = [
    "LikeNew",
    "Excellent",
    "VeryGood",
    "Good",
    "Acceptable",
  ];

  if (!allowedConditions.includes(value)) {
    throw new Error(PRODUCT_AD_ERRORS.conditionRequired);
  }

  return value;
}

function appendProductImage(formData: FormData, photo: ProductAdPhotoInput) {
  formData.append("Images", {
    uri: photo.uri,
    name: photo.name,
    type: photo.type,
  } as never);
}

export async function getProductAds(): Promise<MarketplaceCardData[]> {
  try {
    const { data } = await apiClient.get<ApiProductAdsResponse>("/api/ProductAds");
    if (!data.data || data.data.length === 0) return [];
    return data.data.map(mapToMarketplaceCard);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, PRODUCT_AD_ERRORS.listFailed));
  }
}

export async function createProductAd(input: CreateProductAdInput) {
  const title = trimValue(input.title);
  const description = trimValue(input.description);
  const price = normalizePositiveNumber(input.price, PRODUCT_AD_ERRORS.priceRequired);
  const categoryId = normalizePositiveNumber(
    input.categoryId,
    PRODUCT_AD_ERRORS.categoryRequired,
  );
  const condition = normalizeCondition(input.condition);

  assertMinTrimmedLength(title, 4, PRODUCT_AD_ERRORS.titleRequired);
  assertMinTrimmedLength(description, 15, PRODUCT_AD_ERRORS.descriptionRequired);

  const formData = new FormData();
  formData.append("Title", title);
  formData.append("CategoryId", String(categoryId));
  formData.append("Price", String(price));
  formData.append("Condition", condition);
  formData.append("Description", description);
  input.photos.slice(0, 5).forEach((photo) => appendProductImage(formData, photo));

  try {
    const { data } = await apiClient.post<ApiCreateProductAdResponse>(
      "/api/ProductAds",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return data.message ?? null;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, PRODUCT_AD_ERRORS.createFailed));
  }
}
