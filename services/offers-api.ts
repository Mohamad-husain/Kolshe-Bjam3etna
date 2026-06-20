import { apiClient, getApiErrorMessage } from './http-client';

export type CreateServiceOfferInput = {
  targetId: string | number;
  price: number;
  availability: string;
  message?: string;
};

export type CreateProductOfferInput = CreateServiceOfferInput;

type ApiCreateOfferResponse = {
  success?: boolean;
  message?: string;
  data?: number;
};

function trimValue(value: string) {
  return value.trim();
}

export async function createServiceOffer(input: CreateServiceOfferInput) {
  return createOffer({ ...input, targetType: 'ServiceRequest' });
}

export async function createProductOffer(input: CreateProductOfferInput) {
  return createOffer({ ...input, targetType: 'ProductAd' });
}

async function createOffer(
  input: CreateServiceOfferInput & { targetType: 'ServiceRequest' | 'ProductAd' },
) {
  const targetId = Number(input.targetId);
  const price = Number(input.price);
  const availability = trimValue(input.availability);
  const message = trimValue(input.message ?? '');

  if (!Number.isFinite(targetId) || targetId <= 0) {
    throw new Error('الخدمة غير صحيحة');
  }

  if (!Number.isFinite(price) || price <= 0) {
    throw new Error('يرجى إدخال سعر عرض صحيح');
  }

  if (!availability) {
    throw new Error('يرجى إدخال أوقات التوفر');
  }

  try {
    const { data } = await apiClient.post<ApiCreateOfferResponse>('/api/offers', {
      targetType: input.targetType,
      targetId,
      price,
      availability,
      message: message || null,
    });

    return data.message ?? 'تم إرسال العرض';
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'تعذر إرسال العرض'));
  }
}
