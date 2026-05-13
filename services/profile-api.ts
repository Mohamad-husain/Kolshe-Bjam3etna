import { apiClient, getApiErrorMessage } from '@/services/http-client';

type ApiRecord = Record<string, unknown>;

const CHAT_AVATAR_COLORS = [
  '#2563EB',
  '#22C55E',
  '#38BDF8',
  '#F59E0B',
  '#A855F7',
  '#F97316',
] as const;

function getAvatarColor(seed?: string | null) {
  const value = (seed ?? '').trim();

  if (!value) {
    return CHAT_AVATAR_COLORS[0];
  }

  const index =
    value.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % CHAT_AVATAR_COLORS.length;

  return CHAT_AVATAR_COLORS[index];
}

function getAvatarInitial(name?: string | null) {
  const value = (name ?? '').trim();
  return value[0]?.toUpperCase() ?? 'م';
}

type ProfileListResponse = {
  success?: boolean;
  message?: string;
  data?: ApiRecord[];
};

export type ProfileServiceListing = {
  id: number;
  title: string;
  category: string;
  price: string;
  offers: number;
  status: 'active' | 'closed';
};

export type ProfileAdListing = {
  id: number;
  title: string;
  category: string;
  price: string;
  condition: string;
  status: 'active' | 'sold';
};

export type ExchangeItem = {
  id: number;
  title: string;
  offering: string;
  seeking: string;
  status: 'active' | 'completed';
  responses: number;
};

export type IncomingOffer = {
  id: number;
  type: 'service' | 'exchange' | 'ad';
  listingTitle: string;
  from: string;
  initials: string;
  color: string;
  price?: string;
  message: string;
  time: string;
  rating: number;
  status: 'pending' | 'accepted' | 'rejected';
};

export type OutgoingOffer = {
  id: number;
  type: 'service' | 'exchange' | 'ad';
  listingTitle: string;
  to: string;
  initials: string;
  color: string;
  price?: string;
  message: string;
  time: string;
  status: 'pending' | 'accepted' | 'rejected';
};

function isRecord(value: unknown): value is ApiRecord {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function getRecords(payload: unknown) {
  if (Array.isArray(payload)) {
    return payload.filter(isRecord);
  }

  if (isRecord(payload)) {
    if (Array.isArray(payload.data)) {
      return payload.data.filter(isRecord);
    }

    if (Array.isArray(payload.items)) {
      return payload.items.filter(isRecord);
    }
  }

  return [];
}

function getStringField(record: ApiRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

function getNumberField(record: ApiRecord, keys: string[]) {
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

function getBooleanField(record: ApiRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();

      if (normalized === 'true') {
        return true;
      }

      if (normalized === 'false') {
        return false;
      }
    }
  }

  return null;
}

function getNestedRecord(record: ApiRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (isRecord(value)) {
      return value;
    }
  }

  return null;
}

function getNameFromRecord(record: ApiRecord, keys: string[], nestedKeys: string[]) {
  const direct = getStringField(record, keys);

  if (direct) {
    return direct;
  }

  const nested = getNestedRecord(record, nestedKeys);

  if (!nested) {
    return null;
  }

  return getStringField(nested, ['fullName', 'name', 'userName', 'username']);
}

function formatCurrency(value: number | null, suffix = '') {
  if (value === null) {
    return undefined;
  }

  return `${value} د.أ${suffix}`;
}

function formatCondition(condition: string | null) {
  if (!condition) {
    return 'غير محدد';
  }

  const map: Record<string, string> = {
    LikeNew: 'كالجديد',
    Excellent: 'ممتاز',
    VeryGood: 'جيد جداً',
    Good: 'جيد',
    Acceptable: 'مقبول',
  };

  return map[condition] ?? condition;
}

function formatRelativeTime(value: string | null) {
  if (!value) {
    return 'مؤخراً';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours <= 0) {
    return 'منذ قليل';
  }

  if (diffHours < 24) {
    return diffHours === 1 ? 'منذ ساعة' : `منذ ${diffHours} ساعات`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays === 1) {
    return 'منذ يوم';
  }

  if (diffDays < 7) {
    return `منذ ${diffDays} أيام`;
  }

  const diffWeeks = Math.floor(diffDays / 7);
  return diffWeeks === 1 ? 'منذ أسبوع' : `منذ ${diffWeeks} أسابيع`;
}

function normalizeServiceStatus(record: ApiRecord): 'active' | 'closed' {
  const explicit = getStringField(record, ['status', 'serviceStatus']);

  if (explicit) {
    const normalized = explicit.toLowerCase();

    if (normalized.includes('closed') || normalized.includes('inactive') || normalized.includes('completed')) {
      return 'closed';
    }
  }

  const closed = getBooleanField(record, ['isClosed', 'closed', 'isCompleted']);
  return closed ? 'closed' : 'active';
}

function normalizeProductStatus(record: ApiRecord): 'active' | 'sold' {
  const explicit = getStringField(record, ['status', 'productStatus']);

  if (explicit) {
    const normalized = explicit.toLowerCase();

    if (normalized.includes('sold') || normalized.includes('closed')) {
      return 'sold';
    }
  }

  const sold = getBooleanField(record, ['isSold', 'sold']);
  return sold ? 'sold' : 'active';
}

function normalizeSwapStatus(record: ApiRecord): 'active' | 'completed' {
  const explicit = getStringField(record, ['status', 'swapStatus']);

  if (explicit) {
    const normalized = explicit.toLowerCase();

    if (normalized.includes('completed') || normalized.includes('closed')) {
      return 'completed';
    }
  }

  const completed = getBooleanField(record, ['isCompleted', 'completed', 'isClosed']);
  return completed ? 'completed' : 'active';
}

function normalizeOfferStatus(record: ApiRecord): 'pending' | 'accepted' | 'rejected' {
  const explicit = getStringField(record, ['status', 'offerStatus']);

  if (explicit) {
    const normalized = explicit.toLowerCase();

    if (normalized.includes('accept')) {
      return 'accepted';
    }

    if (normalized.includes('reject')) {
      return 'rejected';
    }
  }

  return 'pending';
}

function normalizeOfferType(record: ApiRecord): 'service' | 'exchange' | 'ad' {
  const explicit = getStringField(record, ['type', 'listingType', 'targetType', 'offerType']);

  if (explicit) {
    const normalized = explicit.toLowerCase();

    if (normalized.includes('swap') || normalized.includes('exchange')) {
      return 'exchange';
    }

    if (normalized.includes('product') || normalized.includes('ad')) {
      return 'ad';
    }
  }

  if (getNumberField(record, ['swapAdId']) !== null) {
    return 'exchange';
  }

  if (getNumberField(record, ['productAdId']) !== null) {
    return 'ad';
  }

  return 'service';
}

function mapMyService(record: ApiRecord): ProfileServiceListing {
  return {
    id: getNumberField(record, ['id', 'serviceRequestId']) ?? Date.now(),
    title: getStringField(record, ['title', 'serviceTitle']) ?? 'خدمة بدون عنوان',
    category: getStringField(record, ['categoryName', 'category']) ?? 'خدمة',
    price: formatCurrency(getNumberField(record, ['budget', 'price', 'pricePerHour']), '/ساعة') ?? 'غير محدد',
    offers: getNumberField(record, ['offersCount', 'offerCount', 'responsesCount', 'proposalsCount']) ?? 0,
    status: normalizeServiceStatus(record),
  };
}

function mapMyAd(record: ApiRecord): ProfileAdListing {
  return {
    id: getNumberField(record, ['id', 'productAdId']) ?? Date.now(),
    title: getStringField(record, ['title', 'productTitle']) ?? 'إعلان بدون عنوان',
    category: getStringField(record, ['categoryName', 'category']) ?? 'إعلان',
    price: formatCurrency(getNumberField(record, ['price'])) ?? 'غير محدد',
    condition: formatCondition(getStringField(record, ['condition', 'conditionName'])),
    status: normalizeProductStatus(record),
  };
}

function mapMySwap(record: ApiRecord): ExchangeItem {
  return {
    id: getNumberField(record, ['id', 'swapAdId']) ?? Date.now(),
    title: getStringField(record, ['title', 'description']) ?? 'تبادل',
    offering: getStringField(record, ['offerTitle', 'offering', 'have']) ?? 'غير محدد',
    seeking: getStringField(record, ['wantedTitle', 'seeking', 'want']) ?? 'غير محدد',
    status: normalizeSwapStatus(record),
    responses: getNumberField(record, ['responsesCount', 'offerCount']) ?? 0,
  };
}

function mapIncomingOffer(record: ApiRecord): IncomingOffer {
  const fromName =
    getNameFromRecord(record, ['from', 'fromUserName', 'senderName', 'userName', 'fullName'], ['fromUser', 'sender', 'user']) ??
    'مستخدم';

  return {
    id: getNumberField(record, ['id', 'offerId']) ?? Date.now(),
    type: normalizeOfferType(record),
    listingTitle:
      getStringField(record, ['listingTitle', 'title', 'serviceTitle', 'productTitle', 'swapTitle', 'requestTitle']) ??
      'عرض جديد',
    from: fromName,
    initials: getAvatarInitial(fromName),
    color: getAvatarColor(fromName),
    price: formatCurrency(getNumberField(record, ['price', 'amount', 'proposedPrice', 'budget'])),
    message:
      getStringField(record, ['message', 'note', 'description', 'content']) ??
      'لا توجد رسالة مرفقة',
    time: formatRelativeTime(getStringField(record, ['createdAt', 'createdAtUtc', 'sentAt', 'offerDate'])),
    rating: getNumberField(record, ['rating', 'userRating', 'senderRating']) ?? 0,
    status: normalizeOfferStatus(record),
  };
}

function mapOutgoingOffer(record: ApiRecord): OutgoingOffer {
  const toName =
    getNameFromRecord(record, ['to', 'toUserName', 'recipientName', 'ownerName', 'fullName'], ['toUser', 'recipient', 'owner', 'user']) ??
    'مستخدم';

  return {
    id: getNumberField(record, ['id', 'offerId']) ?? Date.now(),
    type: normalizeOfferType(record),
    listingTitle:
      getStringField(record, ['listingTitle', 'title', 'serviceTitle', 'productTitle', 'swapTitle', 'requestTitle']) ??
      'عرض صادر',
    to: toName,
    initials: getAvatarInitial(toName),
    color: getAvatarColor(toName),
    price: formatCurrency(getNumberField(record, ['price', 'amount', 'proposedPrice', 'budget'])),
    message:
      getStringField(record, ['message', 'note', 'description', 'content']) ??
      'لا توجد رسالة مرفقة',
    time: formatRelativeTime(getStringField(record, ['createdAt', 'createdAtUtc', 'sentAt', 'offerDate'])),
    status: normalizeOfferStatus(record),
  };
}

async function getList(path: string, fallbackMessage: string) {
  try {
    const { data } = await apiClient.get<ProfileListResponse | ApiRecord[]>(path);
    return getRecords(data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, fallbackMessage));
  }
}

export async function getMyServiceRequests() {
  const records = await getList('/api/ServiceRequests/mine', 'تعذر تحميل خدماتي');
  return records.map(mapMyService);
}

export async function getMyProductAds() {
  const records = await getList('/api/ProductAds/mine', 'تعذر تحميل إعلاناتي');
  return records.map(mapMyAd);
}

export async function getMySwapAds() {
  const records = await getList('/api/SwapAds/mine', 'تعذر تحميل تبادلاتي');
  return records.map(mapMySwap);
}

export async function getIncomingOffers() {
  const records = await getList('/api/offers/incoming', 'تعذر تحميل العروض الواردة');
  return records.map(mapIncomingOffer);
}

export async function getOutgoingOffers() {
  const records = await getList('/api/offers/outgoing', 'تعذر تحميل العروض الصادرة');
  return records.map(mapOutgoingOffer);
}

async function postWithoutBody(path: string, fallbackMessage: string) {
  try {
    await apiClient.post(path);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, fallbackMessage));
  }
}

export async function acceptOffer(offerId: number | string) {
  await postWithoutBody(`/api/offers/${offerId}/accept`, 'تعذر قبول العرض');
}

export async function rejectOffer(offerId: number | string) {
  await postWithoutBody(`/api/offers/${offerId}/reject`, 'تعذر رفض العرض');
}
