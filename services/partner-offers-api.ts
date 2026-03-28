import { apiClient, getApiErrorMessage } from '@/services/http-client';

type ApiPartnerOffer = Record<string, unknown>;

type ApiPartnerOffersResponse = {
  success?: boolean;
  message?: string;
  data?: ApiPartnerOffer[];
};

export type PartnerOffer = {
  id: string;
  name: string;
  offerTitle: string;
  discount: number | null;
  type: 'academy' | 'store';
  expiryDate: string | null;
  location: string | null;
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

  return {
    id: typeof idValue === 'number' || typeof idValue === 'string' ? String(idValue) : `${Date.now()}`,
    name:
      getStringField(item, ['name', 'partnerName', 'businessName', 'title']) ?? 'عرض جديد',
    offerTitle:
      getStringField(item, ['offerTitle', 'title', 'description', 'offerDescription']) ??
      'تفاصيل العرض متاحة داخل الإعلان',
    discount: getNumberField(item, ['discount', 'discountPercentage', 'discountPercent']),
    type: normalizeOfferType(typeValue),
    expiryDate: formatExpiryDate(
      getStringField(item, ['expiryDate', 'expiresAtUtc', 'endDate', 'endDateUtc']),
    ),
    location: getStringField(item, ['location', 'branchName', 'campus']),
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
