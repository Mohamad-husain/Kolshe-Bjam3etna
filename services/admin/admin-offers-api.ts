import { adminOffersFixture } from '@/lib/admin/admin-fixtures';
import { apiClient } from '@/services/http-client';
import type { AdminOfferItem, AdminOfferUpsertInput } from '@/types/admin';
import {
  ApiRecord,
  appendFileToFormData,
  getBooleanField,
  getDateField,
  getFallbackValue,
  getNumberField,
  getRecord,
  getRecords,
  getStringField,
  toAbsoluteImageUrl,
} from './admin-utils';

function normalizeOfferType(value: string | null): AdminOfferItem['type'] {
  if (!value) {
    return 'academy';
  }

  const normalized = value.toLowerCase();
  return normalized.includes('store') || normalized.includes('shop') ? 'store' : 'academy';
}

function mapOffer(record: ApiRecord): AdminOfferItem {
  return {
    id:
      String(
        getNumberField(record, ['id', 'offerId', 'partnerOfferId']) ??
          getStringField(record, ['id']) ??
          Date.now(),
      ),
    imageUrl: toAbsoluteImageUrl(getStringField(record, ['imageUrl', 'image', 'coverImageUrl'])),
    partnerName: getStringField(record, ['partnerName', 'name']) ?? 'شريك جديد',
    type: normalizeOfferType(getStringField(record, ['type', 'partnerType'])),
    category: getStringField(record, ['category']) ?? 'عام',
    title: getStringField(record, ['title', 'offerTitle']) ?? 'عرض جديد',
    description: getStringField(record, ['description', 'details']) ?? '',
    location: getStringField(record, ['location']) ?? 'غير محدد',
    phone: getStringField(record, ['phone', 'phoneNumber']) ?? '',
    email: getStringField(record, ['email']) ?? '',
    expireDateUtc: getDateField(record, ['expireDateUtc', 'expiresAt', 'endDateUtc']),
    discountPercent: getNumberField(record, ['discountPercent', 'discount']) ?? 0,
    showOnHomePage: getBooleanField(record, ['showOnHomePage', 'featured']) ?? false,
    isVerified: getBooleanField(record, ['isVerified', 'verified']) ?? true,
    viewsCount: getNumberField(record, ['viewsCount', 'views', 'viewCount']) ?? 0,
    rating: getNumberField(record, ['rating', 'averageRating']) ?? 0,
    ratingsCount: getNumberField(record, ['ratingsCount', 'reviewsCount']) ?? 0,
  };
}

function buildOfferFormData(input: AdminOfferUpsertInput) {
  const formData = new FormData();
  formData.append('PartnerName', input.partnerName.trim());
  formData.append('Type', input.type);
  formData.append('Category', input.category.trim());
  formData.append('Title', input.title.trim());
  formData.append('Description', input.description.trim());
  formData.append('Location', input.location.trim());
  formData.append('Phone', input.phone.trim());
  formData.append('Email', input.email.trim());
  formData.append('ExpireDateUtc', input.expireDateUtc);
  formData.append('DiscountPercent', String(input.discountPercent));
  formData.append('ShowOnHomePage', String(input.showOnHomePage));

  if (typeof input.isVerified === 'boolean') {
    formData.append('IsVerified', String(input.isVerified));
  }

  appendFileToFormData(formData, 'Image', input.image);
  return formData;
}

export async function getAdminOffers() {
  try {
    const { data } = await apiClient.get('/api/admin/partner-offers');
    const records = getRecords(data);
    return records.length ? records.map(mapOffer) : adminOffersFixture;
  } catch (error) {
    return getFallbackValue(error, 'تعذر تحميل العروض الإدارية', adminOffersFixture);
  }
}

export async function createAdminOffer(input: AdminOfferUpsertInput) {
  try {
    const { data } = await apiClient.post('/api/admin/partner-offers', buildOfferFormData(input), {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const record = getRecord(data);
    return record ? mapOffer(record) : null;
  } catch (error) {
    return getFallbackValue(error, 'تعذر إنشاء العرض', null);
  }
}

export async function updateAdminOffer(id: string, input: AdminOfferUpsertInput) {
  try {
    const { data } = await apiClient.put(
      `/api/admin/partner-offers/${id}`,
      buildOfferFormData(input),
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    const record = getRecord(data);
    return record ? mapOffer(record) : null;
  } catch (error) {
    return getFallbackValue(error, 'تعذر تحديث العرض', null);
  }
}

export async function deleteAdminOffer(id: string) {
  try {
    await apiClient.delete(`/api/admin/partner-offers/${id}`);
  } catch (error) {
    if (typeof __DEV__ === 'undefined' || !__DEV__) {
      throw error;
    }
  }
}
