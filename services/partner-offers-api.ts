import { apiClient, getApiErrorMessage } from '@/services/http-client';
import { toAbsoluteImageUrl } from '@/services/media';

type ApiPartnerOffer = Record<string, unknown>;

type ApiPartnerOffersResponse = {
  success?: boolean;
  message?: string;
  data?: ApiPartnerOffer[];
};

type ApiPartnerOfferDetailsResponse = {
  success?: boolean;
  message?: string;
  data?: ApiPartnerOffer;
};

export type PartnerOffer = {
  id: string;
  name: string;
  offerTitle: string;
  offerDetails: string;
  description: string;
  category: string;
  discount: number | null;
  type: 'academy' | 'store';
  expiryDate: string | null;
  location: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  contactUserId: string | null;
  imageUrl: string | null;
  rating: number | null;
  reviews: number | null;
  verified: boolean;
};

function getStringField(record: ApiPartnerOffer, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

function getNumberField(record: ApiPartnerOffer, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      const parsed = Number(value);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function getBooleanField(record: ApiPartnerOffer, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();

      if (normalized === 'true') return true;
      if (normalized === 'false') return false;
    }
  }

  return false;
}

function formatExpiryDate(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString('ar-JO-u-ca-gregory', {
    day: 'numeric',
    month: 'long',
  });
}

function normalizeOfferType(value: string | null): 'academy' | 'store' {
  if (!value) {
    return 'store';
  }

  const normalized = value.trim().toLowerCase();

  if (
    normalized.includes('academy') ||
    normalized.includes('academic') ||
    normalized.includes('أكاديمية') ||
    normalized.includes('اكاديمية') ||
    normalized.includes('course') ||
    normalized.includes('دورة')
  ) {
    return 'academy';
  }

  return 'store';
}

function mapPartnerOffer(item: ApiPartnerOffer): PartnerOffer {
  const idValue = item.id;
  const typeValue = getStringField(item, ['type', 'partnerType', 'category']);
  const title = getStringField(item, ['offerTitle', 'title', 'description', 'offerDescription']);
  const description = getStringField(item, ['description', 'offerDetails', 'details']);

  return {
    id: typeof idValue === 'number' || typeof idValue === 'string' ? String(idValue) : `${Date.now()}`,
    name:
      getStringField(item, ['name', 'partnerName', 'businessName', 'title']) ?? 'عرض جديد',
    offerTitle: title ?? 'تفاصيل العرض متاحة داخل الإعلان',
    offerDetails: description ?? title ?? 'تفاصيل العرض متاحة داخل الإعلان',
    description: description ?? title ?? 'تفاصيل العرض متاحة داخل الإعلان',
    category: getStringField(item, ['category', 'type']) ?? 'عرض خاص',
    discount: getNumberField(item, ['discount', 'discountPercentage', 'discountPercent']),
    type: normalizeOfferType(typeValue),
    expiryDate: formatExpiryDate(
      getStringField(item, ['expiryDate', 'expireDateUtc', 'expiresAtUtc', 'endDate', 'endDateUtc']),
    ),
    location: getStringField(item, ['location', 'branchName', 'campus']),
    contactEmail: getStringField(item, ['contactEmail', 'email']),
    contactPhone: getStringField(item, ['contactPhone', 'phone']),
    contactUserId: getStringField(item, ['contactUserId', 'ownerId', 'userId']),
    imageUrl: toAbsoluteImageUrl(getStringField(item, ['imageUrl', 'coverImageUrl'])),
    rating: getNumberField(item, ['rating']),
    reviews: getNumberField(item, ['reviews', 'ratingsCount', 'reviewCount']),
    verified: getBooleanField(item, ['verified', 'isVerified']),
  };
}

export async function getPartnerOffers(): Promise<PartnerOffer[]> {
  try {
    const { data } = await apiClient.get<ApiPartnerOffersResponse>('/api/partner-offers');
    return (data.data ?? []).map(mapPartnerOffer);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'تعذر تحميل العروض والخصومات'));
  }
}

export async function getPartnerOfferDetails(id: string | number): Promise<PartnerOffer> {
  const offerId = Number(id);

  if (!Number.isFinite(offerId) || offerId <= 0) {
    throw new Error('العرض غير صحيح');
  }

  try {
    const { data } = await apiClient.get<ApiPartnerOfferDetailsResponse>(
      `/api/partner-offers/${offerId}`,
    );

    if (!data.data) {
      throw new Error('تعذر تحميل تفاصيل العرض');
    }

    return mapPartnerOffer(data.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'تعذر تحميل تفاصيل العرض'));
  }
}
