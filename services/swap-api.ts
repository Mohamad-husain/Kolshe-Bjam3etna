import { apiClient, getApiErrorMessage } from "./http-client";
import { ExchangeCardData } from "@/types/explore";
import { toAbsoluteImageUrl } from "./media";

export type SwapAdCondition =
  | "LikeNew"
  | "Excellent"
  | "VeryGood"
  | "Good"
  | "Acceptable";

type ApiSwapAd = {
  id: number;
  offerTitle: string;
  wantedTitle: string;
  condition: string;
  description: string;
  categoryId: number;
  categoryName: string;
  coverImageUrl?: string | null;
  imageUrl?: string | null;
  photoUrl?: string | null;
  thumbnailUrl?: string | null;
  images?: ApiSwapAdImage[] | null;
  photos?: ApiSwapAdImage[] | null;
  profileImageUrl?: string | null;
  userProfileImageUrl?: string | null;
  ownerProfileImageUrl?: string | null;
  user: {
    fullName: string;
    profileImageUrl: string | null;
    imageUrl?: string | null;
    avatarUrl?: string | null;
  };
};

type ApiSwapAdImage = {
  imageUrl?: string | null;
  url?: string | null;
  path?: string | null;
  fileUrl?: string | null;
};

type ApiSwapAdsResponse = {
  success?: boolean;
  data?: ApiSwapAd[];
};

type ApiCreateSwapAdResponse = {
  success?: boolean;
  message?: string;
};

export type SwapAdPhotoInput = {
  uri: string;
  name: string;
  type: string;
};

export type CreateSwapAdInput = {
  offerTitle: string;
  wantedTitle: string;
  categoryId: number;
  categoryName?: string;
  condition: SwapAdCondition;
  conditionLabel?: string;
  description: string;
  photos: SwapAdPhotoInput[];
};

const SWAP_AD_ERRORS = {
  offerRequired: "يرجى إدخال ما تريد عرضه للتبادل",
  wantedRequired: "يرجى إدخال ما تبحث عنه",
  descriptionRequired: "يرجى كتابة وصف لا يقل عن 15 حرفاً",
  categoryRequired: "يرجى اختيار تصنيف للتبادل",
  conditionRequired: "يرجى اختيار حالة العنصر",
  listFailed: "تعذر تحميل طلبات التبادل",
  createFailed: "تعذر نشر طلب التبادل",
} as const;

function mapToExchangeCard(item: ApiSwapAd): ExchangeCardData {
  const ownerName = item.user.fullName.trim();

  return {
    id: String(item.id),
    title: item.description,
    description: item.description,
    category: item.categoryName,
    have: item.offerTitle,
    want: item.wantedTitle,
    owner: {
      name: ownerName,
      initials: ownerName.charAt(0),
      imageUrl: getSwapOwnerImageUrl(item),
    },
    imageUrl: getSwapAdImageUrl(item),
  };
}

function getImageFromCollection(collection?: ApiSwapAdImage[] | null) {
  return (
    collection?.find((image) =>
      Boolean(image.imageUrl ?? image.url ?? image.path ?? image.fileUrl),
    )?.imageUrl ??
    collection?.find((image) => Boolean(image.url))?.url ??
    collection?.find((image) => Boolean(image.path))?.path ??
    collection?.find((image) => Boolean(image.fileUrl))?.fileUrl ??
    null
  );
}

function getSwapAdImageUrl(item: ApiSwapAd) {
  return toAbsoluteImageUrl(
    item.coverImageUrl ??
      item.imageUrl ??
      item.photoUrl ??
      item.thumbnailUrl ??
      getImageFromCollection(item.images) ??
      getImageFromCollection(item.photos) ??
      null,
  );
}

function getSwapOwnerImageUrl(item: ApiSwapAd) {
  return toAbsoluteImageUrl(
    item.user.profileImageUrl ??
      item.user.imageUrl ??
      item.user.avatarUrl ??
      item.profileImageUrl ??
      item.userProfileImageUrl ??
      item.ownerProfileImageUrl ??
      null,
  );
}

function trimValue(value: string) {
  return value.trim();
}

function assertMinTrimmedLength(
  value: string,
  minLength: number,
  errorMessage: string,
) {
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

function normalizeCondition(value: SwapAdCondition) {
  const allowedConditions: SwapAdCondition[] = [
    "LikeNew",
    "Excellent",
    "VeryGood",
    "Good",
    "Acceptable",
  ];

  if (!allowedConditions.includes(value)) {
    throw new Error(SWAP_AD_ERRORS.conditionRequired);
  }

  return value;
}

function createFormDataImage(photo: SwapAdPhotoInput) {
  return {
    uri: photo.uri,
    name: photo.name,
    type: photo.type,
  } as never;
}

function appendSwapImage(
  formData: FormData,
  photo: SwapAdPhotoInput,
  index: number,
) {
  formData.append("Images", createFormDataImage(photo));
  formData.append("Photos", createFormDataImage(photo));

  if (index === 0) {
    formData.append("Image", createFormDataImage(photo));
    formData.append("CoverImage", createFormDataImage(photo));
  }
}

function buildSwapTitle(offerTitle: string, wantedTitle: string) {
  return `${offerTitle} مقابل ${wantedTitle}`;
}

export async function getSwapAds(): Promise<ExchangeCardData[]> {
  try {
    const { data } = await apiClient.get<ApiSwapAdsResponse>("/api/SwapAds");
    if (!data.data || data.data.length === 0) return [];
    return data.data.map(mapToExchangeCard);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, SWAP_AD_ERRORS.listFailed));
  }
}

export async function createSwapAd(input: CreateSwapAdInput) {
  const offerTitle = trimValue(input.offerTitle);
  const wantedTitle = trimValue(input.wantedTitle);
  const description = trimValue(input.description);
  const categoryName = trimValue(input.categoryName ?? "");
  const conditionLabel = trimValue(input.conditionLabel ?? "");
  const categoryId = normalizePositiveNumber(
    input.categoryId,
    SWAP_AD_ERRORS.categoryRequired,
  );
  const condition = normalizeCondition(input.condition);

  assertMinTrimmedLength(offerTitle, 3, SWAP_AD_ERRORS.offerRequired);
  assertMinTrimmedLength(wantedTitle, 3, SWAP_AD_ERRORS.wantedRequired);
  assertMinTrimmedLength(description, 15, SWAP_AD_ERRORS.descriptionRequired);

  const formData = new FormData();
  formData.append("Title", buildSwapTitle(offerTitle, wantedTitle));
  formData.append("OfferTitle", offerTitle);
  formData.append("OfferedTitle", offerTitle);
  formData.append("Offering", offerTitle);
  formData.append("Have", offerTitle);
  formData.append("WantedTitle", wantedTitle);
  formData.append("WantedItem", wantedTitle);
  formData.append("Seeking", wantedTitle);
  formData.append("Want", wantedTitle);
  formData.append("CategoryId", String(categoryId));
  formData.append("Condition", condition);
  formData.append("Description", description);
  if (categoryName) formData.append("CategoryName", categoryName);
  if (conditionLabel) formData.append("ConditionLabel", conditionLabel);
  input.photos
    .slice(0, 5)
    .forEach((photo, index) => appendSwapImage(formData, photo, index));

  try {
    const { data } = await apiClient.post<ApiCreateSwapAdResponse>(
      "/api/SwapAds",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return data.message ?? null;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, SWAP_AD_ERRORS.createFailed));
  }
}
