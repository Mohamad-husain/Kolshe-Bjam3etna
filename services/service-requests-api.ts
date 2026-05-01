import { ServiceCardData } from '@/types/explore';

import { apiClient, getApiErrorMessage } from './http-client';

type ApiServiceRequest = {
  id: number;
  title: string;
  budget: number;
  deadlineUtc: string;
  description: string;
  categoryId: number;
  categoryName: string;
  attachmentsCount: number;
  user: {
    fullName: string;
    profileImageUrl: string | null;
  };
};

type ApiServiceRequestsResponse = {
  success?: boolean;
  data?: ApiServiceRequest[];
};

type ApiCreateServiceRequestResponse = {
  success?: boolean;
  message?: string;
};

export type CreateServiceRequestInput = {
  title: string;
  budget: number;
  deadline: string;
  description: string;
  categoryId: number;
};

const SERVICE_REQUEST_ERRORS = {
  titleRequired: 'يرجى إدخال عنوان واضح للخدمة',
  descriptionRequired: 'يرجى كتابة وصف لا يقل عن 20 حرفاً',
  categoryRequired: 'يرجى اختيار تصنيف للخدمة',
  budgetRequired: 'يرجى تحديد الميزانية',
  invalidDeadline: 'يرجى إدخال موعد نهائي صحيح بصيغة YYYY-MM-DD',
  listFailed: 'تعذر تحميل طلبات الخدمات',
  createFailed: 'تعذر نشر طلب الخدمة',
} as const;

function trimValue(value: string) {
  return value.trim();
}

function assertMinTrimmedLength(value: string, minLength: number, errorMessage: string) {
  if (trimValue(value).length < minLength) {
    throw new Error(errorMessage);
  }
}

function normalizeNonNegativeNumber(value: number, errorMessage: string) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    throw new Error(errorMessage);
  }

  return numericValue;
}

function normalizePositiveNumber(value: number, errorMessage: string) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    throw new Error(errorMessage);
  }

  return numericValue;
}

function normalizeDeadline(deadline: string) {
  const normalized = trimValue(deadline);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw new Error(SERVICE_REQUEST_ERRORS.invalidDeadline);
  }

  const date = new Date(`${normalized}T12:00:00.000Z`);

  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== normalized) {
    throw new Error(SERVICE_REQUEST_ERRORS.invalidDeadline);
  }

  return date.toISOString();
}

function formatDeadline(deadlineUtc: string): string {
  const deadline = new Date(deadlineUtc);

  if (Number.isNaN(deadline.getTime()) || deadline.getFullYear() < 2000) {
    return 'غير محدد';
  }

  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'انتهى';
  if (diffDays === 0) return 'متبقي اليوم';
  if (diffDays === 1) return 'متبقي يوم';
  if (diffDays <= 6) return `متبقي ${diffDays} أيام`;

  const diffWeeks = Math.ceil(diffDays / 7);

  if (diffDays <= 30) {
    return diffWeeks === 1 ? 'متبقي أسبوع' : `متبقي ${diffWeeks} أسابيع`;
  }

  const diffMonths = Math.ceil(diffDays / 30);
  return diffMonths === 1 ? 'متبقي شهر' : `متبقي ${diffMonths} أشهر`;
}

function mapToServiceCard(item: ApiServiceRequest): ServiceCardData {
  return {
    id: String(item.id),
    title: item.title,
    description: item.description,
    category: item.categoryName,
    pricePerHour: item.budget,
    deadline: formatDeadline(item.deadlineUtc),
    owner: {
      name: item.user.fullName,
      initials: item.user.fullName.charAt(0),
    },
  };
}

export async function getServiceRequests(): Promise<ServiceCardData[]> {
  try {
    const { data } = await apiClient.get<ApiServiceRequestsResponse>('/api/ServiceRequests');

    if (!data.data || data.data.length === 0) {
      return [];
    }

    return data.data.map(mapToServiceCard);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, SERVICE_REQUEST_ERRORS.listFailed));
  }
}

export async function createServiceRequest(input: CreateServiceRequestInput) {
  const title = trimValue(input.title);
  const description = trimValue(input.description);
  const budget = normalizeNonNegativeNumber(input.budget, SERVICE_REQUEST_ERRORS.budgetRequired);
  const categoryId = normalizePositiveNumber(
    input.categoryId,
    SERVICE_REQUEST_ERRORS.categoryRequired,
  );
  const deadlineUtc = normalizeDeadline(input.deadline);

  assertMinTrimmedLength(title, 5, SERVICE_REQUEST_ERRORS.titleRequired);
  assertMinTrimmedLength(description, 20, SERVICE_REQUEST_ERRORS.descriptionRequired);

  const formData = new FormData();
  formData.append('Title', title);
  formData.append('Budget', String(budget));
  formData.append('DeadlineUtc', deadlineUtc);
  formData.append('Description', description);
  formData.append('CategoryId', String(categoryId));

  try {
    const { data } = await apiClient.post<ApiCreateServiceRequestResponse>(
      '/api/ServiceRequests',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    return data.message ?? null;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, SERVICE_REQUEST_ERRORS.createFailed));
  }
}
